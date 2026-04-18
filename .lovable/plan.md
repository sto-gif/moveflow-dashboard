

# Final Polish Plan

12 fixes across data realism, kanban styling, charts, and small UI tweaks.

## Investigation needed

Will read these files in implementation:
- `src/mocks/jobs.ts`, `quotes.ts`, `leads.ts`, `customers.ts` — renumber + reprice + resize
- `src/mocks/notifications.ts` — variety
- `src/routes/_app.index.tsx` — revenue chart curve + line styling
- `src/routes/_app.jobs.tsx`, `_app.leads.index.tsx`, `_app.customers.index.tsx` — confirm Customers card style; align Jobs/Leads
- `src/routes/_app.calendar.tsx` — month view label
- `src/routes/_app.reports.tsx` — date range dropdown + pie legend
- `src/routes/_app.lager.tsx` — search bar
- `src/routes/_app.koretojer.tsx` (Materialer) — remove sync badge
- `src/routes/_app.brief.index.tsx` or quote builder location — date prefill
- `src/routes/_app.leads.$leadId.tsx` — confirm timeline/quotes/notes structure
- `src/components/kanban-board.tsx` — column bg, card border, hover shadow

## Fixes grouped

**A. Data realism (#1)**
- `mocks/jobs.ts`: renumber from #1847 with realistic gaps (skip ~10–15% of IDs). Resize volumes into 4 buckets: studio 8–12 m³ (a few), apartment 25–40 m³ (most), villa 65–90 m³ (some), commercial 110–140 m³ (1–2). Reprice all amounts to non-round values (e.g. 23 847, 34 519, 9 312, occasional `,50`). Mix in 2–3 long business names and 2–3 short ("Lars H.") plus a couple with `notes` so cards render taller.
- `mocks/quotes.ts`, `mocks/leads.ts`, `mocks/customers.ts`: same depan-rounding pass for any prices/values. Vary row counts so some tables are 7 rows, some 23 (achieved by adding/removing seed rows).
- `mocks/notifications.ts`: rewrite ~5 entries with mixed urgency + length. Add `urgent: true` flag on one (red dot rendered in topbar dropdown).

**B. Revenue chart (#2, #12)** in `_app.index.tsx`
- Replace `revenueData` with the exact 12-month sequence: May 165, Jun 195, Jul 220, Aug 235, Sep 210, Oct 190, Nov 175, Dec 145, Jan 140, Feb 160, Mar 185, Apr 199 — each value jittered by ±2–4k for irregularity.
- Update insight text to "Omsætning er steget 21 % sammenlignet med sidste år. Sommer er jeres største sæson."
- Recharts `<Line strokeWidth={2} dot={{ r: 3 }} />` + `<Area>` with light blue gradient (`from-blue-200/30 to-transparent`).

**C. Kanban styling (#3)** in `components/kanban-board.tsx`
- Already inspected: column wrapper currently has no background. Update CSS classes (or `kanban-column` in `styles.css`) so:
  - column: `bg-slate-50` (#F8FAFC), rounded, header with `border-b border-slate-200`, padding
  - card wrapper: white bg, `border border-slate-200`, `rounded-md`, `p-3`, `hover:shadow-sm transition-shadow duration-120`
  - card gap: 12px (`gap-3`)
- Verify Customers kanban already uses this; if it has its own card chrome, mirror to Jobs/Leads renderCards.

**D. Lovable badge (#4)**
- Use `publish_settings--set_badge_visibility { hide_badge: true }` after switch to default mode.
- Fallback: add `iframe[src*="lovable"], #lovable-badge { display:none !important }` to `styles.css`.

**E. Quote builder date (#5)**
- Locate "15/05/2025" default value (likely in quote builder route or create-dialog), change to `2026-06-15`.

**F. Lead detail demo data (#6)**
- In `mocks/leads.ts`, ensure first 6 leads (top of kanban) have `activities[]` (3–4 entries each), `quotes[]` (1–2), `notes[]` (1–2). Lower-priority leads stay sparse.

**G. Month view event label (#7)**
- In `_app.calendar.tsx` month grid render, append customer first/last name: `${time} #${jobNumber} ${customerLastName}`.

**H. Reports date range + legend (#8, #9)** in `_app.reports.tsx`
- Add `<Select>` in header next to Eksporter with the 6 range options, default "Sidste 12 mdr." (state only; no recompute needed for demo).
- Pie chart: add Recharts `<Legend layout="vertical" align="right" verticalAlign="middle" />` or custom legend list rendering color swatch + label per source.

**I. Lager search (#10)**
- Mirror `customers.index.tsx` search input pattern in `_app.lager.tsx` header. Filter by `customerName` or `unitNumber`.

**J. Remove Materialer sync badge (#11)**
- Delete the "Synkroniseret med mobilapp" badge JSX in `_app.koretojer.tsx` (or wherever Materialer lives — will grep).

## Implementation order

1. Data mocks (jobs → quotes → leads → customers → notifications) — biggest blast radius
2. Revenue chart + insight
3. Kanban board styling tweak (single component → cascades)
4. Calendar month label
5. Reports date range + pie legend
6. Lager search
7. Quote builder date, Materialer badge removal, lead detail demo data top-up
8. Hide Lovable badge via publish settings + CSS fallback
9. Verify with screenshots of `/`, `/jobs`, `/leads`, `/calendar`, `/reports`, `/lager`

## Notes

- No new dependencies.
- Renumbering jobs may require updating cross-references in quotes/customers mocks where job IDs are used as foreign keys — will scan and update consistently.
- `,50` øre formatting: the existing `lib/format.ts` `formatDKK` likely strips decimals; will check and switch to `maximumFractionDigits: 2` for the few `,50` values, keeping integer formatting elsewhere.
- Hydration: keep all "random-looking" mock values as hardcoded literals (no `Math.random()`) to avoid SSR mismatch.

