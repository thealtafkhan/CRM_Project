# REQUIREMENT TRACEABILITY MATRIX (RTM) — AcxiomCRM

## 1. Traceability Matrix
This matrix maps every functional and non-functional requirement from the original project specification to its architectural component, development phase, implementation task, and test case.

| Req ID | Requirement Description | Target Module | Dev Phase | Implementation Task | Verification Test Case | Status |
|---|---|---|:---:|---|---|:---:|
| **R-01** | Application Shell, Responsive Layout & Navigation | AcxiomCrm.Web | Phase 3 | Task 3.1, 3.2 | TC-UI-01, TC-UI-02 | Pending |
| **R-02** | Role-based navigation filtering (Admin, Manager, SalesExec) | AcxiomCrm.Web | Phase 3 | Task 3.2 | TC-AUTHZ-01, TC-AUTHZ-02 | Pending |
| **R-03** | Global search and filter patterns | AcxiomCrm.Web | Phase 3 | Task 3.3 | TC-UI-03 | Pending |
| **R-04** | Authentication: Login & Logout (Username/Email + Password) | Infrastructure/Web | Phase 2 | Task 2.1, 2.2 | TC-AUTH-01, TC-AUTH-02 | Pending |
| **R-05** | Cryptographic password hashing (ASP.NET Core Identity) | Infrastructure | Phase 2 | Task 2.1 | TC-SEC-01 | Pending |
| **R-06** | Password policy enforcement (min 8 chars, complexity) | Infrastructure | Phase 2 | Task 2.1 | TC-AUTH-03 | Pending |
| **R-07** | Account lockout after 5 failed attempts (15 min lockout) | Infrastructure | Phase 2 | Task 2.1 | TC-AUTH-04 | Pending |
| **R-08** | Audit logging of authentication events (success/failure) | Infrastructure | Phase 2, 7 | Task 2.4, 7.1 | TC-AUDIT-01 | Pending |
| **R-09** | CSRF prevention with Anti-Forgery tokens on POST requests | AcxiomCrm.Web | Phase 2 | Task 2.3 | TC-SEC-02 | Pending |
| **R-10** | Role-based Dashboard KPIs (Total Customers, Leads, Deals) | Application/Web | Phase 8 | Task 8.2 | TC-DASH-01, TC-DASH-02 | Pending |
| **R-11** | Chart.js visual analytics (Lead Status, Pipeline, Sales) | AcxiomCrm.Web | Phase 8 | Task 8.2 | TC-DASH-03 | Pending |
| **R-12** | Dashboard Date filters (Today, Week, Month, Custom) | AcxiomCrm.Web | Phase 8 | Task 8.2 | TC-DASH-04 | Pending |
| **R-13** | Customer Master CRUD & Search (Code, Name, Email, Phone) | Application/Web | Phase 4 | Task 4.1 | TC-CUST-01, TC-CUST-02 | Pending |
| **R-14** | Customer Email and Phone uniqueness enforcement | Domain/Application | Phase 4 | Task 4.2 | TC-VAL-01, TC-VAL-02 | Pending |
| **R-15** | Customer duplicate creation prevention | Domain/Application | Phase 4 | Task 4.2 | TC-VAL-03 | Pending |
| **R-16** | Customer history and related activity tracking | Application/Web | Phase 4 | Task 4.1 | TC-CUST-03 | Pending |
| **R-17** | Lead Management CRUD & Source capture | Application/Web | Phase 4 | Task 4.3 | TC-LEAD-01 | Pending |
| **R-18** | Lead status workflow enforcement | Domain/Application | Phase 4 | Task 4.3 | TC-LEAD-02 | Pending |
| **R-19** | Atomic conversion of Qualified Lead to Customer & Opportunity| Application | Phase 4 | Task 4.4 | TC-LEAD-03 | Pending |
| **R-20** | Opportunity Management & Stage tracking | Application/Web | Phase 5 | Task 5.1 | TC-OPP-01 | Pending |
| **R-21** | Opportunity Amount > 0 validation | Domain/Application | Phase 5 | Task 5.2 | TC-VAL-04 | Pending |
| **R-22** | Opportunity Probability between 0 and 100 validation | Domain/Application | Phase 5 | Task 5.2 | TC-VAL-05 | Pending |
| **R-23** | Opportunity Expected Close Date not in past validation | Domain/Application | Phase 5 | Task 5.2 | TC-VAL-06 | Pending |
| **R-24** | Derived Weighted Pipeline formula: `Amount * Prob / 100` | Application | Phase 5 | Task 5.3 | TC-OPP-02 | Pending |
| **R-25** | Follow-Up scheduling & management | Application/Web | Phase 6 | Task 6.1 | TC-FOL-01 | Pending |
| **R-26** | Follow-Up date not earlier than today validation | Domain/Application | Phase 6 | Task 6.1 | TC-VAL-07 | Pending |
| **R-27** | Display upcoming and overdue follow-up alerts | AcxiomCrm.Web | Phase 6 | Task 6.2 | TC-FOL-02 | Pending |
| **R-28** | Activity Management (Call, Meeting, Email, Task) | Application/Web | Phase 6 | Task 6.3 | TC-ACT-01 | Pending |
| **R-29** | User & Role Management (Admin only) | Application/Web | Phase 2, 3 | Task 2.1, 3.2 | TC-USER-01, TC-USER-02 | Pending |
| **R-30** | Account status and lockout status administration | Application/Web | Phase 2 | Task 2.1 | TC-USER-03 | Pending |
| **R-31** | Immutable Audit Log capturing user, action, old/new snapshot | Infrastructure | Phase 7 | Task 7.1, 7.2 | TC-AUDIT-02 | Pending |
| **R-32** | REST Web API endpoints for Customers, Leads, Opportunities | AcxiomCrm.Web | Phase 8 | Task 8.1 | TC-API-01, TC-API-02 | Pending |
| **R-33** | API DTO decoupling and HTTP status code accuracy | AcxiomCrm.Web | Phase 8 | Task 8.1 | TC-API-03 | Pending |
| **R-34** | 8 Analytical Reports with filtering and export | Application/Web | Phase 8 | Task 8.3 | TC-REP-01 through 08 | Pending |
| **R-35** | 14-Point Final Acceptance Test Suite | Whole Solution | Phase 8 | Task 8.4 | TC-ACC-01 through 14 | Pending |
