# TESTING STRATEGY — AcxiomCRM

## 1. Testing Philosophy
Quality assurance in AcxiomCRM is holistic, incorporating automated unit testing, database integration testing, API contract verification, role-based authorization verification, and end-to-end user acceptance scenarios.

```
       /\
      /  \      Acceptance Tests (14 Mandatory Scenarios)
     /    \
    /------\    API & Integration Tests (HTTP status codes, DB transactions)
   /        \
  /----------\  Unit Tests (Domain validation rules, business logic, DTO mapping)
```

---

## 2. Test Layers & Tools

### 2.1 Unit Testing
- **Framework**: xUnit + FluentAssertions + Moq.
- **Scope**:
  - Domain validation rules (Amount > 0, Probability 0-100, Date not in past).
  - Weighted pipeline mathematical calculation.
  - Lead status transition state machine.
  - Service-layer orchestration logic.

### 2.2 Integration Testing
- **Framework**: `Microsoft.AspNetCore.Mvc.Testing` (`WebApplicationFactory`).
- **Scope**:
  - Controller actions and Anti-CSRF token verification.
  - EF Core database queries, unique constraints, and foreign key cascades.
  - Audit interceptor transaction integrity (verifying audit rows generated on save).

### 2.3 Security & Authorization Testing
- **Scope**:
  - Horizontal privilege escalation: Verifying Sales Executive cannot view or edit peer records.
  - Vertical privilege escalation: Verifying non-admins cannot access `/Users` or `/AuditLogs`.
  - Authentication brute-force: Verifying account lockout triggers upon 5 failed attempts.

### 2.4 API Contract Testing
- **Scope**:
  - Status code verification (200, 201, 400, 401, 403, 404, 409).
  - Validation response schema matching RFC 7807 Problem Details.
  - Zero sensitive field exposure (password hashes, security stamps).
