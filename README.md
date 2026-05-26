# Store Rating App

A full-stack web application for discovering stores, submitting ratings, and managing feedback across role-based dashboards. Built with a modern React frontend and a secure Express.js REST API backed by MySQL and Prisma ORM.

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-green.svg)
![React](https://img.shields.io/badge/react-19-61dafb.svg)
![Express](https://img.shields.io/badge/express-5-000000.svg)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Author](#author)

---

## Project Overview

**Store Rating App** enables users to rate local stores on a scale of 1–5, while store owners monitor performance and administrators manage the platform. The application implements JWT-based authentication, role-based access control (RBAC), and a responsive single-page interface.

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React, Vite, Tailwind CSS, Axios    |
| Backend  | Express.js, Prisma, MySQL           |
| Auth     | JWT, bcrypt                         |

---

## Features

### Authentication & Security
- User registration and login
- JWT tokens with Bearer authorization
- Password hashing via bcrypt
- Protected routes and role-based middleware
- Session persistence with `localStorage`

### Admin
- Dashboard with platform statistics (users, stores, ratings)
- Create users with roles: `ADMIN`, `USER`, `OWNER`
- List, search, sort, and filter users
- View user details (including owner store rating averages)
- Full store CRUD (create, list, view, delete)
- Search, sort, and paginate stores

### User
- Browse stores with average ratings
- Submit ratings (1–5 stars)
- One rating per store (upsert on duplicate)
- Update existing ratings
- Personal dashboard with rating history

### Owner
- Dashboard for owned stores
- Average rating and total ratings per store
- List of users who submitted ratings

### Frontend
- Responsive dark-themed UI (Tailwind CSS)
- Role-based navigation and redirects
- Toast notifications and loading states
- Axios interceptors for token attachment

---

## User Roles

| Role    | Description                                      | Default Route |
|---------|--------------------------------------------------|---------------|
| `ADMIN` | Manages users, stores, and platform analytics    | `/admin`      |
| `USER`  | Browses stores and submits ratings               | `/stores`     |
| `OWNER` | Views owned stores and customer feedback         | `/owner`      |

> **Note:** Public registration creates `USER` accounts only. Promote the first admin via database or use the Admin API to create elevated roles.

---

## Tech Stack

### Frontend
- **React 19** — UI library
- **Vite** — Build tool and dev server
- **Tailwind CSS 4** — Utility-first styling
- **React Router DOM** — Client-side routing
- **Axios** — HTTP client with interceptors

### Backend
- **Express.js 5** — REST API framework
- **Prisma** — ORM and migrations
- **MySQL** — Relational database
- **jsonwebtoken** — JWT signing and verification
- **bcrypt** — Password hashing
- **CORS** — Cross-origin resource sharing

---

## Folder Structure

```
store-rating-app/
├── backend/
│   ├── controllers/       # Route handlers (auth, admin, store, rating)
│   ├── middleware/        # JWT protect, role authorization
│   ├── routes/            # API route definitions
│   ├── utils/             # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma  # Database models
│   │   └── migrations/    # Migration history
│   ├── server.js          # Express entry point
│   ├── .env               # Backend secrets (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios instance & API modules
│   │   ├── components/    # Navbar, ProtectedRoute, UI primitives
│   │   ├── context/       # Auth & Toast providers
│   │   ├── hooks/         # useAuth, useToast
│   │   ├── layouts/       # MainLayout, AuthLayout
│   │   ├── pages/         # Login, dashboards, store listing
│   │   ├── routes/        # AppRoutes configuration
│   │   └── utils/         # Constants, localStorage helpers
│   ├── .env               # Frontend env (not committed)
│   └── package.json
│
└── README.md
```

---

## Prerequisites

Before you begin, ensure you have installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MySQL](https://www.mysql.com/) (v8.x)
- npm or yarn
- Git

---

## Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/store-rating-app.git
cd store-rating-app/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the `backend/` directory (see [Environment Variables](#environment-variables)).

### 4. Create the MySQL database

```sql
CREATE DATABASE store_rating;
```

### 5. Run Prisma migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### 6. Start the server

```bash
# Development (with nodemon)
npm run server

# Production
node server.js
```

The API runs at **http://localhost:5000** by default.

---

## Frontend Setup

### 1. Navigate to the frontend directory

```bash
cd ../frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and adjust if needed:

```bash
cp .env.example .env
```

### 4. Start the development server

```bash
npm run dev
```

The app runs at **http://localhost:5173**.

### 5. Build for production

```bash
npm run build
npm run preview
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          | Example                                              |
|----------------|--------------------------------------|------------------------------------------------------|
| `DATABASE_URL` | MySQL connection string for Prisma   | `mysql://root:password@127.0.0.1:3306/store_rating` |
| `JWT_SECRET`   | Secret key for signing JWT tokens    | `your_super_secret_key`                              |
| `PORT`         | Server port (optional)               | `5000`                                               |

```env
DATABASE_URL="mysql://root:your_password@127.0.0.1:3306/store_rating"
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

### Frontend (`frontend/.env`)

| Variable        | Description              | Example                        |
|-----------------|--------------------------|--------------------------------|
| `VITE_API_URL`  | Backend API base URL     | `http://localhost:5000/api`    |

```env
VITE_API_URL=http://localhost:5000/api
```

> Never commit `.env` files to version control.

---

## API Overview

Base URL: `http://localhost:5000/api`

All protected routes require:

```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint            | Access  | Description              |
|--------|---------------------|---------|--------------------------|
| POST   | `/auth/register`    | Public  | Register new user (USER) |
| POST   | `/auth/login`       | Public  | Login and receive JWT    |
| GET    | `/auth/profile`     | Auth    | Get logged-in user       |

### Admin

| Method | Endpoint                  | Access | Description                    |
|--------|---------------------------|--------|--------------------------------|
| GET    | `/admin/dashboard`        | ADMIN  | Platform statistics            |
| POST   | `/admin/create-user`      | ADMIN  | Create user with any role      |
| GET    | `/admin/users`            | ADMIN  | List users (search, sort)      |
| GET    | `/admin/users/:id`        | ADMIN  | Get user by ID                 |

### Stores

| Method | Endpoint           | Access              | Description              |
|--------|--------------------|---------------------|--------------------------|
| GET    | `/stores/browse`   | ADMIN, USER, OWNER  | Browse stores (listing)  |
| POST   | `/stores`          | ADMIN               | Create store             |
| GET    | `/stores`          | ADMIN               | List stores (paginated)  |
| GET    | `/stores/:id`      | ADMIN               | Get store by ID          |
| DELETE | `/stores/:id`      | ADMIN               | Delete store             |

### Ratings

| Method | Endpoint                    | Access | Description                    |
|--------|-----------------------------|--------|--------------------------------|
| POST   | `/ratings`                  | USER   | Submit or update rating        |
| PUT    | `/ratings/:storeId`         | USER   | Update rating for a store      |
| GET    | `/ratings/my-ratings`       | USER   | Get current user's ratings     |
| GET    | `/ratings/owner/dashboard`  | OWNER  | Owner store analytics          |

### Example: Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

---

## Screenshots

<!-- Add your screenshots to /docs/screenshots/ and update paths below -->

| Page              | Preview |
|-------------------|---------|
| Login             | ![Login](./docs/screenshots/login.png) |
| Register          | ![Register](./docs/screenshots/register.png) |
| Admin Dashboard   | ![Admin Dashboard](./docs/screenshots/admin-dashboard.png) |
| Store Listing     | ![Store Listing](./docs/screenshots/store-listing.png) |
| User Dashboard    | ![User Dashboard](./docs/screenshots/user-dashboard.png) |
| Owner Dashboard   | ![Owner Dashboard](./docs/screenshots/owner-dashboard.png) |

> Placeholder paths — replace with actual screenshots when available.

---

## Deployment

### Backend

1. Set production environment variables on your host (Railway, Render, AWS, etc.).
2. Run database migrations:

   ```bash
   npx prisma migrate deploy
   ```

3. Start the server:

   ```bash
   node server.js
   ```

### Frontend

1. Set `VITE_API_URL` to your production API URL.
2. Build the static assets:

   ```bash
   npm run build
   ```

3. Deploy the `dist/` folder to Vercel, Netlify, or any static host.

### Recommended production checklist

- [ ] Use a strong `JWT_SECRET`
- [ ] Enable HTTPS
- [ ] Restrict CORS to your frontend domain
- [ ] Use a managed MySQL instance
- [ ] Never expose `.env` files

---

## Database Schema

```
User ──┬── Rating
       │
Store ─┴── Rating (unique: userId + storeId)
```

**Models:** `User`, `Store`, `Rating`  
**Roles:** `ADMIN`, `USER`, `OWNER`

---

## Scripts Reference

| Location   | Command           | Description              |
|------------|-------------------|--------------------------|
| `backend/` | `npm run server`  | Start API with nodemon   |
| `backend/` | `npx prisma studio` | Open Prisma database UI  |
| `frontend/`| `npm run dev`     | Start Vite dev server    |
| `frontend/`| `npm run build`   | Production build         |

---

## Author

**Vaibhav**

- GitHub: [@your-username](https://github.com/your-username)
- Project: [Store Rating App](https://github.com/your-username/store-rating-app)

---

## License

This project is licensed under the **ISC License**.

---

<p align="center">Built with React, Express, Prisma, and MySQL</p>
