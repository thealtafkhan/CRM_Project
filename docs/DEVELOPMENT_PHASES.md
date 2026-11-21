# DEVELOPMENT PHASES & ROADMAP — AcxiomCRM

The project is structured into **8 logical development phases** to ensure systematic delivery, complete testability, and continuous verification:

```
Phase 1: Solution Architecture, Database Initialization & Seed Data
   │
Phase 2: Authentication, ASP.NET Core Identity & Security Baseline
   │
Phase 3: Core Application Shell, Layout & Role Navigation
   │
Phase 4: Customer Master & Lead Management Engine (with Atomic Conversion)
   │
Phase 5: Opportunity Pipeline & Weighted Forecasting
   │
Phase 6: Follow-Up & Omnichannel Activity Tracking (Anti-Backdating)
   │
Phase 7: Immutable Enterprise Audit Trail & Centralized Interceptors
   │
Phase 8: REST Web API, Chart.js Dashboards, Analytical Reporting & Final Verification
```

---

## Detailed Phase Breakdown

### Phase 1: Solution Architecture, Database Initialization & Seed Data
- **Objective**: Establish multi-layer project structure, Entity Framework Core DbContext, migrations, and database seed scripts.
- **Deliverables**: Domain entities, Fluent API configurations, repository interfaces, initial EF Core migration, and database initializer.

### Phase 2: Authentication, Identity & Security Baseline
- **Objective**: Implement ASP.NET Core Identity, password hashing, lockout logic, and Anti-CSRF protection.
- **Deliverables**: AccountController, Login/Register/Logout views, lockout policies, and auth unit tests.

### Phase 3: Core Application Shell & Role Navigation
- **Objective**: Build responsive Bootstrap 5 application layout, dynamic role-based navigation menus, alerts, and modal dialogs.
- **Deliverables**: `_Layout.cshtml`, sidebar, breadcrumbs, user profile dropdown, and role-based UI filters.

### Phase 4: Customer Master & Lead Management Engine
- **Objective**: Implement Customer and Lead CRUD, validation (email/phone uniqueness), and atomic Lead-to-Customer conversion.
- **Deliverables**: CustomersController, LeadsController, Razor views, validation rules, and conversion transaction logic.

### Phase 5: Opportunity Pipeline & Weighted Forecasting
- **Objective**: Implement Opportunity management, pipeline stage transitions, mathematical weighted calculations, and date rules.
- **Deliverables**: OpportunitiesController, stage pipeline UI, weighted pipeline formulas, and validation checks.

### Phase 6: Follow-Up & Activity Tracking
- **Objective**: Implement Follow-up scheduling, overdue detection, anti-backdating rule, and Call/Meeting/Email activity logging.
- **Deliverables**: FollowUpsController, ActivitiesController, overdue visual indicators, and date boundary enforcement.

### Phase 7: Immutable Enterprise Audit Trail
- **Objective**: Build append-only audit logger capturing logins, record mutations (old vs. new values), and admin audit viewer.
- **Deliverables**: `AuditSaveChangesInterceptor`, AuditLogsController, and audit filter view.

### Phase 8: REST Web APIs, Analytics & Final Verification
- **Objective**: Build secure REST API controllers, Chart.js visual dashboards, 8 analytical reports, and execute full acceptance test suite.
- **Deliverables**: API Controllers, Swagger documentation, Chart.js scripts, ReportsController, and compliance report.
