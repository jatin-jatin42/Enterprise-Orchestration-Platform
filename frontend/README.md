# Admin Management Dashboard – Frontend

React + TypeScript + Vite SPA for the **Admin Management Dashboard**.  
It consumes the backend API to provide authentication, a protected dashboard, and a modern UI.

---

## Tech stack

- **React 19** + **TypeScript**
- **Vite** for bundling and dev server
- **Tailwind CSS** (with forms & typography)
- **Zustand** for global state management
- **React Hook Form** + **Zod** for forms & validation
- **Axios** for HTTP requests
- **React Router** for routing
- **react-hot-toast** for notifications

---

## Features

- **Authentication UI**
  - Login and registration pages with Zod validation
  - Friendly error messages and success banners (e.g. after registration)
  - Shows backend validation errors via `AuthServiceError`

- **Protected dashboard**
  - `ProtectedRoute` wrapper checks authentication and optional role
  - Redirects unauthenticated users to `/login`
  - Displays logged‑in user information (username, email, role, status)

- **State management**
  - `authStore` keeps `user`, `token`, `isAuthenticated`, `status`, and `error`
  - Persisted auth state in localStorage (via `zustand/persist`)
  - Safe auto‑profile fetch on app start (uses stored token)

- **API integration**
  - Centralized Axios instance (`api.ts`) with:
    - Base URL from `VITE_API_BASE_URL`
    - JWT header via request interceptor
    - 401 handling (clear token + redirect to `/login`)
  - `authService` wraps all auth‑related API calls and normalizes errors

---

## Requirements

- **Node.js**: v18+  
- **npm**: v9+  
- Backend API running (see `../backend/README.md`)

---

## Setup

From the repo root:

```bash
cd frontend
npm install
```

### Environment variables

An example file is provided:

```bash
cp .env.example .env
```

Available variables:

- `VITE_API_BASE_URL` – Backend API base URL (e.g. `http://localhost:8000/api`)  
- `VITE_ENV` – Optional, e.g. `development` | `production`

**Important**: The value of `VITE_API_BASE_URL` must match the backend URL and be allowed in the backend's `ALLOWED_ORIGINS` list.

---

## Running the app

### Development

```bash
npm run dev
```

Default URL:

- `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Linting & type‑checking

```bash
npm run lint
npm run type-check
```

---

## Key architecture

### Routing

- Defined in `App.tsx` using `react-router-dom`:
  - `/login` – Login page
  - `/register` – Registration page
  - `/dashboard` – Protected dashboard
  - `/` – Redirects to `/dashboard` if authenticated, else `/login`
  - `*` – Simple 404 page

### Auth flow

1. User submits login form.
2. `authStore.login` calls `authService.login(credentials)`.
3. On success:
   - Token is stored via `authService.setToken` (localStorage)
   - Zustand store is updated (`user`, `token`, `isAuthenticated=true`).
4. Axios interceptor attaches `Authorization: Bearer <token>` to all requests.
5. Backend responds with 401 if token is invalid/expired:
   - Interceptor removes token and redirects to `/login`.

On app mount, `App.tsx` checks for an existing token and calls `getProfile()` to hydrate the user.

### Error handling

- `authService`:
  - Wraps Axios errors in `AuthServiceError` with `message`, `code`, `statusCode`.
  - Logs detailed errors only when `import.meta.env.DEV` is `true`.

- `authStore`:
  - Displays toast messages (success/error)
  - Stores a user‑facing `error` string used by forms

- Forms (e.g., `Login.tsx`, `Register.tsx`):
  - Show field‑level validation errors (from Zod)
  - Show global API errors in an alert banner

---

## UI & UX

- Tailwind CSS for styling, including form and typography utilities
- `Button`, `Input`, and `LoadingSpinner` components for consistent UI
- Enhanced login UX:
  - Shows success messages after registration or password reset (via query params)
  - Inline hints (e.g. for intern password pattern)
  - Accessibility attributes (`aria-*`) on inputs and alerts

---

## Extending the app

You can add additional pages and features using the existing patterns:

- Create new pages under `src/pages/`
- Add API clients under `src/services/`
- Add new Zustand stores under `src/stores/`
- Extend types under `src/types/`

When adding new API calls:

- Prefer using the shared `api` Axios instance
- Model responses with `ApiResponse<T>` from `src/types/api.ts`
- Use Zod schemas where appropriate to validate complex data

---

## License

This frontend is part of the overall project and is licensed under the **MIT License**.

