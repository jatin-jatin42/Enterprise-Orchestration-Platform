# Enterprise-Orchestration-Platform – Backend API

Backend service for the **Enterprise-Orchestration-Platform**, built with:

- **Node.js + Express + TypeScript**
- **MongoDB** with **Mongoose**
- **JWT authentication** with role‑based access control (RBAC)
- **Swagger/OpenAPI** documentation
- **Jest + Supertest** for testing

---

## Features

- **Authentication & RBAC**
  - JWT‑based login and registration
  - Roles: `admin`, `user`
  - Middleware: `authenticateUser`, `requireAdmin`, `checkOwnershipOrAdmin`

- **Domain features**
  - Users: admin‑level user management (create/update/deactivate/reset password)
  - Interns: tracking intern details, comments, meeting notes, projects
  - Learning resources: tutorials, articles, courses, docs, etc.
  - Tool resources: dev tools, services, categorized and filterable

- **Security & robustness**
  - Password hashing with **bcryptjs**
  - Centralized error handling (no stack leaks in production)
  - Input validation using **express-validator**
  - Rate limiting with **express-rate-limit**
  - CORS configuration and **Helmet** hardening
  - Strict **TypeScript** configuration (`strict: true`)

- **Developer experience**
  - `ts-node` + `nodemon` for local development
  - `tsc` + `tsc-alias` for compiled builds
  - MongoDB connection helper with clear startup errors
  - Seed script for default admin user

---

## Requirements

- **Node.js**: v18+ (v20 recommended)  
- **npm**: v9+  
- **MongoDB**: Local instance or MongoDB Atlas connection string

---

## Installation & Setup

```bash
cd backend
npm install
```

### 1. Environment configuration

An example file is provided:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

- **Server**
  - `PORT` – HTTP port (default: `8000`)
  - `NODE_ENV` – `development` | `production` | `test`

- **Database**
  - `MONGODB_URI` – MongoDB connection string (required)

- **JWT / Auth**
  - `JWT_SECRET` – **required in production**, at least 32 characters  
  - `JWT_EXPIRE` – token lifetime (e.g. `7d`)

- **CORS**
  - `ALLOWED_ORIGINS` – comma‑separated list of allowed origins, e.g.:  
    `http://localhost:5173,http://localhost:3000`

- **Uploads**
  - `MAX_FILE_SIZE` – max upload size in bytes (default 5 MB)
  - `UPLOAD_PATH` – path for file uploads

- **Rate limiting**
  - `RATE_LIMIT_WINDOW_MS` – window in ms (default 900000 = 15 min)
  - `RATE_LIMIT_MAX_REQUESTS` – max requests per IP per window (default 100)

- **Default admin (for seeding)**
  - `DEFAULT_ADMIN_EMAIL`
  - `DEFAULT_ADMIN_PASSWORD`
  - `DEFAULT_ADMIN_USERNAME`

> In **production**, the backend validates that `JWT_SECRET` and `MONGODB_URI` are set and will **exit** if they are missing or misconfigured.

### 2. Seed the default admin user

```bash
npm run seed
```

- If an admin already exists with the configured email, seeding is skipped.  
- Use the printed credentials to log into the frontend dashboard.

### 3. Run the server

```bash
# Development
npm run dev

# Build & run (production style)
npm run build
npm start
```

Default URLs:

- API base: `http://localhost:8000/api`
- Swagger docs: `http://localhost:8000/api/docs`
- Health check: `http://localhost:8000/api/health`

---

## Scripts

- `npm run dev` – Start server in dev mode (`ts-node` + `nodemon`)
- `npm run build` – Compile TypeScript to `dist`
- `npm start` – Run compiled server from `dist/server.js`
- `npm test` – Run Jest test suite
- `npm run seed` – Seed default admin user

---

## API overview

### Auth routes (`/api/auth`)

- `POST /auth/register` – Register a new user (can be restricted to admin in production)
- `POST /auth/login` – Login with email + password, returns `{ token, user }`
- `GET /auth/profile` – Get the currently authenticated user's profile
- `PUT /auth/profile` – Update own profile
- `PUT /auth/change-password` – Change own password

### User routes (`/api/users`)

Admin capabilities:

- `GET /users` – List users with filters and pagination
- `GET /users/:id` – Get user by ID (self or admin)
- `POST /users` – Create user (admin only)
- `PUT /users/:id` – Update user (admin or self, with restrictions)
- `DELETE /users/:id` – Soft delete/deactivate a user (admin only)
- `POST /users/:id/reset-password` – Reset user password (admin only)
- `PUT /users/:id/settings` – Update own settings

### Learning resources (`/api/learning-resources`)

- `GET /learning-resources` – List resources with filtering, search, pagination
- `GET /learning-resources/:id` – Get a single resource
- `POST /learning-resources` – Create resource (authenticated)
- `PUT /learning-resources/:id` – Update resource (owner or admin)
- `DELETE /learning-resources/:id` – Soft delete
- `POST /learning-resources/:id/like` – Increment likes

### Tool resources (`/api/tools`)

- `GET /tools` – List tools with filters and pagination
- `GET /tools/:id` – Get tool by ID
- `POST /tools` – Create tool (authenticated)
- `PUT /tools/:id` – Update tool (owner or admin)
- `DELETE /tools/:id` – Soft delete tool

### Interns (`/api/interns`)

- `GET /interns` – List interns with filters and pagination
- `GET /interns/:id` – Detailed intern profile
- `POST /interns` – Create intern (admin only)
- `PUT /interns/:id` – Update intern (admin only)
- `DELETE /interns/:id` – Deactivate intern (admin only)
- `POST /interns/:id/comments` – Add daily comment
- `POST /interns/:id/meeting-notes` – Add meeting note
- `POST /interns/:id/projects` – Attach project (admin only)

> Full, always‑up‑to‑date docs are available via **Swagger** at `/api/docs`.

---

## Validation & error handling

- **Validation**: `express-validator` (`validators.ts`) is applied to key routes:
  - Registration, login
  - Learning resources, tools, interns, user creation
- **Error handler**: `error.middleware.ts` ensures consistent JSON error responses:
  - `{ success: false, message, stack? }`
  - Stack traces are only included in `NODE_ENV=development`.

---

## Testing

The backend uses **Jest** and **Supertest**.

```bash
npm test
```

Test categories (see `tests/`):

- Unit tests for auth logic
- Integration tests for user operations
- E2E flow tests for auth

---

## Docker

A `Dockerfile` is provided in this folder. Typical usage:

```bash
docker build -t admin-dashboard-backend .
docker run -p 8000:8000 --env-file .env admin-dashboard-backend
```

You must ensure the container can reach a MongoDB instance (link to another container or Atlas).

---

## Contributing

Issues and pull requests are welcome. When contributing:

- Run `npm test` before opening a PR
- Keep TypeScript strict mode and linting clean
- Avoid adding console logs; use structured logging if needed

---

## License

MIT License
