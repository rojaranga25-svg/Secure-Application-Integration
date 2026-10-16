const express = require('express');
const db = require('./database');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 1. GET /api/internships (List with Pagination)
app.get('/api/internships', (req, res) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  let offset = (page - 1) * limit;

  db.all(
    "SELECT * FROM internships LIMIT ? OFFSET ?",
    [limit, offset],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: "Database retrieval failed", details: err.message });
      }
      db.get("SELECT COUNT(*) AS total FROM internships", (err, countRow) => {
        res.json({
          page,
          limit,
          totalRecords: countRow ? countRow.total : 0,
          data: rows
        });
      });
    }
  );
});

// 2. GET /api/internships/:id (Get Detail by ID)
app.get('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM internships WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Internship record not found" });
    }
    res.json({ data: row });
  });
});

// 3. POST /api/internships (Create New Record with Validation)
app.post('/api/internships', (req, res) => {
  const { title, company, location, stipend, role_type } = req.body;

  // Validation
  if (!title || !company || !location) {
    return res.status(400).json({ 
      error: "Validation Error: 'title', 'company', and 'location' fields are required." 
    });
  }

  const query = `
    INSERT INTO internships (title, company, location, stipend, role_type)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [title, company, location, stipend || null, role_type || null], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to create internship", details: err.message });
    }
    res.status(201).json({
      message: "Internship created successfully",
      data: { id: this.lastID, title, company, location, stipend, role_type }
    });
  });
});

// 4. PUT /api/internships/:id (Update Record)
app.put('/api/internships/:id', (req, res) => {
  const { id } = req.params;
  const { title, company, location, stipend, role_type } = req.body;

  if (!title || !company || !location) {
    return res.status(400).json({ 
      error: "Validation Error: 'title', 'company', and 'location' fields are required." 
    });
  }

  const query = `
    UPDATE internships 
    SET title = ?, company = ?, location = ?, stipend = ?, role_type = ?
    WHERE id = ?
  `;

  db.run(query, [title, company, location, stipend, role_type, id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Update failed", details: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Internship record not found" });
    }
    res.json({ message: "Internship updated successfully" });
  });
});

// 5. DELETE /api/internships/:id (Delete Record)
app.delete('/api/internships/:id', (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM internships WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Delete failed", details: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Internship record not found" });
    }
    res.json({ message: "Internship record deleted successfully" });
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});