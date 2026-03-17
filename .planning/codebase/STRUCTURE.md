# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
KEEP/
├── mafs-financial-dashboard/    # Executive financial modeling and analysis tool
│   ├── components/              # React components for each dashboard view
│   ├── services/                # Business logic and calculation engine
│   ├── App.tsx                  # Root component with tab routing
│   ├── index.tsx                # React bootstrap entry point
│   ├── types.ts                 # TypeScript domain interfaces
│   ├── constants.ts             # Pricing tables, limits, defaults
│   ├── package.json             # Dependencies (React, Vite, TypeScript)
│   ├── tsconfig.json            # TypeScript compiler config
│   ├── vite.config.ts           # Vite dev/build configuration
│   └── index.html               # HTML template
│
├── mafs-member-portal/          # Member-facing self-service portal
│   ├── src/
│   │   ├── components/          # React components for UI screens
│   │   ├── services/            # Premium calculation engine
│   │   ├── lib/                 # External integrations (Supabase)
│   │   ├── App.tsx              # Root component with screen routing
│   │   ├── index.tsx            # React bootstrap entry point
│   │   ├── types.ts             # TypeScript domain interfaces
│   │   └── constants.ts         # Pricing, scenarios, sample data
│   ├── package.json             # Dependencies
│   ├── tsconfig.json            # TypeScript compiler config
│   └── index.html               # HTML template
│
└── mafs-plan/                   # Planning/documentation directory
    └── [planning files]
```

## Directory Purposes

**mafs-financial-dashboard/:**
- Purpose: Internal tool for viewing financial health, running scenarios, estimating claims, and analyzing reserves
- Audience: MAFS staff, financial analysts, leadership
- Key features: Premium calculator, dashboard KPIs, 5-year projections, claims estimator, reserve analysis
- Contains: 6 component files, 1 service file (engine.ts)

**mafs-financial-dashboard/components/:**
- Purpose: UI presentation layer for financial dashboard
- Contains: React components that render calculations and charts
- Key files:
  - `Calculator.tsx` (163 lines) - Premium calculation form with family adjustments
  - `Dashboard.tsx` (104 lines) - KPI cards and fund ratio visualizations
  - `Projections.tsx` (175 lines) - 5-year financial forecast charts
  - `ClaimsTool.tsx` (110 lines) - Claim payout estimation
  - `Reserves.tsx` (114 lines) - Reserve adequacy analysis
  - `Sidebar.tsx` (66 lines) - Navigation menu

**mafs-financial-dashboard/services/:**
- Purpose: Actuarial calculation engine shared between projects
- Contains: Pure calculation functions for premium, claims, projections, Monte Carlo simulation
- Key file: `engine.ts` - deterministic pricing logic, financial modeling

**mafs-member-portal/src/:**
- Purpose: Structure TypeScript source code
- Contains: All production code except node_modules and build outputs

**mafs-member-portal/src/components/:**
- Purpose: UI presentation layer for member self-service portal
- Contains: React components for multi-screen flow
- Key files:
  - `Gateway.tsx` (63 lines) - Initial role selection (member vs employee)
  - `MemberGateway.tsx` (53 lines) - Member sign-in or explore mode selector
  - `MemberPortal.tsx` (441 lines) - Primary member hub with tabbed interface
  - `EmployeePortal.tsx` (493 lines) - Staff administrative interface
  - `VerificationScreen.tsx` (210 lines) - KYC/verification form
  - `EnrollmentForm.tsx` (44 lines) - Membership application
  - `CoverageModeling.tsx` (276 lines) - Actuarial model display (SOA, CAS, Takaful, hybrid)
  - `EligibilityCheck.tsx` (53 lines) - Eligibility criteria display

**mafs-member-portal/src/services/:**
- Purpose: Advanced calculation engine with actuarial models
- Contains: Premium calculation, three actuarial models (SOA, CAS, Takaful), hybrid blending
- Key file: `engine.ts` - specialized functions including `soaModel()`, `casModel()`, `takafulModel()`, `hybridModel()`

**mafs-member-portal/src/lib/:**
- Purpose: External integrations and utilities
- Key file: `supabase.ts` - database operations (applications table, documents storage), authentication

## Key File Locations

**Entry Points:**
- `mafs-financial-dashboard/index.tsx` - Bootstrap React app for dashboard
- `mafs-financial-dashboard/App.tsx` - Root component, manages tab state
- `mafs-member-portal/src/index.tsx` - Bootstrap React app for portal
- `mafs-member-portal/src/App.tsx` - Root component, manages screen navigation

**Configuration:**
- `mafs-financial-dashboard/vite.config.ts` - Vite dev server config (port 3000), path aliases
- `mafs-financial-dashboard/tsconfig.json` - TypeScript strict mode, ES2022 target
- `mafs-member-portal/src/tsconfig.json` - TypeScript strict mode, ESNext target, @ path alias
- `mafs-financial-dashboard/package.json` - React 19, Vite 6, Lucide icons, Recharts
- `mafs-member-portal/package.json` - React 19, Vite 6, Supabase JS 2.97, Lucide icons

**Core Logic:**
- `mafs-financial-dashboard/services/engine.ts` - Premium calculation, claim payout, projections, Monte Carlo
- `mafs-member-portal/src/services/engine.ts` - Extended engine with SOA/CAS/Takaful actuarial models
- `mafs-member-portal/src/lib/supabase.ts` - Database and auth integration

**Domain Models:**
- `mafs-financial-dashboard/types.ts` - Domain types (AgeBracket, CoverageTier, YearProjection, ClaimCalculationResult)
- `mafs-member-portal/src/types.ts` - Extended types (MemberRecord, ClaimRecord, MembershipRequest, AppView, MemberTab)
- `mafs-financial-dashboard/constants.ts` - Premium rates, coverage limits, family multipliers, defaults
- `mafs-member-portal/src/constants.ts` - Premium rates, coverage limits, discounts, scenarios, sample data

**Styling:**
- No separate CSS files; all components use inline Tailwind CSS classes
- Color scheme: Morocco green, red, dark slate tones via Tailwind utilities

## Naming Conventions

**Files:**
- Component files: `PascalCase.tsx` (e.g., `Calculator.tsx`, `MemberPortal.tsx`)
- Service files: `camelCase.ts` (e.g., `engine.ts`, `supabase.ts`)
- Type files: `lowercase.ts` (e.g., `types.ts`, `constants.ts`)

**Directories:**
- Lowercase with hyphens: `components/`, `services/`, `lib/`
- Project root directories: kebab-case (e.g., `mafs-financial-dashboard`, `mafs-member-portal`)

**Functions:**
- Exported functions: `camelCase` (e.g., `calculateMonthlyPremium`, `submitApplication`, `generateProjections`)
- Functional components: `PascalCase` (e.g., `Calculator`, `MemberPortal`)
- Internal/helper functions: `camelCase` (e.g., `generateGaussian`)

**Types & Interfaces:**
- Type names: `PascalCase` (e.g., `AgeBracket`, `CoverageTier`, `MemberRecord`, `AppView`)
- Type aliases for unions: `PascalCase` (e.g., `AgeBracket = '18-30' | '31-45' | ...`)

**Variables:**
- Constants: `UPPER_SNAKE_CASE` (e.g., `PREMIUM_RATES`, `COVERAGE_LIMITS`, `FAMILY_MULTIPLIERS`)
- React state variables: `camelCase` (e.g., `activeTab`, `enterAsMember`, `spouse`)
- Object properties: `camelCase` with optional underscores for database fields (e.g., `submitted_at` from Supabase)

## Where to Add New Code

**New Feature (UI + Logic):**
- Component: `mafs-member-portal/src/components/[FeatureName].tsx` or `mafs-financial-dashboard/components/[FeatureName].tsx`
- Business logic: Add functions to `services/engine.ts` if calculation-based; or create new service file
- Types: Add interfaces to `types.ts`
- Constants: Add to `constants.ts` if feature has reference data
- Tests: Not currently in project; would add `[FeatureName].test.tsx` alongside component

**New Component/Module:**
- If UI-only (no logic): Create `.tsx` file in `components/` directory
- If with internal state: Use React hooks (useState, useEffect)
- If data-dependent: Accept data as props from parent or fetch via service layer
- Example structure:
  ```typescript
  import React, { useState } from 'react';
  import { SomeType } from '../types';
  import { someFunction } from '../services/engine';

  interface ComponentProps {
    onBack: () => void;
  }

  const ComponentName: React.FC<ComponentProps> = ({ onBack }) => {
    const [state, setState] = useState<Type>(initial);
    return <div>{/* render */}</div>;
  };

  export default ComponentName;
  ```

**Utilities & Helpers:**
- Shared calculation helpers: Add to `services/engine.ts`
- Shared UI utilities (if needed): Create `lib/ui.ts` or `lib/utils.ts`
- Form validation: Add functions to service layer or inline in component
- Data formatting: Add helper functions alongside calculation functions in `engine.ts`

**Database Operations:**
- Supabase queries: Add async function to `src/lib/supabase.ts`
- Pattern:
  ```typescript
  export async function myOperation(params: Type) {
    const { data, error } = await supabase
      .from('table_name')
      .select('*')
      .eq('column', value);
    if (error) throw error;
    return data;
  }
  ```
- Called from components via: `const result = await myOperation(args);`

**New Screen/Route (Member Portal):**
1. Create component file in `src/components/[ScreenName].tsx`
2. Add new view type to `AppView` union in `types.ts`
3. Add navigation case to `App.tsx` switch statement
4. Add callback buttons in existing screens to navigate to new screen

## Special Directories

**node_modules/:**
- Purpose: NPM package dependencies
- Generated: Yes (via `npm install`)
- Committed: No (listed in .gitignore)

**build/ or dist/:**
- Purpose: Vite build output (if generated locally)
- Generated: Yes (via `npm run build`)
- Committed: No (listed in .gitignore)

**public/ (if exists in HTML):**
- Purpose: Static assets served directly
- Currently: No public directory detected; assets loaded via URLs or inlined

---

*Structure analysis: 2026-03-17*
