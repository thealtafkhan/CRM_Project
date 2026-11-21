# FEATURES CATALOG — AcxiomCRM

## 1. Feature Architecture Overview
AcxiomCRM encompasses nine core functional subsystems designed to deliver an integrated sales operations experience.

```
AcxiomCRM Solution
├── 1. Authentication & Identity
├── 2. Executive & Operational Dashboards
├── 3. Customer Master Management
├── 4. Lead Capture & Conversion Engine
├── 5. Opportunity Pipeline & Weighted Forecasting
├── 6. Follow-Up & Omnichannel Activity Tracking
├── 7. User Administration & Access Control
├── 8. Immutable Enterprise Audit Trail
└── 9. Analytical Reporting & Business Intelligence
```

---

## 2. Detailed Feature Descriptions

### Feature 1: Authentication & Identity Management
- **Universal Sign-In**: Supports authentication via either registered Username or Email address.
- **Adaptive Hash Storage**: Implements ASP.NET Core Identity password security (PBKDF2 with HMAC-SHA256, 100,000+ iterations).
- **Enforced Password Policy**: Minimum 8 characters, requiring at least one lowercase letter, one uppercase letter, one digit, and one non-alphanumeric character.
- **Brute-Force Lockout Protection**: Automatic account lock for 15 minutes upon 5 consecutive failed attempts.
- **Secure Sign-Out**: Invalidation of authentication cookie and termination of server session.
- **Administrative Unlock**: Administrators can manually clear lockout flags for locked accounts.

### Feature 2: Role-Tailored Dashboards & Visual Analytics
- **Executive KPI Metrics**:
  - Total Customers count (scoped to user permission).
  - Total Leads & Open Leads count.
  - Total Opportunities, Open Opportunities, Won, and Lost counts.
  - Cumulative Pipeline Monetary Value ($ / ₹).
- **Visual Chart.js Dashboards**:
  - **Lead Status Doughnut Chart**: Distribution of leads across `New`, `Contacted`, `Qualified`, `Unqualified`, `Converted`, `Lost`.
  - **Opportunity Pipeline Funnel/Bar Chart**: Value and volume across `Qualification`, `Proposal`, `Negotiation`, `Won`, `Lost`.
  - **Monthly Sales Trend Chart**: Bar/line chart illustrating month-over-month revenue generated from `Won` opportunities.
- **Temporal Filter Engine**: One-click toggles for `Today`, `This Week`, `This Month`, and `Custom Date Range`.

### Feature 3: Customer Master Management
- **Standardized Profile**: Captures Customer Code, Full Name, Email, Primary Phone, Company, Street Address, City, State, Status (`Active`/`Inactive`), Created Date, and Assigned Owner.
- **Duplicate Prevention Engine**: Enforces strict unique constraints on Email and Phone numbers before persisting.
- **Customer 360 View**: Dedicated details page presenting customer profile, historical opportunities, scheduled follow-ups, and activity interaction logs in unified tabs.
- **Soft Deactivation**: Allows safe deactivation rather than cascade deletion to protect historical accounting and audit integrity.

### Feature 4: Lead Lifecycle & Conversion Engine
- **Lead Capture**: Records prospect information with customizable acquisition source (Website, Referral, Cold Call, Campaign, Partner).
- **Lead Qualification Workflow**: Controlled transitions across statuses:
  - `New` -> Initial lead captured.
  - `Contacted` -> Sales rep established communication.
  - `Qualified` -> Prospect confirmed budget, authority, need, and timeline (BANT).
  - `Unqualified` -> Prospect does not match ideal customer profile.
  - `Converted` -> Prospect graduated to paying customer.
  - `Lost` -> Deal ceased.
- **One-Click Lead Conversion**: Atomically converts a `Qualified` lead into a new `Customer` record while creating a corresponding `Opportunity`, copying contact and valuation attributes, and locking the lead state to `Converted`.

### Feature 5: Opportunity Pipeline & Weighted Forecasting
- **Pipeline Stage Management**: Tracks deal progression through defined stages:
  1. *Qualification* (Probability: 10% - 25%)
  2. *Proposal / Quote* (Probability: 40% - 60%)
  3. *Negotiation / Review* (Probability: 70% - 85%)
  4. *Closed Won* (Probability: 100%, Status: Closed)
  5. *Closed Lost* (Probability: 0%, Status: Closed)
- **Mathematical Weighted Forecasting**: Automatically computes `Weighted Value = (Amount * Probability) / 100` for sales forecasting accuracy.
- **Temporal Guardrails**: Rejects active opportunities where Expected Close Date is set in the past.
- **Monetary Boundaries**: Enforces `Amount > 0` for all active deals.

### Feature 6: Follow-Up & Omnichannel Activity Tracking
- **Touchpoint Scheduling**: Schedule follow-ups with defined subjects, target date/time, interaction type (Call, Meeting, Video Conference, Email), priority, and assigned representative.
- **Anti-Backdating Validation**: Strictly blocks creation of new planned follow-ups with scheduled dates in the past.
- **Status Lifecycle**: Supports `Planned`, `Completed`, `Missed`, and `Cancelled`.
- **Automated Overdue Detection**: Identifies and flags follow-ups whose target date has passed while remaining in `Planned` state.
- **Activity Log Subsystem**: Allows logging of ad-hoc calls, meetings, emails, and tasks with granular notes linked to customer/lead profiles.

### Feature 7: User Administration & RBAC Management
- **User Provisioning**: Admin interface to create new personnel accounts, assign primary roles, and configure initial credentials.
- **Role Scoping Engine**:
  - `Admin`: Unrestricted access across all operational data, user administration, security policies, and system audit logs.
  - `Manager`: Access to departmental/team customer records, lead distribution, opportunity pipeline, and managerial reports.
  - `Sales Executive`: Restrictive access to only assigned customer accounts, personal leads, active deals, and scheduled follow-ups.
- **Account Health Monitoring**: Real-time display of user status (`Active`/`Inactive`), lockout state, and failed attempt count.

### Feature 8: Immutable Enterprise Audit Trail
- **Comprehensive Event Capture**: Tracks `Login`, `Failed Login`, `Logout`, `Create`, `Update`, `Delete`, `Role Change`, and `Security Administration`.
- **Change Delta Tracking**: Records JSON snapshots of `OldValue` vs. `NewValue` upon record updates.
- **Tamper Resistance**: Audit table is strictly append-only; database context blocks `Update` and `Delete` calls on `AuditLog` entities.
- **Multi-Parameter Audit Filter**: Search logs by User ID, Target Entity, Action Type, and Timestamp Range.

### Feature 9: Analytical Reporting & Data Export
- **8 Pre-Built Standard Reports**:
  1. *Customer Master Report*
  2. *Lead Pipeline & Conversion Report*
  3. *Follow-Up Performance & Overdue Report*
  4. *Opportunity Stage & Value Report*
  5. *Stage-wise & Owner-wise Pipeline Report*
  6. *Sales Conversion Efficiency Report*
  7. *User & Sales Rep Activity Report*
  8. *Security & Audit Compliance Report*
- **Export Capabilities**: Supports tabular data export to CSV and Excel-compatible formats.
