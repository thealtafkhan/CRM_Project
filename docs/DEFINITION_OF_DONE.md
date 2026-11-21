# DEFINITION OF DONE (DoD) — AcxiomCRM

A task, feature, or development phase is considered **DONE** only when all of the following criteria are fulfilled:

1. **Requirement Adherence**: The feature satisfies 100% of the corresponding requirements from the AcxiomCRM baseline specification.
2. **Double Validation**: Both client-side unobtrusive validation and server-side `ModelState` validation are active.
3. **Authorization Check**: Server-side role-based and ownership-based authorization handlers protect the feature.
4. **Audit Trail Captured**: Any create, update, or delete operation writes an immutable entry to `AuditLog`.
5. **No Secret Leakage**: Passwords and sensitive data are excluded from models, views, and logs.
6. **Code Quality**: Code adheres to clean architecture, compiles with zero warnings/errors, and follows C# naming standards.
7. **Tested & Verified**: All relevant unit and integration test cases pass successfully.
8. **Documentation Synchronized**: `TASK_TRACKER.md`, `CHANGELOG.md`, and relevant docs are updated.
