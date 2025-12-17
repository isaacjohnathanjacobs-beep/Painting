const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
initializeDatabase();

// EMPLOYEE ROUTES

// Get all employees
app.get('/api/employees', (req, res) => {
  db.all('SELECT * FROM employees ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single employee
app.get('/api/employees/:id', (req, res) => {
  db.get('SELECT * FROM employees WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json(row);
  });
});

// Create employee
app.post('/api/employees', (req, res) => {
  const { name, email, phone, role, hourly_rate } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  db.run(
    'INSERT INTO employees (name, email, phone, role, hourly_rate) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, role, hourly_rate],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, email, phone, role, hourly_rate });
    }
  );
});

// Update employee
app.put('/api/employees/:id', (req, res) => {
  const { name, email, phone, role, hourly_rate, status, type, rating, rating_notes } = req.body;

  const ratingNotesJson = rating_notes ? JSON.stringify(rating_notes) : '[]';

  db.run(
    'UPDATE employees SET name = ?, email = ?, phone = ?, role = ?, hourly_rate = ?, status = ?, type = ?, rating = ?, rating_notes = ? WHERE id = ?',
    [name, email, phone, role, hourly_rate, status, type || 'painter', rating || 1.0, ratingNotesJson, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Employee not found' });
        return;
      }
      res.json({ message: 'Employee updated successfully' });
    }
  );
});

// Delete employee
app.delete('/api/employees/:id', (req, res) => {
  db.run('DELETE FROM employees WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Employee not found' });
      return;
    }
    res.json({ message: 'Employee deleted successfully' });
  });
});

// JOB ROUTES

// Get all jobs
app.get('/api/jobs', (req, res) => {
  db.all('SELECT * FROM jobs ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single job with assigned employees
app.get('/api/jobs/:id', (req, res) => {
  db.get('SELECT * FROM jobs WHERE id = ?', [req.params.id], (err, job) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!job) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }

    // Get assigned employees
    db.all(
      `SELECT e.* FROM employees e
       INNER JOIN job_assignments ja ON e.id = ja.employee_id
       WHERE ja.job_id = ?`,
      [req.params.id],
      (err, employees) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        job.assigned_employees = employees;
        res.json(job);
      }
    );
  });
});

// Create job
app.post('/api/jobs', (req, res) => {
  const { client_name, client_phone, client_email, address, description,
          estimated_hours, estimated_cost, start_date, end_date, checklist, materials_checklist } = req.body;

  if (!client_name || !address) {
    res.status(400).json({ error: 'Client name and address are required' });
    return;
  }

  const checklistJson = checklist ? JSON.stringify(checklist) : '[]';
  const materialsChecklistJson = materials_checklist ? JSON.stringify(materials_checklist) : '[]';

  db.run(
    `INSERT INTO jobs (client_name, client_phone, client_email, address, description,
                       estimated_hours, estimated_cost, start_date, end_date, checklist, materials_checklist)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [client_name, client_phone, client_email, address, description,
     estimated_hours, estimated_cost, start_date, end_date, checklistJson, materialsChecklistJson],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, client_name, address, status: 'pending' });
    }
  );
});

// Update job
app.put('/api/jobs/:id', (req, res) => {
  const { client_name, client_phone, client_email, address, description, status,
          estimated_hours, actual_hours, estimated_cost, actual_cost, start_date, end_date, checklist, materials_checklist } = req.body;

  const checklistJson = checklist ? JSON.stringify(checklist) : '[]';
  const materialsChecklistJson = materials_checklist ? JSON.stringify(materials_checklist) : '[]';

  db.run(
    `UPDATE jobs SET client_name = ?, client_phone = ?, client_email = ?, address = ?,
                     description = ?, status = ?, estimated_hours = ?, actual_hours = ?,
                     estimated_cost = ?, actual_cost = ?, start_date = ?, end_date = ?, checklist = ?, materials_checklist = ?
     WHERE id = ?`,
    [client_name, client_phone, client_email, address, description, status,
     estimated_hours, actual_hours, estimated_cost, actual_cost, start_date, end_date, checklistJson, materialsChecklistJson, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      res.json({ message: 'Job updated successfully' });
    }
  );
});

// Update job checklist only
app.patch('/api/jobs/:id/checklist', (req, res) => {
  const { checklist } = req.body;
  const checklistJson = JSON.stringify(checklist || []);

  db.run(
    'UPDATE jobs SET checklist = ? WHERE id = ?',
    [checklistJson, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      res.json({ message: 'Checklist updated successfully' });
    }
  );
});

// Update job materials checklist only
app.patch('/api/jobs/:id/materials', (req, res) => {
  const { materials_checklist } = req.body;
  const materialsChecklistJson = JSON.stringify(materials_checklist || []);

  db.run(
    'UPDATE jobs SET materials_checklist = ? WHERE id = ?',
    [materialsChecklistJson, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }
      res.json({ message: 'Materials checklist updated successfully' });
    }
  );
});

// Delete job
app.delete('/api/jobs/:id', (req, res) => {
  db.run('DELETE FROM jobs WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Job not found' });
      return;
    }
    res.json({ message: 'Job deleted successfully' });
  });
});

// JOB ASSIGNMENT ROUTES

// Assign employee to job
app.post('/api/jobs/:jobId/assign/:employeeId', (req, res) => {
  db.run(
    'INSERT INTO job_assignments (job_id, employee_id) VALUES (?, ?)',
    [req.params.jobId, req.params.employeeId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Employee assigned successfully' });
    }
  );
});

// Unassign employee from job
app.delete('/api/jobs/:jobId/assign/:employeeId', (req, res) => {
  db.run(
    'DELETE FROM job_assignments WHERE job_id = ? AND employee_id = ?',
    [req.params.jobId, req.params.employeeId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Employee unassigned successfully' });
    }
  );
});

// Get employees assigned to a job
app.get('/api/jobs/:jobId/employees', (req, res) => {
  db.all(
    `SELECT e.*, ja.assigned_dates FROM employees e
     INNER JOIN job_assignments ja ON e.id = ja.employee_id
     WHERE ja.job_id = ?`,
    [req.params.jobId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // Parse assigned_dates JSON
      const parsedRows = rows.map(row => ({
        ...row,
        assigned_dates: row.assigned_dates ? JSON.parse(row.assigned_dates) : [],
        rating_notes: row.rating_notes ? JSON.parse(row.rating_notes) : []
      }));
      res.json(parsedRows);
    }
  );
});

// Update employee assignment dates for a job
app.patch('/api/jobs/:jobId/assign/:employeeId/dates', (req, res) => {
  const { dates } = req.body; // Array of date strings ['2025-01-15', '2025-01-16', ...]
  const datesJson = JSON.stringify(dates || []);

  db.run(
    'UPDATE job_assignments SET assigned_dates = ? WHERE job_id = ? AND employee_id = ?',
    [datesJson, req.params.jobId, req.params.employeeId],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Assignment dates updated successfully' });
    }
  );
});

// Get all calendar assignments (for calendar view)
app.get('/api/calendar', (req, res) => {
  db.all(
    `SELECT ja.*, j.client_name, j.address, j.status, e.name as employee_name
     FROM job_assignments ja
     INNER JOIN jobs j ON ja.job_id = j.id
     INNER JOIN employees e ON ja.employee_id = e.id`,
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      // Parse assigned_dates
      const parsedRows = rows.map(row => ({
        ...row,
        assigned_dates: row.assigned_dates ? JSON.parse(row.assigned_dates) : []
      }));
      res.json(parsedRows);
    }
  );
});

// Update job predictions
app.patch('/api/jobs/:id/predictions', (req, res) => {
  const { predicted_hours, predicted_completion_date, start_date } = req.body;

  db.run(
    'UPDATE jobs SET predicted_hours = ?, predicted_completion_date = ?, start_date = ? WHERE id = ?',
    [predicted_hours, predicted_completion_date, start_date, req.params.id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Predictions updated successfully' });
    }
  );
});

// TASK COMPLETION TRACKING

// Update task completion
app.patch('/api/jobs/:jobId/tasks/:taskId/complete', (req, res) => {
  const { completed, completed_by, on_site_employees, completion_date } = req.body;
  const onSiteJson = JSON.stringify(on_site_employees || []);

  // First check if task exists
  db.get(
    'SELECT * FROM tasks WHERE job_id = ? AND task_id = ?',
    [req.params.jobId, req.params.taskId],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (row) {
        // Update existing task
        db.run(
          'UPDATE tasks SET completed = ?, completed_by = ?, on_site_employees = ?, completion_date = ? WHERE job_id = ? AND task_id = ?',
          [completed ? 1 : 0, completed_by, onSiteJson, completion_date, req.params.jobId, req.params.taskId],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Task updated successfully' });
          }
        );
      } else {
        // Insert new task record
        db.run(
          'INSERT INTO tasks (job_id, task_id, completed, completed_by, on_site_employees, completion_date) VALUES (?, ?, ?, ?, ?, ?)',
          [req.params.jobId, req.params.taskId, completed ? 1 : 0, completed_by, onSiteJson, completion_date],
          function(err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ message: 'Task created successfully' });
          }
        );
      }
    }
  );
});

// Get tasks for a job
app.get('/api/jobs/:jobId/tasks', (req, res) => {
  db.all(
    'SELECT * FROM tasks WHERE job_id = ?',
    [req.params.jobId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const parsedRows = rows.map(row => ({
        ...row,
        on_site_employees: row.on_site_employees ? JSON.parse(row.on_site_employees) : [],
        dependencies: row.dependencies ? JSON.parse(row.dependencies) : []
      }));
      res.json(parsedRows);
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
