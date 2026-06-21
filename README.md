# VPass — Visitor Pass Management System

A full-stack Visitor Pass Management System built with the MERN stack (MongoDB, Express.js, React, Node.js). Digitizes the visitor management process with features like pre-registration, QR-code based passes, role-based access, and real-time check-in/check-out tracking.

## Features

- **Role-Based Access Control** — Admin, Security, Host roles with JWT authentication
- **Visitor Registration** — Register visitors with photo upload and ID verification
- **Pre-Registration** — Public form for visitors to self-register before their visit
- **Appointment Management** — Invite visitors, approve/reject appointments
- **QR Code Passes** — Generate visitor passes with unique QR codes
- **PDF Badge Download** — Download printable visitor badge as PDF
- **QR Scanner** — Camera-based QR scanning for check-in/check-out
- **Real-time Dashboard** — Stats, visitor trends chart, recent activity feed
- **Email Notifications** — Automated emails for invites, approvals, pass issuance
- **Check-In / Check-Out** — Track visitor entry/exit with timestamps
- **Reports & Export** — Export visitor logs as CSV
- **Search & Filter** — Full-text search across all data tables
- **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6, Chart.js, html5-qrcode |
| **Backend** | Node.js, Express.js, JWT, Multer, PDFKit, QRCode, Nodemailer |
| **Database** | MongoDB with Mongoose ODM |
| **Styling** | Vanilla CSS with custom design system |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB](https://www.mongodb.com/) running locally or MongoDB Atlas URI
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Final\ Project
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file (copy from example):

```bash
cp .env.example .env
```

Edit `.env` and set your MongoDB connection string:

```
MONGO_URI=mongodb://localhost:27017/vpass
JWT_SECRET=your_secret_key_here
```

### 3. Seed Demo Data

```bash
npm run seed
```

This creates sample users, visitors, appointments, and passes.

### 4. Start Backend Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

### 5. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@vpass.com | admin123 |
| Security | security@vpass.com | security123 |
| Host | priya@vpass.com | host123 |
| Host | amit@vpass.com | host123 |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database and email configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/      # Auth, error handling, file upload
│   │   ├── models/          # Mongoose schemas (User, Visitor, Pass, etc.)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (QR, PDF, Email, Notifications)
│   │   └── utils/           # Helper functions
│   ├── uploads/             # Visitor photo uploads
│   ├── seed.js              # Database seeder
│   └── server.js            # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API client
│   │   ├── context/         # React Context (Auth)
│   │   ├── layouts/         # Page layouts (Auth, Dashboard)
│   │   ├── pages/           # Route-level components by role
│   │   │   ├── admin/       # Admin dashboard, staff management, reports
│   │   │   ├── security/    # QR scanner, issue pass, active visitors
│   │   │   ├── host/        # Invite visitor
│   │   │   ├── shared/      # Visitors, appointments, passes, check logs
│   │   │   └── visitor/     # Public pre-registration
│   │   └── styles/          # CSS files
│   └── vite.config.js
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Users (Admin)
- `GET /api/users` — List users
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Deactivate user

### Visitors
- `POST /api/visitors` — Register visitor (with photo)
- `GET /api/visitors` — List visitors
- `POST /api/visitors/pre-register` — Public pre-registration

### Appointments
- `POST /api/appointments` — Create appointment
- `GET /api/appointments` — List appointments
- `PUT /api/appointments/:id/approve` — Approve
- `PUT /api/appointments/:id/reject` — Reject

### Passes
- `POST /api/passes` — Issue pass (generates QR)
- `GET /api/passes/verify/:passCode` — Verify pass (public)
- `GET /api/passes/:id/download` — Download PDF badge

### Check-In / Check-Out
- `POST /api/checklogs/checkin` — Check in via pass code
- `POST /api/checklogs/checkout` — Check out
- `GET /api/checklogs/active` — Currently inside

### Dashboard
- `GET /api/dashboard/stats` — Summary statistics
- `GET /api/dashboard/visitor-trend` — Trend data for charts
- `GET /api/dashboard/export` — Export CSV

## Screenshots

Screenshots will be added after running the application.

## Future Enhancements

- OTP-based visitor verification
- Multi-organization support
- Docker + Nginx deployment
- Real-time WebSocket notifications
- Analytics dashboard with advanced charts
- Twilio SMS integration
- Visitor face recognition

## License

This project was developed as an academic assignment.
