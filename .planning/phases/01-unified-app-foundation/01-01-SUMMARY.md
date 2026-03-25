---
phase: 01-unified-app-foundation
plan: 01
subsystem: ui
tags: [react, vite, typescript, supabase, tailwind, recharts, lucide-react]

# Dependency graph
requires: []
provides:
  - mafs-portal/ Vite app scaffold with package.json, tsconfig.json, vite.config.ts, index.html
  - Unified src/types.ts with YearProjection (investmentIncome), ClaimCalculationResult (claimAmount, deductibleApplied, coinsuranceRate), FinancialAssumptions
  - Unified src/constants.ts with PREMIUM_RATES, COVERAGE_LIMITS, DEFAULT_ASSUMPTIONS, FAMILY_MULTIPLIERS, DISCOUNTS, SCENARIOS
  - Unified src/services/engine.ts with all actuarial models plus calculateClaimPayout, runMonteCarlo, generateProjections (investmentIncome-aware)
  - src/lib/supabase.ts Supabase client and DB helpers
  - src/main.tsx React entry point, src/App.tsx state machine routing
affects:
  - 01-02 (component migration — depends on engine/types/constants)
  - All subsequent plans in phase 01 and later phases

# Tech tracking
tech-stack:
  added:
    - react ^19.0.0
    - react-dom ^19.0.0
    - typescript ~5.7.2
    - vite ^6.0.0
    - "@vitejs/plugin-react" ^4.3.4
    - "@supabase/supabase-js" ^2.97.0
    - lucide-react ^0.574.0
    - recharts ^3.7.0
    - "@types/node" ^22.14.0
    - Tailwind CSS via CDN (no npm package)
  patterns:
    - State machine routing via AppView discriminated union in App.tsx
    - Single unified engine.ts with all actuarial models (SOA/CAS/Takaful/Hybrid)
    - CDN Tailwind with inline tailwind.config Morocco color tokens
    - Vite @ alias resolving to src/

key-files:
  created:
    - mafs-portal/package.json
    - mafs-portal/index.html
    - mafs-portal/vite.config.ts
    - mafs-portal/tsconfig.json
    - mafs-portal/src/main.tsx
    - mafs-portal/src/App.tsx
    - mafs-portal/src/lib/supabase.ts
    - mafs-portal/src/types.ts
    - mafs-portal/src/constants.ts
    - mafs-portal/src/services/engine.ts
  modified:
    - mafs-portal/tsconfig.json (added vite/client types for import.meta.env)

key-decisions:
  - "generateProjections uses dashboard implementation (includes investmentIncome) not portal implementation (omits it)"
  - "calculateClaimPayout and runMonteCarlo sourced from dashboard engine — portal engine did not have these"
  - "generateGaussian Box-Muller helper is private (not exported) but required by runMonteCarlo"
  - "PREMIUM_RATES and COVERAGE_LIMITS from portal (authoritative) — portal has higher rates for 31+ brackets"
  - "DEFAULT_ASSUMPTIONS from portal (avgPremium: 85 vs dashboard's 50) — portal is source of truth per CONTEXT.md"
  - "lucide-react ^0.574.0 (dashboard version) used to avoid icon name mismatches with dashboard components"
  - "moduleResolution: bundler (Vite 6 preference) rather than portal's Node setting"

patterns-established:
  - "Pattern: Morocco color tokens defined inline in index.html tailwind.config — no CSS file needed"
  - "Pattern: @ alias for src/ imports in vite.config.ts and tsconfig.json paths"
  - "Pattern: vite/client in tsconfig types for import.meta.env"

requirements-completed: [P1-SCAFFOLD, P1-ENGINE]

# Metrics
duration: 201min
completed: 2026-03-25
---

# Phase 01 Plan 01: Scaffold and Unified Foundation Summary

**mafs-portal/ Vite app scaffolded with merged engine (SOA/CAS/Takaful/Hybrid + calculateClaimPayout + runMonteCarlo), unified YearProjection (investmentIncome), enriched ClaimCalculationResult, and all constants from portal's authoritative source**

## Performance

- **Duration:** ~201 min (includes context loading and research review)
- **Started:** 2026-03-25T09:10:26Z
- **Completed:** 2026-03-25T12:31:00Z
- **Tasks:** 2/2
- **Files modified:** 10 created, 1 modified

## Accomplishments

- Scaffolded mafs-portal/ with Vite 6, React 19, TypeScript 5.7, Tailwind CDN, Morocco color tokens, Inter font
- Created unified engine.ts exporting all required functions: determineAgeBracket, calculateMonthlyPremium (6-param), ficoLoadingFactor, soaModel, casModel, takafulModel, hybridModel, generateProjections (investmentIncome-aware), generateScenarioProjections, calculateClaimPayout, runMonteCarlo
- Enriched types.ts: YearProjection gains investmentIncome, ClaimCalculationResult gains claimAmount, deductibleApplied, coinsuranceRate; FinancialAssumptions present from portal
- npm install completed, 0 TypeScript errors in types/constants/engine (only expected missing-component errors in App.tsx)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create mafs-portal/ scaffold with config files and bootstrap** - `784f577` (feat)
2. **Task 2: Create unified types.ts, constants.ts, and merged engine.ts** - `0dd6d29` (feat)

## Files Created/Modified

- `mafs-portal/package.json` — merged dependencies: lucide-react ^0.574.0, @supabase/supabase-js, recharts, @types/node
- `mafs-portal/index.html` — Tailwind CDN, Morocco color tokens, Inter font, div#root mount point
- `mafs-portal/vite.config.ts` — port 5173, react plugin, @ alias to ./src
- `mafs-portal/tsconfig.json` — ESNext, strict, moduleResolution: bundler, jsx: react-jsx, vite/client types
- `mafs-portal/src/main.tsx` — ReactDOM.createRoot entry point (from member portal index.tsx)
- `mafs-portal/src/App.tsx` — state machine routing (gateway/member-gateway/verification/enrollment/member/employee)
- `mafs-portal/src/lib/supabase.ts` — Supabase client + submitApplication, fetchApplications, updateApplicationStatus, uploadDocument, signIn, signOut, getSession
- `mafs-portal/src/types.ts` — full portal types + investmentIncome in YearProjection + claimAmount/deductibleApplied/coinsuranceRate in ClaimCalculationResult
- `mafs-portal/src/constants.ts` — portal authoritative: PREMIUM_RATES, COVERAGE_LIMITS, DEFAULT_ASSUMPTIONS, FAMILY_MULTIPLIERS, DISCOUNTS, SCENARIOS, COVERAGE_TYPES, ELIGIBILITY_REQUIREMENTS, SAMPLE_MEMBERS, SAMPLE_CLAIMS
- `mafs-portal/src/services/engine.ts` — complete merged engine (305 lines)

## Decisions Made

- Dashboard's generateProjections used (not portal's) because only the dashboard version computes and returns investmentIncome in projected objects — required since YearProjection now includes the field
- calculateClaimPayout and runMonteCarlo copied from dashboard engine — these functions do not exist in the portal engine despite the architectural claim that "portal engine is superset"
- Portal PREMIUM_RATES and COVERAGE_LIMITS are authoritative per CONTEXT.md decision (portal rates are higher for 31+ brackets)
- lucide-react ^0.574.0 (dashboard's higher version) used to avoid icon name incompatibilities when dashboard components are migrated in Plan 02

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added vite/client types to tsconfig.json**
- **Found during:** Task 2 (tsc verification run)
- **Issue:** `import.meta.env` in src/lib/supabase.ts produced TS2339 "Property 'env' does not exist on type 'ImportMeta'" — Vite's env type augmentation requires vite/client in the types array
- **Fix:** Added `"types": ["vite/client"]` to tsconfig.json compilerOptions
- **Files modified:** mafs-portal/tsconfig.json
- **Verification:** Re-ran tsc --noEmit, supabase.ts errors cleared, only App.tsx component-import errors remain (expected)
- **Committed in:** 0dd6d29 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing type declaration)
**Impact on plan:** Required for correct TypeScript compilation. No scope creep.

## Issues Encountered

- The portal engine's `generateProjections` does include investmentIncome computation internally but does NOT include it in the push() call (line 266 omits it). Confirmed by reading the portal source — switching to dashboard version was necessary and planned.

## User Setup Required

None - no external service configuration required for this plan. Supabase env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are wired but not needed until auth phase (Phase 5).

## Next Phase Readiness

- All shared modules ready: types.ts, constants.ts, engine.ts have zero TypeScript errors
- Plan 02 can immediately begin copying component files — all imports they depend on exist
- App.tsx references 6 missing components — these will be resolved in Plan 02 (component migration)
- node_modules installed, npm run dev will work once component files exist

---
*Phase: 01-unified-app-foundation*
*Completed: 2026-03-25*
