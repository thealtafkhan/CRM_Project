# TECHNOLOGY STACK SPECIFICATION (MERN) — AcxiomCRM

## 1. Core Framework & Runtime
- **Runtime Environment**: Node.js v20+ LTS (verified: v24.14.0 active).
- **Backend Framework**: Express.js 4.x (REST API, Modular Routing, Error Middleware).
- **Frontend Framework**: React 18+ (SPA, Vite build tool, Functional Components with Hooks).
- **Language**: Modern JavaScript (ES2024) / TypeScript with strict typing.

---

## 2. Persistence & Data Access
- **Database Engine**: MongoDB 7.0+ (NoSQL Document Store, ACID multi-document transactions support).
- **Object Data Modeling (ODM)**: Mongoose 8.x.
- **Data Validation & Schemas**: Mongoose Schema Validators + Joi / express-validator.
- **Indexes**: Unique sparse indexes on Customer/Lead email and phone, compound indexes on `(assignedTo, status)` and `(createdAt)`.

---

## 3. Security, Identity & Authentication
- **Authentication Strategy**: JSON Web Tokens (JWT) + Secure HTTP-only cookies (`.AcxiomCRM.Auth`).
- **Password Hasher**: `bcryptjs` / `argon2` with adaptive salt rounds (12 rounds) — zero plaintext storage.
- **Lockout Mechanism**: Mongoose User model fields (`failedLoginCount`, `lockoutEnd`). Automatically locks account after 5 consecutive failed attempts for 15 minutes.
- **CSRF & Security Headers**: `helmet` (HSTS, CSP, X-Frame-Options) + `cors` with explicit origin whitelist.
- **Rate Limiting**: `express-rate-limit` (brute-force defense on `/api/auth/login`).

---

## 4. Frontend & User Interface
- **CSS Framework**: Bootstrap 5.3 + Bootstrap Icons.
- **Client Routing**: React Router v6 (protected routes with role-based guard components).
- **Data Visualizations & Charts**: Chart.js 4.4 + `react-chartjs-2` (Lead Status doughnut, Opportunity Pipeline bar, Monthly Sales trends).
- **Form Management & Validation**: React Hook Form + Yup / Joi client-side validation schema matching server-side rules.
- **HTTP Client**: Axios with request/response interceptors (auto token attachment, global 401/403/423 handling).
- **Feedback & Notifications**: SweetAlert2 (for destructive modal confirmations) + React-Toastify / Bootstrap Toasts.

---

## 5. Architecture & Supporting Tools
- **Logging**: Winston + Morgan (structured JSON logging, scrubbing secrets, separating audit events).
- **Audit Interceptor**: Custom Mongoose plugin intercepting `pre('save')`, `post('save')`, and `findOneAndUpdate` to record old vs. new values in `AuditLog` collection.
- **Testing**: Jest + Supertest (API integration testing) + React Testing Library.
