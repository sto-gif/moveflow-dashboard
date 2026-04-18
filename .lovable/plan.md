
# Make the entire app interactive (mock-only)

## Architecture: in-memory mock store + provider

Create `src/store/mock-store.tsx` — a single React context wrapping all mutable mock state (leads, customers, jobs, quotes, briefs, notifications, settings). Exposes typed actions:

- `createLead`, `updateLeadStage`, `convertLeadToCustomer`
- `createCustomer`, `updateCustomerStage`
- `createJob`, `updateJobStatus`
- `createQuote`, `updateQuoteStatus`, `convertQuoteToJob`
- `createBrief`
- `markNotificationRead`, `markAllRead`
- `updateSettings`

Initialized from existing `src/mocks/*` arrays (cloned), so no on-disk mutation. Wire `<MockStoreProvider>` in `__root.tsx` inside `QueryClientProvider`. All routes switch from importing arrays directly to `useMockStore()`.

## Reusable building blocks

- `src/components/create-dialog.tsx` — generic `<EntityCreateDialog>` driving "Nyt lead / Ny kunde / Nyt job / Nyt tilbud / Opret ny brief" modals. Pre-fills placeholder data, submit calls store action, closes, fires `toast.success`, navigates to detail when relevant.
- `src/components/sortable-table.tsx` — small wrapper with `useSortableData(items, columns)` hook. Column headers become buttons (chevron up/down). Used by leads/customers/jobs/quotes/inventory/lager tables.
- `src/components/stage-select.tsx` — popover with stage/status options. Click a `Badge` → opens menu → updates store. Used on lead stage, customer stage, job status, quote status (tables + detail headers).

## Drag-and-drop kanban

Add `@dnd-kit/core` + `@dnd-kit/sortable`. New `src/components/kanban-board.tsx` exposing `<KanbanBoard columns items renderCard onMove>`. Refactor jobs/leads/customers kanban views to use it; `onMove` calls the relevant store stage/status action and shows toast.

## Page-by-page wiring

**Dashboard (`_app.index.tsx`)** — wrap each KPI hero in `<Link to="/jobs|/customers|/reports">`. "Nyt job" header button opens job create dialog. Activity-feed items become `<Link>` to corresponding entity. Fix MTD numbers to read from store.

**Topbar** — notification dropdown items already render; add `onClick={() => markRead(n.id)}` + each routes via `Link` to its target (job/lead/quote). "Markér alle som læst" wired.

**Leads list (`_app.leads.index.tsx`)** — search already works; add sort, replace stage badge with `<StageSelect>`, "Nyt lead" → create dialog, kanban uses DnD board.

**Lead detail** — "Send tilbud" → `updateLeadStage("tilbud_sendt")` + toast + navigates to `/quotes`. "Konverter til kunde" → `convertLeadToCustomer(lead)` + toast + navigates to new `/customers/$id`. Notes already work.

**Customers list/detail** — sortable table, stage select, type-filter already works, "Ny kunde" → create dialog. Detail page rows in Flytninger tab `<Link>` to job (open job sheet via query param).

**Jobs (`_app.jobs.tsx`)** — sortable table, status badge → `<StageSelect>`, kanban uses DnD board. Calendar day cells: each job dot becomes a button that opens existing job sheet. "Nyt job" dialog. Search already works.

**Quotes (`_app.quotes.tsx`)** — "Konvertér til job" → `convertQuoteToJob(q)` + toast + navigates to `/jobs`. "Nyt tilbud" opens dialog (or jumps to builder tab). Builder "Send" → `createQuote` + toast.

**Brief (`_app.brief.tsx`)** — "Opret ny brief" → `createBrief()` + navigates to `/brief/$briefId` editor. Toggles persist via store.

**Settings (`_app.settings.tsx`)** — controlled inputs bound to store settings. "Automatiske flows" switches toggle store. "Gem ændringer" → `toast.success("Indstillinger gemt")`.

**Calendar (`_app.calendar.tsx`)** — events → `<Link>` opening job detail (via `?job=ID` query param consumed by jobs route, or navigate to `/jobs` and open sheet).

## Hydration fix

Two issues:
1. `daysFromNow` in `_helpers.ts` uses `new Date()` — replace with `new Date(MOCK_TODAY); d.setDate(d.getDate() + days)`. Eliminates the timeline timestamp drift seen in runtime errors.
2. Lead detail timeline derives `new Date(lead.createdAt + ...)` — already deterministic once `createdAt` is stable.

## Files

**Create**: `src/store/mock-store.tsx`, `src/components/create-dialog.tsx`, `src/components/stage-select.tsx`, `src/components/sortable-table.tsx`, `src/components/kanban-board.tsx`.

**Modify**: `__root.tsx`, `topbar.tsx`, `_app.index.tsx`, `_app.leads.index.tsx`, `_app.leads.$leadId.tsx`, `_app.customers.index.tsx`, `_app.customers.$customerId.tsx`, `_app.jobs.tsx`, `_app.quotes.tsx`, `_app.brief.tsx`, `_app.settings.tsx`, `_app.calendar.tsx`, `mocks/_helpers.ts`.

**Add dep**: `@dnd-kit/core`, `@dnd-kit/sortable`.

## Out of scope
- Real persistence (refresh resets to seed data, by design).
- Field-level editing on detail pages beyond stage/status (only create + stage transitions are wired).
- Reports/Messages/Inventory/Lager/Crew/Vehicles deep-interactivity — these already render mock data and don't have explicit asks; minor wiring (sortable tables) only.
