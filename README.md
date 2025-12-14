# Painting Company Manager

A web-based application for managing jobs and employees for a painting company. Track client information, job details, employee assignments, and more.

## Features

- **Employee Management**
  - Add, edit, and delete employees
  - Track employee contact information, roles, and hourly rates
  - Set employee status (active/inactive)

- **Job Management**
  - Create and manage painting jobs
  - Track client information and job locations
  - Monitor job status (pending, in progress, completed)
  - Estimate and track hours and costs
  - Set start and end dates
  - Add job descriptions and notes

- **Assignment Management**
  - Assign multiple employees to jobs
  - View assigned employees for each job
  - Easy employee assignment interface

## Tech Stack

- **Backend**: Node.js with Express
- **Database**: SQLite3
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **UI**: Modern, responsive design

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Painting
```

2. Install dependencies:
```bash
npm install
```

## Usage

1. Start the server:
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

## Application Structure

```
Painting/
├── server.js           # Express server and API routes
├── database.js         # Database initialization and connection
├── package.json        # Project dependencies
├── public/             # Frontend files
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
└── painting_company.db # SQLite database (created on first run)
```

## API Endpoints

### Employees

- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Jobs

- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job with assigned employees
- `POST /api/jobs` - Create new job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Job Assignments

- `GET /api/jobs/:jobId/employees` - Get employees assigned to a job
- `POST /api/jobs/:jobId/assign/:employeeId` - Assign employee to job
- `DELETE /api/jobs/:jobId/assign/:employeeId` - Unassign employee from job

## Database Schema

### Employees Table
- id (Primary Key)
- name
- email
- phone
- role
- hourly_rate
- status (active/inactive)
- created_at

### Jobs Table
- id (Primary Key)
- client_name
- client_phone
- client_email
- address
- description
- status (pending/in_progress/completed)
- estimated_hours
- actual_hours
- estimated_cost
- actual_cost
- start_date
- end_date
- created_at

### Job Assignments Table
- id (Primary Key)
- job_id (Foreign Key)
- employee_id (Foreign Key)
- assigned_at

## Contributing

Feel free to submit issues and enhancement requests.

## License

MIT
