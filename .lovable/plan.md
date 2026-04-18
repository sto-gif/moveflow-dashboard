
# Movena — Detail Pages, Kanban Polish & Vagtplan Calendar

## 1. Kanban polish (global, single source of truth)
Add reusable utilities in `src/styles.css`:
- `.kanban-column` → `bg-[#F8FAFC] rounded-lg p-3` 
- `.kanban-column-header` → `pb-3 mb-3 border-b border-border flex items-center justify-between`
- `.kanban-card` → `bg-white border border-[#E2E8F0] rounded-md p-3 transition-shadow duration-150 hover:shadow-sm cursor-pointer`
- `.kanban-cards` → `flex flex-col gap-3` (12px)

Apply across `_app.jobs.tsx`, `_app.leads.tsx`, `_app.customers.tsx` kanban renderers — replace ad-hoc card classes with these utilities.

## 2. Lead detail — full page (`/leads/$leadId`)
- New route `src/routes/_app.leads.$leadId.tsx`. Header (back link, name, type/status/source badges, "Send tilbud" + "Konverter til kunde" buttons), contact card, quote info card.
- Tabs: **Timeline | Tilbud | Noter**.
  - Timeline: derive mock activity feed from lead (`createdAt`, stage transitions, generated contact/quote/sms entries) — icon + date + description.
  - Tilbud: filter `quotes` mock by matching customer name/lead id (best-effort) → list with status badge + amount + link.
  - Noter: textarea + list of mock notes (in-memory `useState`).
- `_app.leads.tsx`: rows/kanban cards become `<Link to="/leads/$leadId">`. Remove existing inline drawer if present.

## 3. Customer detail — full page (`/customers/$customerId`)
- New route `src/routes/_app.customers.$customerId.tsx`. Header (back, name, type badge, CVR if erhverv, lifetime value, back arrow), contact card, stats row (total value, # moves, source, first move date).
- Tabs: **Flytninger | Tilbud | Kommunikation | Lager | Noter**.
  - Flytninger: table of jobs filtered by `job.customerId === customer.id` (job#, date, from→to, volume, crew, status, price) — rows link to jobs page (anchor by id).
  - Tilbud: filtered quotes table.
  - Kommunikation: chronological SMS/email mock list.
  - Lager: filter `storage` mock by customer.
  - Noter: notes textarea (local state).
- `_app.customers.tsx`: rows/kanban cards link to `/customers/$customerId`.
- Hydration fix: customer table description (`986.000 kr. … 13 nye`) is recomputed from random mock — pin via `MOCK_TODAY` or memoized seed so SSR/client match. Same sweep for leads description string causing the current hydration warning.

## 4. Vagtplan calendar (`_app.crew.tsx`)
Restructure Kalender tab:
- Sub-tabs: **Kalender | Oversigt** (rename existing grid to "Oversigt").
- Kalender: month/week/day view (reuse Jobs `CalendarGrid` pattern) where each day cell lists employees scheduled and their job IDs. Color dots per employee.
- Add **employee filter** `<Select>` above the calendar: "Alle medarbejdere" or single member → filters cells to that person and shows total hours for the period.
- Keep existing Dag/Uge/Måned range toggle.

## 5. Consistent kanban tab labels
- `_app.leads.tsx`: tabs `Kanban | Tabel` (already done — verify spacing matches Jobs).
- `_app.customers.tsx`: rename tabs to `Pipeline | Tabel` (Pipeline = kanban view, since customer stages differ).
- `_app.jobs.tsx`: keep `Kanban | Kalender | Tabel`.
All three use identical `<Tabs>` styling/position directly under PageHeader.

## Files
**Create**: `src/routes/_app.leads.$leadId.tsx`, `src/routes/_app.customers.$customerId.tsx`.
**Modify**: `src/styles.css`, `_app.jobs.tsx`, `_app.leads.tsx`, `_app.customers.tsx`, `_app.crew.tsx`. Touch `mocks/_helpers.ts` only if needed for deterministic counts.

## Out of scope
- Real notes persistence (in-memory only).
- Drag-and-drop on kanban.
- Editing lead/customer fields from detail page (read-only with action buttons stubbed).
