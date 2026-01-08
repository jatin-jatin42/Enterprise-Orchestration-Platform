## Enterprise-Orchestration-Platform

This repository contains a full‑stack **Enterprise-Orchestration-Platform**:

- **Backend**: Node.js + Express + TypeScript + MongoDB (Mongoose), JWT auth, RBAC, Swagger docs, Jest tests  
- **Frontend**: React + TypeScript + Vite, Tailwind CSS, Zustand, React Hook Form + Zod, Axios, React Router

The app provides:

- Secure authentication with JWT and role‑based access control (admin/user)
- Management of **users**, **interns**, **learning resources**, and **tool resources**
- Admin‑only operations such as user management, intern CRUD, password resets
- A modern dashboard UI for viewing the logged‑in user and performing quick actions

---

## Project structure

- `backend/` – REST API, business logic, database models, tests
- `frontend/` – React SPA dashboard that consumes the backend API

Each folder has its own `package.json` and can be developed independently.

---

## Prerequisites

- **Node.js**: v18+ (v20 recommended)  
- **npm**: v9+  
- **MongoDB**: Local instance or MongoDB Atlas connection string

---

## Quick start (development)

### 1) Clone the repo

```bash
git clone <your-repo-url> Admin-Management-Dashboard
cd Admin-Management-Dashboard
```

### 2) Backend setup

```bash
cd backend
npm install
```

Create `.env` from the example:

```bash
cp .env.example .env
```

Edit `.env` and set at least:

- `MONGODB_URI` – your MongoDB connection string  
- `JWT_SECRET` – **strong, at least 32 chars**, required in production  
- `ALLOWED_ORIGINS` – e.g. `http://localhost:5173`

Seed the default admin user (optional but recommended for first login):

```bash
npm run seed
```

Run the backend:

```bash
# Development (with ts-node + nodemon)
npm run dev

# or, build & run
npm run build
npm start
```

The API will be available at:

- Base URL: `http://localhost:8000/api`
- Swagger docs: `http://localhost:8000/api/docs`
- Health check: `http://localhost:8000/api/health`

> For more backend details, see `backend/README.md`.

### 3) Frontend setup

In a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the backend API URL (must match the backend base URL):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Start the React app:

```bash
npm run dev
```

The frontend will run at:

- `http://localhost:5173`

Log in using the seeded admin credentials (from `npm run seed`) to access the dashboard.

> For more frontend details, see `frontend/README.md`.

---

## High‑level architecture

- **Auth flow**
  - User logs in via `/api/auth/login`
  - Backend returns a signed JWT + user object
  - Frontend stores the token (via `authService.setToken`) and also in a persisted Zustand store
  - Axios interceptor attaches `Authorization: Bearer <token>` to all API requests
  - 401 responses clear the token and redirect to `/login`

- **RBAC**
  - Backend middleware enforces user roles (`authenticateUser`, `requireAdmin`)
  - Frontend `ProtectedRoute` component ensures only authenticated users (and optionally matching roles) can access routes

- **Error handling**
  - Backend has a centralized error middleware with consistent JSON responses
  - Frontend `authService` wraps Axios errors in a custom `AuthServiceError` with message + statusCode
  - UI shows toast notifications and inline error messages

---

## Scripts overview

### Backend

- `npm run dev` – Start API in dev mode (ts-node + nodemon)
- `npm run build` – Compile TypeScript to `dist`
- `npm start` – Run compiled server
- `npm test` – Run Jest test suite
- `npm run seed` – Seed default admin user

### Frontend

- `npm run dev` – Start Vite dev server
- `npm run build` – Production build
- `npm run preview` – Preview production build
- `npm run lint` – Run ESLint
- `npm run type-check` – Run TypeScript type checker

---

## Security notes

- **JWT secret** must be strong and **never** committed to version control.  
- Logs in both backend and frontend only print detailed error information in **development**.  
- Rate limiting, CORS, and Helmet are enabled on the backend to mitigate common web attacks.  
- Default admin credentials from `.env.example` are for **local development only** – always change them in real deployments.

---

## Testing

- Backend tests (`jest`, `supertest`) cover authentication and selected flows:

```bash
cd backend
npm test
```

Frontend currently relies on type‑checking and ESLint; you can add React Testing Library / Cypress as needed.

---

## License

This project is licensed under the **MIT License**.
