const router = require("express").Router();
const pool = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];
const COLUMNS = "id, title, category, description, status";
const MAX_ID = 2147483647; // largest id the database can hold

// Returns a number, or sends the error response and returns null.
function readId(req, res) {
    const raw = req.params.id;
    if (!/^[1-9]\d*$/.test(raw)) {
        res.status(400).json({ message: "The id must be a positive whole number." });
        return null;
    }
    const id = Number(raw);
    if (id > MAX_ID) {
        res.status(404).json({ message: "Record not found." });
        return null;
    }
    return id;
}

// Checks the four editable fields. Any client-supplied id is ignored.
function validateBody(body) {
    if (body === null || typeof body !== "object" || Array.isArray(body)) {
        return { error: "The request body must be a JSON object." };
    }

    const labels = {
        title: "Title",
        category: "Category",
        description: "Description",
        status: "Status"
    };
    for (const field of Object.keys(labels)) {
        if (typeof body[field] !== "string") {
            return { error: labels[field] + " is required and must be text." };
        }
    }

    const values = {
        title: body.title.trim(),
        category: body.category.trim(),
        description: body.description.trim(),
        status: body.status.trim()
    };

    if (values.title.length < 3 || values.title.length > 80) {
        return { error: "Title must have 3 to 80 characters." };
    }
    if (values.category.length < 2 || values.category.length > 40) {
        return { error: "Category must have 2 to 40 characters." };
    }
    if (values.description.length < 5 || values.description.length > 300) {
        return { error: "Description must have 5 to 300 characters." };
    }
    if (!STATUSES.includes(values.status)) {
        return { error: "Status must be Pending, In progress or Completed." };
    }
    return { values };
}

// GET all records
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT " + COLUMNS + " FROM records ORDER BY id"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET one record
router.get("/:id", async (req, res, next) => {
    try {
        const id = readId(req, res);
        if (id === null) return;

        const result = await pool.query(
            "SELECT " + COLUMNS + " FROM records WHERE id = $1",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Record not found." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// POST create a record
router.post("/", async (req, res, next) => {
    try {
        const { values, error } = validateBody(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }

        const result = await pool.query(
            "INSERT INTO records (title, category, description, status) " +
            "VALUES ($1, $2, $3, $4) RETURNING " + COLUMNS,
            [values.title, values.category, values.description, values.status]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// PUT replace the four editable fields
router.put("/:id", async (req, res, next) => {
    try {
        const id = readId(req, res);
        if (id === null) return;

        const { values, error } = validateBody(req.body);
        if (error) {
            return res.status(400).json({ message: error });
        }

        const result = await pool.query(
            "UPDATE records SET title = $1, category = $2, description = $3, status = $4 " +
            "WHERE id = $5 RETURNING " + COLUMNS,
            [values.title, values.category, values.description, values.status, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Record not found." });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE a record
router.delete("/:id", async (req, res, next) => {
    try {
        const id = readId(req, res);
        if (id === null) return;

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING id",
            [id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Record not found." });
        }
        res.status(200).json({ message: "Record deleted." });
    } catch (error) {
        next(error);
    }
});

module.exports = router;