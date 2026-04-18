
# Movena — Comprehensive MVP Update

Rebranding the app to **Movena** and implementing 14 major feature updates. This is a large refactor touching branding, navigation structure, and adding/restructuring 8+ modules.

## Branding (global)
- Add Movena logo (`Fitted_Horizontal_transparent.png`) and icon (`Icon_only_L.svg`) to `src/assets/`.
- Update `src/styles.css` with the full Movena palette (Navy `#0B1F3B`, Blue `#1D4ED8`, Teal `#29ABE2`, Orange `#EA580C`, BG `#F8FAFC`, surface white, borders `#E2E8F0`, text `#0F172A`, muted `#475569`, status colors, radii 8/12/4px).
- Manrope font already set; verify weights 400–800.
- Type scale utilities in `styles.css`: `.text-page-title` (24/700), `.text-section` (18/600), `.text-label` (14/600), `.text-body` (14/400), `.text-body-sm` (13/400), `.text-caption` (12/500).
- Sidebar stays light/white with logo at top, active items use teal indicator + blue text.
- Replace "FlytOperations" → "Movena" everywhere (root title, sidebar header, page metadata, mock company).
- Update favicon in `__root.tsx`.

## Sidebar restructure
New grouping with new items:
- **Overview**: Dashboard, **Daglig Brief** (new)
- **Salg**: **Leads** (new), Kunder, Tilbud, Fakturaer
- **Drift**: Jobs, Kalender, Vagtplan (Crew), Opgaver, **Lager** (new), Materialer (renamed Inventar), Køretøjer (split from Materialer)
- **Engagement**: Beskeder
- **Insights**: Rapporter
- **Settings**: Indstillinger

Topbar: add trial badge "Prøveperiode: 12 dage tilbage" + language switcher (DA/EN dropdown, visual only).

## New / restructured pages

**1. Kunder** — Parent tabs: Alle / Privat / Erhverv. Each customer has `type: 'privat' | 'erhverv'`, optional `cvr` and `companyName`. View toggle: Pipeline kanban / Table (name, type, contact, last job, total value, status). Drawer shows previous jobs list, communication log, notes.

**2. Leads** (new route `_app.leads.tsx`) — Pipeline kanban + table toggle. Stages: Ny → Kontaktet → Tilbud sendt → Forhandling → Vundet/Tabt. Lead source field (Hjemmeside, Telefon, Anbefaling, Facebook, Google). Mock 25+ leads.

**3. Tilbud (Quotes)** — Rebuilt with stepper (Kunde → Volumen → Layout → Services → Parkering → Transport → Tillæg). Pricing model selector (m²/Timepris/Manuel). Live price breakdown panel with line items, custom items, manual adjustment with "Justeret" badge. Flyttepakker selectable cards (Basis/Komplet/Premium). Convert-to-Job CTA on Accepted. Business toggle adds CVR/company fields.

**4. Lager** (new route `_app.lager.tsx`) — Customer storage units. Table with unit#, customer, description, start/end, status, monthly price. Detail drawer. Mock 20+ entries (active + ended).

**5. Materialer** (renamed) — Keep tabs Flyttekasser/Udstyr. Add lent-out tracking with linked customer + return deadline + overdue highlight. Sync indicator pill ("Synkroniseret med mobilapp"). Add custom material type dialog.

**6. Køretøjer** (split into own route `_app.koretojer.tsx`) — Table with capacity (m³), current/upcoming jobs, simple weekly assignment grid.

**7. Vagtplan (Crew)** — Updated weekly grid showing assignments + sick indicator. Hours-per-period running counter. "Syge i dag" pill at top.

**8. Medarbejdere** — Profile drawer adds: strengths/weaknesses (tag inputs), certifications list, driver's license toggle. Skill-match hint badge.

**9. Daglig Brief** (new route `_app.brief.tsx`) — Two layers:
- List/calendar of briefs (date, title, status, author).
- Editor: auto-filled today's jobs/crew/vehicles + editable sections (notes, special instructions, breaks, announcements). Share action. Weekly/monthly toggle.

**10. Job detail Fotos tab** — In Jobs sheet, add "Fotos" tab with Før/Efter gallery (mock photos with thumbnails, upload UI placeholder).

**11. Settings** — Tabs:
- Virksomhed: name, currency selector (DKK default), timezone (Europe/Copenhagen default), language (DA/EN).
- Team & roller, Notifikationer, Integrationer, Tilbudsformular (new — pricing model, field toggles, step order list, appearance, business toggle, live preview), Abonnement (new — current plan + Starter/Professional/Enterprise tier cards), Kom i gang, Feedback, Support.

**12. Remove mobile app** — Audit for any mobile-app preview sections (none expected from current routes; verify Settings/Integrationer doesn't have a mobile mockup).

## Mock data updates
- `customers.ts`: add `type`, `cvr`, `companyName`, `previousJobIds`, `notes`, `communications[]`.
- New: `leads.ts`, `storage.ts`, `briefs.ts`, `packages.ts`, `vehicles.ts` (split from inventory).
- `crew.ts`: add `strengths`, `weaknesses`, `certifications`, `driverLicense`, `sickToday`, `hoursThisPeriod`.
- `jobs.ts`: add `photos: { url, label: 'før'|'efter' }[]`.
- `quotes.ts`: add `pricingModel`, `lineItems[]`, `manualAdjustment`, `packageId`.

## Files to create
Routes: `_app.leads.tsx`, `_app.lager.tsx`, `_app.koretojer.tsx`, `_app.brief.tsx`.
Mocks: `leads.ts`, `storage.ts`, `briefs.ts`, `packages.ts`, `vehicles.ts`.
Components: `trial-badge.tsx`, `language-switcher.tsx`, `quote-stepper.tsx`, `price-breakdown.tsx`, `brief-editor.tsx`, `photo-gallery.tsx`.
Assets: copy logo + icon to `src/assets/`.

## Files to update
`styles.css`, `__root.tsx` (favicon, title), `app-sidebar.tsx` (Movena logo + new groups/items), `topbar.tsx` (trial badge, language), all existing route files for rebrand + restructure (Kunder tabs, Quotes rebuild, Materialer rename, Crew updates, Settings tabs, Jobs photos tab).

## Out of scope (explicitly)
- Real auth/payments (paywall is UI-only).
- Real i18n (toggle visual only, copy stays Danish).
- Real photo upload (UI + mock thumbnails only).
- Drag-and-drop step reordering in form settings (use up/down arrows for MVP).
