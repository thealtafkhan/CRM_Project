# ACCEPTANCE CRITERIA — AcxiomCRM

## 1. Overview
This document specifies the strict pass/fail criteria required for every module and workflow according to the AcxiomCRM Baseline Specification.

---

## 2. Module-by-Module Acceptance Criteria

### AC-01: Application Shell & UI Consistency
- **Pass Criteria**:
  - The application renders a consistent, responsive navigation bar, header, and footer across all authenticated views.
  - Menu options reflect the user's role (Admins see User Management and Audit Logs; Sales Executives do not).
  - Validation errors, flash alerts, and confirmation modals adhere to Bootstrap 5 styling.
  - Anonymous requests to any CRM URL (e.g., `/Customers`, `/Leads`, `/Dashboard`) redirect to `/Account/Login`.

### AC-02: Authentication & Account Security
- **Pass Criteria**:
  - Valid credentials authenticate and establish a secure, HTTP-only authentication cookie.
  - Invalid credentials return a generic error message ("Invalid login attempt") without disclosing whether the username exists.
  - Passwords with < 8 characters or lacking uppercase, lowercase, digit, or special character are rejected.
  - Passwords in the database match Argon2id/PBKDF2 hash patterns and are never visible in plaintext.
  - Entering 5 incorrect passwords triggers an automatic account lockout for 15 minutes.
  - Admins can inspect lockout status and execute an administrative unlock.
  - State-changing POST requests without a valid `__RequestVerificationToken` fail with HTTP 400 Bad Request.

### AC-03: Dashboard & KPI Analytics
- **Pass Criteria**:
  - Successfully logged-in users are redirected to `/Dashboard`.
  - Admin dashboard displays global totals; Manager displays team totals; Sales Executive displays only assigned metrics.
  - KPI cards calculate exact counts for: Total Customers, Total Leads, Open Leads, Total Opportunities, Open Opportunities, Won Opportunities, Lost Opportunities, and Total Pipeline Value.
  - Chart.js renders Lead Status distribution, Opportunity Pipeline stages, and Monthly Sales outcome totals based strictly on authorized data.
  - Date filtering (Today, This Week, This Month, Custom Range) dynamically recalculates metrics without page errors.

### AC-04: Customer Master Management
- **Pass Criteria**:
  - Creating a customer requires Name, Email, Phone, Company, and Status.
  - Form submission with invalid email format (e.g. `test@`) or phone format (e.g. `abc` or 5 digits) is blocked on both client and server.
  - Attempting to register a customer with an email or phone that already exists in the database fails with a clear duplicate conflict message.
  - Successfully created customers generate an entry in the `AuditLog` table.
  - Customer listing supports search by Name, Email, Phone, Company, and pagination.

### AC-05: Lead Management & Conversion Engine
- **Pass Criteria**:
  - New leads capture Code, Name, Email, Phone, Company, Source, Status, Priority, Expected Value, and Assigned Representative.
  - Status transitions follow valid sequence: `New` -> `Contacted` -> `Qualified`/`Unqualified` -> `Converted`/`Lost`. Arbitrary jumping is prohibited.
  - Converting a `Qualified` lead generates a new `Customer` record, a new `Opportunity` record with matching expected values, sets lead status to `Converted`, and logs the event atomically.
  - Once converted, the lead cannot be re-converted or returned to an active status.

### AC-06: Opportunity Management & Pipeline Rules
- **Pass Criteria**:
  - Active opportunities enforce `Amount > 0`. Submitting `Amount <= 0` is rejected with: *"Opportunity Amount must be greater than 0."*
  - Probability must be between 0 and 100 inclusive. Submitting `Probability = 101` is rejected with: *"Probability must be between 0 and 100."*
  - Active opportunities enforce `ExpectedCloseDate >= DateTime.UtcNow.Date`. Submitting a past date is rejected with: *"Expected Close Date cannot be in the past."*
  - Weighted Pipeline value is computed accurately: `Amount * (Probability / 100)`.
  - Moving an opportunity to `Won` marks status as Closed-Won; moving to `Lost` marks status as Closed-Lost.

### AC-07: Follow-Up Management & Anti-Backdating
- **Pass Criteria**:
  - Follow-up records capture Related Entity (Customer, Lead, Opportunity), Target Date, Type, Status, and Assigned User.
  - Submitting a new/planned follow-up with `FollowUpDate < DateTime.UtcNow.Date` is rejected with: *"Follow-up date cannot be earlier than today."*
  - Follow-up status transitions (`Planned` -> `Completed` / `Missed` / `Cancelled`) are logged with remarks.
  - Overdue follow-ups are automatically identified and highlighted with danger badges on the UI.

### AC-08: Activity Management
- **Pass Criteria**:
  - Users can record Calls, Meetings, Emails, and Tasks linked to either a Customer or a Lead.
  - Activity logs require Subject, Activity Type, Date, and Description.
  - Activities appear chronologically in the Customer 360 and Lead details views.

### AC-09: User & Role Administration
- **Pass Criteria**:
  - Only users in the `Admin` role can access `/Users` and `/Roles`.
  - Admin can create new users, select their primary role, and set initial active state.
  - Admin can trigger password resets and unlock locked accounts.
  - Passwords and security hashes are excluded from all view models and JSON responses.

### AC-10: Immutable Audit Logging
- **Pass Criteria**:
  - Successful logins, failed attempts, and logouts generate audit entries.
  - Creating, updating, or deleting Customers, Leads, and Opportunities generates audit entries capturing Entity Name, Record ID, Action, and old vs. new state JSON.
  - Direct attempts to update or delete rows from `AuditLog` are rejected by the DbContext.
  - Audit log viewer provides filtering by User, Entity, Action, and Date range.

### AC-11: REST API Specification
- **Pass Criteria**:
  - Public `/api/auth/login` endpoint returns JWT / auth cookie upon valid credentials; rate-limited against brute-force.
  - `/api/customers`, `/api/leads`, `/api/opportunities`, and `/api/followups` endpoints enforce authentication.
  - Requests with invalid payloads return HTTP 400 Bad Request with structured field errors.
  - Requests attempting unauthorized access return HTTP 403 Forbidden.
  - Accessing non-existent IDs returns HTTP 404 Not Found.
  - All API responses return clean DTOs; entity navigation graphs and password hashes are never exposed.

### AC-12: Analytical Reporting
- **Pass Criteria**:
  - All 8 specified reports render correctly with server-authorized data.
  - Role-based scoping applies to reports (Sales Executives cannot view company-wide pipeline totals).
  - Reports support filtering, sorting, pagination, and data export.
