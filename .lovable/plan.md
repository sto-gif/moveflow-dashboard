

# Audit Fix Plan

Comprehensive fix for 32 issues. I'll explore key files first, then group fixes by area to minimize churn.

## Investigation needed before coding

I need to verify current state of these files (will read in implementation phase):
- `_app.calendar.tsx` — current view modes
- `_app.tasks.tsx` — Kalender tab structure
- `_app.brief.index.tsx` + `_app.koretojer.tsx` — Kalender tab routing
- `_app.jobs.tsx` — job detail sheet (already touched recently)
- `_app.leads.$leadId.tsx` + `_app.customers.$customerId.tsx` — why detail content isn't rendering
- `_app.leads.tsx` + `_app.customers.tsx` + parent layouts — likely missing `<Outlet />` (same bug we fixed for `/brief`)
- `topbar.tsx` — language toggle
- `_app.index.tsx` — dashboard chart, activity, jobs, alerts
- `_app.reports.tsx` — date range, legend, margin source
- `_app.settings.tsx` — integrations, onboarding links, notifications
- `_app.tasks.tsx` — filter bar
- `_app.quotes.tsx`, `_app.lager.tsx`, `_app.inventory.tsx`, `_app.crew.tsx`, `kanban-board.tsx` — various polish
- `mocks/*.ts` — date updates to 2026, revenue trajectory, customer job counts

## Fix groups

### Group A — Routing bugs (HIGH, blocking)
**5. Lead/Customer detail not rendering** — likely `_app.leads.tsx` and `_app.customers.tsx` are parent layouts without `<Outlet />` (same root cause as the brief bug). Fix:
- Rename `_app.leads.tsx` → `_app.leads.index.tsx`
- Rename `_app.customers.tsx` → `_app.customers.index.tsx`
- Verify the `_app.leads.index.tsx` and `_app.customers.index.tsx` files don't already exist; if they do, merge.

**Runtime error**: `routeTree.gen.ts` still references `_app.brief.tsx` — regenerate by ensuring file rename is clean.

### Group B — Calendar views (HIGH)
**1. Calendar Dag/Uge views**: Build real Day view (single column, 07:00–20:00 hourly slots, jobs positioned by time) and Week view (7 columns × hourly rows). Reuse jobs mock data with `scheduledAt`.

**3. Brief calendar tab**: Build dedicated brief-calendar view inside `_app.brief.index.tsx` showing month grid with brief markers per date.

**3. Vehicles calendar tab**: Same in `_app.koretojer.tsx` showing vehicle assignments per date.

**2. Tasks calendar tab**: Build a simple month grid showing tasks by deadline (with priority color dots).

### Group C — Job detail (HIGH)
**4. Rich job detail** in `_app.jobs.tsx` Sheet:
- Pickup/delivery addresses, assigned crew (names), assigned vehicle
- Timeline section (created → confirmed → started → completed)
- Customer info card linking to customer
- Original quote with line items (already partly there)
- New "Fotos" tab with placeholder photo grid
- Tabs: Oversigt | Økonomi | Tidslinje | Fotos

### Group D — Mock data refresh (HIGH)
**6. Dates → 2026**: Update `mocks/crew.ts` (Friansker), `mocks/vehicles.ts` (service dates), and audit `_helpers.ts` for any hard-coded years.
**8. Revenue chart**: Update dashboard chart data to growth trajectory with winter dip.
**10. Customer job counts**: Compute or store job count per customer; show on customer kanban cards.

### Group E — Topbar & nav polish
**7. "AN" → "EN"** in `topbar.tsx`.

### Group F — Calendar event labels
**9. Event labels**: `"13:00 #105 Hansen"` format on calendar cells.

### Group G — Reports page
**11. Date range selector** (Select with presets).
**30. Pie chart legend** (visible).
**31. Margin source**: ensure jobs have `cost` field (already added in earlier turn) — link in tooltip.

### Group H — Settings page
**12. Danish integrations**: Add MobilePay, Dinero, Fortnox cards (replace/append Mailchimp).
**13. Onboarding links**: Wrap remaining checklist items in `<Link>` to relevant settings sections.
**16. Daglig morgensummering**: default `true` in notifications state.

### Group I — Tasks page
**14. Filter bar**: assignee Select, priority Select, due-date range Select.

### Group J — Kanban polish
**15. Lead type vs source**: type = outlined pill, source = colored tag.
**19. Apply card styling** from customers kanban to jobs and leads kanbans (borders, column backgrounds, spacing).
**18. Leads "ALDER" column** → "TEMPERATUR" with Kold/Varm/Hed badges.
**23. Jobs kanban "Vis flere"** after 10 cards per column.

### Group K — Brief polish
**17. Brief titles**: descriptive — "Tirsdag 15. apr: 5 jobs, fuldt team" computed from brief data.

### Group L — Dashboard polish
**20. Activity feed**: icons + left timestamps + dividers.
**21. Dagens jobs cards**: more padding.
**22. Alerts**: bolder titles, muted descriptions.

### Group M — Other pages
**24. Warehouse search bar** on `/lager`.
**25. Warehouse BEMÆRKNINGER**: populate with mock remarks.
**26. Automation timing labels**: "Med det samme" / clearer delays.
**27. Remove "Synkroniseret med mobilapp"** badge on `/inventory`.
**28. Quotes status badges**: muted pill style.
**29. Quotes age**: "Sendt for X dage siden".
**32. Crew table**: move "Holdleder" out of STATUS into ROLLE; status only Aktiv/Syg/Ferie/Inaktiv.

## Execution order

1. Group A (routing) + brief.tsx leftover → unblocks demos
2. Group D (data refresh) → underpins many other fixes (job counts, chart, dates)
3. Group C (job detail) → biggest single feature
4. Group B (calendars) → 4 separate calendar implementations
5. Groups E, F, G, H, I → page-level features
6. Groups J, K, L, M → polish

## Notes & assumptions

- "Fotos" tab will use placeholder image grid (no upload backend) — clearly a demo.
- Customer job count derived live from `jobs` mock filtered by customerId.
- Calendar Day/Week views will be CSS-grid based, not a heavy library.
- Hydration mismatch in console (timeline showing 12.00 vs 14.00) likely from `Math.random()`/`Date.now()` in brief mocks — will switch to seeded values when touching brief mock titles (#17).
- No new dependencies required.

