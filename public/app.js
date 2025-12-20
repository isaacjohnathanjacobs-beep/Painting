// Detect API URL based on current host
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

let currentFilter = 'all';
let editingJobId = null;
let editingEmployeeId = null;
let currentJobForAssignment = null;
let openChecklists = new Set(); // Track which checklists are open

// Escape string for use in HTML attributes
function escapeHtmlAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Safe helper to parse dates - handles both arrays (already parsed by server) and strings
function safeParseDates(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse dates:', e);
    return [];
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupFilters();
  loadJobs();
  loadEmployees();
  setupForms();
});

// TAB MANAGEMENT
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// FILTER MANAGEMENT
function setupFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadJobs();
    });
  });
}

// JOBS FUNCTIONS
async function loadJobs() {
  try {
    const response = await fetch(`${API_URL}/jobs`);
    const jobs = await response.json();

    let filteredJobs = jobs;
    if (currentFilter !== 'all') {
      filteredJobs = jobs.filter(job => job.status === currentFilter);
    }

    displayJobs(filteredJobs);
  } catch (error) {
    console.error('Error loading jobs:', error);
  }
}

async function generateProfessionalTaskDisplay(jobId, checklist) {
  // Fetch task completion details
  let taskCompletions = {};
  try {
    const response = await fetch(`/api/jobs/${jobId}/tasks`);
    const tasks = await response.json();
    tasks.forEach(task => {
      taskCompletions[task.task_id] = task;
    });
  } catch (error) {
    console.error('Error loading task completions:', error);
  }

  // Fetch employees to show names
  let employees = [];
  try {
    const response = await fetch('/api/employees');
    employees = await response.json();
  } catch (error) {
    console.error('Error loading employees:', error);
  }

  // Calculate overall progress
  const totalPercentage = checklist.reduce((sum, task) => {
    return sum + (task.completed ? task.percentage : 0);
  }, 0);

  // Group tasks by phase
  const phases = {
    setup: { name: 'Setup & Preparation', tasks: [], color: '#3b82f6' },
    prep: { name: 'Surface Preparation', tasks: [], color: '#f59e0b' },
    painting: { name: 'Painting', tasks: [], color: '#22c55e' },
    qa: { name: 'Quality Assurance', tasks: [], color: '#8b5cf6' },
    completion: { name: 'Completion', tasks: [], color: '#06b6d4' }
  };

  checklist.forEach(task => {
    if (phases[task.phase]) {
      phases[task.phase].tasks.push(task);
    }
  });

  // Sort tasks within each phase by ID to maintain proper order
  Object.values(phases).forEach(phase => {
    phase.tasks.sort((a, b) => a.id - b.id);
  });

  // Check if task dependencies are met
  const canCheckTask = (task) => {
    if (task.completed) return true;
    if (!task.dependencies || task.dependencies.length === 0) return true;

    // All dependencies must be completed
    return task.dependencies.every(depId => {
      const depTask = checklist.find(t => t.id === depId);
      return depTask && depTask.completed;
    });
  };

  return `
    <div class="professional-task-section">
      <div class="professional-task-header" onclick="toggleChecklist(${jobId})">
        <div>
          <h4 style="margin: 0; font-size: 1.1rem;">Professional Task List</h4>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-muted);">
            ${checklist.filter(t => t.completed).length}/${checklist.length} tasks complete
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--primary);">${Math.round(totalPercentage)}%</div>
          <span class="checklist-toggle" style="font-size: 1.2rem;">${openChecklists.has(jobId) ? '▲' : '▼'}</span>
        </div>
      </div>

      <div class="progress-bar-container" style="margin-top: 1rem;">
        <div class="progress-bar" style="width: ${totalPercentage}%;"></div>
      </div>

      <div id="checklist-${jobId}" class="professional-task-content" style="display: ${openChecklists.has(jobId) ? 'block' : 'none'};">
        ${Object.entries(phases).map(([phaseKey, phase]) => {
          if (phase.tasks.length === 0) return '';

          const phaseCompleted = phase.tasks.filter(t => t.completed).length;
          const phaseTotal = phase.tasks.length;
          const phaseProgress = phase.tasks.reduce((sum, t) => sum + (t.completed ? t.percentage : 0), 0);

          return `
            <div class="task-phase">
              <div class="phase-header" style="border-left-color: ${phase.color};">
                <div>
                  <h5 style="margin: 0; color: ${phase.color};">${phase.name}</h5>
                  <small style="color: var(--text-muted);">${phaseCompleted}/${phaseTotal} tasks • ${Math.round(phaseProgress)}%</small>
                </div>
              </div>

              <div class="phase-tasks">
                ${phase.tasks.map(task => {
                  const isEnabled = canCheckTask(task);
                  const hasUnmetDeps = !isEnabled && !task.completed;
                  const completion = taskCompletions[task.id];

                  // Get completion info
                  let completionInfo = '';
                  if (task.completed && completion) {
                    const completedBy = employees.find(e => e.id === completion.completed_by);
                    const completionDate = completion.completion_date;
                    if (completedBy) {
                      completionInfo = `<span style="color: var(--success); font-weight: 500;"> ✓ Completed by ${completedBy.name}${completionDate ? ` on ${completionDate}` : ''}</span>`;
                    }
                  }

                  return `
                    <div class="professional-task-item ${task.completed ? 'completed' : ''} ${!isEnabled ? 'disabled' : ''}">
                      <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                        <input type="checkbox"
                               id="task-${jobId}-${task.id}"
                               ${task.completed ? 'checked' : ''}
                               ${!isEnabled ? 'disabled' : ''}
                               onchange="updateProfessionalTask(${jobId}, ${task.id}, this.checked, '${escapeHtmlAttr(task.task)}', '${escapeHtmlAttr(task.room || '')}', ${task.percentage || 0})"
                               style="margin-top: 0.25rem;">
                        <div style="flex: 1;">
                          <label for="task-${jobId}-${task.id}" style="cursor: ${isEnabled ? 'pointer' : 'not-allowed'}; display: block;">
                            <div style="font-weight: 600;">${task.task}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">
                              ${task.room} ${task.percentage > 0 ? `• ${task.percentage.toFixed(1)}% of job` : ''}
                              ${hasUnmetDeps ? '<span style="color: var(--warning);"> • Blocked: prerequisites not complete</span>' : ''}
                              ${completionInfo}
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function generateMaterialsDisplay(jobId, materials) {
  if (!materials || materials.length === 0) {
    return '';
  }

  // Calculate total and completed items
  const totalItems = materials.reduce((sum, cat) => sum + cat.items.length, 0);
  const completedItems = materials.reduce((sum, cat) => {
    return sum + cat.items.filter(item => item.checked).length;
  }, 0);

  // Track if materials section is open
  const isOpen = openChecklists.has(`materials-${jobId}`);

  return `
    <div class="professional-task-section" style="margin-top: 1rem;">
      <div class="professional-task-header" onclick="toggleMaterialsChecklist(${jobId})" style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));">
        <div>
          <h4 style="margin: 0; font-size: 1.1rem; color: var(--accent);">📋 Materials & Tools Checklist</h4>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.85rem; color: var(--text-muted);">
            ${completedItems}/${totalItems} items prepared • ${materials.length} categories
          </p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--accent);">${Math.round((completedItems / totalItems) * 100) || 0}%</div>
          <span class="checklist-toggle" style="font-size: 1.2rem;">${isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      <div id="materials-${jobId}" class="professional-task-content" style="display: ${isOpen ? 'block' : 'none'};">
        ${materials.map((category) => {
          const categoryCompleted = category.items.filter(item => item.checked).length;
          const categoryTotal = category.items.length;

          return `
            <div class="task-phase" style="border-left: 3px solid var(--accent);">
              <div class="phase-header" style="border-left-color: var(--accent); background: rgba(59, 130, 246, 0.05);">
                <div>
                  <h5 style="margin: 0; color: var(--accent); font-size: 1rem;">${category.category}</h5>
                  <small style="color: var(--text-muted);">${categoryCompleted}/${categoryTotal} items</small>
                </div>
              </div>

              <div class="phase-tasks">
                ${category.items.map((item) => `
                  <div class="professional-task-item ${item.checked ? 'completed' : ''}" style="padding: 0.75rem;">
                    <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                      <input type="checkbox"
                             id="material-${jobId}-${item.id}"
                             ${item.checked ? 'checked' : ''}
                             onchange="updateMaterialItem(${jobId}, ${item.id}, this.checked)"
                             style="margin-top: 0.25rem; width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent); flex-shrink: 0;">
                      <div style="flex: 1;">
                        <label for="material-${jobId}-${item.id}" style="cursor: pointer; display: block;">
                          <div style="font-weight: 600; color: var(--text-primary); margin-bottom: 0.25rem; ${item.checked ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
                            ${item.name}
                          </div>
                          <div style="font-size: 0.8rem; color: var(--text-muted);">
                            <span style="background: rgba(59, 130, 246, 0.1); padding: 0.2rem 0.5rem; border-radius: 4px; margin-right: 0.5rem;">
                              Qty: ${item.quantity}
                            </span>
                            ${item.notes}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function toggleMaterialsChecklist(jobId) {
  const materialsDiv = document.getElementById(`materials-${jobId}`);
  const isVisible = materialsDiv.style.display !== 'none';
  materialsDiv.style.display = isVisible ? 'none' : 'block';

  // Track open/closed state
  if (isVisible) {
    openChecklists.delete(`materials-${jobId}`);
  } else {
    openChecklists.add(`materials-${jobId}`);
  }

  // Update toggle arrow
  const toggle = materialsDiv.previousElementSibling.querySelector('.checklist-toggle');
  if (toggle) {
    toggle.textContent = isVisible ? '▼' : '▲';
  }
}

async function updateMaterialItem(jobId, itemId, checked) {
  try {
    // Get current job data
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    const job = await response.json();

    // Parse and update materials checklist
    let materialsChecklist = [];
    try {
      if (typeof job.materials_checklist === 'string') {
        materialsChecklist = JSON.parse(job.materials_checklist);
      } else if (Array.isArray(job.materials_checklist)) {
        materialsChecklist = job.materials_checklist;
      } else {
        materialsChecklist = [];
      }
    } catch (e) {
      console.error('Error parsing materials checklist:', e);
      materialsChecklist = [];
    }

    // Find and update the specific item across all categories
    let itemFound = false;
    materialsChecklist.forEach(category => {
      const item = category.items.find(i => i.id === itemId);
      if (item) {
        item.checked = checked;
        itemFound = true;
      }
    });

    if (!itemFound) {
      console.error('Material item not found:', itemId);
      return;
    }

    // Save updated materials checklist using PATCH endpoint
    await fetch(`${API_URL}/jobs/${jobId}/materials`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materials_checklist: materialsChecklist })
    });

    // Reload jobs to show updated progress
    loadJobs();
  } catch (error) {
    console.error('Error updating material item:', error);
    alert('Error updating material item');
  }
}

async function displayJobs(jobs) {
  const jobsList = document.getElementById('jobs-list');

  if (jobs.length === 0) {
    jobsList.innerHTML = `
      <div class="empty-state">
        <h3>No jobs found</h3>
        <p>Click "Add Job" to create your first job</p>
      </div>
    `;
    return;
  }

  // Fetch calendar assignments for mini calendar
  let allAssignments = [];
  try {
    const response = await fetch('/api/calendar');
    allAssignments = await response.json();
  } catch (error) {
    console.error('Error loading calendar assignments:', error);
  }

  const jobsHTML = await Promise.all(jobs.map(async job => {
    const employees = await getJobEmployees(job.id);

    // Parse checklist from JSON
    let checklist = [];
    try {
      if (typeof job.checklist === 'string') {
        checklist = JSON.parse(job.checklist);
      } else if (Array.isArray(job.checklist)) {
        checklist = job.checklist;
      } else {
        checklist = [];
      }
    } catch (e) {
      console.error('Error parsing checklist:', e);
      checklist = [];
    }

    // Parse materials checklist from JSON
    let materialsChecklist = [];
    try {
      if (typeof job.materials_checklist === 'string') {
        materialsChecklist = JSON.parse(job.materials_checklist);
      } else if (Array.isArray(job.materials_checklist)) {
        materialsChecklist = job.materials_checklist;
      } else {
        materialsChecklist = [];
      }
    } catch (e) {
      console.error('Error parsing materials checklist:', e);
      materialsChecklist = [];
    }

    const completedCount = checklist.filter(item => item.completed).length;
    const totalCount = checklist.length;

    // Calculate predicted hours
    const predictedHours = calculatePredictedHours(job.estimated_hours, employees);

    // Calculate predicted completion date
    const predictedCompletion = checklist.length > 0 ? await calculatePredictedCompletionDate(job.id, checklist) : null;

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${job.client_name}</div>
            <div class="card-subtitle">${job.address}</div>
          </div>
          <span class="status-badge status-${job.status}">${formatStatus(job.status)}</span>
        </div>
        <div class="card-body">
          ${job.description ? `<p style="margin-bottom: 15px; color: var(--text-muted);">${job.description.replace(/\n/g, '<br>')}</p>` : ''}
          <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 280px;">
              <div class="info-row">
                ${job.client_phone ? `<div class="info-item"><span class="info-label">Phone:</span><span class="info-value">${job.client_phone}</span></div>` : ''}
                ${job.client_email ? `<div class="info-item"><span class="info-label">Email:</span><span class="info-value">${job.client_email}</span></div>` : ''}
              </div>
              <div class="info-row">
                ${job.start_date ? `<div class="info-item"><span class="info-label">Start:</span><span class="info-value">${formatDateReadable(job.start_date)}</span></div>` : ''}
                ${job.end_date ? `<div class="info-item"><span class="info-label">End:</span><span class="info-value">${formatDateReadable(job.end_date)}</span></div>` : ''}
                ${job.estimated_hours ? `<div class="info-item"><span class="info-label">Est. Hours:</span><span class="info-value">${job.estimated_hours}</span></div>` : ''}
                ${job.estimated_cost ? `<div class="info-item"><span class="info-label">Est. Cost:</span><span class="info-value">$${job.estimated_cost}</span></div>` : ''}
              </div>
              ${predictedHours ? `
                <div class="info-row" style="background: #e8f5e9; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem;">
                  <div class="info-item"><span class="info-label">🎯 Predicted Hours:</span><span class="info-value" style="font-weight: 600; color: #2e7d32;">${predictedHours} hrs</span></div>
                  <div class="info-item"><span class="info-label">Team Efficiency:</span><span class="info-value">${employees.map(e => ((e.type === 'brush_hand' ? 0.667 : 1.0) * (e.rating || 1.0)).toFixed(2) + 'x').join(' + ')}</span></div>
                </div>
              ` : ''}
              ${predictedCompletion ? `
                <div class="info-row" style="background: #e3f2fd; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem;">
                  <div class="info-item"><span class="info-label">📅 Predicted Completion:</span><span class="info-value" style="font-weight: 600; color: #1976d2;">${predictedCompletion.displayDate} (${predictedCompletion.daysRemaining} days)</span></div>
                  <div class="info-item"><span class="info-label">Daily Rate:</span><span class="info-value">${predictedCompletion.completionRate}% per day</span></div>
                </div>
              ` : ''}
              ${employees.length > 0 ? `
                <div class="assigned-employees">
                  <h4>Assigned Employees:</h4>
                  <div class="employee-tags">
                    ${employees.map(emp => `<span class="employee-tag">${emp.name}</span>`).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
            ${(() => {
              // Get assignments for this job
              const jobAssignments = allAssignments.filter(a => a.job_id === job.id);

              // Collect all assigned dates with employee names
              const dateEmployees = {};
              jobAssignments.forEach(a => {
                const dates = safeParseDates(a.assigned_dates);
                dates.forEach(dateStr => {
                  if (!dateEmployees[dateStr]) dateEmployees[dateStr] = [];
                  const emp = employees.find(e => e.id === a.employee_id);
                  if (emp) dateEmployees[dateStr].push(emp.name);
                });
              });

              // Generate next 14 days for calendar grid
              const today = new Date();
              const calendarDays = [];
              for (let i = 0; i < 14; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() + i);
                calendarDays.push({
                  date: formatDate(date),
                  dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
                  dayNum: date.getDate()
                });
              }

              return `
                <div class="job-schedule-calendar" style="flex: 0 0 auto; padding: 1.25rem; background: var(--bg-tertiary); border-radius: 8px;">
                  <h4 style="margin: 0 0 0.75rem 0; font-size: 1rem; color: var(--primary);">📅 Work Schedule</h4>
                  <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; font-size: 0.85rem;">
                    ${calendarDays.map(day => {
                      const empsOnDay = dateEmployees[day.date] || [];
                      const hasWorkers = empsOnDay.length > 0;
                      const empNames = empsOnDay.join(', ');
                      const displayName = empsOnDay.length > 0 ? (empsOnDay[0].length > 6 ? empsOnDay[0].substring(0, 5) + '…' : empsOnDay[0]) : '';
                      const moreCount = empsOnDay.length > 1 ? `+${empsOnDay.length - 1}` : '';
                      return `
                        <div title="${hasWorkers ? empNames : 'No workers assigned'}"
                             style="text-align: center; padding: 0.5rem 0.3rem; border-radius: 4px;
                                    background: ${hasWorkers ? 'var(--primary)' : 'var(--bg-secondary)'};
                                    color: ${hasWorkers ? 'white' : 'var(--text-muted)'}; min-height: 60px; min-width: 42px;">
                          <div style="font-weight: 600; font-size: 1rem;">${day.dayNum}</div>
                          <div style="font-size: 0.65rem; opacity: 0.7;">${day.dayName}</div>
                          ${hasWorkers ? `<div style="font-size: 0.6rem; margin-top: 2px; font-weight: 500;">${displayName}${moreCount}</div>` : ''}
                        </div>
                      `;
                    }).join('')}
                  </div>
                  <button class="btn btn-primary" style="width: 100%; margin-top: 1rem; padding: 0.6rem 1rem;" onclick="manageAssignments(${job.id})">Assign Employees</button>
                </div>
              `;
            })()}
          </div>
          ${materialsChecklist.length > 0 ? generateMaterialsDisplay(job.id, materialsChecklist) : ''}
          ${checklist.length > 0 ? await generateProfessionalTaskDisplay(job.id, checklist) : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="endOfDayReview(${job.id})" title="Review today's performance and adjust ratings">📊 Day Review</button>
          <button class="btn btn-secondary btn-sm" onclick="editJob(${job.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteJob(${job.id})">Delete</button>
        </div>
      </div>
    `;
  }));

  jobsList.innerHTML = jobsHTML.join('');
}

// Calculate predicted hours based on team efficiency
function calculatePredictedHours(estimatedHours, employees) {
  if (!estimatedHours || employees.length === 0) {
    return null;
  }

  // Calculate team efficiency
  let teamEfficiency = 0;
  employees.forEach(emp => {
    const baseEfficiency = emp.type === 'brush_hand' ? 0.667 : 1.0;
    const rating = emp.rating || 1.0;
    teamEfficiency += baseEfficiency * rating;
  });

  if (teamEfficiency === 0) {
    return null;
  }

  return (estimatedHours / teamEfficiency).toFixed(1);
}

// Calculate predicted completion date based on actual progress
async function calculatePredictedCompletionDate(jobId, checklist) {
  try {
    if (!checklist || checklist.length === 0) return null;

    // Get task completion history
    const response = await fetch(`/api/jobs/${jobId}/tasks`);
    const taskCompletions = await response.json();

    if (taskCompletions.length === 0) return null;

    // Calculate completion dates
    const completionDates = taskCompletions
      .filter(t => t.completed && t.completion_date)
      .map(t => new Date(t.completion_date + 'T00:00:00'))
      .sort((a, b) => a - b);

    if (completionDates.length === 0) return null;

    const firstCompletion = completionDates[0];
    const lastCompletion = completionDates[completionDates.length - 1];
    const daysElapsed = Math.max(1, Math.ceil((lastCompletion - firstCompletion) / (1000 * 60 * 60 * 24)));

    // Calculate progress percentage
    const totalPercentage = checklist.reduce((sum, task) => sum + task.percentage, 0);
    const completedPercentage = checklist.reduce((sum, task) => {
      return sum + (task.completed ? task.percentage : 0);
    }, 0);

    if (completedPercentage === 0) return null;

    // Calculate daily completion rate
    const dailyRate = completedPercentage / daysElapsed;

    if (dailyRate === 0) return null;

    // Calculate remaining days
    const remainingPercentage = totalPercentage - completedPercentage;
    const daysRemaining = Math.ceil(remainingPercentage / dailyRate);

    // Calculate predicted completion date
    const today = new Date();
    const predictedDate = new Date(today);
    predictedDate.setDate(predictedDate.getDate() + daysRemaining);

    return {
      date: formatDate(predictedDate),
      displayDate: formatDateDisplay(predictedDate),
      daysRemaining,
      completionRate: dailyRate.toFixed(1)
    };
  } catch (error) {
    console.error('Error calculating predicted completion date:', error);
    return null;
  }
}

async function getJobEmployees(jobId) {
  try {
    console.log(`[getJobEmployees] Fetching employees for job ${jobId}`);
    const response = await fetch(`${API_URL}/jobs/${jobId}/employees`);
    console.log(`[getJobEmployees] Response status: ${response.status}`);
    if (!response.ok) {
      console.error('Failed to fetch job employees:', response.statusText);
      return [];
    }
    const data = await response.json();
    console.log(`[getJobEmployees] Found ${Array.isArray(data) ? data.length : 0} employees:`, data);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error loading job employees:', error);
    return [];
  }
}

function showJobModal(jobId = null) {
  editingJobId = jobId;
  const modal = document.getElementById('job-modal');
  const form = document.getElementById('job-form');
  const title = document.getElementById('job-modal-title');

  if (jobId) {
    title.textContent = 'Edit Job';
    loadJobData(jobId);
  } else {
    title.textContent = 'Add Job';
    form.reset();
  }

  modal.classList.add('active');
}

function closeJobModal() {
  document.getElementById('job-modal').classList.remove('active');
  document.getElementById('job-form').reset();
  editingJobId = null;
  // Clear any stored lists
  window.pendingTaskList = null;
  window.pendingMaterialsList = null;
  window.existingTaskList = null;
  window.existingMaterialsList = null;
}

async function loadJobData(jobId) {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    const job = await response.json();

    document.getElementById('job-id').value = job.id;
    document.getElementById('client-name').value = job.client_name || '';
    document.getElementById('client-phone').value = job.client_phone || '';
    document.getElementById('client-email').value = job.client_email || '';
    document.getElementById('address').value = job.address || '';
    document.getElementById('description').value = job.description || '';
    document.getElementById('status').value = job.status || 'pending';
    document.getElementById('start-date').value = job.start_date || '';
    document.getElementById('end-date').value = job.end_date || '';
    document.getElementById('estimated-hours').value = job.estimated_hours || '';
    document.getElementById('actual-hours').value = job.actual_hours || '';
    document.getElementById('estimated-cost').value = job.estimated_cost || '';
    document.getElementById('actual-cost').value = job.actual_cost || '';

    // Preserve existing checklists when editing
    let checklist = [];
    let materialsChecklist = [];
    try {
      checklist = typeof job.checklist === 'string' ? JSON.parse(job.checklist) : (job.checklist || []);
      materialsChecklist = typeof job.materials_checklist === 'string' ? JSON.parse(job.materials_checklist) : (job.materials_checklist || []);
    } catch (e) {
      console.warn('Error parsing existing checklists:', e);
    }
    window.existingTaskList = checklist;
    window.existingMaterialsList = materialsChecklist;
  } catch (error) {
    console.error('Error loading job data:', error);
  }
}

async function editJob(jobId) {
  showJobModal(jobId);
}

async function deleteJob(jobId) {
  if (!confirm('Are you sure you want to delete this job?')) return;

  try {
    await fetch(`${API_URL}/jobs/${jobId}`, { method: 'DELETE' });
    loadJobs();
  } catch (error) {
    console.error('Error deleting job:', error);
  }
}

// EMPLOYEES FUNCTIONS
async function loadEmployees() {
  try {
    const response = await fetch(`${API_URL}/employees`);
    const employees = await response.json();
    displayEmployees(employees);
  } catch (error) {
    console.error('Error loading employees:', error);
  }
}

// Store employee calendar data globally for quick updates
let employeeCalendarData = {};

async function displayEmployees(employees) {
  const employeesList = document.getElementById('employees-list');

  if (employees.length === 0) {
    employeesList.innerHTML = `
      <div class="empty-state">
        <h3>No employees found</h3>
        <p>Click "Add Employee" to create your first employee</p>
      </div>
    `;
    return;
  }

  // Fetch calendar assignments for mini calendar
  let assignments = [];
  try {
    const response = await fetch(`${API_URL}/calendar`);
    assignments = await response.json();
  } catch (error) {
    console.error('Error loading calendar assignments:', error);
  }

  // Fetch jobs for display
  let jobs = [];
  try {
    const response = await fetch(`${API_URL}/jobs`);
    const allJobs = await response.json();
    // Show all jobs except completed ones
    jobs = allJobs.filter(j => j.status !== 'completed');
    console.log(`[displayEmployees] Loaded ${jobs.length} jobs for assignment (${allJobs.length} total)`);
  } catch (error) {
    console.error('Error loading jobs:', error);
  }

  // Store jobs globally for quick access
  window.activeJobs = jobs;

  // Generate next 14 days for calendar
  const today = new Date();
  const calendarDays = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    calendarDays.push({
      date: formatDate(date),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' })
    });
  }

  const employeesHTML = employees.map(emp => {
    // Get assignments for this employee
    const empAssignments = assignments.filter(a => a.employee_id === emp.id);

    // Build a map of dates to jobs for this employee
    const dateJobMap = {};
    empAssignments.forEach(a => {
      const dates = safeParseDates(a.assigned_dates);
      dates.forEach(d => {
        if (!dateJobMap[d]) dateJobMap[d] = [];
        const job = jobs.find(j => j.id === a.job_id);
        if (job) dateJobMap[d].push({ id: a.job_id, name: job.client_name });
      });
    });

    // Store for quick updates
    employeeCalendarData[emp.id] = { assignments: empAssignments, dateJobMap, jobs };

    // Build mini calendar with assignment indicators
    const calendarHTML = `
      <div class="employee-calendar" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <h4 style="margin: 0; font-size: 0.9rem; color: var(--primary);">📅 Schedule & Assign</h4>
          <select id="job-select-${emp.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; border-radius: 4px; border: 1px solid var(--border); background: var(--bg-secondary);">
            <option value="">Select job...</option>
            ${jobs.map(j => `<option value="${j.id}">${j.client_name}</option>`).join('')}
          </select>
        </div>
        <div id="cal-grid-${emp.id}" class="mini-cal-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; font-size: 0.75rem;">
          ${calendarDays.map(day => renderCalendarDay(emp.id, day, dateJobMap)).join('')}
        </div>
        <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted);">
          Select a job, then click dates to assign
        </div>
      </div>
    `;

    return `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${emp.name}</div>
            ${emp.role ? `<div class="card-subtitle">${emp.role}</div>` : ''}
          </div>
          <span class="status-badge status-${emp.status}">${formatStatus(emp.status)}</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            ${emp.email ? `<div class="info-item"><span class="info-label">Email:</span><span class="info-value">${emp.email}</span></div>` : ''}
            ${emp.phone ? `<div class="info-item"><span class="info-label">Phone:</span><span class="info-value">${emp.phone}</span></div>` : ''}
            ${emp.hourly_rate ? `<div class="info-item"><span class="info-label">Hourly Rate:</span><span class="info-value">$${emp.hourly_rate}/hr</span></div>` : ''}
          </div>
          <div class="info-row" style="margin-top: 0.5rem; border-top: 1px solid #eee; padding-top: 0.5rem;">
            <div class="info-item"><span class="info-label">Type:</span><span class="info-value">${emp.type === 'brush_hand' ? 'Brush Hand (67%)' : 'Painter (100%)'}</span></div>
            <div class="info-item"><span class="info-label">Rating:</span><span class="info-value">${emp.rating || 1.0}x</span></div>
            <div class="info-item"><span class="info-label">Efficiency:</span><span class="info-value">${((emp.type === 'brush_hand' ? 0.667 : 1.0) * (emp.rating || 1.0)).toFixed(2)}x</span></div>
          </div>
          ${calendarHTML}
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="editEmployee(${emp.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  employeesList.innerHTML = employeesHTML;
}

// Render a single calendar day cell
function renderCalendarDay(empId, day, dateJobMap) {
  const jobsOnDay = dateJobMap[day.date] || [];
  const hasJob = jobsOnDay.length > 0;
  const firstJob = jobsOnDay[0];
  const jobLabel = firstJob ? (firstJob.name.length > 8 ? firstJob.name.substring(0, 7) + '…' : firstJob.name) : '';
  const jobNames = jobsOnDay.map(j => j.name).join(', ');

  return `
    <div class="mini-cal-day ${hasJob ? 'has-job' : ''}"
         id="cal-day-${empId}-${day.date}"
         data-date="${day.date}"
         data-employee="${empId}"
         onclick="toggleEmployeeDate(${empId}, '${day.date}')"
         title="${hasJob ? jobNames : 'Click to assign'}"
         style="text-align: center; padding: 0.3rem 0.1rem; border-radius: 4px; cursor: pointer;
                background: ${hasJob ? 'var(--primary)' : 'var(--bg-tertiary)'};
                color: ${hasJob ? 'white' : 'var(--text-secondary)'}; min-height: 50px;">
      <div style="font-weight: 600; font-size: 0.85rem;">${day.dayNum}</div>
      <div style="font-size: 0.6rem; opacity: 0.7;">${day.dayName}</div>
      ${hasJob ? `<div style="font-size: 0.55rem; margin-top: 2px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${jobLabel}</div>` : ''}
    </div>
  `;
}

// Toggle employee assignment for a specific date (optimized for multi-select)
async function toggleEmployeeDate(employeeId, dateStr) {
  const jobSelect = document.getElementById(`job-select-${employeeId}`);
  const jobId = jobSelect?.value;
  const jobName = jobSelect?.options[jobSelect.selectedIndex]?.text;

  if (!jobId) {
    alert('Please select a job first');
    return;
  }

  const dayEl = document.getElementById(`cal-day-${employeeId}-${dateStr}`);
  if (dayEl) {
    dayEl.style.opacity = '0.5'; // Visual feedback
  }

  try {
    // Get current assignments for this employee and job
    const calendarRes = await fetch(`${API_URL}/calendar`);
    const assignments = await calendarRes.json();

    const existingAssignment = assignments.find(a =>
      a.job_id === parseInt(jobId) && a.employee_id === employeeId
    );

    let currentDates = [];
    if (existingAssignment) {
      currentDates = safeParseDates(existingAssignment.assigned_dates);
    } else {
      // Create the assignment first
      await fetch(`${API_URL}/jobs/${jobId}/assign/${employeeId}`, { method: 'POST' });
    }

    // Toggle the date
    const dateIndex = currentDates.indexOf(dateStr);
    let adding = false;
    if (dateIndex > -1) {
      currentDates.splice(dateIndex, 1); // Remove date
    } else {
      currentDates.push(dateStr); // Add date
      currentDates.sort();
      adding = true;
    }

    // Update the dates
    await fetch(`${API_URL}/jobs/${jobId}/assign/${employeeId}/dates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: currentDates })
    });

    // Update UI immediately without full reload
    if (dayEl) {
      const dateObj = new Date(dateStr + 'T00:00:00');
      const dayInfo = {
        date: dateStr,
        dayName: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: dateObj.getDate()
      };

      // Update local data
      const data = employeeCalendarData[employeeId];
      if (data) {
        if (adding) {
          if (!data.dateJobMap[dateStr]) data.dateJobMap[dateStr] = [];
          data.dateJobMap[dateStr].push({ id: parseInt(jobId), name: jobName });
        } else {
          if (data.dateJobMap[dateStr]) {
            data.dateJobMap[dateStr] = data.dateJobMap[dateStr].filter(j => j.id !== parseInt(jobId));
            if (data.dateJobMap[dateStr].length === 0) delete data.dateJobMap[dateStr];
          }
        }
        dayEl.outerHTML = renderCalendarDay(employeeId, dayInfo, data.dateJobMap);
      } else {
        dayEl.style.opacity = '1';
      }
    }
  } catch (error) {
    console.error('Error toggling date assignment:', error);
    alert('Error updating assignment');
    if (dayEl) dayEl.style.opacity = '1';
  }
}

function showEmployeeModal(employeeId = null) {
  editingEmployeeId = employeeId;
  const modal = document.getElementById('employee-modal');
  const form = document.getElementById('employee-form');
  const title = document.getElementById('employee-modal-title');

  if (employeeId) {
    title.textContent = 'Edit Employee';
    loadEmployeeData(employeeId);
  } else {
    title.textContent = 'Add Employee';
    form.reset();
    document.getElementById('employee-status').value = 'active';
  }

  modal.classList.add('active');
}

function closeEmployeeModal() {
  document.getElementById('employee-modal').classList.remove('active');
  document.getElementById('employee-form').reset();
  editingEmployeeId = null;
}

async function loadEmployeeData(employeeId) {
  try {
    const response = await fetch(`${API_URL}/employees/${employeeId}`);
    const employee = await response.json();

    document.getElementById('employee-id').value = employee.id;
    document.getElementById('employee-name').value = employee.name || '';
    document.getElementById('employee-email').value = employee.email || '';
    document.getElementById('employee-phone').value = employee.phone || '';
    document.getElementById('employee-role').value = employee.role || '';
    document.getElementById('hourly-rate').value = employee.hourly_rate || '';
    document.getElementById('employee-status').value = employee.status || 'active';
    document.getElementById('employee-type').value = employee.type || 'painter';
    document.getElementById('employee-rating').value = employee.rating || 1.0;
  } catch (error) {
    console.error('Error loading employee data:', error);
  }
}

async function editEmployee(employeeId) {
  showEmployeeModal(employeeId);
}

async function deleteEmployee(employeeId) {
  if (!confirm('Are you sure you want to delete this employee?')) return;

  try {
    await fetch(`${API_URL}/employees/${employeeId}`, { method: 'DELETE' });
    loadEmployees();
  } catch (error) {
    console.error('Error deleting employee:', error);
  }
}

// ASSIGNMENT MANAGEMENT
let assignmentCalendarData = {};

async function manageAssignments(jobId) {
  currentJobForAssignment = jobId;
  const modal = document.getElementById('assign-modal');

  try {
    const [allEmployees, assignedEmployees, jobData] = await Promise.all([
      fetch(`${API_URL}/employees`).then(r => r.json()),
      fetch(`${API_URL}/jobs/${jobId}/employees`).then(r => r.json()),
      fetch(`${API_URL}/jobs/${jobId}`).then(r => r.json())
    ]);

    // Build map of employee assignments with their dates
    const assignmentMap = {};
    assignedEmployees.forEach(emp => {
      assignmentMap[emp.id] = {
        assigned: true,
        dates: safeParseDates(emp.assigned_dates)
      };
    });

    // Store for quick updates
    assignmentCalendarData[jobId] = { assignmentMap, allEmployees };

    // Generate next 14 days
    const today = new Date();
    const calendarDays = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      calendarDays.push({
        date: formatDate(date),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate()
      });
    }

    const content = document.getElementById('assign-content');
    content.innerHTML = `
      <h3 style="margin-bottom: 1rem;">${jobData.client_name || 'Job'}</h3>
      <div class="assignment-list">
        ${allEmployees.filter(e => e.status === 'active').map(emp => {
          const assignment = assignmentMap[emp.id] || { assigned: false, dates: [] };
          return `
            <div class="assignment-item" style="margin-bottom: 1.5rem; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px;">
              <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem;">
                <input type="checkbox" id="assign-emp-${emp.id}"
                       ${assignment.assigned ? 'checked' : ''}
                       onchange="toggleAssignment(${jobId}, ${emp.id}, this.checked)"
                       style="width: 18px; height: 18px;">
                <label for="assign-emp-${emp.id}" style="flex: 1; cursor: pointer;">
                  <strong>${emp.name}</strong>
                  ${emp.role ? `<span style="color: var(--text-muted);"> - ${emp.role}</span>` : ''}
                </label>
              </div>
              <div id="assign-cal-${emp.id}" style="display: ${assignment.assigned ? 'block' : 'none'};">
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">Click dates to assign:</div>
                <div class="assign-cal-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; font-size: 0.75rem;">
                  ${calendarDays.map(day => {
                    const isAssigned = assignment.dates.includes(day.date);
                    return `
                      <div class="assign-cal-day"
                           id="assign-day-${jobId}-${emp.id}-${day.date}"
                           onclick="toggleJobAssignmentDate(${jobId}, ${emp.id}, '${day.date}')"
                           style="text-align: center; padding: 0.4rem 0.2rem; border-radius: 4px; cursor: pointer;
                                  background: ${isAssigned ? 'var(--primary)' : 'var(--bg-secondary)'};
                                  color: ${isAssigned ? 'white' : 'var(--text-secondary)'};">
                        <div style="font-weight: 600;">${day.dayNum}</div>
                        <div style="font-size: 0.6rem; opacity: 0.7;">${day.dayName}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      <div class="form-actions" style="margin-top: 1rem;">
        <button class="btn btn-primary" onclick="closeAssignModal()">Done</button>
      </div>
    `;

    modal.classList.add('active');
  } catch (error) {
    console.error('Error loading assignment data:', error);
  }
}

async function toggleAssignment(jobId, employeeId, isAssigned) {
  try {
    if (isAssigned) {
      await fetch(`${API_URL}/jobs/${jobId}/assign/${employeeId}`, { method: 'POST' });
      // Show calendar
      const cal = document.getElementById(`assign-cal-${employeeId}`);
      if (cal) cal.style.display = 'block';
      // Update local data
      if (assignmentCalendarData[jobId]) {
        if (!assignmentCalendarData[jobId].assignmentMap[employeeId]) {
          assignmentCalendarData[jobId].assignmentMap[employeeId] = { assigned: true, dates: [] };
        }
        assignmentCalendarData[jobId].assignmentMap[employeeId].assigned = true;
      }
    } else {
      await fetch(`${API_URL}/jobs/${jobId}/assign/${employeeId}`, { method: 'DELETE' });
      // Hide calendar
      const cal = document.getElementById(`assign-cal-${employeeId}`);
      if (cal) cal.style.display = 'none';
      // Update local data
      if (assignmentCalendarData[jobId] && assignmentCalendarData[jobId].assignmentMap[employeeId]) {
        assignmentCalendarData[jobId].assignmentMap[employeeId].assigned = false;
        assignmentCalendarData[jobId].assignmentMap[employeeId].dates = [];
      }
    }
    loadJobs();
  } catch (error) {
    console.error('Error toggling assignment:', error);
  }
}

async function toggleJobAssignmentDate(jobId, employeeId, dateStr) {
  const dayEl = document.getElementById(`assign-day-${jobId}-${employeeId}-${dateStr}`);
  if (dayEl) {
    dayEl.style.opacity = '0.5';
  }

  try {
    // Get current dates from local data
    const data = assignmentCalendarData[jobId];
    if (!data || !data.assignmentMap[employeeId]) {
      console.error('No assignment data found');
      return;
    }

    let currentDates = [...data.assignmentMap[employeeId].dates];
    const dateIndex = currentDates.indexOf(dateStr);
    let adding = false;

    if (dateIndex > -1) {
      currentDates.splice(dateIndex, 1);
    } else {
      currentDates.push(dateStr);
      currentDates.sort();
      adding = true;
    }

    // Update server
    await fetch(`${API_URL}/jobs/${jobId}/assign/${employeeId}/dates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: currentDates })
    });

    // Update local data
    data.assignmentMap[employeeId].dates = currentDates;

    // Update UI
    if (dayEl) {
      dayEl.style.background = adding ? 'var(--primary)' : 'var(--bg-secondary)';
      dayEl.style.color = adding ? 'white' : 'var(--text-secondary)';
      dayEl.style.opacity = '1';
    }
  } catch (error) {
    console.error('Error toggling date:', error);
    if (dayEl) dayEl.style.opacity = '1';
  }
}

function closeAssignModal() {
  document.getElementById('assign-modal').classList.remove('active');
  currentJobForAssignment = null;
}

// FORM HANDLERS
function setupForms() {
  document.getElementById('job-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Use pending lists if new ones were generated, otherwise preserve existing ones when editing
    const checklist = window.pendingTaskList || window.existingTaskList || [];
    const materialsChecklist = window.pendingMaterialsList || window.existingMaterialsList || [];

    const jobData = {
      client_name: document.getElementById('client-name').value,
      client_phone: document.getElementById('client-phone').value,
      client_email: document.getElementById('client-email').value,
      address: document.getElementById('address').value,
      description: document.getElementById('description').value,
      status: document.getElementById('status').value,
      start_date: document.getElementById('start-date').value,
      end_date: document.getElementById('end-date').value,
      estimated_hours: document.getElementById('estimated-hours').value || null,
      actual_hours: document.getElementById('actual-hours').value || null,
      estimated_cost: document.getElementById('estimated-cost').value || null,
      actual_cost: document.getElementById('actual-cost').value || null,
      checklist: checklist,
      materials_checklist: materialsChecklist
    };

    // Clear pending and existing lists after using them
    window.pendingTaskList = null;
    window.pendingMaterialsList = null;
    window.existingTaskList = null;
    window.existingMaterialsList = null;

    try {
      let savedJobId = editingJobId;

      if (editingJobId) {
        await fetch(`${API_URL}/jobs/${editingJobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
      } else {
        const response = await fetch(`${API_URL}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
        const newJob = await response.json();
        savedJobId = newJob.id;
      }

      closeJobModal();

      // Switch to "all" filter to ensure user can see the job they just saved
      // This prevents jobs from "disappearing" when status changes
      if (currentFilter !== 'all') {
        currentFilter = 'all';
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === 'all');
        });
      }

      loadJobs();
    } catch (error) {
      console.error('Error saving job:', error);
    }
  });

  document.getElementById('employee-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const employeeData = {
      name: document.getElementById('employee-name').value,
      email: document.getElementById('employee-email').value,
      phone: document.getElementById('employee-phone').value,
      role: document.getElementById('employee-role').value,
      hourly_rate: document.getElementById('hourly-rate').value || null,
      status: document.getElementById('employee-status').value,
      type: document.getElementById('employee-type').value || 'painter',
      rating: parseFloat(document.getElementById('employee-rating').value) || 1.0
    };

    try {
      if (editingEmployeeId) {
        await fetch(`${API_URL}/employees/${editingEmployeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        });
      } else {
        await fetch(`${API_URL}/employees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData)
        });
      }

      closeEmployeeModal();
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  });
}

// UTILITY FUNCTIONS
function formatStatus(status) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDateReadable(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ESTIMATE FILE UPLOAD & PARSING
function triggerEstimateUpload() {
  const input = document.getElementById('estimate-upload');
  input.value = ''; // Clear previous selection to allow re-uploading same file
  input.click();
}

async function handleEstimateUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const jobData = parseEstimateFile(text);

    if (!jobData) {
      alert('Could not parse estimate file. Please check the file format.');
      return;
    }

    // Create the job
    const response = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jobData)
    });

    if (response.ok) {
      alert(`Job created successfully!\nClient: ${jobData.client_name}\nEstimate: $${jobData.estimated_cost}`);
      loadJobs();
    } else {
      alert('Error creating job from estimate.');
    }
  } catch (error) {
    console.error('Error processing estimate file:', error);
    alert('Error reading estimate file.');
  }
}

function parseTasks(tasksString) {
  if (!tasksString) return [];

  // Split tasks by comma and parse each one
  const taskList = tasksString.split(',').map(task => task.trim()).filter(t => t);

  return taskList.map((task, index) => {
    // Capitalize first letter and format nicely
    let formattedTask = task.charAt(0).toUpperCase() + task.slice(1);

    // Add "Paint" prefix if not already present and not "wallpaper removal"
    if (!formattedTask.toLowerCase().includes('paint') &&
        !formattedTask.toLowerCase().includes('removal') &&
        !formattedTask.toLowerCase().includes('stain') &&
        !formattedTask.toLowerCase().includes('oil')) {
      formattedTask = 'Paint ' + formattedTask;
    } else if (formattedTask.toLowerCase().includes('wallpaper removal')) {
      formattedTask = 'Remove wallpaper';
    }

    return {
      id: index + 1,
      task: formattedTask,
      completed: false
    };
  });
}

function parseEstimateFile(text) {
  try {
    const lines = text.split('\n').map(line => line.trim());

    // Extract total estimate
    const totalLine = lines.find(line => line.startsWith('Total Project Estimate:'));
    const totalMatch = totalLine ? totalLine.match(/\$([0-9,]+)/) : null;
    const estimatedCost = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : null;

    // Check if this is interior or exterior
    const isInterior = lines.some(line => line === 'INTERIOR PAINTING');
    const isExterior = lines.some(line => line === 'EXTERIOR PAINTING');

    let jobType, details, tasks, condition, coats, jobName;

    if (isInterior) {
      // Parse interior room format
      const roomIndex = lines.findIndex(line => line.startsWith('Room:'));
      if (roomIndex === -1) return null;

      const roomLine = lines[roomIndex];
      const sizeLine = lines[roomIndex + 1];
      const tasksLine = lines[roomIndex + 2];
      const conditionLine = lines[roomIndex + 3];

      const roomMatch = roomLine.match(/Room:\s+(.+)/);
      jobType = roomMatch ? roomMatch[1] : 'Interior Painting';

      const sizeMatch = sizeLine.match(/Size:\s+([\d.]+)\s*×\s*([\d.]+)\s*metres\s*\(([\d.]+)m²\)/);
      details = sizeMatch ? `${sizeMatch[1]}m × ${sizeMatch[2]}m (${sizeMatch[3]}m²)` : '';

      const tasksMatch = tasksLine.match(/Tasks:\s+(.+)/);
      tasks = tasksMatch ? tasksMatch[1] : '';

      const conditionMatch = conditionLine.match(/Condition:\s+(.+)/);
      condition = conditionMatch ? conditionMatch[1] : 'good';

      jobName = `Estimate - ${jobType}`;
    } else if (isExterior) {
      // Parse exterior format
      const areaIndex = lines.findIndex(line => line.startsWith('Area:'));
      if (areaIndex === -1) return null;

      const areaLine = lines[areaIndex];
      const detailsLine = lines[areaIndex + 1];
      const tasksLine = lines[areaIndex + 2];
      const conditionLine = lines[areaIndex + 3];
      const coatsLine = lines[areaIndex + 4];

      const areaMatch = areaLine.match(/Area:\s+(.+)/);
      jobType = areaMatch ? areaMatch[1] : 'Exterior Painting';

      const detailsMatch = detailsLine.match(/Details:\s+(.+)/);
      details = detailsMatch ? detailsMatch[1] : '';

      const tasksMatch = tasksLine.match(/Tasks:\s+(.+)/);
      tasks = tasksMatch ? tasksMatch[1] : '';

      const conditionMatch = conditionLine.match(/Condition:\s+(.+)/);
      condition = conditionMatch ? conditionMatch[1] : 'good';

      const coatsMatch = coatsLine.match(/Coats:\s+(.+)/);
      coats = coatsMatch ? coatsMatch[1] : '';

      jobName = `Estimate - ${jobType}`;
    } else {
      // Can't determine format
      return null;
    }

    // Create comprehensive job description
    let description = `Imported from estimate file\n\n`;
    description += `Type: ${jobType}\n`;
    if (details) description += `Details: ${details}\n`;
    if (condition) description += `Condition: ${condition}\n`;
    if (coats) description += `Coats: ${coats}`;

    // Parse tasks into checklist items
    const checklist = parseTasks(tasks);

    // Return job data
    return {
      client_name: jobName,
      client_phone: '',
      client_email: '',
      address: 'Address from estimate',
      description: description,
      status: 'pending',
      start_date: '',
      end_date: '',
      estimated_hours: null,
      actual_hours: null,
      estimated_cost: estimatedCost,
      actual_cost: null,
      checklist: checklist
    };
  } catch (error) {
    console.error('Error parsing estimate:', error);
    return null;
  }
}

// CHECKLIST FUNCTIONS
function toggleChecklist(jobId) {
  const checklistDiv = document.getElementById(`checklist-${jobId}`);
  const isVisible = checklistDiv.style.display !== 'none';
  checklistDiv.style.display = isVisible ? 'none' : 'block';

  // Track open/closed state
  if (isVisible) {
    openChecklists.delete(jobId);
  } else {
    openChecklists.add(jobId);
  }

  // Update toggle arrow
  const toggle = checklistDiv.previousElementSibling.querySelector('.checklist-toggle');
  if (toggle) {
    toggle.textContent = isVisible ? '▼' : '▲';
  }
}

async function updateChecklistItem(jobId, itemId, completed) {
  try {
    console.log(`[updateChecklistItem] Starting - jobId: ${jobId}, itemId: ${itemId}, completed: ${completed}`);

    // Get current job data
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    console.log(`[updateChecklistItem] Fetch job response status: ${response.status}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.status} ${response.statusText}`);
    }

    let job;
    try {
      const text = await response.text();
      console.log(`[updateChecklistItem] Response text length: ${text.length}`);
      job = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('[updateChecklistItem] Error parsing job response:', e);
      throw new Error(`Failed to parse job data: ${e.message}`);
    }

    // Parse and update checklist
    let checklist = [];
    try {
      if (typeof job.checklist === 'string') {
        checklist = job.checklist ? JSON.parse(job.checklist) : [];
      } else if (Array.isArray(job.checklist)) {
        checklist = job.checklist;
      } else {
        checklist = [];
      }
    } catch (e) {
      console.error('[updateChecklistItem] Error parsing checklist:', e);
      checklist = [];
    }

    console.log(`[updateChecklistItem] Checklist has ${checklist.length} items`);

    // Update the specific item
    const itemIndex = checklist.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      checklist[itemIndex].completed = completed;
      console.log(`[updateChecklistItem] Updated task at index ${itemIndex}`);
    } else {
      console.warn(`[updateChecklistItem] Task with id ${itemId} not found in checklist`);
    }

    // Save updated checklist
    console.log(`[updateChecklistItem] Saving checklist...`);
    const updateResponse = await fetch(`${API_URL}/jobs/${jobId}/checklist`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist })
    });

    console.log(`[updateChecklistItem] Update response status: ${updateResponse.status}`);

    if (!updateResponse.ok) {
      let errorMsg = 'Failed to update checklist';
      try {
        const errorText = await updateResponse.text();
        console.log(`[updateChecklistItem] Error response text: ${errorText}`);
        const errorData = errorText ? JSON.parse(errorText) : {};
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // Response wasn't JSON, use status text
        errorMsg = `${updateResponse.status} ${updateResponse.statusText}`;
      }
      throw new Error(errorMsg);
    }

    console.log(`[updateChecklistItem] Checklist updated successfully`);

    // Reload jobs to show updated progress
    loadJobs();
  } catch (error) {
    console.error('[updateChecklistItem] Error:', error);
    throw error; // Re-throw to be caught by calling function
  }
}

// Update professional task with employee tracking
async function updateProfessionalTask(jobId, taskId, completed, taskName = '', taskRoom = '', taskPercentage = 0) {
  try {
    console.log(`[updateProfessionalTask] Starting - jobId: ${jobId}, taskId: ${taskId}, completed: ${completed}, task: ${taskName}`);

    if (completed) {
      // When marking complete, auto-detect who's on-site today
      console.log(`[updateProfessionalTask] Getting job employees...`);
      const employees = await getJobEmployees(jobId);

      if (employees.length === 0) {
        // No employees found - still update the checklist, just skip the detailed tracking
        console.warn(`[updateProfessionalTask] No employees found for job ${jobId}, updating checklist only`);
        await updateChecklistItem(jobId, taskId, completed);
        return;
      }

      // Get today's date in YYYY-MM-DD format
      const today = formatDate(new Date());

      // Get calendar assignments to see who's on-site today
      console.log(`[updateProfessionalTask] Getting calendar assignments...`);
      const calendarRes = await fetch('/api/calendar');
      let assignments = [];
      if (calendarRes.ok) {
        try {
          const text = await calendarRes.text();
          assignments = text ? JSON.parse(text) : [];
        } catch (e) {
          console.warn('[updateProfessionalTask] Could not parse calendar assignments:', e);
        }
      }

      const onSiteToday = employees.filter(emp => {
        const assignment = assignments.find(a => a.job_id === jobId && a.employee_id === emp.id);
        if (!assignment) return false;
        const dates = safeParseDates(assignment.assigned_dates);
        return dates.includes(today);
      });

      // Auto-select: use first on-site employee, or first assigned employee if none on-site
      const completedByEmployee = onSiteToday.length > 0 ? onSiteToday[0] : employees[0];
      console.log(`[updateProfessionalTask] Auto-selected employee: ${completedByEmployee.name} (on-site: ${onSiteToday.length > 0})`);

      // Update task with completed_by info
      await updateTaskCompletion(jobId, taskId, true, completedByEmployee.id, onSiteToday.map(e => e.id), today, taskName, taskRoom, taskPercentage);
    } else {
      // Marking incomplete - just update the checklist
      await updateChecklistItem(jobId, taskId, false);
    }
  } catch (error) {
    console.error('Error updating professional task:', error);
    alert('Error updating task: ' + (error.message || error));
    loadJobs();
  }
}

// Update task completion with employee tracking
async function updateTaskCompletion(jobId, taskId, completed, completedBy, onSiteEmployees, completionDate, taskName = '', taskRoom = '', taskPercentage = 0) {
  try {
    console.log(`[updateTaskCompletion] Starting - jobId: ${jobId}, taskId: ${taskId}, task: ${taskName}`);

    // Update checklist
    await updateChecklistItem(jobId, taskId, completed);

    // Store task completion details in tasks table
    console.log(`[updateTaskCompletion] Saving to tasks table...`);
    const response = await fetch(`/api/jobs/${jobId}/tasks/${taskId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        completed,
        completed_by: completedBy,
        on_site_employees: onSiteEmployees, // Don't stringify - server will do it
        completion_date: completionDate,
        task: taskName,
        room: taskRoom,
        percentage: taskPercentage
      })
    });

    console.log(`[updateTaskCompletion] Tasks table response status: ${response.status}`);

    if (!response.ok) {
      let errorMsg = 'Failed to save task completion';
      try {
        const errorText = await response.text();
        console.log(`[updateTaskCompletion] Error response text: ${errorText}`);
        const errorData = errorText ? JSON.parse(errorText) : {};
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // Response wasn't JSON, use status text
        errorMsg = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    console.log(`[updateTaskCompletion] Task completion saved successfully`);

    // Reload jobs to show updated state
    loadJobs();
  } catch (error) {
    console.error('[updateTaskCompletion] Error:', error);
    throw error;
  }
}

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
}

// ========================================
// ESTIMATOR FUNCTIONALITY
// ========================================

// Resene Colors Database
const reseneColors = {
  // Core existing colors
  'Resene Alabaster': '#F5F4F1', 'Resene Half Alabaster': '#FAF9F7', 'Resene Black White': '#EBE9E5',
  'Resene Sea Fog': '#E9E7E3', 'Resene Merino': '#E9E6DF', 'Resene Bianca': '#F3EFE6',
  'Resene White Pointer': '#E5E1DA', 'Resene Thorndon Cream': '#DAD5C9', 'Resene Pearl Lusta': '#F2EAD9',
  'Resene Concrete': '#C2C1BD', 'Resene Half Concrete': '#D1D0CC', 'Resene Silver Chalice': '#BEBDBA',
  'Resene Tea': '#BFB5A2', 'Resene Half Tea': '#D9D2C7', 'Resene Truffle': '#BEB9AD',
  'Resene Duck Egg Blue': '#C4CBC8', 'Resene Carefree': '#B7D4CD', 'Resene Fossil': '#D9D1C3',
  'Resene Pohutukawa': '#893C3F', 'Resene Keppel': '#3AB09E', 'Resene Ironsand': '#2D2926',
  'Resene Foundry': '#2C2F38',

  // NEUTRALS & OFF-WHITES
  'Resene Half Bianca': '#F7F3EA', 'Resene Quarter Bianca': '#FAF7F0', 'Resene Half Thorndon Cream': '#E4DED4',
  'Resene Double Thorndon Cream': '#CFC8B9', 'Resene Half Pearl Lusta': '#F0E8D7', 'Resene Double Pearl Lusta': '#E7DCC5',
  'Resene Soapstone': '#EFE9DE', 'Resene Solitaire': '#F5EAD7', 'Resene Villa White': '#EDE8DE',
  'Resene Half Villa White': '#F1EEE7', 'Resene Orchid White': '#F7F0E6', 'Resene Half Orchid White': '#F8F4ED',
  'Resene Quarter Spanish White': '#F4EDE1', 'Resene Siesta': '#EFE6D7', 'Resene Baroque': '#E2DACF',
  'Resene Half Biscotti': '#E8DFD3', 'Resene Double Biscotti': '#D8CEBF', 'Resene Milk White': '#EFEDE4',
  'Resene Quarter Merino': '#F1EEE7', 'Resene Double Black White': '#E6E3DD',

  // LIGHT GREYS & CONTEMPORARY NEUTRALS
  'Resene Wan White': '#E7E7E4', 'Resene Quarter Wan White': '#EFEFEC', 'Resene Quarter Geyser': '#E2E6E7',
  'Resene Geyser': '#D9DDDE', 'Resene Skinny Dip': '#DDD7C8', 'Resene Quarter Tea': '#E6E0D6',
  'Resene Triple Concrete': '#AFAFA9', 'Resene Half Fog': '#D4D6D4', 'Resene Fog': '#CBCDCB',
  'Resene Quarter Fog': '#E1E3E1', 'Resene Half Silver Chalice': '#CDCDCA', 'Resene Quarter Silver Chalice': '#E2E2E0',
  'Resene Quarter Stack': '#D2D3D0', 'Resene Westar': '#DCD7CF', 'Resene Parchment': '#DCD4C7',
  'Resene Half Tana': '#DDDFCD', 'Resene Half Napa': '#BFBAB1', 'Resene Half Surrender': '#DCDFE0',
  'Resene Ghost': '#DDE1E3', 'Resene Concrete Mixer': '#D5D5D3',

  // MEDIUM GREYS & URBAN TONES
  'Resene Mid Grey': '#7F7F7A', 'Resene Quarter Friar Grey': '#D0CCC3', 'Resene Half Friar Grey': '#A8A59D',
  'Resene Triple Friar Grey': '#5F5A52', 'Resene Iron Sand': '#4B4A44', 'Resene Tuna': '#484B51',
  'Resene Shuttle Grey': '#5F646A', 'Resene Dove Grey': '#7C7C76', 'Resene Scarpa Flow': '#7A7D7F',
  'Resene Quarter Scarpa Flow': '#D0D1D2', 'Resene Double Stack': '#6E706C', 'Resene Triple Stack': '#4C4D49',
  'Resene Cloudy': '#BFC4C7', 'Resene Dolphin Grey': '#787D82', 'Resene Spun Pearl': '#ACA9AD',
  'Resene Eighth Delta': '#EBEBE6', 'Resene Double Delta': '#A9A8A2', 'Resene Half Regent Grey': '#A4ABB1',
  'Resene Quarter Regent Grey': '#CCD1D6',

  // BROWNS / WARM EXTERIOR COLOURS
  'Resene Brown Sugar': '#A68A76', 'Resene Double Brown Sugar': '#8C6E5B', 'Resene Zorba': '#AFA397',
  'Resene Triple Zorba': '#8D8379', 'Resene Biscotti': '#DCCBBD', 'Resene Drought': '#C0A98A',
  'Resene Possessed': '#8A6346', 'Resene Kenya': '#7A5C46', 'Resene Double Stonehenge': '#666259',
  'Resene Stonehenge': '#7C776C', 'Resene Double Gravel': '#4A4743', 'Resene Gravel': '#625E58',
  'Resene Felix': '#6B5749', 'Resene Yuma': '#CDC3A7', 'Resene Tapa': '#767B6D',
  'Resene Double Tapa': '#5D6156', 'Resene Triple Tapa': '#464941', 'Resene Quarter Stonehenge': '#D8D4C8',
  'Resene Makara': '#A08D63', 'Resene Colins Wicket': '#7B6B47',

  // BLUES
  'Resene Coast': '#2E4858', 'Resene Endeavour': '#005C8A', 'Resene San Marino': '#4F6D8A',
  'Resene Horizon': '#7F8FA7', 'Resene Kashmir Blue': '#556C8C', 'Resene Mako': '#505459',
  'Resene Biscay': '#2E3F4F', 'Resene Lazy River': '#A7C0C8', 'Resene Breeze': '#C5DDE2',
  'Resene Escape': '#B8D1DC', 'Resene Half Escape': '#D8E7EC', 'Resene Nebula': '#C3D6D0',
  'Resene Half Cut Glass': '#DAE8E6', 'Resene Cut Glass': '#C7DDDA', 'Resene Kashmir': '#415A77',
  'Resene Rhino': '#3D4D59', 'Resene Watermark': '#96B6C8', 'Resene Half Gull Grey': '#CED6DB',
  'Resene Double Gull Grey': '#ABB4BA', 'Resene Astronaut': '#283A57',

  // GREENS
  'Resene Mantle': '#A3B5A6', 'Resene Double Mantle': '#839786', 'Resene Pewter': '#889094',
  'Resene Xanadu': '#788F8F', 'Resene Robin Egg Blue': '#A0C8C9', 'Resene Peace': '#C6D5CC',
  'Resene Ashanti': '#9EC2B3', 'Resene Kandinsky': '#7FA291', 'Resene Lemon Grass': '#999E68',
  'Resene Triple Lemon Grass': '#868C58', 'Resene Half Kumutoto': '#B7D9D3', 'Resene Kumutoto': '#89C4BC',
  'Resene Edgewater': '#CFE4DD', 'Resene Aqua': '#AFCED4', 'Resene Half Opal': '#A9C1BC',
  'Resene Tasman': '#AAB8A2', 'Resene Paddock': '#5D735A', 'Resene Verdun Green': '#487642',
  'Resene Hemlock': '#A8B09B', 'Resene Coriander': '#BFCABA',

  // FEATURE COLOURS / ACCENTS
  'Resene Pohutukawa Dark': '#7A3335', 'Resene Havoc': '#A52F2B', 'Resene Pohutukawa Light': '#9E474B',
  'Resene Smitten': '#C73862', 'Resene Plum': '#662B47', 'Resene Aubergine': '#462237',
  'Resene Hot Chile': '#8A2C23', 'Resene Bright Red': '#D82927', 'Resene Clockwork Orange': '#D16326',
  'Resene Ecstasy': '#F07C3E', 'Resene West Side': '#FF9835', 'Resene Turbo': '#F7C400',
  'Resene Wild Thing': '#ECB900', 'Resene Stinger': '#7C8A28', 'Resene Limerick': '#58A01C',
  'Resene Crusoe': '#2A6E4F', 'Resene Blue Lagoon': '#01757A', 'Resene Malibu': '#7CCCE5',
  'Resene Curious Blue': '#2596C1', 'Resene Endeavour Light': '#4FA1C8',

  'Choose colour': '#f3f4f6'
};

const roomTypes = ['Bedroom', 'Living Room', 'Kitchen', 'Bathroom', 'Hallway', 'Dining Room', 'Laundry', 'Garage', 'Office/Study'];
const exteriorTypes = ['House Walls', 'Deck', 'Fence', 'Roof', 'Garage', 'Shed'];
const claddingTypes = ['Weatherboard', 'Brick', 'Plaster/Stucco', 'Fibre Cement', 'Concrete Block'];
const trimLabels = {basic: 'Basic Trim', rounded: 'Rounded Trim (+25%)', colonial: 'Colonial Trim (+75%)'};
const condLabels = {excellent: 'Excellent (-5%)', good: 'Good Condition', fair: 'Fair (+30%)', poor: 'Poor (+70%)'};

let rooms = [], exteriors = [];

function getColorHex(colorName) {
  return reseneColors[colorName] || '#FFFFFF';
}

function switchEstimatorTab(tab) {
  document.querySelectorAll('.estimator-tab-content').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.estimator-tab-btn').forEach(e => e.classList.remove('active'));
  document.getElementById(tab + '-tab-est').classList.add('active');
  document.querySelector('.' + tab + '-tab').classList.add('active');
}

function toggleColorGrid(elementId, forceState = null) {
  const container = document.getElementById(elementId);
  if (!container) return;

  const isActive = container.classList.contains('active');
  const newState = forceState !== null ? forceState : !isActive;

  document.querySelectorAll('.color-grid-container').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.color-selector-toggle').forEach(el => el.classList.remove('active'));

  if (newState) {
    container.classList.add('active');
    const toggle = container.previousElementSibling;
    if (toggle && toggle.classList.contains('color-selector-toggle')) {
      toggle.classList.add('active');
    }
  }
}
function createColorGrid(currentColor, fieldName, itemId, type) {
  const colorCategories = {
    'Popular Whites & Off-Whites': ['Resene Alabaster', 'Resene Half Alabaster', 'Resene Black White', 'Resene Double Black White', 'Resene Sea Fog', 'Resene Merino', 'Resene Quarter Merino', 'Resene Bianca', 'Resene Half Bianca', 'Resene Quarter Bianca', 'Resene Villa White', 'Resene Half Villa White', 'Resene Orchid White', 'Resene Half Orchid White', 'Resene Milk White'],

    'Warm Neutrals & Creams': ['Resene Thorndon Cream', 'Resene Half Thorndon Cream', 'Resene Double Thorndon Cream', 'Resene Pearl Lusta', 'Resene Half Pearl Lusta', 'Resene Double Pearl Lusta', 'Resene Quarter Spanish White', 'Resene Soapstone', 'Resene Solitaire', 'Resene Siesta', 'Resene Baroque', 'Resene Half Biscotti', 'Resene Double Biscotti'],

    'Contemporary Light Greys': ['Resene Concrete', 'Resene Half Concrete', 'Resene Triple Concrete', 'Resene Wan White', 'Resene Quarter Wan White', 'Resene Geyser', 'Resene Quarter Geyser', 'Resene Fog', 'Resene Half Fog', 'Resene Quarter Fog', 'Resene Ghost', 'Resene Concrete Mixer', 'Resene Westar'],

    'Modern Medium Greys': ['Resene Silver Chalice', 'Resene Half Silver Chalice', 'Resene Quarter Silver Chalice', 'Resene Mid Grey', 'Resene Dove Grey', 'Resene Cloudy', 'Resene Spun Pearl', 'Resene Quarter Stack', 'Resene Double Stack', 'Resene Quarter Scarpa Flow', 'Resene Scarpa Flow'],

    'Sophisticated Dark Greys': ['Resene Triple Stack', 'Resene Quarter Friar Grey', 'Resene Half Friar Grey', 'Resene Triple Friar Grey', 'Resene Iron Sand', 'Resene Tuna', 'Resene Shuttle Grey', 'Resene Dolphin Grey', 'Resene Half Regent Grey', 'Resene Quarter Regent Grey'],

    'Warm Beiges & Earth Tones': ['Resene Tea', 'Resene Half Tea', 'Resene Quarter Tea', 'Resene Truffle', 'Resene Skinny Dip', 'Resene Parchment', 'Resene Half Tana', 'Resene Half Napa', 'Resene Half Surrender', 'Resene Fossil'],

    'Natural Browns & Warm Exteriors': ['Resene Brown Sugar', 'Resene Double Brown Sugar', 'Resene Zorba', 'Resene Triple Zorba', 'Resene Biscotti', 'Resene Drought', 'Resene Possessed', 'Resene Kenya', 'Resene Stonehenge', 'Resene Double Stonehenge', 'Resene Quarter Stonehenge', 'Resene Gravel', 'Resene Double Gravel', 'Resene Felix', 'Resene Yuma', 'Resene Makara', 'Resene Colins Wicket'],

    'Traditional Exterior Darks': ['Resene Tapa', 'Resene Double Tapa', 'Resene Triple Tapa', 'Resene Ironsand', 'Resene Foundry'],

    'Blues & Coastal Tones': ['Resene Coast', 'Resene Endeavour', 'Resene Endeavour Light', 'Resene San Marino', 'Resene Horizon', 'Resene Kashmir Blue', 'Resene Kashmir', 'Resene Mako', 'Resene Biscay', 'Resene Rhino', 'Resene Astronaut', 'Resene Lazy River', 'Resene Breeze', 'Resene Escape', 'Resene Half Escape', 'Resene Watermark', 'Resene Half Gull Grey', 'Resene Double Gull Grey', 'Resene Curious Blue', 'Resene Malibu'],

    'Soft Aquas & Spa Colors': ['Resene Duck Egg Blue', 'Resene Robin Egg Blue', 'Resene Carefree', 'Resene Nebula', 'Resene Half Cut Glass', 'Resene Cut Glass', 'Resene Half Kumutoto', 'Resene Kumutoto', 'Resene Edgewater', 'Resene Aqua', 'Resene Half Opal', 'Resene Blue Lagoon'],

    'Natural Greens': ['Resene Mantle', 'Resene Double Mantle', 'Resene Pewter', 'Resene Xanadu', 'Resene Peace', 'Resene Ashanti', 'Resene Kandinsky', 'Resene Tasman', 'Resene Paddock', 'Resene Verdun Green', 'Resene Hemlock', 'Resene Coriander', 'Resene Lemon Grass', 'Resene Triple Lemon Grass'],

    'Bold Feature & Accent Colors': ['Resene Pohutukawa', 'Resene Pohutukawa Dark', 'Resene Pohutukawa Light', 'Resene Havoc', 'Resene Smitten', 'Resene Plum', 'Resene Aubergine', 'Resene Hot Chile', 'Resene Bright Red', 'Resene Clockwork Orange', 'Resene Ecstasy', 'Resene West Side', 'Resene Turbo', 'Resene Wild Thing', 'Resene Stinger', 'Resene Limerick', 'Resene Crusoe', 'Resene Keppel']
  };

  let gridHtml = '<div class="color-grid">';

  const isClearSelected = currentColor === 'Choose colour';
  gridHtml += `<div class="color-option clear-option ${isClearSelected ? 'selected' : ''}"
                    onclick="updateItem(${itemId}, '${fieldName}', 'Choose colour', '${type}'); toggleColorGrid('${itemId}-${fieldName}', false)">
                 <div class="color-tooltip">Clear Selection</div>
                 <div class="color-name" style="color: #64748b; font-weight: 600;">Clear</div>
               </div>`;

  Object.entries(colorCategories).forEach(([category, colors]) => {
    colors.forEach(color => {
      const colorHex = getColorHex(color);
      const isSelected = color === currentColor;
      const shortName = color.replace('Resene ', '').replace('Quarter ', 'Qtr ').replace('Half ', '1/2 ').replace('Double ', 'Dbl ').replace('Triple ', '3x ');
      const displayName = shortName.length > 16 ? shortName.substring(0, 14) + '...' : shortName;

      gridHtml += `<div class="color-option ${isSelected ? 'selected' : ''}"
                        style="background-color: ${colorHex};"
                        onclick="updateItem(${itemId}, '${fieldName}', '${color}', '${type}'); toggleColorGrid('${itemId}-${fieldName}', false)">
                     <div class="color-tooltip">${color}</div>
                     <div class="color-name">${displayName}</div>
                   </div>`;
    });
  });

  gridHtml += '</div>';
  return gridHtml;
}

function createRoomPreview(room) {
  const wallColor = getColorHex(room.wallColor);
  const ceilingColor = getColorHex(room.ceilingColor);

  return `
    <div class="room-preview">
      <div class="preview-label">Room Color Preview</div>
      <div class="room-3d">
        <div class="wall-back" style="background: ${wallColor};"></div>
        <div class="wall-right" style="background: ${wallColor};"></div>
        <div class="floor"></div>
        <div class="ceiling" style="background: ${ceilingColor};"></div>
      </div>

      <div class="color-legend">
        <div class="legend-item">
          <div class="legend-swatch" style="background: ${wallColor};"></div>
          <span>Walls: ${room.wallColor === 'Choose colour' ? 'TBD' : room.wallColor.replace('Resene ', '')}</span>
        </div>
        <div class="legend-item">
          <div class="legend-swatch" style="background: ${ceilingColor};"></div>
          <span>Ceiling: ${room.ceilingColor === 'Choose colour' ? 'TBD' : room.ceilingColor.replace('Resene ', '')}</span>
        </div>
      </div>
    </div>`;
}

function calcRoom(r) {
  if(!r.length || !r.width) return 0;
  const l = +r.length, w = +r.width, h = +r.ceilingHeight;
  const floor = l * w, walls = 2 * (l + w) * h, ceil = floor, peri = 2 * (l + w);
  let p = 0;

  // Calculate premiums (additive, not multiplicative)
  const hPremium = h >= 3.6 ? 0.4 : h >= 3 ? 0.2 : h >= 2.7 ? 0.1 : 0;
  const rPremium = {Kitchen: 0.2, Bathroom: 0.25, Laundry: 0.15}[r.type] || 0;

  if(r.selectedTasks['Paint walls']) p += walls * 32;
  if(r.selectedTasks['Paint ceiling']) p += ceil * 36;
  if(r.selectedTasks['Paint skirting/coving']) {
    const tr = {basic: 10, rounded: 13, colonial: 18};
    p += peri * (tr[r.trimType] || 10);
  }
  if(r.selectedTasks['Paint doors']) p += 165;
  if(r.selectedTasks['Paint windows']) p += 95;
  if(r.selectedTasks['Paint cabinets']) p += floor * 0.2 * 48;
  if(r.selectedTasks['Remove wallpaper']) p += walls * 18;

  const cdPremium = {excellent: -0.05, good: 0, fair: 0.3, poor: 0.7}[r.condition];
  const coPremium = r.coats === '3' ? 0.35 : 0;

  // Apply all premiums additively
  p *= (1 + hPremium + rPremium + cdPremium + coPremium);
  return Math.round(p);
}

function calcExt(e) {
  let p = 0;

  // Calculate premiums (additive, not multiplicative)
  const cdPremium = {excellent: -0.1, good: 0, fair: 0.35, poor: 0.8}[e.condition];
  const coPremium = e.coats === '3' ? 0.35 : 0;
  const scPremium = e.scaffolding ? 0.25 : 0;
  const stPremium = +e.height === 2 ? 0.3 : +e.height >= 3 ? 0.5 : 0;

  if(e.type === 'House Walls') {
    const a = +e.area || 0;
    const clRates = {Weatherboard: 42, Brick: 52, 'Plaster/Stucco': 58, 'Fibre Cement': 46, 'Concrete Block': 48};
    if(e.selectedTasks['Paint walls']) p += a * (clRates[e.cladding] || 42);
    if(e.selectedTasks['Fascia/soffits']) p += a * 0.15 * 38;
    if(e.selectedTasks['Gutters/downpipes']) p += a * 0.1 * 32;
    if(e.selectedTasks['Window frames']) p += Math.ceil(a / 15) * 105;
    if(e.selectedTasks['Exterior doors']) p += 235;
  } else if(e.type === 'Deck') {
    const a = +e.deckArea || 0;
    if(e.selectedTasks['Stain/oil deck']) p += a * 16;
    if(e.selectedTasks['Paint deck']) p += a * 25;
    if(e.selectedTasks['Balustrades']) p += Math.sqrt(a) * 3 * 14;
  } else if(e.type === 'Fence') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint fence']) p += a * 31;
    if(e.selectedTasks['Stain fence']) p += a * 19;
  } else if(e.type === 'Garage' || e.type === 'Shed') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint walls']) p += a * 38;
    if(e.selectedTasks['Paint trim']) p += a * 0.12 * 24;
    if(e.selectedTasks['Paint doors']) p += 160;
  } else if(e.type === 'Roof') {
    const a = +e.area || 0;
    const roofPremium = e.roofType === 'Metal' ? 0.2 : e.roofType === 'Tile' ? 0.35 : 0;
    if(e.selectedTasks['Paint roof']) p += a * 40;
    // Apply roof premium separately for roof jobs
    p *= (1 + roofPremium);
  }

  // Apply all premiums additively (except roof which was already applied)
  if(e.type !== 'Roof') {
    p *= (1 + cdPremium + coPremium + scPremium + stPremium);
  } else {
    p *= (1 + cdPremium + coPremium + scPremium + stPremium);
  }

  return Math.round(p);
}

// Calculate estimated hours for a room
function calcRoomHours(r) {
  if(!r.length || !r.width) return 0;
  const l = +r.length, w = +r.width, h = +r.ceilingHeight;
  const floor = l * w, walls = 2 * (l + w) * h, ceil = floor, peri = 2 * (l + w);
  let hours = 0;

  // Base hours per task (hours per m² or per item)
  if(r.selectedTasks['Paint walls']) hours += walls / 12; // ~12 m² per hour
  if(r.selectedTasks['Paint ceiling']) hours += ceil / 10; // ~10 m² per hour (harder)
  if(r.selectedTasks['Paint skirting/coving']) {
    const trMult = {basic: 1, rounded: 1.25, colonial: 1.75};
    hours += (peri / 8) * (trMult[r.trimType] || 1); // ~8m per hour base
  }
  if(r.selectedTasks['Paint doors']) hours += 1.5; // ~1.5 hours per door
  if(r.selectedTasks['Paint windows']) hours += 1; // ~1 hour per window
  if(r.selectedTasks['Paint cabinets']) hours += floor * 0.2 / 3; // Slower work
  if(r.selectedTasks['Remove wallpaper']) hours += walls / 5; // ~5 m² per hour (slow)

  // Apply condition and coat multipliers
  const cdMult = {excellent: 0.9, good: 1, fair: 1.3, poor: 1.6}[r.condition] || 1;
  const coMult = r.coats === '3' ? 1.4 : 1;
  const hMult = h >= 3.6 ? 1.3 : h >= 3 ? 1.15 : h >= 2.7 ? 1.05 : 1;

  hours *= cdMult * coMult * hMult;
  return Math.round(hours * 10) / 10; // Round to 1 decimal
}

// Calculate estimated hours for exterior
function calcExtHours(e) {
  let hours = 0;

  const cdMult = {excellent: 0.85, good: 1, fair: 1.4, poor: 1.8}[e.condition] || 1;
  const coMult = e.coats === '3' ? 1.4 : 1;
  const scMult = e.scaffolding ? 1.2 : 1;
  const stMult = +e.height === 2 ? 1.25 : +e.height >= 3 ? 1.5 : 1;

  if(e.type === 'House Walls') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint walls']) hours += a / 8; // ~8 m² per hour exterior
    if(e.selectedTasks['Fascia/soffits']) hours += (a * 0.15) / 6;
    if(e.selectedTasks['Gutters/downpipes']) hours += (a * 0.1) / 8;
    if(e.selectedTasks['Window frames']) hours += Math.ceil(a / 15) * 1.5;
    if(e.selectedTasks['Exterior doors']) hours += 2.5;
  } else if(e.type === 'Deck') {
    const a = +e.deckArea || 0;
    if(e.selectedTasks['Stain/oil deck']) hours += a / 15; // Faster
    if(e.selectedTasks['Paint deck']) hours += a / 10;
    if(e.selectedTasks['Balustrades']) hours += Math.sqrt(a) * 0.5;
  } else if(e.type === 'Fence') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint fence']) hours += a / 6;
    if(e.selectedTasks['Stain fence']) hours += a / 10;
  } else if(e.type === 'Garage' || e.type === 'Shed') {
    const a = +e.area || 0;
    if(e.selectedTasks['Paint walls']) hours += a / 10;
    if(e.selectedTasks['Paint trim']) hours += (a * 0.12) / 6;
    if(e.selectedTasks['Paint doors']) hours += 1.5;
  } else if(e.type === 'Roof') {
    const a = +e.area || 0;
    const roofMult = e.roofType === 'Metal' ? 1.1 : e.roofType === 'Tile' ? 1.4 : 1;
    if(e.selectedTasks['Paint roof']) hours += (a / 6) * roofMult;
  }

  hours *= cdMult * coMult * scMult * stMult;
  return Math.round(hours * 10) / 10;
}

// Calculate total estimated hours
function calcTotalHours() {
  const interiorHours = rooms.reduce((s, r) => s + calcRoomHours(r), 0);
  const exteriorHours = exteriors.reduce((s, e) => s + calcExtHours(e), 0);
  return Math.round((interiorHours + exteriorHours) * 10) / 10;
}

function calcAll() {
  const iT = rooms.reduce((s, r) => s + calcRoom(r), 0);
  const eT = exteriors.reduce((s, e) => s + calcExt(e), 0);
  const t = iT + eT;

  document.getElementById('total-price').textContent = t.toLocaleString();
  document.getElementById('min-price').textContent = Math.round(t * 0.95).toLocaleString();
  document.getElementById('max-price').textContent = Math.round(t * 1.08).toLocaleString();
  document.getElementById('interior-subtotal').textContent = iT.toLocaleString();
  document.getElementById('exterior-subtotal').textContent = eT.toLocaleString();
  document.getElementById('total-hours').textContent = calcTotalHours();

  let iRows = '';
  rooms.forEach((r, i) => {
    const p = calcRoom(r);
    if(p === 0) return;
    const tasks = Object.keys(r.selectedTasks).filter(t => r.selectedTasks[t]).map(t => {
      let taskName;
      let color = '';

      if (t === 'Remove wallpaper') {
        taskName = 'wallpaper removal';
      } else {
        taskName = t.replace('Paint ', '').toLowerCase();

        if (t === 'Paint walls' && r.wallColor && r.wallColor !== 'Choose colour') {
          color = ` (${r.wallColor.replace('Resene ', '')})`;
        } else if (t === 'Paint ceiling' && r.ceilingColor && r.ceilingColor !== 'Choose colour') {
          color = ` (${r.ceilingColor.replace('Resene ', '')})`;
        } else if (t === 'Paint skirting/coving' && r.trimColor && r.trimColor !== 'Choose colour') {
          color = ` (${r.trimColor.replace('Resene ', '')})`;
        } else if (t === 'Paint doors' && r.doorColor && r.doorColor !== 'Choose colour') {
          color = ` (${r.doorColor.replace('Resene ', '')})`;
        } else if (t === 'Paint windows' && r.windowColor && r.windowColor !== 'Choose colour') {
          color = ` (${r.windowColor.replace('Resene ', '')})`;
        } else if (t === 'Paint cabinets' && r.cabinetColor && r.cabinetColor !== 'Choose colour') {
          color = ` (${r.cabinetColor.replace('Resene ', '')})`;
        }
      }

      return taskName + color;
    }).join(', ') || '—';
    iRows += `<tr><td><b>${r.type}</b></td><td>${r.length}×${r.width}m</td><td class="task-detail">${tasks}</td><td><b>$${p.toLocaleString()}</b></td></tr>`;
  });

  let eRows = '';
  exteriors.forEach((e, i) => {
    const p = calcExt(e);
    if(p === 0) return;
    const tasks = Object.keys(e.selectedTasks).filter(t => e.selectedTasks[t]).map(t => {
      let taskName = t.replace('Paint ', '').toLowerCase();
      let color = '';

      if (e.type === 'House Walls') {
        if (t === 'Paint walls' && e.wallColor && e.wallColor !== 'Choose colour') {
          color = ` (${e.wallColor.replace('Resene ', '')})`;
        } else if (t === 'Fascia/soffits' && e.fasciaColor && e.fasciaColor !== 'Choose colour') {
          color = ` (${e.fasciaColor.replace('Resene ', '')})`;
        } else if (t === 'Gutters/downpipes' && e.gutterColor && e.gutterColor !== 'Choose colour') {
          color = ` (${e.gutterColor.replace('Resene ', '')})`;
        } else if (t === 'Window frames' && e.windowColor && e.windowColor !== 'Choose colour') {
          color = ` (${e.windowColor.replace('Resene ', '')})`;
        } else if (t === 'Exterior doors' && e.doorColor && e.doorColor !== 'Choose colour') {
          color = ` (${e.doorColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Deck') {
        if (t === 'Paint deck' && e.deckColor && e.deckColor !== 'Choose colour') {
          color = ` (${e.deckColor.replace('Resene ', '')})`;
        } else if (t === 'Balustrades' && e.balustradeColor && e.balustradeColor !== 'Choose colour') {
          color = ` (${e.balustradeColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Fence') {
        if ((t === 'Paint fence' || t === 'Stain fence') && e.fenceColor && e.fenceColor !== 'Choose colour') {
          color = ` (${e.fenceColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Garage' || e.type === 'Shed') {
        if (t === 'Paint walls' && e.wallColor && e.wallColor !== 'Choose colour') {
          color = ` (${e.wallColor.replace('Resene ', '')})`;
        } else if (t === 'Paint trim' && e.trimColor && e.trimColor !== 'Choose colour') {
          color = ` (${e.trimColor.replace('Resene ', '')})`;
        } else if (t === 'Paint doors' && e.doorColor && e.doorColor !== 'Choose colour') {
          color = ` (${e.doorColor.replace('Resene ', '')})`;
        }
      } else if (e.type === 'Roof') {
        if (t === 'Paint roof' && e.roofColor && e.roofColor !== 'Choose colour') {
          color = ` (${e.roofColor.replace('Resene ', '')})`;
        }
      }

      return taskName + color;
    }).join(', ') || '—';

    let sz;
    if(e.type === 'House Walls') {
      sz = `${e.area}m² ${e.cladding}`;
    } else if(e.type === 'Deck') {
      sz = `${e.deckArea}m²`;
    } else if(e.type === 'Roof') {
      sz = `${e.area}m² ${e.roofType || 'Metal'}`;
    } else {
      sz = `${e.area}m²`;
    }

    eRows += `<tr><td><b>${e.type}</b></td><td>${sz}</td><td class="task-detail">${tasks}</td><td><b>$${p.toLocaleString()}</b></td></tr>`;
  });

  document.getElementById('interior-table').innerHTML = iRows || '<tr><td colspan="4" style="text-align:center;color:#888;">No interior rooms added</td></tr>';
  document.getElementById('exterior-table').innerHTML = eRows || '<tr><td colspan="4" style="text-align:center;color:#888;">No exterior areas added</td></tr>';
  document.getElementById('interior-summary').style.display = iT > 0 ? 'block' : 'none';
  document.getElementById('exterior-summary').style.display = eT > 0 ? 'block' : 'none';
  document.getElementById('estimate-section').style.display = t > 0 ? 'block' : 'none';
}

function renderRooms() {
  document.getElementById('rooms-container').innerHTML = rooms.map((r, i) => {
    const allTasks = [
      {n: 'Paint walls', c: 'wallColor', types: ['all']},
      {n: 'Remove wallpaper', c: null, prep: true, types: ['all']},
      {n: 'Paint ceiling', c: 'ceilingColor', types: ['all']},
      {n: 'Paint skirting/coving', c: 'trimColor', trim: true, types: ['all']},
      {n: 'Paint doors', c: 'doorColor', types: ['all']},
      {n: 'Paint windows', c: 'windowColor', types: ['all']},
      {n: 'Paint cabinets', c: 'cabinetColor', types: ['Kitchen', 'Laundry', 'Bathroom']}
    ];

    const tasks = allTasks.filter(task =>
      task.types.includes('all') || task.types.includes(r.type)
    );

    const taskHtml = tasks.map(t => {
      const sel = r.selectedTasks[t.n];
      const colorHex = t.c ? getColorHex(r[t.c]) : null;
      return `
        <div class="task-box${sel ? ' selected' : ''}" onclick="toggleTask(${r.id},'${t.n}')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${sel ? ' checked' : ''} onchange="toggleTask(${r.id},'${t.n}')"> ${t.n}
          </label>
          ${sel && t.c ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${r.id}-${t.c}')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${colorHex};"></div>
                  <span>${r[t.c]}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${r.id}-${t.c}" class="color-grid-container">
                ${createColorGrid(r[t.c], t.c, r.id, 'room')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
              ${t.trim ? `
                <label style="margin-top:.8rem;">Trim Style</label>
                <select onchange="updateItem(${r.id},'trimType',this.value,'room')">
                  ${Object.entries(trimLabels).map(([v,l]) => `<option value="${v}"${r.trimType === v ? ' selected' : ''}>${l}</option>`).join('')}
                </select>
              ` : ''}
            </div>
          ` : ''}
          ${sel && t.prep ? `
            <div class="prep-work-info" onclick="event.stopPropagation()" style="margin-top: 0.5rem;">
              <small style="color: #666; font-style: italic;">✓ Includes surface preparation and cleanup</small>
            </div>
          ` : ''}
        </div>`;
    }).join('');

    return `
      <div class="room-card">
        <div class="room-header">
          <h3 class="room-title">Room ${i + 1}</h3>
          <button class="btn-delete" onclick="removeItem(${r.id}, 'room')">✕</button>
        </div>
        <div class="grid grid-4">
          <div><label>Room Type</label><select onchange="updateItem(${r.id},'type',this.value,'room')">${roomTypes.map(v => `<option value="${v}"${r.type === v ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
          <div><label>Length (m)</label><input type="number" step="0.1" value="${r.length}" onchange="updateItem(${r.id},'length',this.value,'room')"></div>
          <div><label>Width (m)</label><input type="number" step="0.1" value="${r.width}" onchange="updateItem(${r.id},'width',this.value,'room')"></div>
          <div><label>Ceiling Height</label>
            <select onchange="updateItem(${r.id},'ceilingHeight',this.value,'room')">
              <option value="2.4"${r.ceilingHeight === '2.4' ? ' selected' : ''}>2.4m (Standard)</option>
              <option value="2.7"${r.ceilingHeight === '2.7' ? ' selected' : ''}>2.7m</option>
              <option value="3.0"${r.ceilingHeight === '3.0' ? ' selected' : ''}>3.0m</option>
              <option value="3.6"${r.ceilingHeight === '3.6' ? ' selected' : ''}>3.6m+</option>
            </select>
          </div>
        </div>
        <div class="grid grid-2">
          <div><label>Surface Condition
            <span class="tooltip">ℹ️
              <span class="tooltiptext">Surface condition determines preparation requirements:
- Excellent: Light filling and sanding, ready to paint
- Good: Standard filling, sanding and minor touch-up work
- Fair: Some scraping, filling, sanding and spot priming needed
- Poor: Major scraping, extensive filling, sanding, full priming required</span>
            </span>
          </label><select onchange="updateItem(${r.id},'condition',this.value,'room')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${r.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${r.id},'coats',this.value,'room')">
              <option value="2"${r.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${r.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>
        <div class="section-header">Select painting tasks</div>
        ${taskHtml}
        ${Object.keys(r.selectedTasks).some(task => r.selectedTasks[task]) ? createRoomPreview(r) : ''}
      </div>`;
  }).join('');
  calcAll();
}

function renderExteriors() {
  document.getElementById('exterior-container').innerHTML = exteriors.map((e, i) => {
    let fields, taskHtml;

    if(e.type === 'House Walls') {
      fields = `
        <div class="grid grid-4">
          <div><label>Cladding Type</label><select onchange="updateItem(${e.id},'cladding',this.value,'exterior')">${claddingTypes.map(v => `<option value="${v}"${e.cladding === v ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
          <div><label>Wall Area (m²)
            <span class="tooltip">ℹ️
              <span class="tooltiptext">Total external wall surface area to be painted. Measure height × width of each wall, add them together, then subtract doors/windows. Example: Front (6m×3m) + Back (6m×3m) + Left (8m×3m) + Right (8m×3m) = 84m²</span>
            </span>
          </label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Building Height</label>
            <select onchange="updateItem(${e.id},'height',this.value,'exterior')">
              <option value="1"${e.height === '1' ? ' selected' : ''}>Single storey</option>
              <option value="2"${e.height === '2' ? ' selected' : ''}>Two storey (+30%)</option>
              <option value="3"${e.height === '3' ? ' selected' : ''}>Three+ storey (+50%)</option>
            </select>
          </div>
          <div><label>Scaffolding</label>
            <select onchange="updateItem(${e.id},'scaffolding',this.value==='true','exterior')">
              <option value="false"${!e.scaffolding ? ' selected' : ''}>No</option>
              <option value="true"${e.scaffolding ? ' selected' : ''}>Yes (+25%)</option>
            </select>
          </div>
        </div>
        <div class="grid grid-2">
          <div><label>Surface Condition
            <span class="tooltip">ℹ️
              <span class="tooltiptext">Surface condition determines preparation requirements:
- Excellent: Light filling and sanding, ready to paint
- Good: Standard filling, sanding and minor touch-up work
- Fair: Some scraping, filling, sanding and spot priming needed
- Poor: Major scraping, extensive filling, sanding, full priming required</span>
            </span>
          </label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      const tasks = ['Paint walls', 'Fascia/soffits', 'Gutters/downpipes', 'Window frames', 'Exterior doors'];
      const colorFields = ['wallColor', 'fasciaColor', 'gutterColor', 'windowColor', 'doorColor'];

      taskHtml = tasks.map((task, idx) => {
        const isSelected = e.selectedTasks[task];
        const colorField = colorFields[idx];
        const taskColor = e[colorField] || 'Choose colour';
        const colorHex = getColorHex(taskColor);

        return `
          <div class="task-box${isSelected ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'${task}')">
            <label class="task-label" onclick="event.stopPropagation()">
              <input type="checkbox"${isSelected ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'${task}')"> ${task}
            </label>
            ${isSelected ? `
              <div class="color-select-group" onclick="event.stopPropagation()">
                <label>Resene Color Selection</label>
                <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-${colorField}')">
                  <div class="selected-color-display">
                    <div class="selected-color-swatch" style="background-color: ${colorHex};"></div>
                    <span>${taskColor}</span>
                  </div>
                  <span>▼ Change Color</span>
                </div>
                <div id="${e.id}-${colorField}" class="color-grid-container">
                  ${createColorGrid(taskColor, colorField, e.id, 'exterior')}
                </div>
                <div class="resene-brand">🎨 Resene ColorShop</div>
              </div>
            ` : ''}
          </div>`;
      }).join('');

    } else if(e.type === 'Deck') {
      fields = `
        <div class="grid grid-3">
          <div><label>Deck Area (m²)</label><input type="number" value="${e.deckArea}" onchange="updateItem(${e.id},'deckArea',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Stain/oil deck'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Stain/oil deck')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Stain/oil deck'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Stain/oil deck')">
            Stain/oil deck
          </label>
        </div>
        <div class="task-box${e.selectedTasks['Paint deck'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint deck')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint deck'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint deck')">
            Paint deck
          </label>
          ${e.selectedTasks['Paint deck'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-deckColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.deckColor || 'Choose colour')};"></div>
                  <span>${e.deckColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-deckColor" class="color-grid-container">
                ${createColorGrid(e.deckColor || 'Choose colour', 'deckColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Balustrades'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Balustrades')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Balustrades'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Balustrades')">
            Balustrades
          </label>
          ${e.selectedTasks['Balustrades'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-balustradeColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.balustradeColor || 'Choose colour')};"></div>
                  <span>${e.balustradeColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-balustradeColor" class="color-grid-container">
                ${createColorGrid(e.balustradeColor || 'Choose colour', 'balustradeColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>`;

    } else if(e.type === 'Fence') {
      fields = `
        <div class="grid grid-3">
          <div><label>Fence Area (m²)</label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Paint fence'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint fence')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint fence'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint fence')">
            Paint fence
          </label>
          ${e.selectedTasks['Paint fence'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-fenceColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.fenceColor || 'Choose colour')};"></div>
                  <span>${e.fenceColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-fenceColor" class="color-grid-container">
                ${createColorGrid(e.fenceColor || 'Choose colour', 'fenceColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Stain fence'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Stain fence')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Stain fence'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Stain fence')">
            Stain fence
          </label>
        </div>`;

    } else if(e.type === 'Garage' || e.type === 'Shed') {
      fields = `
        <div class="grid grid-3">
          <div><label>Wall Area (m²)</label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Number of Coats</label>
            <select onchange="updateItem(${e.id},'coats',this.value,'exterior')">
              <option value="2"${e.coats === '2' ? ' selected' : ''}>2 coats</option>
              <option value="3"${e.coats === '3' ? ' selected' : ''}>3 coats (+35%)</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Paint walls'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint walls')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint walls'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint walls')">
            Paint walls
          </label>
          ${e.selectedTasks['Paint walls'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-wallColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.wallColor || 'Choose colour')};"></div>
                  <span>${e.wallColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-wallColor" class="color-grid-container">
                ${createColorGrid(e.wallColor || 'Choose colour', 'wallColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Paint trim'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint trim')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint trim'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint trim')">
            Paint trim
          </label>
          ${e.selectedTasks['Paint trim'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-trimColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.trimColor || 'Choose colour')};"></div>
                  <span>${e.trimColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-trimColor" class="color-grid-container">
                ${createColorGrid(e.trimColor || 'Choose colour', 'trimColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>
        <div class="task-box${e.selectedTasks['Paint doors'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint doors')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint doors'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint doors')">
            Paint doors
          </label>
          ${e.selectedTasks['Paint doors'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-doorColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.doorColor || 'Choose colour')};"></div>
                  <span>${e.doorColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-doorColor" class="color-grid-container">
                ${createColorGrid(e.doorColor || 'Choose colour', 'doorColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>`;

    } else if(e.type === 'Roof') {
      fields = `
        <div class="grid grid-3">
          <div><label>Roof Area (m²)</label><input type="number" value="${e.area}" onchange="updateItem(${e.id},'area',this.value,'exterior')"></div>
          <div><label>Condition</label><select onchange="updateItem(${e.id},'condition',this.value,'exterior')">${Object.entries(condLabels).map(([v,l]) => `<option value="${v}"${e.condition === v ? ' selected' : ''}>${l}</option>`).join('')}</select></div>
          <div><label>Roof Type</label>
            <select onchange="updateItem(${e.id},'roofType',this.value,'exterior')">
              <option value="Metal"${e.roofType === 'Metal' ? ' selected' : ''}>Metal (+20%)</option>
              <option value="Tile"${e.roofType === 'Tile' ? ' selected' : ''}>Tile (+35%)</option>
              <option value="Membrane"${e.roofType === 'Membrane' ? ' selected' : ''}>Membrane</option>
            </select>
          </div>
        </div>`;

      taskHtml = `
        <div class="task-box${e.selectedTasks['Paint roof'] ? ' selected' : ''}" onclick="toggleExteriorTask(${e.id},'Paint roof')">
          <label class="task-label" onclick="event.stopPropagation()">
            <input type="checkbox"${e.selectedTasks['Paint roof'] ? ' checked' : ''} onchange="toggleExteriorTask(${e.id},'Paint roof')">
            Paint roof
          </label>
          ${e.selectedTasks['Paint roof'] ? `
            <div class="color-select-group" onclick="event.stopPropagation()">
              <label>Resene Color Selection</label>
              <div class="color-selector-toggle" onclick="toggleColorGrid('${e.id}-roofColor')">
                <div class="selected-color-display">
                  <div class="selected-color-swatch" style="background-color: ${getColorHex(e.roofColor || 'Choose colour')};"></div>
                  <span>${e.roofColor || 'Choose colour'}</span>
                </div>
                <span>▼ Change Color</span>
              </div>
              <div id="${e.id}-roofColor" class="color-grid-container">
                ${createColorGrid(e.roofColor || 'Choose colour', 'roofColor', e.id, 'exterior')}
              </div>
              <div class="resene-brand">🎨 Resene ColorShop</div>
            </div>
          ` : ''}
        </div>`;

    }

    return `
      <div class="exterior-card">
        <div class="room-header">
          <h3 class="room-title">${e.type} ${i + 1}</h3>
          <button class="btn-delete" onclick="removeItem(${e.id}, 'exterior')">✕</button>
        </div>
        <div style="margin-bottom:1rem;">
          <label>Structure Type</label>
          <select onchange="updateItem(${e.id},'type',this.value,'exterior')">${exteriorTypes.map(v => `<option value="${v}"${e.type === v ? ' selected' : ''}>${v}</option>`).join('')}</select>
        </div>
        ${fields}
        <div class="section-header">Select painting tasks</div>
        ${taskHtml}
      </div>`;
  }).join('');
  calcAll();
}

function addRoom() {
  rooms.push({
    id: Date.now(),
    type: 'Bedroom',
    length: '4.0',
    width: '3.5',
    ceilingHeight: '2.4',
    condition: 'good',
    coats: '2',
    trimType: 'basic',
    wallColor: 'Choose colour',
    ceilingColor: 'Choose colour',
    trimColor: 'Choose colour',
    doorColor: 'Choose colour',
    windowColor: 'Choose colour',
    cabinetColor: 'Choose colour',
    selectedTasks: {}
  });
  renderRooms();
}

function addExterior() {
  exteriors.push({
    id: Date.now(),
    type: 'House Walls',
    cladding: 'Weatherboard',
    area: '150',
    height: '1',
    condition: 'good',
    coats: '2',
    roofType: 'Metal',
    wallColor: 'Choose colour',
    fasciaColor: 'Choose colour',
    gutterColor: 'Choose colour',
    windowColor: 'Choose colour',
    doorColor: 'Choose colour',
    deckColor: 'Choose colour',
    balustradeColor: 'Choose colour',
    fenceColor: 'Choose colour',
    trimColor: 'Choose colour',
    roofColor: 'Choose colour',
    scaffolding: false,
    deckArea: '30',
    selectedTasks: {}
  });
  renderExteriors();
}

function removeItem(id, type) {
  if(type === 'room') {
    rooms = rooms.filter(r => r.id !== id);
    renderRooms();
  } else {
    exteriors = exteriors.filter(e => e.id !== id);
    renderExteriors();
  }
}

function updateItem(id, field, value, type) {
  if(type === 'room') {
    rooms = rooms.map(r => {
      if(r.id === id) {
        const updated = {...r, [field]: value};
        if(field === 'type') {
          updated.selectedTasks = {};
        }
        return updated;
      }
      return r;
    });
    renderRooms();
  } else {
    exteriors = exteriors.map(e => {
      if(e.id === id) {
        const updated = {...e, [field]: value};
        if(field === 'type') {
          updated.selectedTasks = {};
        }
        return updated;
      }
      return e;
    });
    renderExteriors();
  }
}

function toggleTask(id, task) {
  rooms = rooms.map(r => r.id === id ? {...r, selectedTasks: {...r.selectedTasks, [task]: !r.selectedTasks[task]}} : r);
  renderRooms();
}

function toggleExteriorTask(id, task) {
  exteriors = exteriors.map(e => e.id === id ? {...e, selectedTasks: {...e.selectedTasks, [task]: !e.selectedTasks[task]}} : e);
  renderExteriors();
}

function emailQuote() {
  const t = document.getElementById('total-price').textContent;
  window.location.href = `mailto:quote@yourcompany.co.nz?subject=Painting Quote Request - $${t}&body=Please provide a detailed quote for the painting work estimated at $${t}.`;
}

// PDF Generation Function
function downloadEstimatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const totalPrice = document.getElementById('total-price').textContent;
  const minPrice = document.getElementById('min-price').textContent;
  const maxPrice = document.getElementById('max-price').textContent;
  const interiorSubtotal = document.getElementById('interior-subtotal').textContent;
  const exteriorSubtotal = document.getElementById('exterior-subtotal').textContent;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(34, 197, 94);
  doc.text('Professional Painting Estimate', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Premium Resene paints • Professional quality • 5-year guarantee', 105, 28, { align: 'center' });

  const date = new Date().toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated: ${date}`, 105, 34, { align: 'center' });

  let yPos = 45;

  // Interior Summary
  if (rooms.length > 0 && interiorSubtotal !== '0') {
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text('Interior Painting', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    rooms.forEach((r, i) => {
      const p = calcRoom(r);
      if (p === 0) return;

      const tasks = Object.keys(r.selectedTasks)
        .filter(t => r.selectedTasks[t])
        .map(t => {
          let taskName = t.replace('Paint ', '').toLowerCase();
          let color = '';

          if (t === 'Paint walls' && r.wallColor && r.wallColor !== 'Choose colour') {
            color = ` (${r.wallColor.replace('Resene ', '')})`;
          } else if (t === 'Paint ceiling' && r.ceilingColor && r.ceilingColor !== 'Choose colour') {
            color = ` (${r.ceilingColor.replace('Resene ', '')})`;
          }

          return taskName + color;
        }).join(', ') || '—';

      doc.text(`${r.type} - ${r.length}×${r.width}m`, 15, yPos);
      doc.text(`$${p.toLocaleString()}`, 180, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(tasks, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94);
    doc.text(`Interior Subtotal: $${interiorSubtotal}`, 180, yPos, { align: 'right' });
    yPos += 10;
  }

  // Exterior Summary
  if (exteriors.length > 0 && exteriorSubtotal !== '0') {
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text('Exterior Painting', 15, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    exteriors.forEach((e, i) => {
      const p = calcExt(e);
      if (p === 0) return;

      const tasks = Object.keys(e.selectedTasks)
        .filter(t => e.selectedTasks[t])
        .map(t => t.replace('Paint ', '').toLowerCase())
        .join(', ') || '—';

      let sz;
      if (e.type === 'House Walls') {
        sz = `${e.area}m² ${e.cladding}`;
      } else if (e.type === 'Deck') {
        sz = `${e.deckArea}m²`;
      } else {
        sz = `${e.area}m²`;
      }

      doc.text(`${e.type} - ${sz}`, 15, yPos);
      doc.text(`$${p.toLocaleString()}`, 180, yPos);
      yPos += 5;
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text(tasks, 20, yPos);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);

      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.setFontSize(11);
    doc.setTextColor(34, 197, 94);
    doc.text(`Exterior Subtotal: $${exteriorSubtotal}`, 180, yPos, { align: 'right' });
    yPos += 10;
  }

  // Total
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 5;
  doc.setFillColor(34, 197, 94);
  doc.rect(15, yPos, 180, 25, 'F');

  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Total Project Estimate', 105, yPos + 10, { align: 'center' });
  doc.setFontSize(20);
  doc.text(`$${totalPrice}`, 105, yPos + 18, { align: 'center' });

  yPos += 30;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Estimate Range: $${minPrice} – $${maxPrice}`, 105, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Includes GST • Full preparation • Premium Resene paints • 5-year guarantee', 105, yPos, { align: 'center' });

  // Disclaimer
  yPos += 10;
  doc.setFillColor(254, 252, 232);
  doc.rect(15, yPos, 180, 15, 'F');
  doc.setTextColor(146, 64, 14);
  doc.text('Indicative pricing only. Free on-site quote and colour consultation required for final price.', 105, yPos + 8, { align: 'center' });

  // Save
  doc.save(`painting-estimate-${totalPrice}.pdf`);
}

// Generate Professional Task List from Estimate
function generateProfessionalTaskList() {
  const tasks = [];
  let taskId = 1;

  // Calculate total estimate for percentage weights
  const interiorEstimate = rooms.reduce((sum, r) => sum + calcRoom(r), 0);
  const exteriorEstimate = exteriors.reduce((sum, e) => sum + calcExt(e), 0);
  const totalEstimate = interiorEstimate + exteriorEstimate;

  // Calculate interior vs exterior split for percentage allocation
  const interiorPct = totalEstimate > 0 ? interiorEstimate / totalEstimate : 1;
  const exteriorPct = totalEstimate > 0 ? exteriorEstimate / totalEstimate : 0;

  // Check if any room has wallpaper removal
  const hasWallpaperRemoval = rooms.some(r => r.selectedTasks['Remove wallpaper']);

  // PHASE 1: GLOBAL SETUP (5% of job - covers both interior and exterior)
  const setupWeight = 5;
  tasks.push({
    id: taskId++,
    phase: 'setup',
    task: 'Confirm final price after on-site visit',
    completed: false,
    percentage: setupWeight * 0.3,
    dependencies: [],
    room: 'All'
  });
  tasks.push({
    id: taskId++,
    phase: 'setup',
    task: 'Confirm colour schedule before opening paint',
    completed: false,
    percentage: setupWeight * 0.2,
    dependencies: [1],
    room: 'All'
  });
  tasks.push({
    id: taskId++,
    phase: 'setup',
    task: 'Confirm scope interpretation (windows, trim details, etc.)',
    completed: false,
    percentage: setupWeight * 0.2,
    dependencies: [1],
    room: 'All'
  });
  tasks.push({
    id: taskId++,
    phase: 'setup',
    task: 'Protect common areas and access paths',
    completed: false,
    percentage: setupWeight * 0.15,
    dependencies: [1, 2, 3],
    room: 'All'
  });
  tasks.push({
    id: taskId++,
    phase: 'setup',
    task: 'Establish lighting for defect detection',
    completed: false,
    percentage: setupWeight * 0.15,
    dependencies: [1, 2, 3],
    room: 'All'
  });

  const setupEndId = taskId - 1;

  // PHASE 2: INTERIOR PREP (30% of interior portion)
  // Tasks are done sequentially ACROSS all rooms (not room-by-room)
  const interiorPrepWeight = 30 * interiorPct;
  const prepWeightPerRoom = rooms.length > 0 ? interiorPrepWeight / rooms.length : 0;

  // Filter out rooms with no tasks
  const validRooms = rooms.filter(r => calcRoom(r) > 0).map((room, index) => ({
    ...room,
    roomName: `${room.type} ${index + 1}`,
    roomIndex: index
  }));

  let lastProtectId = setupEndId;
  let lastHardwareId = setupEndId;
  let lastWallpaperRemovalIds = {};
  let lastRepairId = setupEndId;
  let lastSandingId = setupEndId;
  let lastDustRemovalId = setupEndId;
  let lastPrimeId = setupEndId;

  // Step 1: Protect floors and fixtures in ALL rooms
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'prep',
      task: `Protect floors and fixtures`,
      completed: false,
      percentage: prepWeightPerRoom * 0.1,
      dependencies: [lastProtectId],
      room: room.roomName
    });
    lastProtectId = taskId - 1;
    lastHardwareId = taskId - 1; // Hardware depends on protection
  });

  // Step 2: Remove or mask hardware in ALL rooms
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'prep',
      task: `Remove or mask hardware`,
      completed: false,
      percentage: prepWeightPerRoom * 0.05,
      dependencies: [lastHardwareId],
      room: room.roomName
    });
    lastHardwareId = taskId - 1;
  });

  // Step 3: Wallpaper removal for rooms that need it
  const roomsWithWallpaper = validRooms.filter(r => r.selectedTasks['Remove wallpaper']);
  if (roomsWithWallpaper.length > 0) {
    let lastWallpaperTaskId = lastHardwareId;

    // Remove wallpaper from all rooms that have it
    roomsWithWallpaper.forEach((room) => {
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Remove wallpaper`,
        completed: false,
        percentage: prepWeightPerRoom * 0.15,
        dependencies: [lastWallpaperTaskId],
        room: room.roomName
      });
      lastWallpaperTaskId = taskId - 1;
      lastWallpaperRemovalIds[room.roomIndex] = taskId - 1;
    });

    // Remove adhesive residue from all rooms
    roomsWithWallpaper.forEach((room) => {
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Remove adhesive residue`,
        completed: false,
        percentage: prepWeightPerRoom * 0.1,
        dependencies: [lastWallpaperTaskId],
        room: room.roomName
      });
      lastWallpaperTaskId = taskId - 1;
      lastWallpaperRemovalIds[room.roomIndex] = taskId - 1;
    });

    // Allow walls to dry in all rooms
    roomsWithWallpaper.forEach((room) => {
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Allow walls to dry (minimum 24 hours)`,
        completed: false,
        percentage: prepWeightPerRoom * 0.05,
        dependencies: [lastWallpaperTaskId],
        room: room.roomName
      });
      lastWallpaperTaskId = taskId - 1;
      lastWallpaperRemovalIds[room.roomIndex] = taskId - 1;
    });

    lastRepairId = lastWallpaperTaskId;
  } else {
    lastRepairId = lastHardwareId;
  }

  // Step 4: Inspect and repair surface defects in ALL rooms
  validRooms.forEach((room) => {
    const roomDep = lastWallpaperRemovalIds[room.roomIndex] || lastRepairId;
    tasks.push({
      id: taskId++,
      phase: 'prep',
      task: `Inspect and repair surface defects`,
      completed: false,
      percentage: prepWeightPerRoom * 0.15,
      dependencies: [roomDep],
      room: room.roomName
    });
    lastRepairId = taskId - 1;
    lastSandingId = taskId - 1;
  });

  // Step 5: Initial sanding of ALL surfaces in ALL rooms
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'prep',
      task: `Initial sanding of ALL surfaces (walls, ceiling, trim, doors, windows)`,
      completed: false,
      percentage: prepWeightPerRoom * 0.2,
      dependencies: [lastSandingId],
      room: room.roomName
    });
    lastSandingId = taskId - 1;
    lastDustRemovalId = taskId - 1;
  });

  // Step 6: Dust removal and surface cleaning in ALL rooms
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'prep',
      task: `Dust removal and surface cleaning`,
      completed: false,
      percentage: prepWeightPerRoom * 0.1,
      dependencies: [lastDustRemovalId],
      room: room.roomName
    });
    lastDustRemovalId = taskId - 1;
    lastPrimeId = taskId - 1;
  });

  // Step 7: Spot-prime or seal in ALL rooms
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'prep',
      task: `Spot-prime or seal where required`,
      completed: false,
      percentage: prepWeightPerRoom * 0.1,
      dependencies: [lastPrimeId],
      room: room.roomName
    });
    lastPrimeId = taskId - 1;
  });

  const prepEndId = taskId - 1;

  // CRITICAL HOLD POINT
  tasks.push({
    id: taskId++,
    phase: 'prep',
    task: '✓ HOLD POINT: All prep complete - Ready to begin painting',
    completed: false,
    percentage: 0,
    dependencies: [prepEndId],
    room: 'All'
  });

  const paintStartId = taskId;

  // PHASE 3: INTERIOR PAINTING (55% of interior portion)
  // Paint order: Skirting → Windows → Ceilings → Walls → Doors → Cabinets
  // Tasks are done sequentially ACROSS all rooms
  const interiorPaintWeight = 55 * interiorPct;

  // Calculate surface distribution
  const surfaceCount = {
    skirting: 0,
    windows: 0,
    ceilings: 0,
    walls: 0,
    doors: 0,
    cabinets: 0
  };

  validRooms.forEach(room => {
    if (room.selectedTasks['Paint skirting/coving']) surfaceCount.skirting++;
    if (room.selectedTasks['Paint windows']) surfaceCount.windows++;
    if (room.selectedTasks['Paint ceiling']) surfaceCount.ceilings++;
    if (room.selectedTasks['Paint walls']) surfaceCount.walls++;
    if (room.selectedTasks['Paint doors']) surfaceCount.doors++;
    if (room.selectedTasks['Paint cabinets']) surfaceCount.cabinets++;
  });

  const totalSurfaces = Object.values(surfaceCount).reduce((a, b) => a + b, 0);
  const weightPerSurface = totalSurfaces > 0 ? interiorPaintWeight / totalSurfaces : 0;

  // Helper to paint a surface across all rooms sequentially
  const paintSurfaceAcrossRooms = (surfaceType, surfaceName, getColor) => {
    const roomsWithSurface = validRooms.filter(room => room.selectedTasks[surfaceType]);
    if (roomsWithSurface.length === 0) return;

    let lastTaskId = taskId - 1;

    // Coat 1 for all rooms
    roomsWithSurface.forEach((room) => {
      const color = getColor(room);
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `${surfaceName} - Coat 1${color ? ' (' + color + ')' : ''}`,
        completed: false,
        percentage: weightPerSurface * 0.4,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // Light sanding for all rooms
    roomsWithSurface.forEach((room) => {
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `${surfaceName} - Light sanding between coats`,
        completed: false,
        percentage: weightPerSurface * 0.1,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // Dust removal for all rooms
    roomsWithSurface.forEach((room) => {
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `${surfaceName} - Dust removal`,
        completed: false,
        percentage: weightPerSurface * 0.1,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // Coat 2 (final) for all rooms
    roomsWithSurface.forEach((room) => {
      const color = getColor(room);
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `${surfaceName} - Coat 2 (final)${color ? ' (' + color + ')' : ''}`,
        completed: false,
        percentage: weightPerSurface * 0.4,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });
  };

  // 1. Paint skirting/coving AND windows together (with sanding done together between coats)
  const roomsWithSkirting = validRooms.filter(room => room.selectedTasks['Paint skirting/coving']);
  const roomsWithWindows = validRooms.filter(room => room.selectedTasks['Paint windows']);
  const hasTrimSurfaces = roomsWithSkirting.length > 0 || roomsWithWindows.length > 0;

  if (hasTrimSurfaces) {
    let lastTaskId = taskId - 1;

    // COAT 1 - Skirting/Coving for all rooms
    roomsWithSkirting.forEach((room) => {
      const color = room.trimColor && room.trimColor !== 'Choose colour' ? room.trimColor : '';
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `Skirting/Coving - Coat 1${color ? ' (' + color + ')' : ''}`,
        completed: false,
        percentage: weightPerSurface * 0.4,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // COAT 1 - Windows for all rooms
    roomsWithWindows.forEach((room) => {
      const color = room.windowColor && room.windowColor !== 'Choose colour' ? room.windowColor : '';
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `Windows - Coat 1${color ? ' (' + color + ')' : ''}`,
        completed: false,
        percentage: weightPerSurface * 0.4,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // SANDING - All trim surfaces (skirting AND windows) together
    const roomsWithAnyTrim = [...new Set([...roomsWithSkirting, ...roomsWithWindows])];
    roomsWithAnyTrim.forEach((room) => {
      const surfaces = [];
      if (room.selectedTasks['Paint skirting/coving']) surfaces.push('Skirting/Coving');
      if (room.selectedTasks['Paint windows']) surfaces.push('Windows');
      const surfaceList = surfaces.join(' & ');

      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `${surfaceList} - Light sanding between coats`,
        completed: false,
        percentage: weightPerSurface * 0.1,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // DUST REMOVAL - All trim surfaces together
    roomsWithAnyTrim.forEach((room) => {
      const surfaces = [];
      if (room.selectedTasks['Paint skirting/coving']) surfaces.push('Skirting/Coving');
      if (room.selectedTasks['Paint windows']) surfaces.push('Windows');
      const surfaceList = surfaces.join(' & ');

      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `${surfaceList} - Dust removal`,
        completed: false,
        percentage: weightPerSurface * 0.1,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // COAT 2 - Skirting/Coving for all rooms
    roomsWithSkirting.forEach((room) => {
      const color = room.trimColor && room.trimColor !== 'Choose colour' ? room.trimColor : '';
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `Skirting/Coving - Coat 2 (final)${color ? ' (' + color + ')' : ''}`,
        completed: false,
        percentage: weightPerSurface * 0.4,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // COAT 2 - Windows for all rooms
    roomsWithWindows.forEach((room) => {
      const color = room.windowColor && room.windowColor !== 'Choose colour' ? room.windowColor : '';
      tasks.push({
        id: taskId++,
        phase: 'painting',
        task: `Windows - Coat 2 (final)${color ? ' (' + color + ')' : ''}`,
        completed: false,
        percentage: weightPerSurface * 0.4,
        dependencies: [lastTaskId],
        room: room.roomName
      });
      lastTaskId = taskId - 1;
    });

    // Protect finished trim before painting ceilings/walls
    tasks.push({
      id: taskId++,
      phase: 'painting',
      task: 'Allow trim cure time and apply low-tack masking to protect finished surfaces',
      completed: false,
      percentage: 0.5,
      dependencies: [lastTaskId],
      room: 'All'
    });
  }

  // 2. Paint ceilings across all rooms
  paintSurfaceAcrossRooms(
    'Paint ceiling',
    'Ceiling',
    (room) => room.ceilingColor && room.ceilingColor !== 'Choose colour' ? room.ceilingColor : ''
  );

  // 3. Paint walls across all rooms
  paintSurfaceAcrossRooms(
    'Paint walls',
    'Walls',
    (room) => room.wallColor && room.wallColor !== 'Choose colour' ? room.wallColor : ''
  );

  // 4. Paint doors across all rooms
  paintSurfaceAcrossRooms(
    'Paint doors',
    'Doors',
    (room) => room.doorColor && room.doorColor !== 'Choose colour' ? room.doorColor : ''
  );

  // 5. Paint cabinets across all rooms
  paintSurfaceAcrossRooms(
    'Paint cabinets',
    'Cabinets',
    (room) => room.cabinetColor && room.cabinetColor !== 'Choose colour' ? room.cabinetColor : ''
  );

  const paintEndId = taskId - 1;

  // EXTERIOR PAINTING (if applicable)
  // Add exterior tasks if there are valid exterior jobs
  const validExteriors = exteriors.filter(e => calcExt(e) > 0).map((ext, index) => ({
    ...ext,
    extName: ext.type === 'House Walls' ? `Exterior ${index + 1}` :
             ext.type === 'Deck' ? `Deck ${index + 1}` : `${ext.type} ${index + 1}`,
    extIndex: index
  }));

  let lastExteriorTaskId = paintEndId;

  if (validExteriors.length > 0) {
    // Exterior gets 30% of its portion for prep, 55% for painting (matching interior proportions)
    const exteriorPrepWeight = 30 * exteriorPct;
    const exteriorPaintWeight = 55 * exteriorPct;

    // EXTERIOR PREP PHASE
    const prepWeightPerExterior = validExteriors.length > 0 ? exteriorPrepWeight / validExteriors.length : exteriorPrepWeight;

    validExteriors.forEach((ext) => {
      // Pressure washing
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Pressure wash exterior surfaces`,
        completed: false,
        percentage: prepWeightPerExterior * 0.25,
        dependencies: [lastExteriorTaskId],
        room: ext.extName
      });
      lastExteriorTaskId = taskId - 1;

      // Scraping and sanding
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Scrape loose paint and sand rough areas`,
        completed: false,
        percentage: prepWeightPerExterior * 0.3,
        dependencies: [lastExteriorTaskId],
        room: ext.extName
      });
      lastExteriorTaskId = taskId - 1;

      // Repairs and filling
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Repair damaged areas and fill cracks`,
        completed: false,
        percentage: prepWeightPerExterior * 0.25,
        dependencies: [lastExteriorTaskId],
        room: ext.extName
      });
      lastExteriorTaskId = taskId - 1;

      // Prime bare areas
      tasks.push({
        id: taskId++,
        phase: 'prep',
        task: `Prime bare areas and repairs`,
        completed: false,
        percentage: prepWeightPerExterior * 0.2,
        dependencies: [lastExteriorTaskId],
        room: ext.extName
      });
      lastExteriorTaskId = taskId - 1;
    });

    // EXTERIOR PAINTING PHASE
    const paintWeightPerExterior = validExteriors.length > 0 ? exteriorPaintWeight / validExteriors.length : exteriorPaintWeight;

    validExteriors.forEach((ext) => {
      if (ext.type === 'House Walls') {
        // Paint in order: Fascia/soffits → Gutters → Walls → Windows → Doors
        const surfaces = [
          { task: 'Fascia/soffits', name: 'Fascia/Soffits', color: ext.fasciaColor, weight: 0.15 },
          { task: 'Gutters/downpipes', name: 'Gutters/Downpipes', color: ext.gutterColor, weight: 0.15 },
          { task: 'Paint walls', name: 'Walls', color: ext.wallColor, weight: 0.5 },
          { task: 'Window frames', name: 'Window Frames', color: ext.windowColor, weight: 0.1 },
          { task: 'Exterior doors', name: 'Doors', color: ext.doorColor, weight: 0.1 }
        ];

        surfaces.forEach((surface) => {
          if (ext.selectedTasks[surface.task]) {
            const colorInfo = surface.color && surface.color !== 'Choose colour' ? ` (${surface.color})` : '';
            const numCoats = parseInt(ext.coats) || 2;

            // Coat 1
            tasks.push({
              id: taskId++,
              phase: 'painting',
              task: `${surface.name} - Coat 1${colorInfo}`,
              completed: false,
              percentage: (paintWeightPerExterior * surface.weight) * 0.4,
              dependencies: [lastExteriorTaskId],
              room: ext.extName
            });
            lastExteriorTaskId = taskId - 1;

            // Sanding between coats
            tasks.push({
              id: taskId++,
              phase: 'painting',
              task: `${surface.name} - Light sanding between coats`,
              completed: false,
              percentage: (paintWeightPerExterior * surface.weight) * 0.1,
              dependencies: [lastExteriorTaskId],
              room: ext.extName
            });
            lastExteriorTaskId = taskId - 1;

            // Dust removal
            tasks.push({
              id: taskId++,
              phase: 'painting',
              task: `${surface.name} - Dust removal`,
              completed: false,
              percentage: (paintWeightPerExterior * surface.weight) * 0.1,
              dependencies: [lastExteriorTaskId],
              room: ext.extName
            });
            lastExteriorTaskId = taskId - 1;

            // Coat 2 (or final coat)
            tasks.push({
              id: taskId++,
              phase: 'painting',
              task: `${surface.name} - Coat ${numCoats} (final)${colorInfo}`,
              completed: false,
              percentage: (paintWeightPerExterior * surface.weight) * 0.4,
              dependencies: [lastExteriorTaskId],
              room: ext.extName
            });
            lastExteriorTaskId = taskId - 1;

            // If 3 coats, add another cycle
            if (numCoats === 3) {
              // Sanding
              tasks.push({
                id: taskId++,
                phase: 'painting',
                task: `${surface.name} - Light sanding between coats`,
                completed: false,
                percentage: (paintWeightPerExterior * surface.weight) * 0.05,
                dependencies: [lastExteriorTaskId],
                room: ext.extName
              });
              lastExteriorTaskId = taskId - 1;

              // Dust removal
              tasks.push({
                id: taskId++,
                phase: 'painting',
                task: `${surface.name} - Dust removal`,
                completed: false,
                percentage: (paintWeightPerExterior * surface.weight) * 0.05,
                dependencies: [lastExteriorTaskId],
                room: ext.extName
              });
              lastExteriorTaskId = taskId - 1;

              // Final coat (coat 3)
              tasks.push({
                id: taskId++,
                phase: 'painting',
                task: `${surface.name} - Coat 3 (final)${colorInfo}`,
                completed: false,
                percentage: (paintWeightPerExterior * surface.weight) * 0.2,
                dependencies: [lastExteriorTaskId],
                room: ext.extName
              });
              lastExteriorTaskId = taskId - 1;
            }
          }
        });
      } else if (ext.type === 'Deck') {
        const numCoats = parseInt(ext.coats) || 2;

        if (ext.selectedTasks['Stain/oil deck']) {
          // Coat 1
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Stain/Oil Deck - Coat 1`,
            completed: false,
            percentage: paintWeightPerExterior * 0.4,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

          // Light sanding
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Deck - Light sanding between coats`,
            completed: false,
            percentage: paintWeightPerExterior * 0.1,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

          // Dust removal
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Deck - Dust removal`,
            completed: false,
            percentage: paintWeightPerExterior * 0.1,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

          // Final coat
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Stain/Oil Deck - Coat ${numCoats} (final)`,
            completed: false,
            percentage: paintWeightPerExterior * 0.4,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

        } else if (ext.selectedTasks['Paint deck']) {
          const colorInfo = ext.deckColor && ext.deckColor !== 'Choose colour' ? ` (${ext.deckColor})` : '';

          // Coat 1
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Paint Deck - Coat 1${colorInfo}`,
            completed: false,
            percentage: paintWeightPerExterior * 0.4,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

          // Light sanding
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Deck - Light sanding between coats`,
            completed: false,
            percentage: paintWeightPerExterior * 0.1,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

          // Dust removal
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Deck - Dust removal`,
            completed: false,
            percentage: paintWeightPerExterior * 0.1,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;

          // Final coat
          tasks.push({
            id: taskId++,
            phase: 'painting',
            task: `Paint Deck - Coat ${numCoats} (final)${colorInfo}`,
            completed: false,
            percentage: paintWeightPerExterior * 0.4,
            dependencies: [lastExteriorTaskId],
            room: ext.extName
          });
          lastExteriorTaskId = taskId - 1;
        }
      }
    });
  }

  // PHASE 4: QA AND COMPLETION (10% of job)
  // Tasks done sequentially across all rooms AND exteriors
  const qaWeight = 10;
  const totalAreas = validRooms.length + validExteriors.length;
  const qaWeightPerArea = totalAreas > 0 ? qaWeight / totalAreas : qaWeight;

  let lastRemoveMaskingId = lastExteriorTaskId;
  let lastInspectionId = lastExteriorTaskId;
  let lastTouchUpId = lastExteriorTaskId;
  let lastCleanId = lastExteriorTaskId;
  let lastSignOffId = lastExteriorTaskId;

  // Step 1: Remove masking and protection from all rooms and exteriors
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Remove masking and protection`,
      completed: false,
      percentage: qaWeightPerArea * 0.2,
      dependencies: [lastRemoveMaskingId],
      room: room.roomName
    });
    lastRemoveMaskingId = taskId - 1;
    lastInspectionId = taskId - 1;
  });

  validExteriors.forEach((ext) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Remove masking and protection`,
      completed: false,
      percentage: qaWeightPerArea * 0.2,
      dependencies: [lastRemoveMaskingId],
      room: ext.extName
    });
    lastRemoveMaskingId = taskId - 1;
    lastInspectionId = taskId - 1;
  });

  // Step 2: Final defect inspection in all areas
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Final defect inspection`,
      completed: false,
      percentage: qaWeightPerArea * 0.3,
      dependencies: [lastInspectionId],
      room: room.roomName
    });
    lastInspectionId = taskId - 1;
    lastTouchUpId = taskId - 1;
  });

  validExteriors.forEach((ext) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Final defect inspection`,
      completed: false,
      percentage: qaWeightPerArea * 0.3,
      dependencies: [lastInspectionId],
      room: ext.extName
    });
    lastInspectionId = taskId - 1;
    lastTouchUpId = taskId - 1;
  });

  // Step 3: Touch-ups if required in all areas
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Touch-ups if required`,
      completed: false,
      percentage: qaWeightPerArea * 0.3,
      dependencies: [lastTouchUpId],
      room: room.roomName
    });
    lastTouchUpId = taskId - 1;
    lastCleanId = taskId - 1;
  });

  validExteriors.forEach((ext) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Touch-ups if required`,
      completed: false,
      percentage: qaWeightPerArea * 0.3,
      dependencies: [lastTouchUpId],
      room: ext.extName
    });
    lastTouchUpId = taskId - 1;
    lastCleanId = taskId - 1;
  });

  // Step 4: Clean all areas
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Clean area`,
      completed: false,
      percentage: qaWeightPerArea * 0.1,
      dependencies: [lastCleanId],
      room: room.roomName
    });
    lastCleanId = taskId - 1;
    lastSignOffId = taskId - 1;
  });

  validExteriors.forEach((ext) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Clean area`,
      completed: false,
      percentage: qaWeightPerArea * 0.1,
      dependencies: [lastCleanId],
      room: ext.extName
    });
    lastCleanId = taskId - 1;
    lastSignOffId = taskId - 1;
  });

  // Step 5: Area sign-off for all areas
  validRooms.forEach((room) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Area sign-off`,
      completed: false,
      percentage: qaWeightPerArea * 0.1,
      dependencies: [lastSignOffId],
      room: room.roomName
    });
    lastSignOffId = taskId - 1;
  });

  validExteriors.forEach((ext) => {
    tasks.push({
      id: taskId++,
      phase: 'qa',
      task: `Area sign-off`,
      completed: false,
      percentage: qaWeightPerArea * 0.1,
      dependencies: [lastSignOffId],
      room: ext.extName
    });
    lastSignOffId = taskId - 1;
  });

  // FINAL SIGN-OFF
  const finalMessage = validRooms.length > 0 && validExteriors.length > 0 ? 'all areas' :
                       validRooms.length > 0 ? 'all rooms' : 'all exterior areas';
  tasks.push({
    id: taskId++,
    phase: 'completion',
    task: `✓ Confirm ${finalMessage} approved`,
    completed: false,
    percentage: 0,
    dependencies: [lastSignOffId],
    room: 'All'
  });

  tasks.push({
    id: taskId++,
    phase: 'completion',
    task: '✓ Job complete - Final sign-off',
    completed: false,
    percentage: 0,
    dependencies: [taskId - 1],
    room: 'All'
  });

  return tasks;
}

// Generate Materials Checklist based on Estimate
function generateMaterialsChecklist() {
  const materials = [];
  let itemId = 1; // Track unique IDs for each item

  // Calculate totals for both interior and exterior
  const validRooms = rooms.filter(r => calcRoom(r) > 0);
  const validExteriors = exteriors.filter(e => calcExt(e) > 0);
  const totalRooms = validRooms.length;

  // Only skip if BOTH interior and exterior are empty
  if (totalRooms === 0 && validExteriors.length === 0) {
    return materials;
  }

  // INTERIOR MATERIALS (only if there are rooms)
  if (totalRooms > 0) {
    // Calculate total floor area
    let totalFloorArea = 0;
    validRooms.forEach(room => {
      const length = parseFloat(room.length) || 0;
      const width = parseFloat(room.width) || 0;
      totalFloorArea += length * width;
    });

    // Check for wallpaper removal
    const hasWallpaperRemoval = validRooms.some(r => r.selectedTasks['Remove wallpaper']);

    // Count surfaces and windows
    let totalSurfaces = 0;
    let totalWindows = 0;
    let totalDoors = 0;
    let hasCeilings = false;
    let hasWalls = false;
    let hasTrim = false;

    validRooms.forEach(room => {
      if (room.selectedTasks['Paint walls']) {
        totalSurfaces++;
        hasWalls = true;
      }
      if (room.selectedTasks['Paint ceiling']) {
        totalSurfaces++;
        hasCeilings = true;
      }
      if (room.selectedTasks['Paint skirting and coving']) {
        totalSurfaces++;
        hasTrim = true;
      }
      if (room.selectedTasks['Paint doors']) {
        totalSurfaces++;
        totalDoors += 1;
      }
      if (room.selectedTasks['Paint windows']) {
        totalSurfaces++;
        totalWindows += 1;
      }
    });

    const avgCoats = validRooms.reduce((sum, r) => sum + (parseFloat(r.coats) || 2), 0) / validRooms.length;

    // STEP 1 — ACCESS & PROTECTION EQUIPMENT (ALWAYS REQUIRED)
      materials.push({
      category: 'Access & Protection Equipment',
      items: [
        { id: itemId++, name: 'Drop sheets (canvas or heavy-duty plastic)', quantity: Math.ceil(totalFloorArea / 10) + ' sheets', notes: 'Scaled to total floor area', checked: false },
        { id: itemId++, name: 'Additional plastic sheeting for furniture', quantity: Math.ceil(totalRooms / 2) + ' rolls', notes: 'For protecting furniture and fixed items', checked: false },
        { id: itemId++, name: 'Masking tape - Low-tack', quantity: Math.ceil(totalSurfaces / 3) + ' rolls', notes: 'For delicate surfaces', checked: false },
        { id: itemId++, name: 'Masking tape - Standard', quantity: Math.ceil(totalSurfaces / 2) + ' rolls', notes: 'For general use', checked: false },
        { id: itemId++, name: 'Step ladders', quantity: totalRooms > 3 ? '2' : '1', notes: 'Additional ladder for larger jobs', checked: false },
        { id: itemId++, name: 'Work lights (portable LED)', quantity: Math.ceil(totalRooms / 3) + ' units', notes: 'For defect detection', checked: false },
        { id: itemId++, name: 'Extension leads and power boards', quantity: '2 sets', notes: 'For power tools', checked: false }
      ]
    });
  
    // STEP 2 — WALLPAPER REMOVAL TOOLS (ONLY IF NEEDED)
    if (hasWallpaperRemoval) {
      materials.push({
        category: 'Wallpaper Removal Tools',
        items: [
          { id: itemId++, name: 'Wallpaper scraper(s)', quantity: '2-3', notes: 'For stripping wallpaper', checked: false },
          { id: itemId++, name: 'Broad knives / stripping blades', quantity: '2-3', notes: 'Various sizes', checked: false },
          { id: itemId++, name: 'Spray bottles or pump sprayer', quantity: '1-2', notes: 'For wetting wallpaper', checked: false },
          { id: itemId++, name: 'Buckets', quantity: '2-3', notes: 'For water and waste', checked: false },
          { id: itemId++, name: 'Sponges or stripping pads', quantity: '1 pack', notes: 'For cleaning', checked: false },
          { id: itemId++, name: 'Heavy-duty rubbish bags', quantity: Math.ceil(totalRooms * 2) + ' bags', notes: 'For wallpaper disposal', checked: false },
          { id: itemId++, name: 'Disposable gloves', quantity: '2 boxes', notes: 'For protection', checked: false }
        ]
      });
    }
  
    // STEP 3 — PREP & REPAIR MATERIALS (ALWAYS REQUIRED)
    materials.push({
      category: 'Prep & Repair Materials',
      items: [
        { id: itemId++, name: 'Interior wall filler / stopping compound', quantity: Math.ceil(totalRooms / 2) + ' tubs', notes: 'For wall repairs', checked: false },
        { id: itemId++, name: 'Fine surface filler', quantity: hasTrim ? Math.ceil(totalRooms / 3) + ' tubs' : '1 tub', notes: 'For trim and joinery', checked: false },
        { id: itemId++, name: 'Flexible gap filler (No More Gaps)', quantity: Math.ceil(totalRooms / 2) + ' tubes', notes: 'For gaps and cracks', checked: false },
        { id: itemId++, name: 'Caulking gun', quantity: '1-2', notes: 'For gap filler application', checked: false },
        { id: itemId++, name: 'Putty knives / filling knives', quantity: '1 set (3-4 sizes)', notes: 'Various sizes for different tasks', checked: false },
        { id: itemId++, name: 'Scrapers (paint and filling)', quantity: '2-3', notes: 'For prep work', checked: false },
        { id: itemId++, name: 'Sugar soap or surface cleaner', quantity: Math.ceil(totalRooms / 3) + ' bottles', notes: 'For cleaning surfaces', checked: false },
        { id: itemId++, name: 'Cleaning rags / wipes', quantity: '2 packs', notes: 'For wiping and cleaning', checked: false }
      ]
    });
  
    // STEP 4 — SANDING SYSTEM (MANDATORY FOR ALL JOBS)
    const sandpaperQty = Math.ceil(totalSurfaces * avgCoats / 2);
    materials.push({
      category: 'Sanding System (Mandatory)',
      items: [
        { id: itemId++, name: 'Sanding blocks', quantity: '2-3', notes: 'For flat surfaces', checked: false },
        { id: itemId++, name: 'Pole sander', quantity: hasCeilings || hasWalls ? '1' : '0', notes: 'For ceilings and walls', checked: false },
        { id: itemId++, name: 'Detail sanding sponges', quantity: '1 pack', notes: 'For corners and details', checked: false },
        { id: itemId++, name: 'Sandpaper - Coarse grit (60-80)', quantity: Math.ceil(sandpaperQty * 0.3) + ' sheets', notes: 'For prep/repairs', checked: false },
        { id: itemId++, name: 'Sandpaper - Medium grit (120-150)', quantity: Math.ceil(sandpaperQty * 0.4) + ' sheets', notes: 'For general prep', checked: false },
        { id: itemId++, name: 'Sandpaper - Fine grit (220-240)', quantity: Math.ceil(sandpaperQty * 0.5) + ' sheets', notes: 'For between coats (mandatory)', checked: false },
        { id: itemId++, name: 'Vacuum with fine dust filter', quantity: '1', notes: 'For dust removal', checked: false },
        { id: itemId++, name: 'Tack cloths or microfiber cloths', quantity: Math.ceil(totalSurfaces) + ' cloths', notes: 'For final dust removal', checked: false }
      ]
    });
  
    // STEP 5 — PAINT APPLICATION TOOLS
    materials.push({
      category: 'Paint Application Tools',
      items: [
        { id: itemId++, name: 'Roller frames', quantity: '2-3', notes: 'Standard 9" frames', checked: false },
        { id: itemId++, name: 'Extension poles', quantity: '1-2', notes: 'For ceilings and high walls', checked: false },
        { id: itemId++, name: 'Roller sleeves - Walls (medium nap)', quantity: Math.ceil(totalSurfaces / 2) + ' sleeves', notes: 'For wall application', checked: false },
        { id: itemId++, name: 'Roller sleeves - Ceilings (long nap)', quantity: hasCeilings ? Math.ceil(totalRooms / 2) + ' sleeves' : '0', notes: 'For ceiling application', checked: false },
        { id: itemId++, name: 'Paint trays with liners', quantity: '2-3 trays + liners', notes: 'For roller application', checked: false },
        { id: itemId++, name: 'Paint buckets (5L)', quantity: '2-3', notes: 'For mixing and pouring', checked: false },
        { id: itemId++, name: 'Cutting-in brushes (2-3")', quantity: '2-3', notes: 'For edges and corners', checked: false },
        { id: itemId++, name: 'Trim/detail brushes (1-2")', quantity: hasTrim ? '3-4' : '2', notes: 'For doors, windows, skirting', checked: false },
        { id: itemId++, name: 'Paint stirring sticks', quantity: '1 pack', notes: 'For mixing paint', checked: false }
      ]
    });
  
    // STEP 6 — PAINT & COATING MATERIALS (RESENE SYSTEM)
    const paintItems = [];
  
    // Primer/sealer (more if wallpaper removal)
    const primerQty = hasWallpaperRemoval
      ? Math.ceil(totalSurfaces * 2)
      : Math.ceil(totalSurfaces * 0.5);
    paintItems.push({
      id: itemId++,
      name: 'Primer/Sealer (Resene system)',
      quantity: primerQty + 'L',
      notes: hasWallpaperRemoval ? 'Extra for wallpaper removal prep' : 'Based on surface condition',
      checked: false
    });
  
    // Ceiling paint
    if (hasCeilings) {
      const ceilingRooms = validRooms.filter(r => r.selectedTasks['Paint ceiling']);
      const ceilingArea = ceilingRooms.reduce((sum, r) => {
        const length = parseFloat(r.length) || 0;
        const width = parseFloat(r.width) || 0;
        return sum + (length * width);
      }, 0);
      const ceilingPaintL = Math.ceil(ceilingArea * avgCoats * 0.12); // ~8m²/L coverage
      paintItems.push({
        id: itemId++,
        name: 'Ceiling paint (Resene system)',
        quantity: ceilingPaintL + 'L',
        notes: `For ${ceilingRooms.length} ceiling(s), ${avgCoats} coats + wastage`,
        checked: false
      });
    }
  
    // Wall paint
    if (hasWalls) {
      const wallRooms = validRooms.filter(r => r.selectedTasks['Paint walls']);
      const wallArea = wallRooms.reduce((sum, r) => {
        const length = parseFloat(r.length) || 0;
        const width = parseFloat(r.width) || 0;
        const height = parseFloat(r.ceilingHeight) || 2.4;
        const perimeter = (length + width) * 2;
        return sum + (perimeter * height);
      }, 0);
      const wallPaintL = Math.ceil(wallArea * avgCoats * 0.12);
      paintItems.push({
        id: itemId++,
        name: 'Wall paint (Resene system)',
        quantity: wallPaintL + 'L',
        notes: `For ${wallRooms.length} room(s), ${avgCoats} coats + wastage`,
        checked: false
      });
    }
  
    // Trim/enamel paint
    if (hasTrim || totalDoors > 0 || totalWindows > 0) {
      const trimQty = Math.ceil((totalRooms * 2) + (totalDoors * 0.5) + (totalWindows * 0.5));
      paintItems.push({
        id: itemId++,
        name: 'Trim/Door/Window enamel (Resene system)',
        quantity: trimQty + 'L',
        notes: `For skirting, doors, windows - ${avgCoats} coats + wastage`,
        checked: false
      });
    }
  
    materials.push({
      category: 'Paint & Coating Materials (Resene)',
      items: paintItems
    });
  
    // STEP 7 — MASKING & PROTECTION MATERIALS (TRIM-FIRST LOGIC)
    materials.push({
      category: 'Masking & Protection (Trim-First)',
      items: [
        { id: itemId++, name: 'Additional low-tack masking tape', quantity: Math.ceil(totalSurfaces / 2) + ' rolls', notes: 'For protecting finished trim/windows', checked: false },
        { id: itemId++, name: 'Plastic or paper masking rolls', quantity: hasTrim ? '2-3 rolls' : '1 roll', notes: 'For edge protection', checked: false },
        { id: itemId++, name: 'Edge protection materials', quantity: Math.ceil(totalRooms / 2) + ' sets', notes: 'For skirting and window sills', checked: false }
      ]
    });
  
    // STEP 8 — CLEANUP & DISPOSABLES
    materials.push({
      category: 'Cleanup & Disposables',
      items: [
        { id: itemId++, name: 'Heavy-duty rubbish bags', quantity: Math.ceil(totalRooms * 1.5) + ' bags', notes: 'For waste disposal', checked: false },
        { id: itemId++, name: 'Roller and brush cleaning materials', quantity: '1 set', notes: 'Or budget for disposables', checked: false },
        { id: itemId++, name: 'Bucket liners', quantity: '1 pack', notes: 'For easy cleanup', checked: false },
        { id: itemId++, name: 'Disposable gloves', quantity: '2 boxes', notes: 'For protection', checked: false },
        { id: itemId++, name: 'Hand cleaner', quantity: '2 bottles', notes: 'For painter cleanup', checked: false },
        { id: itemId++, name: 'Paper towels / wipes', quantity: '2-3 rolls', notes: 'For general cleanup', checked: false }
      ]
    });
  
    // STEP 9 — QA & FINISHING ITEMS
    materials.push({
      category: 'QA & Finishing',
      items: [
        { id: itemId++, name: 'Touch-up brushes (small)', quantity: '2-3', notes: 'For final touch-ups', checked: false },
        { id: itemId++, name: 'Fine grit sandpaper for defect correction', quantity: '10-15 sheets', notes: 'For final corrections', checked: false },
        { id: itemId++, name: 'Inspection light (LED)', quantity: '1', notes: 'For quality checking', checked: false },
        { id: itemId++, name: 'Spare paint for touch-ups', quantity: '10% of each color', notes: 'Retained for future touch-ups', checked: false }
      ]
    });
  } // End interior materials

  // EXTERIOR-SPECIFIC MATERIALS (if applicable)
  if (validExteriors.length > 0) {
    // Calculate exterior totals
    let totalExteriorArea = 0;
    let hasHouseWalls = false;
    let hasDecks = false;
    validExteriors.forEach(ext => {
      const area = parseFloat(ext.area) || 0;
      totalExteriorArea += area;
      if (ext.type === 'House Walls') hasHouseWalls = true;
      if (ext.type === 'Deck') hasDecks = true;
    });

    // EXTERIOR PREP EQUIPMENT
    const exteriorPrepItems = [];
    exteriorPrepItems.push({ id: itemId++, name: 'Pressure washer (electric or gas)', quantity: '1', notes: 'For cleaning exterior surfaces', checked: false });
    exteriorPrepItems.push({ id: itemId++, name: 'Pressure washer nozzles (various angles)', quantity: '1 set', notes: 'Different spray patterns', checked: false });
    exteriorPrepItems.push({ id: itemId++, name: 'Garden hose and connections', quantity: '1 set', notes: 'For water supply', checked: false });
    exteriorPrepItems.push({ id: itemId++, name: 'Paint scrapers (wide blade)', quantity: '2-3', notes: 'For removing loose paint', checked: false });
    exteriorPrepItems.push({ id: itemId++, name: 'Wire brushes', quantity: '2-3', notes: 'For rust and loose paint removal', checked: false });
    exteriorPrepItems.push({ id: itemId++, name: 'Exterior-grade sandpaper (coarse-medium)', quantity: Math.ceil(validExteriors.length * 2) + ' packs', notes: 'For surface prep', checked: false });
    exteriorPrepItems.push({ id: itemId++, name: 'Safety goggles', quantity: '2-3 pairs', notes: 'For pressure washing safety', checked: false });

    materials.push({
      category: 'Exterior Prep Equipment',
      items: exteriorPrepItems
    });

    // EXTERIOR ACCESS EQUIPMENT
    const accessItems = [];
    if (hasHouseWalls) {
      accessItems.push({ id: itemId++, name: 'Extension ladders', quantity: '1-2', notes: 'For high exterior walls', checked: false });
      accessItems.push({ id: itemId++, name: 'Ladder stabilizers', quantity: '1 set', notes: 'For ladder safety', checked: false });
      accessItems.push({ id: itemId++, name: 'Scaffolding (if needed for multi-story)', quantity: 'As required', notes: 'For safe access to high areas', checked: false });
    }
    accessItems.push({ id: itemId++, name: 'Step ladders (exterior)', quantity: '1-2', notes: 'For lower areas and decks', checked: false });

    materials.push({
      category: 'Exterior Access Equipment',
      items: accessItems
    });

    // EXTERIOR REPAIR MATERIALS
    const exteriorRepairItems = [];
    exteriorRepairItems.push({ id: itemId++, name: 'Exterior wood filler / epoxy', quantity: Math.ceil(validExteriors.length / 2) + ' tubs', notes: 'For wood repairs', checked: false });
    exteriorRepairItems.push({ id: itemId++, name: 'Exterior-grade caulk (paintable)', quantity: Math.ceil(validExteriors.length) + ' tubes', notes: 'For gaps and cracks', checked: false });
    exteriorRepairItems.push({ id: itemId++, name: 'Caulking gun (heavy-duty)', quantity: '1-2', notes: 'For exterior caulk application', checked: false });
    exteriorRepairItems.push({ id: itemId++, name: 'Rust converter (if metal surfaces)', quantity: '1-2 bottles', notes: 'For treating rusted areas', checked: false });

    materials.push({
      category: 'Exterior Repair Materials',
      items: exteriorRepairItems
    });

    // EXTERIOR PAINT & COATINGS
    const exteriorPaintItems = [];

    // Exterior primer
    const exteriorPrimerQty = Math.ceil(totalExteriorArea * 0.15); // Coverage varies by surface
    exteriorPaintItems.push({
      id: itemId++,
      name: 'Exterior primer/sealer (Resene system)',
      quantity: exteriorPrimerQty + 'L',
      notes: 'For bare wood and repairs',
      checked: false
    });

    // Exterior paint for house walls
    if (hasHouseWalls) {
      const houseWalls = validExteriors.filter(e => e.type === 'House Walls');
      const houseArea = houseWalls.reduce((sum, e) => sum + (parseFloat(e.area) || 0), 0);
      const avgExteriorCoats = houseWalls.reduce((sum, e) => sum + (parseFloat(e.coats) || 2), 0) / houseWalls.length;

      // Wall paint
      const wallPaintQty = Math.ceil(houseArea * avgExteriorCoats * 0.15);
      exteriorPaintItems.push({
        id: itemId++,
        name: 'Exterior wall paint (Resene system)',
        quantity: wallPaintQty + 'L',
        notes: `For ${houseWalls.length} exterior area(s), ${avgExteriorCoats} coats`,
        checked: false
      });

      // Trim paint (fascia, gutters, windows, doors)
      const trimQty = Math.ceil(houseWalls.length * 5);
      exteriorPaintItems.push({
        id: itemId++,
        name: 'Exterior trim/enamel paint (Resene system)',
        quantity: trimQty + 'L',
        notes: 'For fascia, gutters, windows, doors',
        checked: false
      });
    }

    // Deck stain/paint
    if (hasDecks) {
      const decks = validExteriors.filter(e => e.type === 'Deck');
      const deckArea = decks.reduce((sum, e) => sum + (parseFloat(e.area) || 0), 0);
      const deckCoats = decks.reduce((sum, e) => sum + (parseFloat(e.coats) || 2), 0) / decks.length;

      const deckProductQty = Math.ceil(deckArea * deckCoats * 0.15);
      exteriorPaintItems.push({
        id: itemId++,
        name: 'Deck stain/oil or paint (Resene system)',
        quantity: deckProductQty + 'L',
        notes: `For ${decks.length} deck(s), ${deckCoats} coats`,
        checked: false
      });
    }

    materials.push({
      category: 'Exterior Paint & Coatings (Resene)',
      items: exteriorPaintItems
    });

    // EXTERIOR PROTECTION MATERIALS
    const exteriorProtectionItems = [];
    exteriorProtectionItems.push({ id: itemId++, name: 'Heavy-duty plastic sheeting', quantity: Math.ceil(validExteriors.length) + ' rolls', notes: 'For protecting plants and landscaping', checked: false });
    exteriorProtectionItems.push({ id: itemId++, name: 'Canvas drop sheets (exterior)', quantity: Math.ceil(validExteriors.length / 2) + ' sheets', notes: 'For ground protection', checked: false });
    exteriorProtectionItems.push({ id: itemId++, name: 'Exterior masking tape (weather-resistant)', quantity: Math.ceil(validExteriors.length) + ' rolls', notes: 'For windows and trim', checked: false });
    exteriorProtectionItems.push({ id: itemId++, name: 'Masking paper/plastic for windows', quantity: hasHouseWalls ? '2-3 rolls' : '1 roll', notes: 'For protecting glass', checked: false });

    materials.push({
      category: 'Exterior Protection Materials',
      items: exteriorProtectionItems
    });

    // EXTERIOR APPLICATION TOOLS
    const exteriorToolItems = [];
    exteriorToolItems.push({ id: itemId++, name: 'Exterior brushes (4-5" wide)', quantity: '2-3', notes: 'For large exterior surfaces', checked: false });
    exteriorToolItems.push({ id: itemId++, name: 'Exterior roller frames (9-18")', quantity: '2', notes: 'Various sizes for exterior work', checked: false });
    exteriorToolItems.push({ id: itemId++, name: 'Exterior roller sleeves (thick nap)', quantity: Math.ceil(validExteriors.length) + ' sleeves', notes: 'For textured surfaces', checked: false });
    exteriorToolItems.push({ id: itemId++, name: 'Long extension poles (2-4m)', quantity: '1-2', notes: 'For reaching high areas from ground', checked: false });
    if (hasHouseWalls) {
      exteriorToolItems.push({ id: itemId++, name: 'Airless paint sprayer (optional)', quantity: '1', notes: 'For large house wall areas (optional but faster)', checked: false });
      exteriorToolItems.push({ id: itemId++, name: 'Spray gun cleaning kit', quantity: '1', notes: 'If using sprayer', checked: false });
    }

    materials.push({
      category: 'Exterior Application Tools',
      items: exteriorToolItems
    });
  }

  return materials;
}

// Create Job from Estimate Function
async function createJobFromEstimate() {
  const totalPrice = document.getElementById('total-price').textContent;

  if (!totalPrice || totalPrice === '0') {
    alert('Please create an estimate first before creating a job.');
    return;
  }

  // Build description from rooms and exteriors
  let description = 'ESTIMATE DETAILS:\n\n';

  if (rooms.length > 0) {
    description += 'INTERIOR PAINTING:\n';
    rooms.forEach((r, i) => {
      const p = calcRoom(r);
      if (p === 0) return;

      const tasks = Object.keys(r.selectedTasks)
        .filter(t => r.selectedTasks[t])
        .map(t => {
          let taskName = t;
          let color = '';

          if (t === 'Paint walls' && r.wallColor && r.wallColor !== 'Choose colour') {
            color = ` (${r.wallColor})`;
          } else if (t === 'Paint ceiling' && r.ceilingColor && r.ceilingColor !== 'Choose colour') {
            color = ` (${r.ceilingColor})`;
          } else if (t === 'Paint skirting/coving' && r.trimColor && r.trimColor !== 'Choose colour') {
            color = ` (${r.trimColor})`;
          } else if (t === 'Paint doors' && r.doorColor && r.doorColor !== 'Choose colour') {
            color = ` (${r.doorColor})`;
          } else if (t === 'Paint windows' && r.windowColor && r.windowColor !== 'Choose colour') {
            color = ` (${r.windowColor})`;
          } else if (t === 'Paint cabinets' && r.cabinetColor && r.cabinetColor !== 'Choose colour') {
            color = ` (${r.cabinetColor})`;
          }

          return '  • ' + taskName + color;
        }).join('\n');

      description += `\n${r.type} (${r.length}×${r.width}m, ${r.ceilingHeight}m ceiling):\n${tasks}\n`;
    });
  }

  if (exteriors.length > 0) {
    description += '\n\nEXTERIOR PAINTING:\n';
    exteriors.forEach((e, i) => {
      const p = calcExt(e);
      if (p === 0) return;

      const tasks = Object.keys(e.selectedTasks)
        .filter(t => e.selectedTasks[t])
        .map(t => {
          let taskName = t;
          let color = '';

          if (e.type === 'House Walls') {
            if (t === 'Paint walls' && e.wallColor && e.wallColor !== 'Choose colour') {
              color = ` (${e.wallColor})`;
            } else if (t === 'Fascia/soffits' && e.fasciaColor && e.fasciaColor !== 'Choose colour') {
              color = ` (${e.fasciaColor})`;
            } else if (t === 'Gutters/downpipes' && e.gutterColor && e.gutterColor !== 'Choose colour') {
              color = ` (${e.gutterColor})`;
            }
          }

          return '  • ' + taskName + color;
        }).join('\n');

      let details;
      if (e.type === 'House Walls') {
        details = `${e.area}m² ${e.cladding}`;
      } else if (e.type === 'Deck') {
        details = `${e.deckArea}m²`;
      } else {
        details = `${e.area}m²`;
      }

      description += `\n${e.type} (${details}):\n${tasks}\n`;
    });
  }

  description += `\n\nESTIMATED TOTAL: $${totalPrice}`;

  // Generate professional task list from estimate
  const professionalTaskList = generateProfessionalTaskList();

  // Generate materials checklist from estimate
  const materialsChecklist = generateMaterialsChecklist();

  // Store task list and materials checklist temporarily for job creation
  window.pendingTaskList = professionalTaskList;
  window.pendingMaterialsList = materialsChecklist;

  // Open job modal and pre-fill with estimate data
  editingJobId = null;
  document.getElementById('job-modal-title').textContent = 'Create Job from Estimate';
  document.getElementById('job-id').value = '';
  document.getElementById('client-name').value = '';
  document.getElementById('client-phone').value = '';
  document.getElementById('client-email').value = '';
  document.getElementById('address').value = '';
  document.getElementById('description').value = description;
  document.getElementById('status').value = 'pending';
  document.getElementById('start-date').value = '';
  document.getElementById('end-date').value = '';
  document.getElementById('estimated-hours').value = calcTotalHours();
  document.getElementById('actual-hours').value = '';
  document.getElementById('estimated-cost').value = totalPrice.replace(/,/g, '');
  document.getElementById('actual-cost').value = '';

  document.getElementById('job-modal').classList.add('active');

  // Switch to Jobs tab
  switchTab('jobs');

  const totalMaterialItems = materialsChecklist.reduce((sum, cat) => sum + cat.items.length, 0);
  alert(`Estimate loaded!\n\n• ${professionalTaskList.length} professional tasks\n• ${totalMaterialItems} materials/tools needed\n\nPlease fill in client details and save the job.`);
}

renderRooms();
renderExteriors();

// ============================================================
// CALENDAR FUNCTIONALITY
// ============================================================

let currentCalendarWeek = new Date();
let calendarAssignments = [];
let allJobs = [];
let allEmployees = [];

// Format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Get week start (Monday) for a given date
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
  return new Date(d.setDate(diff));
}

// Get week end (Sunday)
function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// Format date for display (e.g., "Mon 17 Dec")
function formatDateDisplay(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

// Check if date matches YYYY-MM-DD string
function isSameDate(date, dateString) {
  return formatDate(date) === dateString;
}

// Detect conflicts (multiple jobs on same employee-date)
function detectConflicts(assignments) {
  const conflicts = {};

  assignments.forEach(assignment => {
    const dates = safeParseDates(assignment.assigned_dates);
    dates.forEach(dateStr => {
      const key = `${assignment.employee_id}_${dateStr}`;
      if (!conflicts[key]) {
        conflicts[key] = [];
      }
      conflicts[key].push(assignment);
    });
  });

  // Return only the conflicts (2+ jobs on same date)
  const conflictKeys = Object.keys(conflicts).filter(key => conflicts[key].length > 1);
  return conflictKeys.reduce((obj, key) => {
    obj[key] = conflicts[key];
    return obj;
  }, {});
}

// Load and render calendar
async function loadCalendar() {
  try {
    // Fetch calendar data and all jobs/employees
    const [assignmentsRes, jobsRes, employeesRes] = await Promise.all([
      fetch('/api/calendar'),
      fetch('/api/jobs'),
      fetch('/api/employees')
    ]);

    calendarAssignments = await assignmentsRes.json();
    allJobs = await jobsRes.json();
    allEmployees = await employeesRes.json();

    renderCalendar();
  } catch (error) {
    console.error('Error loading calendar:', error);
    alert('Failed to load calendar data');
  }
}

// Render calendar grid
function renderCalendar() {
  const weekStart = getWeekStart(currentCalendarWeek);
  const weekEnd = getWeekEnd(currentCalendarWeek);

  // Update week label
  document.getElementById('calendar-week-label').textContent =
    `Week of ${formatDateDisplay(weekStart)} – ${formatDateDisplay(weekEnd)}`;

  // Generate days array
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    days.push(day);
  }

  // Detect conflicts
  const conflicts = detectConflicts(calendarAssignments);

  // Filter active employees only
  const activeEmployees = allEmployees.filter(emp => emp.status === 'active');

  // Build grid HTML
  let gridHTML = '';

  // Header row
  gridHTML += '<div class="calendar-header-cell">Employee</div>';
  days.forEach(day => {
    const isToday = isSameDate(day, formatDate(new Date()));
    gridHTML += `<div class="calendar-header-cell ${isToday ? 'today' : ''}">${formatDateDisplay(day)}</div>`;
  });

  // Employee rows
  activeEmployees.forEach(employee => {
    // Employee name cell
    gridHTML += `<div class="calendar-employee-cell">${employee.name}</div>`;

    // Day cells
    days.forEach(day => {
      const dateStr = formatDate(day);
      const isToday = isSameDate(day, formatDate(new Date()));

      // Find assignments for this employee on this date
      const assignmentsForDay = calendarAssignments.filter(a => {
        const dates = safeParseDates(a.assigned_dates);
        return a.employee_id === employee.id && dates.includes(dateStr);
      });

      // Check for conflicts
      const conflictKey = `${employee.id}_${dateStr}`;
      const hasConflict = conflicts[conflictKey] && conflicts[conflictKey].length > 1;

      let cellClass = 'calendar-day-cell';
      if (isToday) cellClass += ' today';
      if (assignmentsForDay.length > 0) cellClass += ' has-assignment';
      if (hasConflict) cellClass += ' has-conflict';

      // Build cell content
      let cellContent = '';
      if (assignmentsForDay.length > 0) {
        assignmentsForDay.forEach(assignment => {
          const job = allJobs.find(j => j.id === assignment.job_id);
          if (job) {
            cellContent += `<div class="assignment-badge" title="${job.client_name} - ${job.address}">${job.client_name}</div>`;
          }
        });
      }

      gridHTML += `<div class="${cellClass}" onclick="handleCalendarCellClick(${employee.id}, '${dateStr}', '${employee.name}')">${cellContent}</div>`;
    });
  });

  document.getElementById('calendar-grid').innerHTML = gridHTML;
}

// Handle cell click - assign/unassign employee to date
async function handleCalendarCellClick(employeeId, dateStr, employeeName) {
  // Find existing assignments for this employee on this date
  const existingAssignments = calendarAssignments.filter(a => {
    const dates = safeParseDates(a.assigned_dates);
    return a.employee_id === employeeId && dates.includes(dateStr);
  });

  if (existingAssignments.length > 0) {
    // Show assignments and allow removal
    let message = `${employeeName} on ${dateStr}:\n\n`;
    existingAssignments.forEach(a => {
      const job = allJobs.find(j => j.id === a.job_id);
      if (job) {
        message += `• ${job.client_name} - ${job.address}\n`;
      }
    });
    message += '\nClick "Assign New Job" to add another job, or "Remove Assignment" to unassign.';

    const choice = prompt(message + '\n\nEnter:\n- "add" to assign new job\n- "remove" to remove assignment\n- "cancel" to close', 'cancel');

    if (choice === 'remove' && existingAssignments.length > 0) {
      // Remove date from first assignment
      const assignment = existingAssignments[0];
      const dates = safeParseDates(assignment.assigned_dates);
      const updatedDates = dates.filter(d => d !== dateStr);

      try {
        const response = await fetch(`/api/jobs/${assignment.job_id}/assign/${employeeId}/dates`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates: updatedDates })
        });

        if (response.ok) {
          await loadCalendar();
          alert('Assignment removed successfully');
        }
      } catch (error) {
        console.error('Error removing assignment:', error);
        alert('Failed to remove assignment');
      }
      return;
    } else if (choice !== 'add') {
      return;
    }
  }

  // Show job selection modal
  const activeJobs = allJobs.filter(j => j.status !== 'completed');
  if (activeJobs.length === 0) {
    alert('No active jobs available. Create a job first.');
    return;
  }

  let jobOptions = 'Select a job to assign:\n\n';
  activeJobs.forEach((job, idx) => {
    jobOptions += `${idx + 1}. ${job.client_name} - ${job.address}\n`;
  });

  const jobChoice = prompt(jobOptions + '\nEnter job number:', '1');
  if (!jobChoice) return;

  const jobIndex = parseInt(jobChoice) - 1;
  if (jobIndex < 0 || jobIndex >= activeJobs.length) {
    alert('Invalid job number');
    return;
  }

  const selectedJob = activeJobs[jobIndex];

  // Check if employee is already assigned to this job
  let existingAssignment = calendarAssignments.find(a =>
    a.job_id === selectedJob.id && a.employee_id === employeeId
  );

  let updatedDates = [];
  if (existingAssignment) {
    // Add date to existing assignment
    updatedDates = safeParseDates(existingAssignment.assigned_dates);
    if (!updatedDates.includes(dateStr)) {
      updatedDates.push(dateStr);
      updatedDates.sort(); // Keep dates sorted
    }
  } else {
    // Create new assignment
    updatedDates = [dateStr];

    // First assign employee to job
    try {
      const response = await fetch(`/api/jobs/${selectedJob.id}/assign/${employeeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to assign employee to job');
      }
    } catch (error) {
      console.error('Error assigning employee:', error);
      alert('Failed to assign employee to job');
      return;
    }
  }

  // Update dates
  try {
    const response = await fetch(`/api/jobs/${selectedJob.id}/assign/${employeeId}/dates`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: updatedDates })
    });

    if (response.ok) {
      await loadCalendar();

      // Check for conflicts and warn
      const conflicts = detectConflicts(calendarAssignments);
      const conflictKey = `${employeeId}_${dateStr}`;
      if (conflicts[conflictKey] && conflicts[conflictKey].length > 1) {
        alert(`⚠️ WARNING: ${employeeName} is now assigned to ${conflicts[conflictKey].length} jobs on ${dateStr}`);
      } else {
        alert('Assignment successful!');
      }
    }
  } catch (error) {
    console.error('Error updating assignment dates:', error);
    alert('Failed to update assignment dates');
  }
}

// Calendar navigation functions
function calendarToday() {
  currentCalendarWeek = new Date();
  renderCalendar();
}

function calendarPrevWeek() {
  currentCalendarWeek.setDate(currentCalendarWeek.getDate() - 7);
  renderCalendar();
}

function calendarNextWeek() {
  currentCalendarWeek.setDate(currentCalendarWeek.getDate() + 7);
  renderCalendar();
}

// Refresh data when tab is switched
const originalSwitchTab = switchTab;
window.switchTab = function(tabName) {
  originalSwitchTab(tabName);
  if (tabName === 'calendar') {
    loadCalendar();
  }
  if (tabName === 'employees') {
    loadEmployees(); // Refresh to get latest jobs in dropdown
  }
};

// ============================================================
// AUTO-RATING ADJUSTMENT SYSTEM
// ============================================================

// Analyze employee performance and suggest rating adjustments
async function analyzeEmployeePerformance(employeeId, jobId) {
  try {
    // Get all tasks completed by this employee on this job
    const tasksRes = await fetch(`/api/jobs/${jobId}/tasks`);
    const allTasks = await tasksRes.json();

    const employeeTasks = allTasks.filter(t => t.completed_by === employeeId && t.completed);

    if (employeeTasks.length === 0) {
      return null;
    }

    // Get employee data
    const empRes = await fetch(`/api/employees/${employeeId}`);
    const employee = await empRes.json();

    // Calculate expected vs actual performance
    const baseEfficiency = employee.type === 'brush_hand' ? 0.667 : 1.0;
    const currentRating = employee.rating || 1.0;
    const expectedEfficiency = baseEfficiency * currentRating;

    // Count unique days worked
    const workDates = new Set(employeeTasks.map(t => t.completion_date));
    const daysWorked = workDates.size;

    // Calculate tasks completed per day
    const tasksPerDay = employeeTasks.length / daysWorked;

    // Get average tasks per day across all employees on this job
    const avgTasksPerDay = await getAverageTasksPerDay(jobId);

    // Calculate performance ratio
    const performanceRatio = avgTasksPerDay > 0 ? tasksPerDay / avgTasksPerDay : 1.0;

    // Suggest rating adjustment
    let suggestedRating = currentRating;
    let note = '';

    if (performanceRatio > 1.2) {
      // Exceptional performance - increase rating by 0.1
      suggestedRating = Math.min(3.0, currentRating + 0.1);
      note = `Excellent performance on job ${jobId}: ${tasksPerDay.toFixed(1)} tasks/day (${(performanceRatio * 100).toFixed(0)}% above average)`;
    } else if (performanceRatio < 0.8) {
      // Below average performance - decrease rating by 0.1
      suggestedRating = Math.max(0.1, currentRating - 0.1);
      note = `Needs improvement on job ${jobId}: ${tasksPerDay.toFixed(1)} tasks/day (${(100 - performanceRatio * 100).toFixed(0)}% below average)`;
    } else {
      // Average performance - no change
      note = `Consistent performance on job ${jobId}: ${tasksPerDay.toFixed(1)} tasks/day`;
    }

    return {
      employeeId,
      employeeName: employee.name,
      currentRating,
      suggestedRating,
      performanceRatio,
      tasksCompleted: employeeTasks.length,
      daysWorked,
      tasksPerDay,
      note
    };
  } catch (error) {
    console.error('Error analyzing employee performance:', error);
    return null;
  }
}

// Calculate average tasks per day across all employees on a job
async function getAverageTasksPerDay(jobId) {
  try {
    const tasksRes = await fetch(`/api/jobs/${jobId}/tasks`);
    const allTasks = await tasksRes.json();

    if (allTasks.length === 0) return 0;

    // Group by employee
    const employeeStats = {};
    allTasks.forEach(task => {
      if (!task.completed || !task.completed_by) return;

      if (!employeeStats[task.completed_by]) {
        employeeStats[task.completed_by] = {
          tasks: 0,
          dates: new Set()
        };
      }

      employeeStats[task.completed_by].tasks++;
      if (task.completion_date) {
        employeeStats[task.completed_by].dates.add(task.completion_date);
      }
    });

    // Calculate average tasks per day
    let totalTasksPerDay = 0;
    let employeeCount = 0;

    Object.values(employeeStats).forEach(stats => {
      if (stats.dates.size > 0) {
        totalTasksPerDay += stats.tasks / stats.dates.size;
        employeeCount++;
      }
    });

    return employeeCount > 0 ? totalTasksPerDay / employeeCount : 0;
  } catch (error) {
    console.error('Error calculating average tasks per day:', error);
    return 0;
  }
}

// Apply rating adjustment to employee
async function applyRatingAdjustment(analysis) {
  if (!analysis) return;

  const confirmed = confirm(
    `Performance Analysis for ${analysis.employeeName}:\n\n` +
    `Current Rating: ${analysis.currentRating.toFixed(1)}x\n` +
    `Suggested Rating: ${analysis.suggestedRating.toFixed(1)}x\n\n` +
    `Performance: ${(analysis.performanceRatio * 100).toFixed(0)}% of average\n` +
    `Tasks Completed: ${analysis.tasksCompleted} over ${analysis.daysWorked} days\n` +
    `Rate: ${analysis.tasksPerDay.toFixed(1)} tasks/day\n\n` +
    `Note: ${analysis.note}\n\n` +
    `Apply this rating adjustment?`
  );

  if (!confirmed) return;

  try {
    // Get employee data
    const empRes = await fetch(`/api/employees/${analysis.employeeId}`);
    const employee = await empRes.json();

    // Add note to rating notes
    const ratingNotes = JSON.parse(employee.rating_notes || '[]');
    ratingNotes.push({
      date: formatDate(new Date()),
      oldRating: analysis.currentRating,
      newRating: analysis.suggestedRating,
      note: analysis.note
    });

    // Update employee rating
    await fetch(`/api/employees/${analysis.employeeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...employee,
        rating: analysis.suggestedRating,
        rating_notes: ratingNotes
      })
    });

    alert(`Rating updated successfully!\n${employee.name}: ${analysis.currentRating.toFixed(1)}x → ${analysis.suggestedRating.toFixed(1)}x`);

    // Reload employees to show updated rating
    loadEmployees();
    loadJobs(); // Reload jobs to update predicted hours
  } catch (error) {
    console.error('Error applying rating adjustment:', error);
    alert('Failed to apply rating adjustment');
  }
}

// End of day performance review for a job
async function endOfDayReview(jobId) {
  try {
    // Get all employees who worked today on this job
    const today = formatDate(new Date());

    const tasksRes = await fetch(`/api/jobs/${jobId}/tasks`);
    const allTasks = await tasksRes.json();

    const todaysTasks = allTasks.filter(t => t.completion_date === today && t.completed);

    if (todaysTasks.length === 0) {
      alert('No tasks completed today on this job.');
      return;
    }

    // Get unique employees who worked today
    const employeeIds = [...new Set(todaysTasks.map(t => t.completed_by))];

    let reviewMessage = `End of Day Review - ${today}\n\n`;
    reviewMessage += `Tasks completed today: ${todaysTasks.length}\n`;
    reviewMessage += `Employees who worked: ${employeeIds.length}\n\n`;

    // Analyze each employee
    for (const empId of employeeIds) {
      const analysis = await analyzeEmployeePerformance(empId, jobId);
      if (analysis) {
        reviewMessage += `${analysis.employeeName}: ${analysis.tasksCompleted} tasks total, ${analysis.tasksPerDay.toFixed(1)} per day\n`;

        // Auto-suggest rating if significant change
        if (Math.abs(analysis.suggestedRating - analysis.currentRating) >= 0.1) {
          await applyRatingAdjustment(analysis);
        }
      }
    }

    alert(reviewMessage);
  } catch (error) {
    console.error('Error in end of day review:', error);
    alert('Failed to complete end of day review');
  }
}

// Add End of Day Review button to job cards (called from displayJobs)
function addEndOfDayReviewButton(jobId) {
  return `<button class="btn btn-secondary btn-sm" onclick="endOfDayReview(${jobId})" title="Review today's performance and adjust ratings">📊 Day Review</button>`;
}
