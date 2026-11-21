# LIVE TASK TRACKER — AcxiomCRM

## Status Legend
- `[x] COMPLETED`: Implemented, tested, and verified against baseline.
- `[-] IN PROGRESS`: Currently under active development.
- `[ ] PENDING`: Not yet started.

---

## Phase 1: Solution Setup & Database Layer (MERN Stack)
- [x] Task 1.1: Initialize MERN Solution (Express Backend + React Vite Frontend).
- [x] Task 1.2: Implement Mongoose Models (`User`, `Customer`, `Lead`, `Opportunity`, `FollowUp`, `Activity`, `AuditLog`).
- [x] Task 1.3: Configure MongoDB connection and indexes (unique sparse email/phone).
- [x] Task 1.4: Implement Database Initializer with seed data (Admin, Manager, Sales Rep, Customers, Leads, Deals).

## Phase 2: Authentication & Security Baseline
- [x] Task 2.1: Configure bcrypt password hashing, password policy, and brute-force account lockout.
- [x] Task 2.2: Implement Auth Controller (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`).
- [x] Task 2.3: Integrate JWT bearer authorization and secure HTTP-only cookies.
- [x] Task 2.4: Implement authentication audit event triggers (`Login`, `FailedLogin`, `Lockout`, `Logout`).

## Phase 3: Application Shell & UI
- [x] Task 3.1: Build responsive Bootstrap 5 Master Layout with Header Navbar and Sidebar.
- [x] Task 3.2: Implement dynamic role-based navigation menus and route guards.
- [x] Task 3.3: Configure SweetAlert2 confirmation dialogs and Toast feedback.

## Phase 4: Customer & Lead Management
- [x] Task 4.1: Implement Customer CRUD views, 360 history tabs, and controller actions.
- [x] Task 4.2: Enforce Customer Email and Phone uniqueness validations (HTTP 409 Conflict).
- [x] Task 4.3: Implement Lead CRUD views and status lifecycle engine (`New` -> `Contacted` -> `Qualified` -> `Converted` / `Lost`).
- [x] Task 4.4: Implement atomic Lead-to-Customer & Opportunity conversion workflow.

## Phase 5: Opportunity Management
- [x] Task 5.1: Implement Opportunity CRUD and stage progression pipeline.
- [x] Task 5.2: Enforce business validations (`Amount > 0`, `Probability 0-100`, `ExpectedCloseDate >= Today`).
- [x] Task 5.3: Implement derived Weighted Pipeline calculation (`Amount * Prob / 100`).

## Phase 6: Follow-Up & Activity Tracking
- [x] Task 6.1: Implement Follow-up scheduling with anti-backdating validation (`FollowUpDate >= Today`).
- [x] Task 6.2: Implement automated overdue follow-up visual indicators (danger badges & pulse).
- [x] Task 6.3: Implement omnichannel Activity logging (Call, Meeting, Email, Task).

## Phase 7: Audit Logging
- [x] Task 7.1: Implement append-only AuditLog model capturing logins, mutations, and old/new snapshots.
- [x] Task 7.2: Implement Admin Audit Log viewer with action/entity filtering and JSON diff modal.
- [x] Task 7.3: Verify append-only immutability guardrails on audit collection.

## Phase 8: REST APIs, Dashboards & Reporting
- [x] Task 8.1: Implement REST API controllers returning clean DTOs and accurate HTTP status codes.
- [x] Task 8.2: Implement Chart.js visual analytics (Lead Status doughnut, Opportunity Pipeline bar, Monthly Sales trend).
- [x] Task 8.3: Implement 8 analytical reports with filtering and CSV export.
- [x] Task 8.4: Execute full 14-point acceptance testing and compliance verification.
