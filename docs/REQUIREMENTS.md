# REQUIREMENTS SPECIFICATION — AcxiomCRM

## 1. Functional Requirements Matrix
Derived directly from the AcxiomCRM Specification Baseline:

| Ref ID | Module | Functional Requirement | Priority | Verification Method |
|---|---|---|---|---|
| **FR-01** | App Shell | Provide responsive Bootstrap layout with navigation, header, user menu, alerts, and footer. | High | UI Inspection |
| **FR-02** | App Shell | Dynamically filter menu navigation according to the authenticated user's assigned role. | High | Role Navigation Test |
| **FR-03** | App Shell | Provide global search and filtering patterns across CRM listing screens. | Medium | Search Query Verification |
| **FR-04** | Auth | Implement secure login and logout using username/email and password credentials. | Critical | Auth Test Suite |
| **FR-05** | Auth | Passwords must never be stored in plain text; use ASP.NET Core Identity adaptive hashing. | Critical | DB Hash Inspection |
| **FR-06** | Auth | Apply password complexity policy: minimum 8 characters, uppercase, lowercase, digit, and special char. | Critical | Policy Validation Test |
| **FR-07** | Auth | Enforce account lockout mechanism after 5 consecutive failed login attempts for 15 minutes. | Critical | Lockout Integration Test |
| **FR-08** | Auth | Record all successful and failed authentication attempts into the Audit Log. | Critical | Audit Table Inspection |
| **FR-09** | Auth | Protect all state-changing MVC HTTP POST requests with Anti-Forgery Tokens (`ValidateAntiForgeryToken`). | Critical | CSRF Penetration Test |
| **FR-10** | Dashboard | Display role-based KPI cards: Total Customers, Total Leads, Open Leads, Total Opportunities, Open Opportunities, Won Opportunities, Lost Opportunities, Total Pipeline Value. | High | Calculation & Scope Test |
| **FR-11** | Dashboard | Render Chart.js analytics for Lead Status distribution, Opportunity Pipeline stages, and Monthly Sales outcome totals. | High | Chart Render & Data Check |
| **FR-12** | Dashboard | Provide date range filtering: Today, This Week, This Month, and Custom Range. | Medium | Filter Query Test |
| **FR-13** | Customer | Full CRUD operations for Customer master records (CustomerId, Code, Name, Email, Phone, Company, Address, City, State, Status, CreatedDate, CreatedBy). | High | CRUD Integration Test |
| **FR-14** | Customer | Enforce business uniqueness constraints on Email and Phone; prevent duplicate customer creation. | High | Duplicate Prevention Test |
| **FR-15** | Customer | Prevent invalid email format and validate phone number structure (e.g. 10 digits). | High | Format Regex Test |
| **FR-16** | Customer | Track modification history and display related activities and history to authorized users. | Medium | History Tab Inspection |
| **FR-17** | Lead | Capture and manage prospective leads (LeadId, Code, Name, Email, Phone, Company, Source, Status, Priority, ExpectedValue, CreatedDate, AssignedTo). | High | Lead Workflow Test |
| **FR-18** | Lead | Enforce valid status lifecycles: `New` -> `Contacted` -> `Qualified` / `Unqualified` -> `Converted` / `Lost`. | High | State Machine Test |
| **FR-19** | Lead | Support conversion of `Qualified` leads into Customer and Opportunity entities in a single atomic transaction. | Critical | Lead Conversion Test |
| **FR-20** | Opportunity | Manage sales opportunities (OpportunityId, Name, CustomerId, LeadId, Amount, Stage, Probability, ExpectedCloseDate, Status, CreatedDate, AssignedTo). | High | Opportunity Workflow |
| **FR-21** | Opportunity | Require Amount > 0 for active opportunities; require Probability between 0 and 100 inclusive. | High | Validation Boundary Test |
| **FR-22** | Opportunity | Expected Close Date cannot be in the past for active sales opportunities. | High | Date Rule Test |
| **FR-23** | Opportunity | Calculate derived Weighted Pipeline Value: `(Amount * Probability) / 100`. | High | Formula Verification |
| **FR-24** | Follow-Up | Schedule, complete, reschedule, and cancel follow-ups against Customers, Leads, and Opportunities. | High | Follow-Up Workflow |
| **FR-25** | Follow-Up | Follow-up date cannot be earlier than today (`DateTime.UtcNow.Date`) for new/planned activities. | High | Date Boundary Test |
| **FR-26** | Follow-Up | Display upcoming and overdue follow-up alerts on the dashboard and listing views. | High | Visual Alert Verification |
| **FR-27** | Activity | Log and track omnichannel sales activities: Call, Meeting, Email, Task linked to Customers and Leads. | Medium | Activity Log Test |
| **FR-28** | User Mgmt | Full administrative user management: user creation, role assignment, active/inactive toggling, lockout reset. | High | Admin RBAC Test |
| **FR-29** | User Mgmt | Never expose password hashes or security secrets in UI views or API JSON responses. | Critical | Secret Leakage Inspection |
| **FR-30** | Audit Log | Append-only audit logger capturing UserId, Action, EntityName, RecordId, OldValue, NewValue, CreatedDate, IpAddress. | Critical | Audit Immutability Test |
| **FR-31** | REST API | Expose RESTful endpoints for Customers, Leads, Opportunities, Follow-Ups, and Pipeline data using dedicated DTOs. | High | Swagger / Postman Test |
| **FR-32** | REST API | Enforce endpoint authorization and return accurate HTTP status codes (200, 201, 400, 401, 403, 404, 409). | High | API Contract Verification |
| **FR-33** | Reports | Implement 8 distinct analytical reports with sorting, filtering, and export capabilities. | High | Report Generation Test |

---

## 2. Non-Functional Requirements (NFR)
### NFR-1: Security & Compliance
- **Zero Raw Secrets**: Plaintext passwords, tokens, and salt strings must never be persisted or logged.
- **CSRF Defense**: All POST/PUT/DELETE forms must validate HTTP anti-forgery tokens.
- **SQL Injection Prevention**: 100% database queries executed through Entity Framework Core parameterized LINQ queries; raw string interpolation prohibited.
- **XSS Mitigation**: Automatic HTML encoding across Razor views; sanitization on markdown/text fields.
- **Least Privilege Access**: Server-side role enforcement on every controller action and API endpoint.

### NFR-2: Performance & Scalability
- **Sub-Second Response Times**: List queries must execute in < 200ms using proper indexed foreign keys (`CustomerId`, `AssignedTo`, `Status`).
- **Paginated Listing**: Default page size of 10 or 25 records to prevent memory exhaustion on large datasets.
- **Optimized DTO Projections**: API queries must use EF Core `.Select(dto => ...)` projections to avoid over-fetching.

### NFR-3: Reliability & Data Integrity
- **ACID Transactions**: Lead conversion and multi-entity operations wrapped in database transactions (`IDbContextTransaction`).
- **Soft Deactivation**: Core business records (Customers, Users) support deactivation to preserve relational integrity.
- **Audit Immutability**: No `DELETE` or `UPDATE` permissions exposed for `AuditLog` records.

### NFR-4: Usability & Accessibility
- **Responsive Layout**: Seamless presentation on 1920x1080 desktop, tablet (768px - 1024px), and mobile viewports.
- **Immediate Inline Feedback**: Client-side unobtrusive jQuery validation paired with server-side ModelState validation.
- **Accessible Controls**: Standard ARIA attributes, semantic HTML5, and keyboard-navigable forms.
