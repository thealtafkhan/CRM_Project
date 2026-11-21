# ARCHITECTURAL DECISION RECORDS (ADR) — AcxiomCRM

## ADR-01: Multi-Tier Clean Architecture Pattern
- **Status**: Approved
- **Context**: The CRM requires high maintainability, strict testability, and technology decoupling between business rules, database access, and user presentation.
- **Decision**: Adopt a 4-tier Clean Architecture: `Domain`, `Application`, `Infrastructure`, and `Web` (Presentation + REST API).
- **Consequences**: Business logic is isolated from UI and database concerns, enabling automated unit testing of core rules without database dependencies.

---

## ADR-02: Authentication & Identity via ASP.NET Core Identity
- **Status**: Approved
- **Context**: The specification strictly mandates no custom plaintext password tables and demands standard-compliant hashing, lockout, and session handling.
- **Decision**: Utilize standard `Microsoft.AspNetCore.Identity.EntityFrameworkCore` with extended `ApplicationUser` and `ApplicationRole` classes.
- **Consequences**: Native PBKDF2/Argon2 password hashing, built-in lockout protection, and seamless integration with authentication cookies and claims-based authorization.

---

## ADR-03: Append-Only Immutable Audit Trail via EF Core Interceptor
- **Status**: Approved
- **Context**: The CRM requires tracking all critical security and data changes with old vs. new state snapshots.
- **Decision**: Implement an EF Core `SaveChangesInterceptor` (`AuditSaveChangesInterceptor`) that captures entity changes before persisting and writes audit records in the same atomic database transaction.
- **Consequences**: Zero chance of forgetting to write an audit entry when saving records; complete transparency and audit consistency.

---

## ADR-04: Hybrid Presentation: MVC Razor + Decoupled REST APIs
- **Status**: Approved
- **Context**: The specification requires both a responsive Bootstrap web application and secure REST API endpoints.
- **Decision**: Host both MVC Controllers (serving Razor views) and REST API Controllers (serving JSON DTOs) within the `AcxiomCrm.Web` host project.
- **Consequences**: Single deployment artifact, unified configuration, shared domain services, and zero code duplication between web UI and REST API.
