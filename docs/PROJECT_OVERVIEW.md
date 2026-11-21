# PROJECT OVERVIEW — AcxiomCRM

## 1. Executive Summary
**AcxiomCRM** is an enterprise-level Customer Relationship Management web application engineered for sales organizations to streamline the entire customer acquisition and retention lifecycle. Built in strict conformance with the *AcxiomCRM Functional & Technical Project Documentation Specification*, it empowers organizations to manage leads, opportunities, follow-up interactions, omnichannel sales activities, customer accounts, users, and audit trails.

## 2. Business Scenario
A modern commercial enterprise requires coordinated sales execution. Different tiers of sales professionals interact with the CRM:
- **Sales Executives** originate leads, log interactions (calls, meetings, emails, tasks), schedule and execute follow-ups, and convert qualified leads into customers and active opportunities. They manage their assigned accounts without seeing or modifying peer portfolios.
- **Sales Managers** oversee regional or team-level sales operations, monitor aggregate sales pipelines, review conversion ratios, reassign unassigned or stalled leads, and inspect performance metrics.
- **Administrators** control system governance, manage user credentials and lifecycle (activation/deactivation/lockout resets), oversee roles and security policies, inspect system-wide audit logs, and configure platform parameters.

## 3. Core Objectives
1. **End-to-End Sales Pipeline Tracking**: Track customer prospects seamlessly from initial inquiry (`New` lead) through qualification, opportunity negotiation, and final contract win/loss.
2. **Prevent Lead Leakage & Strict Follow-Up Compliance**: Enforce automated tracking of pending, upcoming, and overdue follow-ups with business rules prohibiting backdating of planned touchpoints.
3. **Role-Based Security & Data Scoping**: Prevent horizontal privilege escalation; Sales Executives access only assigned records, Managers access departmental portfolios, and Admins maintain governance over all records.
4. **Auditability & Regulatory Compliance**: Maintain an immutable, append-only record of all critical events (logins, failed attempts, record additions, field mutations with old vs. new values, deletions, role updates).
5. **Decoupled API Integration**: Expose REST endpoints with strict DTO boundaries, HTTP status codes, and input validation to enable external connectivity.
6. **Data-Driven Sales Intelligence**: Provide real-time KPI cards and visual Chart.js dashboards reflecting accurate, authorized sales analytics.

## 4. Scope of the System
### In Scope
- Application Shell with responsive Bootstrap styling, role-based navigation, global search, and alerts.
- ASP.NET Core Identity authentication with Argon2id/PBKDF2 hashing, lockout after failed attempts, and password complexity enforcement.
- Role-Based Access Control (Admin, Manager, Sales Executive).
- Customer Master Management (uniqueness rules on email/phone, code generation, audit tracking).
- Lead Management (source capture, status progression, lead scoring/expected value, qualification, customer/opportunity conversion).
- Opportunity Management (pipeline stages, probability 0-100%, Amount > 0, weighted pipeline calculation, close date validations).
- Follow-up Management (scheduling, completing, rescheduling, anti-backdating rule, overdue indicators).
- Activity Management (Calls, Meetings, Emails, Tasks linked to Customers and Leads).
- User & Role Administration (user creation, role binding, activation toggle, lockout unlock, password reset).
- Audit Logging (user, entity, record ID, old/new snapshot values, client IP, action timestamp).
- REST APIs for CRM resources with DTO encapsulation and authentication.
- Reporting Engine (8 distinct analytical reports with filtering and export capabilities).

### Out of Scope
- Direct payment gateway processing.
- Direct VoIP telephony hardware integration (activities are logged within CRM).
- Direct SMTP mailserver hosting (email activities tracked as CRM logs or sent via external SMTP gateway).
