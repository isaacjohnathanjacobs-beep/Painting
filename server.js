const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initializeDatabase } = require('./database');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve the game at the root
app.use(express.static('game'));

// Serve painting app at /manager route (optional)
app.use('/manager', express.static('public'));

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
  // on_site_employees is already an array, stringify it for storage
  const onSiteJson = typeof on_site_employees === 'string'
    ? on_site_employees
    : JSON.stringify(on_site_employees || []);

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
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

// WebSocket server for multiplayer
const wss = new WebSocket.Server({ server });

const players = new Map(); // Map of playerId -> player data

// Shared goblin state (server-authoritative)
const TILE = 32;
const goblins = [
  {id:1, name:'Goblin', x:18*TILE, y:15*TILE, tileX:18, tileY:15, hp:5, maxHp:5, dir:1, anim:'idle', frame:0, timer:0, aggroRange:4, attackTimer:0, respawnTimer:0, dead:false},
  {id:2, name:'Goblin', x:30*TILE, y:22*TILE, tileX:30, tileY:22, hp:5, maxHp:5, dir:-1, anim:'idle', frame:0, timer:0, aggroRange:4, attackTimer:0, respawnTimer:0, dead:false},
  {id:3, name:'Goblin', x:20*TILE, y:25*TILE, tileX:20, tileY:25, hp:5, maxHp:5, dir:1, anim:'idle', frame:0, timer:0, aggroRange:4, attackTimer:0, respawnTimer:0, dead:false},
  {id:4, name:'Goblin Scout', x:15*TILE, y:18*TILE, tileX:15, tileY:18, hp:7, maxHp:7, dir:-1, anim:'idle', frame:0, timer:0, aggroRange:5, attackTimer:0, respawnTimer:0, dead:false},
  {id:5, name:'Goblin Brute', x:32*TILE, y:18*TILE, tileX:32, tileY:18, hp:10, maxHp:10, dir:1, anim:'idle', frame:0, timer:0, aggroRange:3, attackTimer:0, respawnTimer:0, dead:false}
];

wss.on('connection', (ws) => {
  const playerId = Math.random().toString(36).substring(7);
  console.log(`Player ${playerId} connected`);

  // Send player their ID
  ws.send(JSON.stringify({ type: 'init', playerId }));

  // Send existing players to new player
  const existingPlayers = Array.from(players.values());
  ws.send(JSON.stringify({ type: 'players', players: existingPlayers }));

  // Send current goblin state to new player
  ws.send(JSON.stringify({ type: 'goblins', goblins }));

  // Add new player
  players.set(playerId, {
    id: playerId,
    x: 400,
    y: 300,
    character: null,
    equipment: {}
  });

  // Broadcast new player to all others
  broadcast({ type: 'playerJoined', player: players.get(playerId) }, playerId);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'update') {
        // Update player position and state
        const player = players.get(playerId);
        if (player) {
          player.x = data.x;
          player.y = data.y;
          player.character = data.character;
          player.equipment = data.equipment;
          player.anim = data.anim;
          player.dir = data.dir;
          player.frame = data.frame;

          // Broadcast to all other players
          broadcast({ type: 'playerUpdate', player }, playerId);
        }
      } else if (data.type === 'goblinDamage') {
        // Handle goblin damage from client
        const goblin = goblins.find(g => g.id === data.goblinId);
        if (goblin && !goblin.dead) {
          goblin.hp -= data.damage;
          goblin.anim = 'hurt';

          if (goblin.hp <= 0) {
            goblin.dead = true;
            goblin.respawnTimer = 15000;
            goblin.anim = 'idle';
          }

          // Broadcast goblin update to all clients
          broadcast({ type: 'goblinUpdate', goblin });
        }
      }
    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  ws.on('close', () => {
    console.log(`Player ${playerId} disconnected`);
    players.delete(playerId);
    broadcast({ type: 'playerLeft', playerId });
  });

  // Store ws on player for sending messages
  const player = players.get(playerId);
  if (player) {
    player.ws = ws;
  }
});

function broadcast(message, excludeId = null) {
  const msg = JSON.stringify(message);
  players.forEach((player, id) => {
    if (id !== excludeId && player.ws && player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(msg);
    }
  });
}

// Server-side goblin update loop
let lastUpdate = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = now - lastUpdate;
  lastUpdate = now;

  let updated = false;
  for (const g of goblins) {
    if (g.dead) {
      g.respawnTimer -= dt;
      if (g.respawnTimer <= 0) {
        g.dead = false;
        g.hp = g.maxHp;
        g.anim = 'idle';
        updated = true;
      }
    } else {
      // Update animation frame
      g.timer += dt;
      const gSpd = g.anim === 'walk' ? 100 : g.anim === 'attack' ? 80 : 150;
      if (g.timer >= gSpd) {
        g.timer = 0;
        g.frame = (g.frame + 1) % 8;
        updated = true;
      }

      // Simple AI: Move toward nearest player
      let nearestPlayer = null;
      let nearestDist = Infinity;

      for (const [id, p] of players) {
        const dist = Math.sqrt((p.x - g.x) ** 2 + (p.y - g.y) ** 2);
        if (dist < nearestDist && dist < g.aggroRange * TILE) {
          nearestDist = dist;
          nearestPlayer = p;
        }
      }

      if (nearestPlayer) {
        g.dir = nearestPlayer.x > g.x ? 1 : -1;

        if (nearestDist > TILE * 1.2) {
          // Move toward player
          g.anim = 'walk';
          const dx = nearestPlayer.x - g.x;
          const dy = nearestPlayer.y - g.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d > 0) {
            g.x += (dx / d) * 1.5;
            g.y += (dy / d) * 1.5;
            g.tileX = Math.floor(g.x / TILE);
            g.tileY = Math.floor(g.y / TILE);
            updated = true;
          }
        } else {
          g.anim = 'attack';
          updated = true;
        }
      } else {
        if (g.anim !== 'idle') {
          g.anim = 'idle';
          updated = true;
        }
      }
    }
  }

  // Broadcast goblin state if anything changed
  if (updated) {
    broadcast({ type: 'goblins', goblins });
  }
}, 50); // 20 updates per second
