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

    // Add materials_checklist column to jobs table if it doesn't exist
    db.run(`
      ALTER TABLE jobs ADD COLUMN materials_checklist TEXT DEFAULT '[]'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding materials_checklist column:', err.message);
      }
    });

    // Add predicted_hours column to jobs table
    db.run(`
      ALTER TABLE jobs ADD COLUMN predicted_hours REAL
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding predicted_hours column:', err.message);
      }
    });

    // Add predicted_completion_date column to jobs table
    db.run(`
      ALTER TABLE jobs ADD COLUMN predicted_completion_date TEXT
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding predicted_completion_date column:', err.message);
      }
    });

    // Add type column to employees table
    db.run(`
      ALTER TABLE employees ADD COLUMN type TEXT DEFAULT 'painter'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding type column:', err.message);
      }
    });

    // Add rating column to employees table
    db.run(`
      ALTER TABLE employees ADD COLUMN rating REAL DEFAULT 1.0
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding rating column:', err.message);
      }
    });

    // Add rating_notes column to employees table
    db.run(`
      ALTER TABLE employees ADD COLUMN rating_notes TEXT DEFAULT '[]'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding rating_notes column:', err.message);
      }
    });

    // Add assigned_dates column to job_assignments table
    db.run(`
      ALTER TABLE job_assignments ADD COLUMN assigned_dates TEXT DEFAULT '[]'
    `, (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding assigned_dates column:', err.message);
      }
    });

    // Create tasks table for tracking individual task completion
    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        phase TEXT,
        task TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        percentage REAL DEFAULT 0,
        dependencies TEXT DEFAULT '[]',
        room TEXT,
        estimated_hours REAL DEFAULT 0,
        completed_by INTEGER,
        on_site_employees TEXT DEFAULT '[]',
        completion_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (completed_by) REFERENCES employees(id) ON DELETE SET NULL
      )
    `);
  });

  console.log('Database initialized successfully');
}

module.exports = { db, initializeDatabase };
