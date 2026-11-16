-- Inserts the starting records only when the table is empty.
INSERT INTO records (title, category, description, status)
SELECT * FROM (VALUES
  ('Wi-Fi keeps disconnecting', 'Network', 'My laptop loses the campus Wi-Fi every few minutes in the library reading room.', 'Pending'),
  ('Install MATLAB on lab PC', 'Software', 'Lab 2 computer number 14 needs MATLAB installed for the simulation class.', 'In progress'),
  ('Broken keyboard in Lab 3', 'Hardware', 'Several keys on the keyboard at desk 6 do not respond when pressed.', 'Completed'),
  ('Cannot open student portal', 'Network', 'The student portal page times out when opened from the hostel network.', 'Pending'),
  ('Antivirus update failing', 'Software', 'The antivirus on the staff office computer shows an error when updating its definitions.', 'In progress'),
  ('Projector will not display', 'Hardware', 'The projector in Room B12 turns on but shows no image from the laptop.', 'Pending'),
  ('Lab account password reset', 'Software', 'A student cannot sign in to the computer lab account and needs a password reset.', 'Completed'),
  ('Printer offline in admin block', 'Hardware', 'The shared printer in the admin block shows as offline on all office computers.', 'In progress')
) AS v(title, category, description, status)
WHERE NOT EXISTS (SELECT 1 FROM records);