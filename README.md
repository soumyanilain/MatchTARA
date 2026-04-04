# MatchTARA

**TA & RA Position Portal for University Departments**

Team CodeHustlers

---

## Overview

MatchTARA is a full-stack web application that centralizes the hiring process for Teaching Assistant (TA) and Research Assistant (RA) positions within a university department. Professors post positions and review applicants; students browse and apply without creating an account.

## Tech Stack

| Layer       | Technology                    |
| ----------- | ----------------------------- |
| Frontend    | React 18, React Router, Axios |
| Backend     | Node.js, Express              |
| Database    | PostgreSQL + Prisma ORM       |
| Auth        | JWT + Bcrypt                  |
| File Upload | Multer (local storage)        |
| Email       | Nodemailer (SMTP)             |
| Styling     | Custom CSS (Inter font)       |

## Project Structure

```
matchtara/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── auth/          # PrivateRoute
│   │   │   └── layout/        # Navbar
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service (Axios)
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                    # Node/Express backend
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.js            # Sample data
│   ├── src/
│   │   ├── config/            # Prisma client
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth, upload, error handling
│   │   ├── routes/            # Express routes
│   │   ├── utils/             # Email helper
│   │   └── index.js           # Entry point
│   ├── uploads/               # Resume storage
│   ├── .env.example
│   └── package.json
├── .gitignore
├── package.json               # Root scripts
└── README.md
```

## Getting Started

### Prerequisites

- **Node.js** v18+ and npm
- **PostgreSQL** v14+ (running locally or via Docker)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/matchtara.git
cd matchtara
```

### 2. Install Dependencies

```bash
npm run install:all
```

This installs root, server, and client dependencies.

### 3. Set Up Environment Variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` with your values:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/matchtara"
JWT_SECRET="generate-a-random-secret-here"
CLIENT_URL="http://localhost:3000"
```

### 4. Set Up the Database

```bash
# Create the database in PostgreSQL
psql -U postgres -c "CREATE DATABASE matchtara;"

# Run Prisma migrations
cd server
npx prisma migrate dev --name init

# Seed sample data (optional)
npx prisma db seed

# View database in browser (optional)
npx prisma studio
```

### 5. Run the Application

From the project root:

```bash
npm run dev
```

This starts both servers concurrently:

- **Backend API:** http://localhost:5000
- **Frontend App:** http://localhost:3000

## API Endpoints

### Auth (`/api/auth`)

| Method | Route            | Auth     | Description           |
| ------ | ---------------- | -------- | --------------------- |
| POST   | `/register`      | Public   | Register professor    |
| GET    | `/verify/:token` | Public   | Verify email          |
| POST   | `/login`         | Public   | Login, get JWT        |
| GET    | `/me`            | Required | Get current professor |

### Positions (`/api/positions`)

| Method | Route        | Auth     | Description          |
| ------ | ------------ | -------- | -------------------- |
| GET    | `/`          | Public   | List open positions  |
| GET    | `/:id`       | Public   | Get position details |
| POST   | `/`          | Required | Create position      |
| PUT    | `/:id`       | Required | Update position      |
| PATCH  | `/:id/close` | Required | Close position       |
| DELETE | `/:id`       | Required | Delete position      |

### Applications (`/api/applications`)

| Method | Route                   | Auth     | Description            |
| ------ | ----------------------- | -------- | ---------------------- |
| POST   | `/`                     | Public   | Submit application     |
| GET    | `/position/:positionId` | Required | List apps for position |
| GET    | `/:id`                  | Required | Get single application |
| PATCH  | `/:id/status`           | Required | Update app status      |

### Dashboard (`/api/dashboard`)

| Method | Route                  | Auth     | Description            |
| ------ | ---------------------- | -------- | ---------------------- |
| GET    | `/my-positions`        | Required | Professor's positions  |
| GET    | `/recent-applications` | Required | Latest 10 applications |

## Seed Data

After running `npx prisma db seed`, the following test accounts are available:

| Email                | Password    | Role      |
| -------------------- | ----------- | --------- |
| smith@university.edu | password123 | Professor |
| chen@university.edu  | password123 | Professor |

Three sample positions are also created.

## Git Workflow

### Branching Strategy

```
main          ← stable, deployable
  └── dev     ← integration branch
       ├── feature/US-1-register
       ├── feature/US-11-job-board
       └── feature/US-4a-create-position
```

### Workflow

1. Pull latest `dev`: `git checkout dev && git pull`
2. Create feature branch: `git checkout -b feature/US-XX-description`
3. Commit frequently with clear messages
4. Push and open a Pull Request to `dev`
5. One teammate reviews before merging
6. After sprint: merge `dev` → `main`

### Commit Message Convention

```
US-1: Add professor registration endpoint
US-11: Create job board with position cards
US-4a: Build create position form
fix: resolve CORS issue on login
chore: update Prisma schema
```

## Sprint Plan

| Sprint   | Stories                                        | Points |
| -------- | ---------------------------------------------- | ------ |
| Sprint 1 | Auth + Job Board + Create Position + Apply     | 28     |
| Sprint 2 | Edit/Close/Delete + App Review + Search/Filter | 25     |
| Sprint 3 | Notifications + Rich Editor + Enhancements     | 23     |
