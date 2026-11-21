# AcxiomCRM — Enterprise Customer Relationship Management System

## Project Overview
AcxiomCRM is an enterprise-grade, role-based web CRM application designed to manage the end-to-end sales lifecycle—from lead acquisition and qualification to follow-ups, activity management, opportunity pipelines, customer conversion, and comprehensive reporting.

The system is built strictly in accordance with the **AcxiomCRM Functional & Technical Project Documentation Specification** baseline, adhering to strict multi-tier architecture, role-based authorization (Admin, Manager, Sales Executive), multi-level input and business validation, tamper-evident audit logging, secure REST APIs, and interactive Chart.js analytics.

---

## Key Highlights & Capabilities
- **Role-Based Workflows**: Tailored portals and data visibility for Administrator, Sales Manager, and Sales Executive.
- **Full Sales Lifecycle**: Lead capturing, qualification scoring, conversion to Customer & Opportunity, pipeline progression with weighted valuation.
- **Follow-up & Activity Tracking**: Scheduling future tasks, calls, meetings, emails with strict anti-backdating business rules.
- **Multi-Level Validation**: Combined client-side (unobtrusive feedback) and server-side model state verification, preventing unauthorized modifications.
- **Enterprise Security**: ASP.NET Core Identity authentication, cryptographic password hashing, strict password complexity policies, brute-force lockout, anti-forgery tokens (`ValidateAntiForgeryToken`), and zero-leakage error handling.
- **Audit Logging**: Immutable, append-only security and business audit trail capturing user, action, old/new values, IP address, and timestamps.
- **Decoupled REST API**: High-performance REST endpoints exposing Customers, Leads, Opportunities, and Reports using strongly typed DTOs and HTTP semantics.
- **Modern Responsive UI**: Bootstrap-powered interface with interactive Chart.js dashboards, global search, filtering, and pagination.

---

## Documentation Index
Comprehensive project documentation is maintained under the [`docs/`](./docs) directory:

| Category | Document | Description |
|---|---|---|
| **Core & Requirements** | [`docs/PROJECT_OVERVIEW.md`](./docs/PROJECT_OVERVIEW.md) | Business scenario, scope & objectives |
| | [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md) | Functional & non-functional requirements |
| | [`docs/FEATURES.md`](./docs/FEATURES.md) | Comprehensive feature catalog |
| | [`docs/USER_ROLES_AND_PERMISSIONS.md`](./docs/USER_ROLES_AND_PERMISSIONS.md) | RBAC matrix & scope definitions |
| | [`docs/ACCEPTANCE_CRITERIA.md`](./docs/ACCEPTANCE_CRITERIA.md) | Explicit pass/fail evaluation criteria |
| **Architecture & Design** | [`docs/TECH_STACK.md`](./docs/TECH_STACK.md) | Approved technologies, libraries & tools |
| | [`docs/SYSTEM_ARCHITECTURE.md`](./docs/SYSTEM_ARCHITECTURE.md) | Layered multi-tier architecture breakdown |
| | [`docs/PROJECT_STRUCTURE.md`](./docs/PROJECT_STRUCTURE.md) | File & directory organizational structure |
| | [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md) | Entities, relationships, constraints & keys |
| | [`docs/API_SPECIFICATION.md`](./docs/API_SPECIFICATION.md) | REST API endpoints, DTOs & status codes |
| | [`docs/DATA_FLOW.md`](./docs/DATA_FLOW.md) | End-to-end data pipelines & workflows |
| **UI/UX & Design** | [`docs/UI_UX_GUIDELINES.md`](./docs/UI_UX_GUIDELINES.md) | Layout, navigation & UX patterns |
| | [`docs/DESIGN_SYSTEM.md`](./docs/DESIGN_SYSTEM.md) | Colors, typography, spacing & controls |
| | [`docs/RESPONSIVE_DESIGN.md`](./docs/RESPONSIVE_DESIGN.md) | Mobile, tablet & desktop viewport rules |
| **Security & Quality** | [`docs/SECURITY_POLICY.md`](./docs/SECURITY_POLICY.md) | Overall application security baseline |
| | [`docs/AUTHENTICATION.md`](./docs/AUTHENTICATION.md) | Identity, lockout, cookies & reset flows |
| | [`docs/AUTHORIZATION.md`](./docs/AUTHORIZATION.md) | Policy-based & resource-based access |
| | [`docs/VALIDATION_RULES.md`](./docs/VALIDATION_RULES.md) | Client, server & business rule catalog |
| | [`docs/ERROR_HANDLING.md`](./docs/ERROR_HANDLING.md) | Global exception filter & friendly responses |
| | [`docs/CODING_STANDARDS.md`](./docs/CODING_STANDARDS.md) | C# / ASP.NET Core naming & design patterns |
| | [`docs/DEVELOPMENT_RULES.md`](./docs/DEVELOPMENT_RULES.md) | Mandatory implementation standards |
| **Roadmap & Tracking** | [`docs/DEVELOPMENT_PHASES.md`](./docs/DEVELOPMENT_PHASES.md) | Phase-wise development milestones |
| | [`docs/TASK_TRACKER.md`](./docs/TASK_TRACKER.md) | Live task progress & status tracking |
| | [`docs/REQUIREMENT_TRACEABILITY.md`](./docs/REQUIREMENT_TRACEABILITY.md) | PDF requirement to implementation mapping |
| | [`docs/ARCHITECTURE_DECISIONS.md`](./docs/ARCHITECTURE_DECISIONS.md) | Architectural Decision Records (ADRs) |
| | [`docs/CHANGELOG.md`](./docs/CHANGELOG.md) | Version history & milestone increments |
| **Testing & QA** | [`docs/TESTING_STRATEGY.md`](./docs/TESTING_STRATEGY.md) | Multi-tier test methodology |
| | [`docs/TEST_CASES.md`](./docs/TEST_CASES.md) | End-to-end functional test cases |
| | [`docs/SECURITY_TESTING.md`](./docs/SECURITY_TESTING.md) | Vulnerability & authorization test suites |
| | [`docs/BUG_TRACKER.md`](./docs/BUG_TRACKER.md) | Issue log, severity & resolution tracking |
| **DevOps & Maintenance** | [`docs/INSTALLATION_GUIDE.md`](./docs/INSTALLATION_GUIDE.md) | Local development environment setup |
| | [`docs/ENVIRONMENT_VARIABLES.md`](./docs/ENVIRONMENT_VARIABLES.md) | Configuration settings & secrets |
| | [`docs/DEPLOYMENT_GUIDE.md`](./docs/DEPLOYMENT_GUIDE.md) | IIS, Docker & Cloud deployment steps |
| | [`docs/MAINTENANCE_GUIDE.md`](./docs/MAINTENANCE_GUIDE.md) | Backup, health checks & troubleshooting |
| **AI Governance** | [`docs/AI_INSTRUCTIONS.md`](./docs/AI_INSTRUCTIONS.md) | Strict guidelines for AI engineering agents |
| | [`docs/DEFINITION_OF_DONE.md`](./docs/DEFINITION_OF_DONE.md) | Rigorous checklist for task completion |

---

## Quick Start
Refer to [`docs/INSTALLATION_GUIDE.md`](./docs/INSTALLATION_GUIDE.md) for complete instructions on prerequisites, database initialization, seeding initial users, and starting the development server.
