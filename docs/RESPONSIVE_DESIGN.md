# RESPONSIVE DESIGN SPECIFICATION — AcxiomCRM

## 1. Breakpoint Grid Matrix
AcxiomCRM adopts the standard Bootstrap 5 responsive grid breakpoints:

| Device Target | Breakpoint Prefix | Viewport Range | Layout Configuration |
|---|---|---|---|
| **Extra Small (Mobile)** | `xs` | < 576px | Single column vertical stack, off-canvas sliding sidebar menu, condensed table cards. |
| **Small (Mobile Landscape)** | `sm` | ≥ 576px | 2-column KPI cards, full-width forms. |
| **Medium (Tablets)** | `md` | ≥ 768px | Collapsible sidebar, 2-column form grids, standard tabular listings with horizontal scroll. |
| **Large (Laptops/Desktops)** | `lg` | ≥ 992px | Fixed left sidebar, multi-column dashboard analytics, 3-column form sections. |
| **Extra Large (Wide Monitors)** | `xl` | ≥ 1200px | Expanded data tables, multi-pane side-by-side Customer 360 view. |

---

## 2. Responsive UI Behaviors
- **Mobile Navigation**: On screens < 992px, the desktop sidebar collapses into an accessible off-canvas drawer triggered by a hamburger icon in the sticky header.
- **Data Table Adaptation**:
  - Horizontal scroll container (`table-responsive`) wraps all listings to prevent layout breaking on small screens.
  - Secondary metadata columns (e.g. CreatedDate, CustomerCode) are hidden on mobile using `d-none d-md-table-cell`.
- **Chart.js Resizing**: All Chart.js canvas elements specify `responsive: true` and `maintainAspectRatio: false` with height bound to parent container.
