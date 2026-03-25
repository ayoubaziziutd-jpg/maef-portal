# Phase 1: Unified App Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Merge `mafs-member-portal` and `mafs-financial-dashboard` into a single `mafs-portal/` Vite app. All existing screens work. Financial dashboard components live inside the staff portal's Financials tab. No new features — migration only. App builds and runs.

</domain>

<decisions>
## Implementation Decisions

### App Location
- New `mafs-portal/` directory at repo root (clean start, not in-place replace of member portal)
- Member portal is the structural host — its routing, types, and engine are the foundation
- Financial dashboard is the guest — its components move wholesale into staff portal

[auto] Directory structure — "New mafs-portal/ at root" (recommended — clean slate avoids clobbering existing working app during migration)

### Engine Merge Strategy
- Member portal `engine.ts` is the superset — keep it as the single source of truth
- Dashboard's additional engine functions (if any) are merged into the member portal engine
- No two engine files — one `src/services/engine.ts` in the unified app

[auto] Engine merge — "Member portal engine is superset" (recommended — already confirmed by codebase analysis in ARCHITECTURE.md)

### Financial Dashboard Integration Point
- `EmployeePortal.tsx` already has `activeTab === 'dashboard'` stub
- Dashboard components (Dashboard, Projections, Reserves, ClaimsTool, Calculator) drop into that tab
- Navigation handled by existing EmployeePortal tab switcher — no new routing needed

[auto] Integration point — "Use existing EmployeePortal tab stub" (recommended — insertion point already exists at line 74)

### Component Organization
- Mirror existing structure: `src/components/` with portal-specific components flat
- Add `src/components/shared/` for components used by both member and staff sides
- Add `src/components/dashboard/` for the 5 financial dashboard components
- No new component abstraction layer — just organized folders

[auto] Component organization — "Mirror existing + dashboard/ subfolder" (recommended — minimal change, low migration risk)

### Netlify Build Target
- After migration, Netlify build command becomes `npm run build` run from `mafs-portal/`
- Publish directory: `mafs-portal/dist`
- Update netlify.toml or Netlify UI to point at the new app

[auto] Deploy config — "Update Netlify to mafs-portal/dist" (recommended — single app, single deploy)

### Claude's Discretion
- Exact tsconfig settings
- vite.config.ts path aliases
- index.html content
- Whether to keep mafs-member-portal/ and mafs-financial-dashboard/ directories (recommend keeping but not deploying — safe to delete later)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture & Structure
- `.planning/codebase/ARCHITECTURE.md` — System design, patterns used throughout both apps
- `.planning/codebase/STRUCTURE.md` — Directory layout of both existing apps
- `.planning/research/ARCHITECTURE.md` — Recommended unified folder structure, exact integration point for dashboard components

### Project Requirements
- `.planning/PROJECT.md` — Tech stack constraints, brand colors, deployment requirements, single app mandate

### Codebase Patterns
- `.planning/codebase/CONVENTIONS.md` — Code style, naming patterns to follow in the unified app
- `.planning/codebase/STACK.md` — Exact dependency versions to use

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mafs-member-portal/src/App.tsx`: Top-level screen state machine — copy as basis for unified App.tsx
- `mafs-member-portal/src/services/engine.ts`: The superset engine — copy directly into `mafs-portal/src/services/engine.ts`
- `mafs-member-portal/src/lib/supabase.ts`: Supabase client — copy directly
- `mafs-member-portal/src/types.ts`: Unified types file — copy as basis
- `mafs-member-portal/src/constants.ts`: Copy directly
- All `mafs-member-portal/src/components/*.tsx`: Copy all to `mafs-portal/src/components/`
- `mafs-financial-dashboard/components/Dashboard.tsx` etc.: Copy to `mafs-portal/src/components/dashboard/`

### Established Patterns
- State machine routing: `view` state variable in App.tsx controls which screen renders (no React Router)
- Tailwind CSS for all styling — no CSS modules, no styled-components
- React 19 with hooks — no class components

### Integration Points
- `EmployeePortal.tsx` line ~74: `{activeTab === 'dashboard' && <div>Financials Dashboard — Coming Soon</div>}` — replace this div with the 5 dashboard components
- `mafs-financial-dashboard/App.tsx`: Tab routing shows how to compose Dashboard, Projections, Reserves, ClaimsTool, Calculator — replicate this pattern inside the 'dashboard' tab

</code_context>

<specifics>
## Specific Ideas

- "Everything was built here and pasted to GitHub which Netlify deploys" — existing flow is push to GitHub main → Netlify auto-deploy
- The two apps are separate today but the member portal is already the right shape — gateway, member/staff split, tabs
- Financial dashboard's 5 views need their own sub-navigation inside the staff portal's Financials tab

</specifics>

<deferred>
## Deferred Ideas

- Supabase auth wiring — Phase 5
- UI redesign / brand system — Phase 2
- New member features (File a Request, etc.) — Phase 3
- New staff features (claims adjudication, etc.) — Phase 4

</deferred>

---

*Phase: 01-unified-app-foundation*
*Context gathered: 2026-03-24*
