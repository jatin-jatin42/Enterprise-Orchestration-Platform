# Enterprise Orchestration Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)

## 📖 Overview

The **Enterprise Orchestration Platform** is a robust, full-stack solution designed to streamline administrative and operational tasks. It features a scalable **Node.js/Express** backend and a dynamic **React** frontend, providing a seamless experience for managing users, interns, and resources with enterprise-grade security and performance.

## ✨ Key Features

-   **🔐 Secure Authentication**: Robust JWT-based authentication with role-based access control (RBAC) for Admins and Users.
-   **👥 User & Intern Management**: Comprehensive CRUD operations for managing system users and intern profiles.
-   **📚 Resource Hub**: Centralized management for learning materials and development tools.
-   **⚡ Modern Dashboard**: A responsive, high-performance UI built with React and Tailwind CSS.
-   **🛠️ Developer-First**: Written entirely in TypeScript with strict typing, thoroughly tested with Jest.
-   **📄 API Documentation**: Integrated Swagger/OpenAPI documentation for easy API exploration.

## 🏗️ Tech Stack

### Backend
-   **Runtime**: Node.js, Express
-   **Language**: TypeScript
-   **Database**: MongoDB (Mongoose)
-   **Auth**: JWT, Bcrypt
-   **Validation**: Zod, Express-Validator
-   **Testing**: Jest, Supertest

### Frontend
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS, Headless UI
-   **State Management**: Zustand
-   **Forms**: React Hook Form, Zod
-   **Routing**: React Router DOM

## 📂 Project Structure

```bash
├── backend/            # REST API, Business Logic, DB Models
│   ├── src/
│   │   ├── controllers/# Route Controllers
│   │   ├── models/     # Mongoose Models
│   │   ├── routes/     # API Routes
│   │   ├── services/   # Business Logic
│   │   └── ...
│   └── ...
├── frontend/           # React SPA Dashboard
│   ├── src/
│   │   ├── components/ # Reusable UI Components
│   │   ├── pages/      # Page Views
│   │   ├── store/      # Zustand State Stores
│   │   └── ...
│   └── ...
└── README.md           # Project Documentation
```

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

-   **Node.js**: v18+ (v20 recommended)
-   **npm**: v9+
-   **MongoDB**: Local instance or Atlas URI

### 1. Clone the Repository

```bash
git clone <your-repo-url> Admin-Management-Dashboard
cd Admin-Management-Dashboard
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

**Configure `.env`**:
```env
MONGODB_URI=mongodb://localhost:27017/enterprise-v1
JWT_SECRET=your_super_secure_secret
ALLOWED_ORIGINS=http://localhost:5173
```

**Seed & Run**:
```bash
npm run seed  # Seeds default admin user
npm run dev   # Starts development server
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

**Configure `.env`**:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**Run**:
```bash
npm run dev
```

Visit `http://localhost:5173` and log in with the seeded credentials.

## 🧪 Testing

The backend includes a comprehensive test suite.

```bash
cd backend
npm test
```

## 📄 License

This project is licensed under the [MIT License](LICENSE).
