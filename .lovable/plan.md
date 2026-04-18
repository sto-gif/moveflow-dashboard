

## Goal
Add a consistent **filter feature** alongside the existing search across the main list/kanban views (Leads, Jobs, Customers, Quotes, Brief, Tasks, Lager, etc.).

## Design

A reusable **`FilterBar`** component placed next to the search input on each page. It opens a popover with checkbox groups. Active filters render as small dismissable chips below the search row.

```text
[ Search…    ] [ ⏷ Filter (2) ]   ← in PageHeader actions
[ Status: I gang ✕ ] [ Kilde: Google ✕ ] [ Ryd alle ]   ← chips row
```

## Component API

```tsx
<FilterBar
  filters={[
    { key: "status", label: "Status", options: [{value, label, count?}] },
    { key: "source", label: "Kilde", options: [...] },
    { key: "owner",  label: "Ejer",   options: [...] },
  ]}
  value={activeFilters}              // Record<string, string[]>
  onChange={setActiveFilters}
/>
```

Multi-select per group, OR within a group, AND across groups. Counts shown next to each option.

## Per-page filter sets

| Page | Filters |
|---|---|
| Leads | Status (stage), Kilde, Ejer, Type (privat/erhverv) |
| Jobs | Status, Crew-medlem, Køretøj tildelt (ja/nej), Måned |
| Customers | Stage, Kilde, By |
| Quotes | Status, Pakke, Måned |
| Brief | Status, Tildelt til |
| Tasks | Status, Prioritet, Tildelt |
| Lager / Inventory | Lokation, Status |

Existing ad-hoc filters (e.g. Customers' privat/erhverv pill row) get folded into the unified FilterBar so there's only one place to filter.

## URL persistence

Filters serialize to search params via TanStack Router `validateSearch` + zod adapter (`fallback`/`default`), so filter state survives reloads and is shareable. Pattern:
```ts
validateSearch: zodValidator(z.object({
  status: fallback(z.string().array(), []).default([]),
  source: fallback(z.string().array(), []).default([]),
}))
```

## Integration with existing pieces

- `RowCount` already shows `(filtreret)` automatically when `shown !== total` — no change needed.
- Kanban + Table both consume the same `filtered` array, so applying the new filter once filters both views.
- Sticky-header tables stay as-is.

## Files

**Create**
- `src/components/filter-bar.tsx` — popover + chips + clear-all
- `src/hooks/use-filters.ts` — small helper to apply a filter map to a list

**Edit (one page at a time, same pattern)**
- `src/routes/_app.leads.index.tsx`
- `src/routes/_app.jobs.tsx`
- `src/routes/_app.customers.index.tsx`
- `src/routes/_app.quotes.tsx`
- `src/routes/_app.brief.index.tsx`
- `src/routes/_app.tasks.tsx`
- `src/routes/_app.lager.tsx`, `_app.inventory.tsx`

## Rollout suggestion

Ship in two steps to keep PRs reviewable:
1. Build `FilterBar` + wire **Leads** and **Jobs** end-to-end (highest demo value).
2. Roll out to Customers, Quotes, Brief, Tasks, Lager.

