# TEST CASES SPECIFICATION — AcxiomCRM

## 1. Authentication & Security Test Cases
- **TC-AUTH-01**: Valid login redirects to Dashboard with authenticated cookie.
- **TC-AUTH-02**: Invalid credentials display generic error message without revealing user existence.
- **TC-AUTH-03**: Password policy rejects passwords < 8 characters or missing required character classes.
- **TC-AUTH-04**: Account locks after 5 consecutive failed login attempts for 15 minutes.
- **TC-AUTH-05**: Logout invalidates session and prevents navigating back to protected pages.

---

## 2. Authorization & RBAC Test Cases
- **TC-AUTHZ-01**: Anonymous user attempting to access `/Dashboard` is redirected to `/Account/Login`.
- **TC-AUTHZ-02**: Sales Executive accessing `/Users` or `/AuditLogs` receives HTTP 403 Forbidden.
- **TC-AUTHZ-03**: Sales Executive accessing another rep's customer details receives HTTP 403 Forbidden.
- **TC-AUTHZ-04**: Manager can view all team leads but cannot perform user security administration.

---

## 3. Business Validation Test Cases
- **TC-VAL-01**: Creating customer with invalid email format is rejected by both client and server.
- **TC-VAL-02**: Creating customer with invalid phone format is rejected by both client and server.
- **TC-VAL-03**: Creating customer with duplicate email or phone returns conflict validation error.
- **TC-VAL-04**: Creating opportunity with `Amount <= 0` is rejected with: *"Opportunity Amount must be greater than 0."*
- **TC-VAL-05**: Creating opportunity with `Probability > 100` is rejected with: *"Probability must be between 0 and 100."*
- **TC-VAL-06**: Creating active opportunity with `ExpectedCloseDate < Today` is rejected with: *"Expected Close Date cannot be in the past."*
- **TC-VAL-07**: Creating planned follow-up with `FollowUpDate < Today` is rejected with: *"Follow-up date cannot be earlier than today."*

---

## 4. Workflow Test Cases
- **TC-LEAD-01**: Lead progresses through valid statuses (`New` -> `Contacted` -> `Qualified`).
- **TC-LEAD-02**: Converting a Qualified Lead atomically creates Customer and Opportunity records, marks lead as `Converted`, and logs audit trail.
- **TC-OPP-01**: Weighted pipeline value accurately calculates `(Amount * Probability) / 100`.
- **TC-AUDIT-01**: Every record creation, update, and deletion writes an immutable entry into `AuditLog` capturing old vs. new values.

---

## 5. REST API Test Cases
- **TC-API-01**: `/api/customers` returns paginated DTO list without exposing internal database entities.
- **TC-API-02**: `/api/customers` POST with duplicate email returns HTTP 409 Conflict.
- **TC-API-03**: Protected API endpoints return HTTP 401 Unauthorized when requested without authentication.
