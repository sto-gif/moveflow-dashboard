
# Moving Company SaaS — Frontend Prototype (Final Plan)

Building a complete frontend-only prototype with rich Danish mock data across all 12 modules. Clean white/gray base with **#1D4ED8** accent, **Manrope** font (400–800), **DKK** currency, Danish names and cities throughout.

## Tech & setup
- Manrope via Google Fonts (preconnect + stylesheet in `__root.tsx` head), set as default sans in `src/styles.css`.
- Accent `#1D4ED8` wired into the primary token.
- Recharts for charts, dnd-kit for kanban drag-and-drop, date-fns for date formatting (Danish locale).

## Routes (TanStack file-based)
Layout route `_app.tsx` provides sidebar + topbar shell with `<Outlet />`. Each leaf has its own `head()` metadata.

```
src/routes/
  __root.tsx              (Manrope fonts, providers, 404)
  _app.tsx                (sidebar + topbar layout)
  _app.index.tsx          → / Dashboard
  _app.customers.tsx
  _app.jobs.tsx
  _app.quotes.tsx
  _app.calendar.tsx
  _app.crew.tsx
  _app.tasks.tsx
  _app.inventory.tsx
  _app.messages.tsx
  _app.invoices.tsx
  _app.reports.tsx
  _app.settings.tsx
```

## Shared shell
- **Sidebar** (shadcn `Sidebar`, collapsible to icons): grouped — Overview, Sales, Operations, Engagement, Insights, Settings. Active route highlighted in accent.
- **Topbar**: global search, notification bell with dropdown panel, user menu. Always-visible `SidebarTrigger`.
- **Notification dropdown** with realistic Danish operational alerts:
  - "Job #142 starter om 2 timer — 1 medarbejder mangler"
  - "Faktura #089 er 7 dage forfalden (12.500 DKK)"
  - "Nyt tilbud anmodet af Lars Hansen"
  - "Mette Sørensen har anmodet om fri 24. april"
  - "Lager: Flyttekasser under minimum (18 tilbage)"
  - "Job #138 markeret som færdig af crew leader Anders"
  - plus 4–5 more (overdue, reminders, mentions).

## Mock data (`src/mocks/`)
Typed modules: `customers.ts`, `jobs.ts`, `quotes.ts`, `crew.ts`, `tasks.ts`, `inventory.ts`, `messages.ts`, `invoices.ts`, `notifications.ts`, `company.ts`.
- 40+ customers (Lars Hansen, Mette Sørensen, Jens Nielsen, Anne Pedersen, Søren Christensen, Emilie Jensen, etc.)
- Cities: København, Aarhus, Odense, Aalborg, Esbjerg, Randers, Kolding, Horsens, Vejle, Roskilde
- 60+ jobs spanning past/today/future, 15 crew members, 30+ invoices, 25+ quotes, inventory items, message threads
- All amounts in DKK (formatted via `Intl.NumberFormat('da-DK', { style: 'currency', currency: 'DKK' })`)
- Dates formatted with Danish locale

## Pages (each with rich data + designed empty state component)
1. **Dashboard** — KPI strip (Omsætning MTD, Jobs udført, Crew-udnyttelse, Gns. jobværdi, Udestående, Konvertering), today's jobs table with crew chips, alerts panel, deadlines, revenue line chart, lead funnel, activity feed.
2. **Customers** — Pipeline kanban (Ny henvendelse → Tilbud sendt → Booket → Afsluttet → Tabt) + table toggle, customer drawer.
3. **Jobs** — Kanban / Calendar / Table tabs, job sheet with drag-and-drop crew, equipment, status timeline, cost vs revenue.
4. **Quotes** — List + builder (volume, distance, crew, etage, extras), live DKK total, convert-to-job.
5. **Calendar** — Day/week/month, color-coded by status or crew.
6. **Crew** — Roster, profile drawer, weekly schedule grid, time-off, daily view.
7. **Tasks** — Kanban / Table / Calendar tabs.
8. **Inventory** — Boxes / Equipment / Vehicles tabs, in/out log, low-stock banners.
9. **Messages** — Conversation list + thread, automated sequence manager (SMS + Email templates).
10. **Invoices** — Table with status filters, totals strip, profitability breakdown.
11. **Reports** — Filter bar + 6 charts + per-job profitability table.
12. **Settings** — Tabs: Virksomhed, Team & roller, Notifikationer, Integrationer, Kom i gang, Feedback, Support.

## Dependencies to add
`recharts`, `@dnd-kit/core`, `@dnd-kit/sortable`, `date-fns` (with `date-fns/locale/da`).

## Replacement
`src/routes/index.tsx` placeholder gets replaced by the dashboard route via `_app.index.tsx`.
