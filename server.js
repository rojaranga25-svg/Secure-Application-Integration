const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." }
});
app.use('/api/', apiLimiter);

app.get('/api/internships', (req, res) => {
  db.all("SELECT * FROM internships", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Failed to fetch data" });
    res.json({ data: rows });
  });
});

app.post('/api/applications', (req, res) => {
  const { internship_id, applicant_name, applicant_email } = req.body;

  if (!internship_id || !applicant_name || !applicant_email) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = `INSERT INTO applications (internship_id, applicant_name, applicant_email) VALUES (?, ?, ?)`;
  db.run(query, [internship_id, applicant_name, applicant_email], function(err) {
    if (err) return res.status(500).json({ error: "Database error." });
    res.status(201).json({ message: "Application submitted successfully!", applicationId: this.lastID });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});