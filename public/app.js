// Detect API URL based on current host
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

let currentFilter = 'all';
let editingJobId = null;
let editingEmployeeId = null;
let currentJobForAssignment = null;

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

  const jobsHTML = await Promise.all(jobs.map(async job => {
    const employees = await getJobEmployees(job.id);
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
          ${job.description ? `<p style="margin-bottom: 15px; color: var(--gray-700);">${job.description}</p>` : ''}
          <div class="info-row">
            ${job.client_phone ? `<div class="info-item"><span class="info-label">Phone:</span><span class="info-value">${job.client_phone}</span></div>` : ''}
            ${job.client_email ? `<div class="info-item"><span class="info-label">Email:</span><span class="info-value">${job.client_email}</span></div>` : ''}
          </div>
          <div class="info-row">
            ${job.start_date ? `<div class="info-item"><span class="info-label">Start:</span><span class="info-value">${formatDate(job.start_date)}</span></div>` : ''}
            ${job.end_date ? `<div class="info-item"><span class="info-label">End:</span><span class="info-value">${formatDate(job.end_date)}</span></div>` : ''}
            ${job.estimated_hours ? `<div class="info-item"><span class="info-label">Est. Hours:</span><span class="info-value">${job.estimated_hours}</span></div>` : ''}
            ${job.estimated_cost ? `<div class="info-item"><span class="info-label">Est. Cost:</span><span class="info-value">$${job.estimated_cost}</span></div>` : ''}
          </div>
          ${employees.length > 0 ? `
            <div class="assigned-employees">
              <h4>Assigned Employees:</h4>
              <div class="employee-tags">
                ${employees.map(emp => `<span class="employee-tag">${emp.name}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>
        <div class="card-actions">
          <button class="btn btn-secondary btn-sm" onclick="manageAssignments(${job.id})">Assign Employees</button>
          <button class="btn btn-secondary btn-sm" onclick="editJob(${job.id})">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteJob(${job.id})">Delete</button>
        </div>
      </div>
    `;
  }));

  jobsList.innerHTML = jobsHTML.join('');
}

async function getJobEmployees(jobId) {
  try {
    const response = await fetch(`${API_URL}/jobs/${jobId}/employees`);
    return await response.json();
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

function displayEmployees(employees) {
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

  const employeesHTML = employees.map(emp => `
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
      </div>
      <div class="card-actions">
        <button class="btn btn-secondary btn-sm" onclick="editEmployee(${emp.id})">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteEmployee(${emp.id})">Delete</button>
      </div>
    </div>
  `).join('');

  employeesList.innerHTML = employeesHTML;
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
async function manageAssignments(jobId) {
  currentJobForAssignment = jobId;
  const modal = document.getElementById('assign-modal');

  try {
    const [allEmployees, assignedEmployees] = await Promise.all([
      fetch(`${API_URL}/employees`).then(r => r.json()),
      fetch(`${API_URL}/jobs/${jobId}/employees`).then(r => r.json())
    ]);

    const assignedIds = new Set(assignedEmployees.map(e => e.id));

    const content = document.getElementById('assign-content');
    content.innerHTML = `
      <div class="checkbox-list">
        ${allEmployees.filter(e => e.status === 'active').map(emp => `
          <div class="checkbox-item">
            <input type="checkbox" id="emp-${emp.id}"
                   ${assignedIds.has(emp.id) ? 'checked' : ''}
                   onchange="toggleAssignment(${jobId}, ${emp.id}, this.checked)">
            <label for="emp-${emp.id}">
              <strong>${emp.name}</strong>
              ${emp.role ? ` - ${emp.role}` : ''}
            </label>
          </div>
        `).join('')}
      </div>
      <div class="form-actions">
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
    } else {
      await fetch(`${API_URL}/jobs/${jobId}/assign/${employeeId}`, { method: 'DELETE' });
    }
    loadJobs();
  } catch (error) {
    console.error('Error toggling assignment:', error);
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
      actual_cost: document.getElementById('actual-cost').value || null
    };

    try {
      if (editingJobId) {
        await fetch(`${API_URL}/jobs/${editingJobId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
      } else {
        await fetch(`${API_URL}/jobs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData)
        });
      }

      closeJobModal();
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
      status: document.getElementById('employee-status').value
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

function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Close modals when clicking outside
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.classList.remove('active');
  }
}
