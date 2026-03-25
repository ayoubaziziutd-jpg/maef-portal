# MAFS Portal — Roadmap

## Milestone 1: Unified Portal v1.0

**Goal:** Merge both apps into one deployable portal with complete member/staff features, full MAFS brand design, Supabase auth/data, and live on Netlify.

---

### Phase 1: Unified App Foundation

**Goal:** Merge `mafs-member-portal` and `mafs-financial-dashboard` into a single `mafs-portal/` Vite app. All existing screens work. Financial dashboard components live inside the staff portal's Financials tab. No new features — migration only.

**Plans:** 2/3 plans executed

Plans:
- [x] 01-01-PLAN.md — Scaffold mafs-portal/ and merge engine/types/constants
- [ ] 01-02-PLAN.md — Copy all portal and dashboard components
- [ ] 01-03-PLAN.md — Wire dashboard into EmployeePortal and verify build

**Deliverables:**
- New `mafs-portal/` directory at repo root with Vite + React 19 + TypeScript + Tailwind
- Single unified `engine.ts` (member portal is the superset — merge dashboard additions in)
- All existing components from both apps present and routing correctly
- `EmployeePortal` Financials tab renders Dashboard, Projections, Reserves, ClaimsTool
- App builds without errors (`npm run build` passes)
- Dev server runs at localhost:5173

**Canonical refs:**
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STRUCTURE.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/PROJECT.md`

---

### Phase 2: MAFS Design System + Full UI/UX Redesign

**Goal:** Apply a complete, polished design system across the entire unified app. Every screen — gateway, member portal, staff portal, financial dashboard — must use the MAFS green/gold brand palette, consistent typography, spacing, and component patterns. Target: looks like a professional fintech/mutual-fund portal, not a prototype.

**Deliverables:**
- Tailwind theme configured with MAFS brand tokens (`maef-green: #0D5F3A`, `gold: #D4A843`)
- Consistent design across: Gateway, MemberGateway, MemberPortal (all tabs), EmployeePortal (all tabs), financial dashboard views
- All legacy inline colors, mismatched styles, and placeholder UI replaced
- Responsive layouts (mobile-first, works on phone and desktop)
- Loading states, empty states, error states designed throughout

**Canonical refs:**
- `.planning/codebase/CONVENTIONS.md`
- `.planning/PROJECT.md`

---

### Phase 3: Member Features — Complete Stubs

**Goal:** Replace all "Coming Soon" stubs on the member side with functional UI. Members can file a request, track its status, update their profile, and contact support. No backend yet — forms submit to placeholder handlers.

**Deliverables:**
- File a Request: claim submission form (coverage type, description, amount, date)
- My Requests: list view showing submitted requests with status badges
- Update Profile: editable form for name, address, phone, email, dependents
- Coverage Summary card: shows current tier, limits, covered types
- Contact Support: email link + support hours (static content)

**Canonical refs:**
- `.planning/research/FEATURES.md`
- `.planning/PROJECT.md`

---

### Phase 4: Staff Features — Complete Stubs

**Goal:** Replace all missing/stub staff workflows with functional UI. Staff can view full member records, adjudicate claims, record claim decisions, and see claims history per member. No backend yet — forms submit to placeholder handlers.

**Deliverables:**
- Member Detail view: full record modal/page (name, tier, FICO, dependents, heritage discount, claim history)
- Incoming Claims queue: list of member requests with approve/deny workflow UI
- Add Claim Record: form to manually record a payout against a member
- Claims history per member: visible in member detail view
- Membership Requests tab: existing approve/deny workflow preserved and polished

**Canonical refs:**
- `.planning/research/FEATURES.md`
- `.planning/PROJECT.md`

---

### Phase 5: Supabase Auth + Database

**Goal:** Wire up real authentication and data persistence. Members log in as members, staff log in as staff. Member records, claim records, and membership applications are stored in Supabase and loaded from the database. All form handlers from Phases 3 & 4 connect to real Supabase operations.

**Deliverables:**
- Supabase Auth: member login (email + password), staff login (separate role)
- Role-based routing: `ProtectedRoute` wrapper — wrong role redirects to gateway
- Database schema: `members`, `claims`, `membership_applications` tables with RLS policies
- Member portal reads from/writes to `members` and `claims` tables
- Staff portal reads from/writes to all three tables
- File a Request (Phase 3 form) creates a real `claims` record
- Membership application (Phase 3 flow) creates a real `membership_applications` record
- `AuthContext` + `useAuth` hook used throughout

**Canonical refs:**
- `.planning/codebase/INTEGRATIONS.md`
- `.planning/research/ARCHITECTURE.md`
- `.planning/PROJECT.md`

---

### Phase 6: Production Deploy

**Goal:** Ship. Clean build, push to GitHub, confirm Netlify deploys, verify the live site at https://moroccan-american-consulting-society.netlify.app/. Set environment variables in Netlify. Smoke test all critical flows.

**Deliverables:**
- `npm run build` passes with no type errors
- Netlify env vars set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Netlify build command and publish directory configured for `mafs-portal/`
- Push to GitHub main → Netlify auto-deploy succeeds
- Live site smoke test: gateway loads, member login works, staff login works, financial dashboard renders

**Canonical refs:**
- `.planning/PROJECT.md`

---

## Backlog (future milestones)

- Document upload for claims (Supabase Storage)
- Coverage benefit certificate / PDF download
- Surplus distribution notification
- Heritage Discount progress tracker
- Request timeline / lifecycle view with named stages
- Email/push notifications
- Multi-language support (Arabic/French)
- Mobile native app
