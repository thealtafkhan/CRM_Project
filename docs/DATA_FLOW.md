# DATA FLOW & WORKFLOW SPECIFICATION — AcxiomCRM

## 1. Core End-to-End Workflows

### 1.1 Lead-to-Customer & Opportunity Conversion Workflow
The primary revenue lifecycle moves from raw inquiry to satisfied paying client.

```
+---------------+     1. Capture Prospect      +------------------------+
| Inbound Lead  | ---------------------------> | Lead Entity (`New`)    |
+---------------+                              +------------------------+
                                                           |
                                                   2. Assignment
                                                           v
                                               +------------------------+
                                               | Sales Executive Review |
                                               +------------------------+
                                                           |
                                                3. Touchpoint & Contact
                                                           v
                                               +------------------------+
                                               | Lead (`Contacted`)     |
                                               +------------------------+
                                                           |
                                                4. BANT Qualification
                                                           v
                                               +------------------------+
                                               | Lead (`Qualified`)     |
                                               +------------------------+
                                                           |
                                    5. Conversion Request (Single Atomic Tx)
                                                           |
                      +------------------------------------+------------------------------------+
                      |                                                                         |
                      v                                                                         v
+------------------------------------+                                     +------------------------------------+
| Create Customer Entity             |                                     | Create Opportunity Entity          |
| - Code, Name, Email, Phone         |                                     | - Name, Amount, ExpectedCloseDate  |
| - Address, Company, OwnerId        |                                     | - Stage: Qualification, 20% Prob   |
+------------------------------------+                                     +------------------------------------+
                      |                                                                         |
                      +------------------------------------+------------------------------------+
                                                           |
                                            6. Update Lead (`Converted`)
                                                           v
                                            7. Append-Only Audit Entry
                                            - "Lead 105 Converted by User 42"
```

---

### 1.2 Opportunity Pipeline Progression Workflow
Tracks monetary potential from initial interest through negotiation to won or lost.

```
[Qualification] (Prob: 20%)
       |
       v
[Proposal / Quotation] (Prob: 50%) ---> Validates: Amount > 0, ExpectedCloseDate >= Today
       |
       v
[Negotiation / Review] (Prob: 80%) ---> Re-computes: Weighted Value = (Amount * 80) / 100
       |
       +-----------------------+-----------------------+
       |                                               |
       v                                               v
[Closed Won] (Prob: 100%)                       [Closed Lost] (Prob: 0%)
- Status: Won                                   - Status: Lost
- Generates Win Audit Event                     - Requires Loss Reason Note
- Adds to Monthly Sales Report                  - Excluded from Active Pipeline
```

---

### 1.3 Follow-Up & Touchpoint Lifecycle
Guarantees anti-backdating and timely sales follow-ups.

```
User Schedules Follow-Up
          |
          v
Server-Side Guardrail:
Is FollowUpDate >= DateTime.UtcNow.Date?
          |
     +----+----+
     |         |
    NO        YES
     |         |
     v         v
Reject 400   Persist FollowUp (`Planned`)
             Audit Action Logged
                     |
                     +---------------------------------------+
                     |                                       |
           Target Date Arrives                      Target Date Passes
                     |                              without completion
                     v                                       v
             Touchpoint Occurs                      Automated Overdue Flag
                     |                              Highlighted on Dashboard
       +-------------+-------------+
       |                           |
       v                           v
Mark as `Completed`        Request Reschedule
- Record Remarks           - Check New Date >= Today
- Update Customer History  - Update Date & Audit Log
```

---

### 1.4 Audit Logging Interceptor Pipeline
Every database write traverses the EF Core audit interceptor.

```
Client Action (POST / PUT / DELETE)
       |
       v
Controller / API Layer (Validation & RBAC)
       |
       v
Service Layer executes Business Operation
       |
       v
DbContext.SaveChangesAsync()
       |
       v
[AuditSaveChangesInterceptor]
       |
       +---> Inspects EF Core ChangeTracker
       |     - Detects Modified / Added / Deleted Entities
       |     - Generates JSON snapshot of Modified properties (Old vs. New)
       |     - Obtains Current UserId and Client IP Address
       |
       +---> Inserts record into `AuditLogs` within the SAME atomic database transaction
       |
       v
Database Commit Successful (Data + Audit Persisted Atomically)
```
