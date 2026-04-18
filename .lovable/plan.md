
# Fix detail-page routing + verify kanban styling

## Root cause: detail pages don't render

In TanStack file-based routing, `_app.leads.tsx` is a **layout route** for its children (`_app.leads.$leadId.tsx`). A layout route must render `<Outlet />` for child routes to display. Currently `_app.leads.tsx` renders the leads list directly with no `<Outlet />`, so `/leads/L-5000` matches the child route but the parent's list UI overwrites it. Same issue for `_app.customers.tsx`.

The page title updates because `head()` from the matched child route still applies — only the rendered tree is wrong.

## Fix: split list route from layout

Standard TanStack pattern — convert each parent into a pure layout, move list content to an index route:

1. **Rename** `src/routes/_app.leads.tsx` → `src/routes/_app.leads.index.tsx` (keeps URL `/leads`, contains the existing list/kanban/table UI unchanged).
2. **Create** new `src/routes/_app.leads.tsx` as a 4-line layout: `createFileRoute("/_app/leads")` with `component: () => <Outlet />`.
3. Same for customers: rename `_app.customers.tsx` → `_app.customers.index.tsx`, create new `_app.customers.tsx` as Outlet-only layout.

Result: `/leads` renders list (via index), `/leads/$leadId` renders detail — both nested under the new pure layout, no UI conflict.

## Kanban styling — already consistent

Verified: `_app.jobs.tsx`, `_app.leads.tsx`, and `_app.customers.tsx` all use identical `.kanban-column`, `.kanban-column-header`, `.kanban-cards`, `.kanban-card` utility classes (defined once in `styles.css`). The perceived inconsistency was likely caused by the detail-page bug masking interaction differences. No CSS changes needed; will visually confirm after the routing fix.

## Quiet hydration fix

Dashboard description ("28 aktive jobs" vs "37") drifts between SSR and client because `_app.index.tsx` recomputes counts each render against a mock that uses non-deterministic logic. Memoize the count from the seeded mock data once at module level (or pin via `MOCK_TODAY`) so SSR and client agree.

## Files
**Create**: `_app.leads.index.tsx`, `_app.customers.index.tsx`, new pure-layout `_app.leads.tsx`, new pure-layout `_app.customers.tsx`.
**Modify**: `_app.index.tsx` (deterministic count).
**Auto-regenerated**: `routeTree.gen.ts`.

## Out of scope
Kanban CSS changes (already consistent), drag-and-drop, real persistence.
