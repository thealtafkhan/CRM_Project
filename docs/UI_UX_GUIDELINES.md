# UI/UX GUIDELINES — AcxiomCRM

## 1. Design Philosophy
AcxiomCRM delivers an enterprise-grade, clean, intuitive, and distraction-free user experience tailored for high-volume sales workflows. The interface is optimized to reduce cognitive load, minimize mouse clicks, and eliminate ambiguous user actions.

---

## 2. Global Layout & Structural Hierarchy
- **Header / Navigation Bar**:
  - Sticky top navbar with branding logo, active module links, global search bar, notification alerts icon, and User Profile dropdown (showing Current Role badge and Sign Out button).
- **Sidebar / Quick Action Drawer**:
  - Left navigation menu grouping CRM modules: Dashboard, Customers, Leads, Opportunities, Follow-Ups, Activities, Reports, Administration (Admin only).
  - Highlighting active routes with contrasting accent background.
- **Main Content Stage**:
  - Breadcrumb navigation indicating current module and record hierarchy.
  - Page Header containing the title, descriptive subtitle, and primary call-to-action button (e.g. `+ Add New Lead`).
  - Fluid-width responsive container utilizing Bootstrap grid (`container-fluid`).
- **Footer**:
  - Minimalist bottom footer showing application copyright, system build version, and active environment indicator.

---

## 3. UI Component Standards
### 3.1 Data Tables & Listings
- Clean tabular presentation using Bootstrap `table table-hover align-middle`.
- Sticky column headers with ascending/descending sort indicators.
- Badges for status flags:
  - `Active` / `Won` / `Qualified`: Green (`badge bg-success`)
  - `New` / `Planned` / `Proposal`: Blue (`badge bg-primary` or `bg-info`)
  - `Contacted` / `Negotiation`: Yellow/Warning (`badge bg-warning text-dark`)
  - `Lost` / `Unqualified` / `Cancelled` / `Overdue`: Red (`badge bg-danger`)
- Unified Action buttons: View Details (Eye icon), Edit (Pencil icon), and Delete/Deactivate (Trash icon with confirmation dialog).
- Standard pagination bar with record range summary (*"Showing 1 to 10 of 45 entries"*).

### 3.2 Forms & Input UX
- Logical two-column layout for standard forms; single-column for modals.
- Mandatory fields clearly marked with red asterisks (`*`).
- Floating labels (`form-floating`) or clear top-aligned labels.
- Real-time inline feedback:
  - Green outline on valid input (`is-valid`).
  - Red outline with descriptive error text beneath field on invalid input (`is-invalid`).
- Submit buttons automatically show a spinning loader icon and disable themselves on click to prevent duplicate submissions.

### 3.3 Confirmation Modals & Destructive Actions
- Any destructive operation (e.g. Customer deactivation, Lead loss, Opportunity closure) MUST trigger a SweetAlert2 modal dialog requiring affirmative confirmation before dispatching HTTP POST.
