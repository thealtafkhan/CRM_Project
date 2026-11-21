# DESIGN SYSTEM SPECIFICATION (2-Color System) — AcxiomCRM

## 1. Strict 2-Color Master Palette

```
========================================================================================
1. PRIMARY COLOR:      #2563EB (Royal Cobalt Blue)
   - Usage: Primary CTAs, Active Navigation Pill, Metric Value Highlights, Focused Rings
   - Light Tint: #EFF6FF (Hover backgrounds, soft tag backgrounds)
   - Dark Hover: #1D4ED8

2. SECONDARY COLOR:    #0F172A (Executive Deep Slate)
   - Usage: Master Navigation Bar, High-Contrast Typography, Table Headers, Card Borders
   - Light Tint: #1E293B

SUPPORTIVE NEUTRALS:
- Canvas Background:   #F8FAFC (Clean Light Slate)
- Surface Cards:       #FFFFFF (Pure White)
- Hairline Borders:    #E2E8F0 (Slate 200)
- Secondary Text:      #475569 (Slate 600)
- Muted Text:          #94A3B8 (Slate 400)

FUNCTIONAL SIGNALS (Reserved strictly for status meaning):
- Success / Won:       #10B981 (Soft Emerald Pill: #ECFDF5)
- Danger / Lost:       #EF4444 (Soft Crimson Pill: #FEF2F2)
- Warning / Attention: #F59E0B (Soft Amber Pill: #FFFBEB)
========================================================================================
```

---

## 2. Typography
- **Primary Typeface**: `Plus Jakarta Sans`, `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
- **Monospace Typeface**: `"Fira Code", monospace` (for Customer Code, Lead Code, IP, Timestamps).
- **Scale**:
  - H1 / H2 Page Headers: `1.5rem` - `1.75rem` (24px - 28px), Bold (700)
  - Card Titles: `0.725rem` (12px), Bold (700), Uppercase letter-spacing `0.05em`
  - Body Text: `0.885rem` (14px), Regular (400), Line-height 1.5
  - Badge Pills: `0.725rem` (11.5px), Semi-bold (600), Rounded `9999px`

---

## 3. UI Component Standards
1. **KPI Metric Cards**: Compact surface card with `kpi-title` in muted uppercase, `kpi-value` in bold 28px, and a high-contrast icon wrapper.
2. **Pill Badges**: `.badge-pill` with soft background and high-contrast text (`badge-primary-soft`, `badge-secondary-soft`, `badge-success-soft`, `badge-danger-soft`).
3. **Table Container**: Bordered, rounded `12px` container with subtle borders and hover row feedback.
4. **Modals & Forms**: Rounded `14px` dialogs with subtle backdrop blur, hairline dividers, and consistent `.btn-primary` and `.btn-outline-secondary` controls.
