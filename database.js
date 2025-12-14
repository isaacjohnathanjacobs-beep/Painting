const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'painting_company.db');
const db = new sqlite3.Database(dbPath);

function initializeDatabase() {
  db.serialize(() => {
    // Create employees table
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        role TEXT,
        hourly_rate REAL,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    db.run(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_name TEXT NOT NULL,
        client_phone TEXT,
        client_email TEXT,
        address TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        estimated_hours REAL,
        actual_hours REAL,
        estimated_cost REAL,
        actual_cost REAL,
        start_date TEXT,
        end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create job assignments table (many-to-many relationship)
    db.run(`
      CREATE TABLE IF NOT EXISTS job_assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        employee_id INTEGER NOT NULL,
        assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Add checklist column to jobs table if it doesn't exist
    db.run(`
      ALTER TABLE jobs ADD COLUMN checklist TEXT DEFAULT '[]'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding checklist column:', err.message);
      }
    });
  });

  console.log('Database initialized successfully');
}

module.exports = { db, initializeDatabase };
