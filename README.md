# MatchTARA

> **TA & RA Position Portal for University Departments**
> A full-stack web application that streamlines the hiring of Teaching Assistants and Research Assistants — connecting students with faculty without bureaucratic friction.

[![Live Demo](https://img.shields.io/badge/Live_Demo-matchtara.netlify.app-4472C4?style=flat-square)](https://matchtara.netlify.app)
[![Stack](https://img.shields.io/badge/Stack-React_+_Node_+_PostgreSQL-2C3E50?style=flat-square)](#technology-stack)
[![License](https://img.shields.io/badge/License-MIT-success?style=flat-square)](#license)

Built by **Team CodeHustlers** as part of ITCS 6112 — Software System Design & Implementation at UNC Charlotte, College of Computing and Informatics.

---

## Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Demo Credentials](#demo-credentials)
- [Production Deployment](#production-deployment)
- [Team](#team)
- [Documentation](#documentation)
- [License](#license)

---

## Overview

MatchTARA replaces the scattered, email-based TA/RA hiring process at universities with a structured workflow:

- **Students** browse open positions and apply with a resume — **no account required**
- **Faculty** post positions, review applications, and update statuses with automated email notifications
- **Departments** maintain a single source of truth for all open assistantship opportunities

The system was built across three two-week sprints, delivering 27 user stories totaling 83 story points. It is currently deployed and accessible at [matchtara.netlify.app](https://matchtara.netlify.app).

---

## Live Demo

| Resource | URL |
|----------|-----|
| **Live Application** | https://matchtara.netlify.app |
| **Source Code** | https://github.com/soumyanilain/MatchTARA |
| **API Health Check** | https://matchtara-api.onrender.com/api/health |

> ⚠️ **Heads up:** The backend runs on Render's free tier and sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake the server. Subsequent requests are instant.

---

## Key Features

### For Students (No Login Required)
- Browse paginated job board with TA/RA filter chips and keyword search
- View full position details (description, requirements, hours, compensation, deadline)
- Submit applications with PDF resume upload (max 5 MB)
- Receive a confirmation page with reference ID after submission
- Get automated email notifications when application status changes
- Expired positions are visually grayed out — Apply button hides automatically

### For Faculty (Whitelist + Email Verification)
- Register with a `.edu` email; account activates after clicking emailed verification link
- Resend verification email if the link is missed or expires
- Create new positions with a structured form (validated client + server-side)
- Edit position details after posting
- Close positions to remove from public view; delete to permanently remove
- View dashboard with stats (total / open / closed positions, total applications)
- Browse applications with sort, filter, and real-time status counts
- Read full applicant statements and download resumes securely
- Update application status (PENDING → REVIEWED → ACCEPTED/REJECTED)
- Bulk-update multiple applications at once with parallel email notifications

### Automated Background Tasks
- Hourly cron job auto-closes positions whose deadlines have passed
- Email connection pool keeps SMTP latency low (~2-5 seconds per email)
- All transactional emails sent asynchronously (non-blocking)

---

## Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | React 18, React Router, Axios, Context API | Component-based UI with stateless routing |
| **Backend** | Node.js, Express | Fast prototyping, full-stack JavaScript |
| **Database** | PostgreSQL via Prisma ORM | Strong consistency, typesafe queries |
| **Auth** | JWT + Bcrypt | Stateless tokens, industry-standard hashing |
| **File Upload** | Multer | Standard middleware for PDF resumes |
| **Email** | Nodemailer + Gmail SMTP | Reliable transactional emails with connection pooling |
| **Background Jobs** | node-cron | Lightweight scheduling for auto-close |
| **Frontend Hosting** | Netlify | Free CDN-backed static hosting with auto-deploy |
| **Backend Hosting** | Render | Free Node.js hosting with auto-deploy from GitHub |
| **Database Hosting** | Neon | Serverless PostgreSQL with persistent free tier |

---

## Project Structure

```
matchtara/
├── client/                      # React frontend
│   ├── public/
│   │   └── _redirects           # Netlify SPA routing config
│   └── src/
│       ├── components/
│       │   ├── auth/            # PrivateRoute wrapper
│       │   └── layout/          # Navbar, Footer
│       ├── context/
│       │   └── AuthContext.js   # Global auth state
│       ├── pages/               # Route components (one per page)
│       ├── services/
│       │   └── api.js           # Axios client + endpoints
│       └── utils/
│           └── validatePosition.js
│
├── server/                      # Express backend
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Versioned SQL migrations
│   │   └── seed.js              # Sample data
│   └── src/
│       ├── index.js             # Server bootstrap
│       ├── config/
│       │   ├── db.js            # Prisma client
│       │   └── whitelist.js     # Approved faculty emails
│       ├── middleware/
│       │   ├── auth.js          # JWT verification
│       │   └── upload.js        # Multer file handling
│       ├── routes/              # Express route definitions
│       ├── controllers/         # Business logic
│       └── utils/
│           ├── email.js         # Nodemailer + email templates
│           └── cronJobs.js      # Auto-close scheduled job
│
├── package.json                 # Workspace orchestration
└── README.md
```

---

## Prerequisites

Before running MatchTARA locally, ensure you have:

- **Node.js** 18 or higher → [Download](https://nodejs.org)
- **PostgreSQL** 14 or higher → [Download](https://www.postgresql.org/download/)
- **Git** 2.30+ → [Download](https://git-scm.com)
- **A Gmail account** with [2-Step Verification](https://myaccount.google.com/security) enabled and an [App Password](https://myaccount.google.com/apppasswords) generated for SMTP
- **A code editor** like VS Code (recommended)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/soumyanilain/MatchTARA.git
cd MatchTARA
```

### 2. Install all dependencies

This single command installs Node packages for the workspace, the backend, and the frontend:

```bash
npm run install:all
```

### 3. Create the database

Open a terminal and create an empty PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE matchtara;"
```

### 4. Configure environment variables

Copy the example `.env` file and fill in your values:

```bash
cp server/.env.example server/.env
```

Open `server/.env` and update the following values (see [Environment Variables](#environment-variables) for details).

### 5. Configure the faculty whitelist

Open `server/src/config/whitelist.js` and add the emails of faculty who should be allowed to register:

```javascript
const ALLOWED_PROFESSOR_EMAILS = [
  'professor1@charlotte.edu',
  'professor2@charlotte.edu',
  'smith@university.edu',  // demo seed user
];
```

### 6. Run migrations and seed the database

```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

This creates the database tables and inserts:
- 2 demo professors (`smith@university.edu`, `chen@university.edu`)
- 3 sample positions (TA for Database Systems, RA for NLP Lab, TA for Computer Networks)

---

## Environment Variables

Edit `server/.env` with the following keys:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/matchtara` |
| `JWT_SECRET` | Long random string for signing JWTs | `matchtara-secret-key-change-in-production` |
| `JWT_EXPIRES_IN` | Token validity duration | `24h` |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` |
| `SMTP_USER` | Gmail address used to send emails | `youremail@gmail.com` |
| `SMTP_PASS` | Gmail App Password (16 chars, no spaces) | `abcdwxyz12345678` |
| `EMAIL_FROM` | Display name shown to recipients | `MatchTARA <youremail@gmail.com>` |
| `CLIENT_URL` | Frontend URL (for verification links and CORS) | `http://localhost:3000` |
| `PORT` | Backend server port | `5000` |

> 🔒 **Never commit `.env` to git.** It is already listed in `.gitignore`.

---

## Running the Application

From the project root, start both the backend and frontend with a single command:

```bash
npm run dev
```

You should see output like:

```
[0] MatchTARA server running on port 5000
[0] SMTP ready to send emails
[0] Cron jobs scheduled
[1] Compiled successfully!
[1] You can now view matchtara-client in the browser.
[1]   Local: http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in any modern browser.

### Useful npm scripts

```bash
npm run dev           # Start both servers (frontend + backend)
npm run server        # Start only the backend (http://localhost:5000)
npm run client        # Start only the frontend (http://localhost:3000)
npm run install:all   # Install dependencies for root, server, and client
npm run db:migrate    # Run pending Prisma migrations
npm run db:seed       # Re-seed the database with sample data
npm run db:studio     # Open Prisma Studio (visual DB browser at localhost:5555)
```

---

## Demo Credentials

After seeding the database, you can log in with these accounts:

| Role | Email | Password |
|------|-------|----------|
| Faculty (Dr. Jane Smith) | `smith@university.edu` | `password123` |
| Faculty (Dr. Wei Chen) | `chen@university.edu` | `password123` |
| Student (apply flow) | Any `.edu` email — no account needed | — |

To test the full hiring flow:

1. Open the app in **incognito** mode (so you're not logged in)
2. Click any open position → **Apply for this Position**
3. Fill the form with your real `.edu` email address (you'll receive notifications)
4. Submit the application
5. Switch to a normal browser window, log in as `smith@university.edu`
6. Click **View Apps** on your position to see the new application
7. Update the status — the student receives an email notification

---

## Production Deployment

The live version of MatchTARA is deployed on three free-tier services:

### Database (Neon)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a project named `matchtara`
3. Copy the connection string from the dashboard

### Backend (Render)
1. Sign up at [render.com](https://render.com)
2. Click **New + → Web Service** and connect this GitHub repo
3. Configure:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npx prisma migrate deploy && npx prisma db seed`
   - **Start Command:** `npm start`
4. Add all environment variables from `server/.env` to the Render dashboard, plus:
   - `DATABASE_URL` — your Neon connection string
   - `CLIENT_URL` — your Netlify URL (added after frontend deploys)
   - `NODE_ENV` — `production`

### Frontend (Netlify)
1. Sign up at [netlify.com](https://netlify.com)
2. Click **Add new site → Import an existing project** and connect this GitHub repo
3. Configure:
   - **Base Directory:** `client`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `client/build`
4. Add environment variable:
   - `REACT_APP_API_URL` — `https://your-render-service.onrender.com/api`

After deploying, return to Render and update `CLIENT_URL` to your Netlify URL so CORS allows requests from the frontend.

---

## Team

Built by **Team CodeHustlers** at UNC Charlotte:

- **Soumyanil Ain** 
- **Piyush Patil**  
- **Christopher Coetzer**  


---

## Documentation

The following documents accompany this project:

- **[Project Documentation PDF](./MatchTARA_Project_Documentation.pdf)** — Full project report covering problem analysis, design, development, and teamwork
- **[User Manual PDF](./MatchTARA_User_Manual.pdf)** — End-user setup and feature walkthrough
- **[Final Presentation PPTX](./MatchTARA_Final_Presentation.pptx)** — 13-slide demo deck
- **[System Requirements PDF](./MatchTARA_System_Requirements.pdf)** — Functional and non-functional requirements
- **[Product Backlog PDF](./MatchTARA_Product_Backlog.pdf)** — User stories with acceptance criteria
- **[Sprint Reports PDF](./MatchTARA_All_Sprint_Reports.pdf)** — Detailed reports for Sprints 1, 2, and 3

---

## License

This project was developed for academic purposes as part of ITCS 6112 at UNC Charlotte. The code is available under the MIT License — see the LICENSE file for details.

---

<p align="center">
  <strong>Built with care by Team CodeHustlers · April 2026</strong><br>
  <em>University of North Carolina at Charlotte · College of Computing and Informatics</em>
</p>
