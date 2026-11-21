# USER ROLES AND PERMISSIONS (RBAC) — AcxiomCRM

## 1. Role Hierarchy & Principles
AcxiomCRM implements a strict Role-Based Access Control (RBAC) model augmented with Resource-Based Ownership validation. The system defines three standardized user roles:

1. **Admin (System Administrator)**: Global administrative authority over platform configuration, user provisioning, security policies, system-wide CRM records, and audit inspections.
2. **Manager (Sales Team Manager)**: Operational oversight over sales representatives, departmental lead assignments, team-wide opportunity pipelines, follow-up monitoring, and performance reports.
3. **Sales Executive (Field / Inside Sales Representative)**: Execution-level user with access strictly restricted to their individually owned or assigned customers, leads, opportunities, activities, and follow-ups.

---

## 2. Comprehensive RBAC Permission Matrix

| Module / Resource | Action | Admin | Manager | Sales Executive |
|---|---|:---:|:---:|:---:|
| **Authentication** | Login / Logout | Yes | Yes | Yes |
| | Self Password Change | Yes | Yes | Yes |
| **Dashboard** | View Global Executive Dashboard | Yes | No | No |
| | View Team / Department Dashboard | Yes | Yes | No |
| | View Personal Assigned Dashboard | Yes | Yes | Yes |
| **Customer Master** | View Global Customer Records | Yes | Yes (Team) | No (Assigned Only) |
| | Create Customer | Yes | Yes | Yes |
| | Edit Customer | Yes | Yes (Team) | Yes (Assigned Only) |
| | Delete / Deactivate Customer | Yes | Yes (Soft Only) | No |
| | Reassign Customer Owner | Yes | Yes | No |
| **Lead Management** | View All Leads | Yes | Yes (Team) | No (Assigned Only) |
| | Create Lead | Yes | Yes | Yes |
| | Edit Lead Details | Yes | Yes (Team) | Yes (Assigned Only) |
| | Assign Lead to Sales Executive | Yes | Yes | No |
| | Update Lead Status | Yes | Yes (Team) | Yes (Assigned Only) |
| | Convert Lead to Customer/Opp | Yes | Yes | Yes (Assigned Only) |
| | Delete Lead | Yes | No | No |
| **Opportunity** | View All Opportunities | Yes | Yes (Team) | No (Assigned Only) |
| | Create Opportunity | Yes | Yes | Yes |
| | Edit Opportunity / Change Stage | Yes | Yes (Team) | Yes (Assigned Only) |
| | Close Deal (Won / Lost) | Yes | Yes (Team) | Yes (Assigned Only) |
| | Delete Opportunity | Yes | No | No |
| **Follow-Up** | Schedule Follow-Up | Yes | Yes | Yes |
| | View Follow-Up Schedule | Yes | Yes (Team) | Yes (Assigned Only) |
| | Complete / Reschedule Follow-Up | Yes | Yes (Team) | Yes (Assigned Only) |
| | Cancel Follow-Up | Yes | Yes | No |
| **Activity Tracking**| Log Call / Meeting / Email / Task | Yes | Yes | Yes |
| | View Activity History | Yes | Yes (Team) | Yes (Assigned Only) |
| **User Management** | Create Application User | Yes | No | No |
| | Edit User Profile | Yes | Limited | No |
| | Activate / Deactivate User | Yes | No | No |
| | Unlock Locked Account | Yes | No | No |
| | Reset User Password | Yes | No | No |
| **Role Management** | View Role Definitions | Yes | No | No |
| | Assign / Modify User Roles | Yes | No | No |
| **Audit Log** | View System Security Audit Log | Yes | No | No |
| | View Business Record Changes | Yes | Limited (Team) | No |
| | Purge / Modify Audit Records | **NO (Forbidden)** | **NO (Forbidden)** | **NO (Forbidden)** |
| **REST API** | Access Public Auth Endpoints | Yes | Yes | Yes |
| | Access Protected CRM Endpoints | Yes (Full) | Yes (Team Scoped)| Yes (Assigned Scoped) |
| **Reports** | Customer Master Report | Yes | Yes (Team) | Yes (Assigned Only) |
| | Lead Conversion Report | Yes | Yes (Team) | Yes (Assigned Only) |
| | Follow-Up Performance Report | Yes | Yes (Team) | Yes (Assigned Only) |
| | Opportunity & Pipeline Reports | Yes | Yes (Team) | Yes (Assigned Only) |
| | Sales Performance Summary | Yes | Yes | No |
| | User Activity Report | Yes | Yes (Team) | No |
| | Security & Audit Event Report | Yes | No | No |

---

## 3. Server-Side Enforcement Mechanisms
1. **Controller-Level Authorization**: Evaluated via standard ASP.NET Core `[Authorize(Roles = "Admin,Manager")]` attributes.
2. **Resource-Based Authorization Handlers**: When a user accesses an entity (e.g. `GET /Customers/Edit/5`), the `CustomerAuthorizationHandler` checks:
   - Is user in `Admin` role? -> **Grant Access**.
   - Is user in `Manager` role? -> Check if record owner belongs to the manager's assigned team -> **Grant Access**.
   - Is user in `Sales Executive` role? -> Compare `record.AssignedTo == currentUserId` -> If match: **Grant Access**; If mismatch: **Return 403 Forbidden**.
3. **Query-Level Scoping**: Database LINQ expressions automatically append ownership filters:
   ```csharp
   if (User.IsInRole("SalesExecutive"))
   {
       query = query.Where(c => c.AssignedTo == currentUserId);
   }
   ```
4. **UI Masking**: Navigation links, action buttons (Edit, Delete, Convert), and dropdown actions are rendered conditionally using Razor tag helpers, but backend enforcement remains authoritative.
