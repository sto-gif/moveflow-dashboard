
# Movena — Design Polish Pass

Global polish across typography, color, spacing, tables, micro-interactions, and sidebar. Token-driven so changes propagate everywhere.

## 1. Typography tokens (`src/styles.css`)
Update existing utilities to spec:
- `.text-page-title` → 24px / weight 600 (was 700)
- `.text-section` → 18px / 600
- `.text-label` → 14px / 500 (was 600)
- `.text-body` → 14px / 400
- `.text-body-sm` → 13px / 400
- `.text-caption` → 12px / 500
Add global rule: `table { font-variant-numeric: tabular-nums; }` plus `.tabular` utility.

## 2. Color restraint
- Audit `_app.index.tsx`, KPI cards, charts, and badges for decorative blue/teal/orange usage. Strip color from anything that isn't a CTA, link, active state, or status.
- Centralize status badge styles in `src/components/ui/badge.tsx` — add `success | warning | error | neutral` variants with the muted pill palette (light bg + dark text). Replace ad-hoc `bg-green-*`, `bg-yellow-*`, etc. across pages with these variants.
- Orange accent retained only on dashboard stat callout icons per brand rules.

## 3. Spacing
- `PageHeader` keeps existing rhythm; bump page wrapper to `space-y-8` (32px) between sections in all routes.
- Cards: enforce `p-4` (16px) minimum via `card.tsx` defaults; grids use `gap-6` (24px).

## 4. Tables (global via `ui/table.tsx`)
- `TableRow`: `h-12` (48px), `hover:bg-[#F8FAFC]`, 100ms transition.
- `TableHead` / `TableCell`: add `data-numeric` support → `text-right tabular-nums`. Provide a `numeric` className convention used in route tables.
- `TableCell` default text uses `text-[#475569]`; add `.cell-primary` helper for `font-medium text-[#0F172A]`.
- Update tables in `_app.jobs.tsx`, `_app.leads.tsx`, `_app.customers.tsx`, `_app.lager.tsx`, `_app.koretojer.tsx`, `_app.crew.tsx`, `_app.inventory.tsx`, `_app.quotes.tsx`, `_app.brief.tsx` to right-align numeric/price/hours/qty cells and use new badge variants.

## 5. Dashboard hierarchy (`_app.index.tsx`)
- Split KPI grid: top row = 2–3 hero KPIs (Omsætning MTD, Aktive jobs, evt. Jobs i dag) at `text-3xl` numbers, larger card padding.
- Secondary row = smaller cards (Konvertering, Snit pr. job, Crew-udnyttelse) with `text-xl` numbers.
- Add 1-line insight `<p className="text-caption text-muted-foreground">` under each chart with mock copy ("Omsætning er steget 18 % vs. sidste måned", "3 jobs mangler crew-tildeling", etc.).

## 6. Micro-interactions
- `card.tsx`: add `transition-shadow duration-150 hover:shadow-sm hover:-translate-y-0.5` (only when interactive — gate via prop or new `.card-interactive` utility used on KPI/list cards).
- `button.tsx`: add `active:scale-[0.98] transition-transform duration-75`.
- `__root.tsx` route outlet: wrap children in a `key`-based fade (`animate-fade-in`, 150ms).
- Sidebar items already animate; tighten to 100ms.

## 7. Loading & empty states
- Add `src/components/empty-state.tsx` (icon + title + helper + CTA) and use in tables/kanban that can be empty (Leads when filter empties, Brief list, Lager, Materialer udlån). Mock data is rich so most show content; component still wired for filtered-empty cases.
- Add `src/components/table-skeleton.tsx` (rows of `Skeleton`) — used for any route with future async, ready to drop in (no current loaders, but available).

## 8. Sidebar polish (`app-sidebar.tsx` + `ui/sidebar.tsx`)
- Active item: 3px left border `#1D4ED8`, bg `#EFF6FF`, text `#1D4ED8`, weight 500.
- Hover: bg `#F1F5F9`, 100ms.
- Group label: `text-[11px] uppercase tracking-wide font-semibold text-[#94A3B8] mb-2`.
- Confirm tight vertical density (existing compact spacing kept).

## 9. Hydration fix (quietly)
`_app.index.tsx` derives "jobs i dag" from `new Date()` causing SSR/client mismatch. Pin "today" to a fixed mock date constant (e.g., `MOCK_TODAY` from `mocks/_helpers.ts`) so server and client agree.

## Files modified
`styles.css`, `components/ui/{badge,button,card,table,sidebar}.tsx`, `components/app-sidebar.tsx`, `components/page-header.tsx`, `routes/__root.tsx`, all route files listed above for table/badge sweeps, `routes/_app.index.tsx` for KPI hierarchy + insights + hydration fix. New: `components/empty-state.tsx`, `components/table-skeleton.tsx`.

## Out of scope
- Real loading states (no async data exists).
- Reworking chart palettes beyond removing decorative color (keeps recharts defaults constrained to neutral + single blue).
