# SECURITY TESTING SPECIFICATION — AcxiomCRM

## 1. Vulnerability Assessment Scenarios
This document defines penetration and security testing protocols to ensure complete compliance with the security baseline:

| Test ID | Vulnerability Vector | Test Scenario | Expected Mitigation | Result |
|---|---|---|---|:---:|
| **SEC-01** | Plaintext Password Leakage | Inspect database tables, logs, and API outputs | Zero plaintext passwords or reversible hashes found | Pass |
| **SEC-02** | Cross-Site Request Forgery | Submit state-changing POST without `__RequestVerificationToken` | Request rejected with HTTP 400 Bad Request | Pass |
| **SEC-03** | SQL Injection | Inject `' OR 1=1 --` into login and search inputs | Sanitized by EF Core parameterized query; zero injection | Pass |
| **SEC-04** | Cross-Site Scripting (XSS) | Enter `<script>alert('xss')</script>` into Customer Name | Razor automatically HTML-encodes output safely | Pass |
| **SEC-05** | Horizontal Privilege Escalation | Sales Rep A submits `GET /Customers/Edit/99` owned by Rep B | System rejects request with HTTP 403 Forbidden | Pass |
| **SEC-06** | Vertical Privilege Escalation | Sales Rep submits `POST /Users/Create` | System rejects request with HTTP 403 Forbidden | Pass |
| **SEC-07** | Brute-Force Password Attack | Automate 10 consecutive failed logins on a single account | System locks account on 5th attempt for 15 minutes | Pass |
| **SEC-08** | Audit Trail Tampering | Attempt direct `DELETE FROM AuditLogs` | DbContext intercepts and throws operation prohibited exception | Pass |
