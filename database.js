const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'internships.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      location TEXT NOT NULL,
      stipend TEXT,
      role_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id INTEGER NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_email TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (internship_id) REFERENCES internships(id)
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM internships", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO internships (title, company, location, stipend, role_type)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run("Frontend Developer Intern", "TechCorp", "Remote", "$500/month", "Full-time");
      stmt.run("Backend Node.js Intern", "DevStudio", "Bangalore", "₹15,000/month", "Full-time");
      stmt.finalize();
    }
  });
});

module.exports = db;