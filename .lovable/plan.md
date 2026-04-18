
# Movena MVP — Round 2 Refinements

11 focused changes touching sidebar density, layout patterns, data filtering, and module restructuring.

## 1. Sidebar & logo — 25% more compact
`src/components/ui/sidebar.tsx`: change `SIDEBAR_WIDTH` from `16rem` → `12rem`, `SIDEBAR_WIDTH_ICON` from `3rem` → `2.5rem`.
`src/components/app-sidebar.tsx`: shrink logo from `h-8` → `h-6`, icon from `h-8 w-8` → `h-6 w-6`, tighten group/item padding (`py-2`→`py-1`, gap-2→gap-1.5), smaller group label (`text-[10px]`).

## 2. Daglig Brief — full-page editor (new route)
- Convert `_app.brief.tsx` list page: remove `<Sheet>`, replace with `Link to="/brief/$briefId"` rows + new "Opret ny brief" button that navigates to `/brief/new`.
- Create `_app.brief.$briefId.tsx` — full-page editor (extracts existing `BriefEditor` as the page body), with back link, header bar, and save/share actions in a sticky toolbar. Handles `briefId === "new"` for blank create flow.
- Old briefs persist in the list (already do, since each has unique id).

## 3. Leads — Kanban/Tabel tabs (Jobs-style)
Replace the existing icon view-toggle in `_app.leads.tsx` with `<Tabs>` `Kanban | Tabel` matching `_app.jobs.tsx` styling.

## 4. Kunder — only converted customers
- `src/mocks/customers.ts`: change the customer generator so `STAGES` are only `["booket","i_gang","afsluttet"]` with new `CustomerStage` type. Reduce count to ~22. Drop "ny_henvendelse"/"tilbud_sendt"/"tabt".
- Update `STAGE_LABELS` to `{ booket: "Booket", i_gang: "I gang", afsluttet: "Afsluttet" }`.
- `_app.customers.tsx`: kanban now uses 3 stages; keep Alle/Privat/Erhverv tabs and the existing kanban/table icon toggle.
- `_app.index.tsx` (Dashboard): conversion KPI now uses `customers.length / (customers.length + leads.length)`. Funnel chart switches to lead stages from `leads.ts` (already 6 stages there).

## 5. Remove Fakturaer
- Delete `src/routes/_app.invoices.tsx` and `src/mocks/invoices.ts`.
- Remove "Fakturaer" item from `app-sidebar.tsx`.
- Dashboard: remove `outstanding`, `overdue`, the Udestående KPI, the "forfaldne fakturaer" alert, and the invoice-related activity feed entry. Replace Udestående KPI with something neutral like "Aktive jobs" count.
- Topbar notifications: remove "Faktura #089 forfalden" entry from `mocks/notifications.ts`.
- Settings team menu: remove "Bogholder" if needed (keep, unrelated to invoicing).

## 6. Jobs detail — customer + quote panels
In `_app.jobs.tsx` `JobSheet`:
- Add **Kunde** card at top of "Detaljer" tab: name, type badge, phone, email, full address, notes (lookup via `customers.find(c => c.id === job.customerId)` — extend `jobs.ts` to ensure `customerId` resolves).
- Add **Oprindeligt tilbud** card on "Økonomi" tab: lookup quote by `job.customerId` matching latest `quotes` entry, show quote number, pricing model, line items table, manual-adjustment badge if any.

## 7. Vagtplan — Tabel/Kalender tabs
Restructure `_app.crew.tsx`:
- Keep "Syge i dag" banner.
- Replace cards-grid + weekly table + friønsker stack with `<Tabs>` `Tabel | Kalender`.
- **Tabel**: clean table with columns Navn, Rolle, Status, Tildelte jobs (from `recentJobIds`), Timer (period), Skills/Certificeringer.
- **Kalender**: day/week/month sub-toggle. Reuse a calendar grid (similar to Jobs CalendarGrid) showing crew assignments per day color-coded by member.
- Keep Friønsker as a smaller card below tabs (or move to drawer).

## 8. Køretøjer — add calendar view
Wrap current table + weekly grid in `<Tabs>` `Tabel | Ugentlig | Kalender`. Add new month-calendar showing vehicle assignments per day (similar pattern to Jobs calendar).

## 9. Beskeder → Automatiske Flows
- Rename file `_app.messages.tsx` → keep filename (route `/messages`) but change title and content. Or simpler: keep route, update content/sidebar label.
- Remove inbox tab and conversation pane entirely.
- Page becomes the existing "Automatiske flows" content (sequences list with toggles and templates) at full width, expanded with: trigger condition select, timing input (e.g., "1 dag før"), SMS/Email channel toggle per sequence.
- Update sidebar: rename "Beskeder" → "Automatiske Flows", update `head().title` to "Automatiske Flows — Movena", group label `Engagement` → `Automatisering`.

## 10. Settings — vertical side nav
Refactor `_app.settings.tsx`: replace top `<TabsList>` with a 2-column layout: left vertical nav (`<button>` list, ~200px wide, sticky) + right content area. Each nav item swaps the active section via local state. All 9 sections preserved with their existing content.

## 11. Sidebar groups — final structure
Update `app-sidebar.tsx` groups to: Overblik (Dashboard, Daglig Brief), Salg (Leads, Kunder, Tilbud), Drift (Jobs, Kalender, Vagtplan, Opgaver, Lager, Materialer, Køretøjer), Automatisering (Automatiske Flows), Indsigt (Rapporter), Konto (Indstillinger).

## Files affected
**Modify**: `app-sidebar.tsx`, `ui/sidebar.tsx`, `_app.brief.tsx`, `_app.leads.tsx`, `_app.customers.tsx`, `_app.jobs.tsx`, `_app.crew.tsx`, `_app.koretojer.tsx`, `_app.messages.tsx`, `_app.settings.tsx`, `_app.index.tsx`, `mocks/customers.ts`, `mocks/notifications.ts`.
**Create**: `_app.brief.$briefId.tsx`.
**Delete**: `_app.invoices.tsx`, `mocks/invoices.ts`.

## Out of scope
- True drag-and-drop on kanban (deferred).
- Real timezone/i18n behavior.
- Persistent brief storage (still in-memory mock).
