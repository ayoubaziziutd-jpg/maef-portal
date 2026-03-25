# Phase 1: Unified App Foundation - Research

**Researched:** 2026-03-24
**Domain:** React/Vite app merge — two SPAs into one, component migration, engine consolidation
**Confidence:** HIGH (based entirely on direct codebase analysis — no speculation required)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **App Location:** New `mafs-portal/` directory at repo root (clean start, not in-place replace)
- **Structural host:** Member portal is the foundation — its routing, types, and engine are the base
- **Financial dashboard role:** Guest — its components move wholesale into staff portal
- **Engine merge:** Member portal `engine.ts` is the superset — keep as single source of truth; dashboard's additional functions merged in
- **Integration point:** `EmployeePortal.tsx` existing `activeTab === 'dashboard'` stub — replace the "Coming Soon" div with dashboard components
- **Component organization:** Mirror existing structure with `src/components/shared/` and `src/components/dashboard/` additions
- **Netlify target:** Build from `mafs-portal/`, publish `mafs-portal/dist`

### Claude's Discretion

- Exact tsconfig settings
- vite.config.ts path aliases
- index.html content
- Whether to keep `mafs-member-portal/` and `mafs-financial-dashboard/` directories (recommend keeping but not deploying)

### Deferred Ideas (OUT OF SCOPE)

- Supabase auth wiring — Phase 5
- UI redesign / brand system — Phase 2
- New member features (File a Request, etc.) — Phase 3
- New staff features (claims adjudication, etc.) — Phase 4
</user_constraints>

---

## Summary

This phase is a pure copy-and-merge migration. No new features, no new patterns. The two existing SPAs are well-understood; the main work is creating the `mafs-portal/` scaffold, copying files in the right order, fixing import paths, and wiring the `EmployeePortal` "Coming Soon" stub to render the 5 dashboard components.

The single highest-risk item is the engine merge. The member portal engine (`engine.ts`) is claimed to be the superset — but direct analysis reveals it is **not a complete superset**. It lacks `calculateClaimPayout` and `runMonteCarlo`, which exist only in the dashboard engine and are required by two dashboard components (`ClaimsTool.tsx` and `Reserves.tsx`). These must be merged in from the dashboard engine.

Additionally, the two `YearProjection` types differ by one field (`investmentIncome` exists in the dashboard type but not the portal type), and the two `ClaimCalculationResult` types differ significantly (the dashboard version has 3 extra fields: `claimAmount`, `deductibleApplied`, `coinsuranceRate`). The unified types file must use the dashboard's richer versions of these interfaces.

**Primary recommendation:** Scaffold `mafs-portal/` using the member portal as the structural base. Merge the two engines by starting with the portal engine and adding `calculateClaimPayout` + `runMonteCarlo` from the dashboard engine. Use the dashboard's richer `YearProjection` and `ClaimCalculationResult` type definitions. Copy dashboard components verbatim to `src/components/dashboard/` and fix import paths from `../` to relative paths within the new structure.

---

## Standard Stack

### Core (locked — no alternatives)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| react | ^19.0.0 | UI framework | member portal package.json |
| react-dom | ^19.0.0 | DOM rendering | member portal package.json |
| typescript | ~5.7.2 | Type checking | member portal package.json |
| vite | ^6.0.0 | Build tool and dev server | member portal package.json |
| @vitejs/plugin-react | ^4.3.4 | React Fast Refresh | member portal package.json |

### Key Dependencies

| Library | Version | Purpose | Note |
|---------|---------|---------|------|
| @supabase/supabase-js | ^2.97.0 | DB + auth client | member portal only — carry over |
| lucide-react | ^0.474.0 | Icons | both apps use this |
| recharts | ^3.7.0 | Charts (Projections, Dashboard, Reserves) | both apps use this |
| @types/react | ^19.0.0 | React type defs | dev dep |
| @types/react-dom | ^19.0.0 | React DOM type defs | dev dep |

**Note:** The dashboard uses lucide-react ^0.574.0 (higher). The unified package.json should use the higher version (^0.574.0) to avoid icon name mismatches. The dashboard also uses `@types/node ^22.14.0` as a dev dep — include it because `vite.config.ts` uses `path` (Node built-in) for the `@` alias resolution.

**Unified package.json dependencies (merge result):**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.97.0",
    "lucide-react": "^0.574.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "recharts": "^3.7.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.7.2",
    "vite": "^6.0.0"
  }
}
```

### Tailwind CSS — Critical Configuration Note

**Both existing apps use Tailwind via CDN in `index.html`**, not via npm. The `index.html` loads `https://cdn.tailwindcss.com` and configures the theme inline via a `<script>tailwind.config = {...}</script>` block.

The financial dashboard's `index.html` defines Morocco color tokens:
```javascript
tailwind.config = {
  theme: { extend: {
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    colors: { morocco: { red: '#C1272D', green: '#006233', green_light: '#008545', dark: '#1a1a1a' } }
  }}
}
```

The member portal has no `index.html` at its root (it was not found). The member portal's Tailwind config must be reconstructed. Given the CONTEXT.md discretion on `index.html` content, the unified app's `index.html` must:
1. Load Tailwind CDN
2. Define the Morocco color tokens (same as dashboard)
3. Load Inter font from Google Fonts
4. Mount at `<div id="root"></div>`
5. Load `src/main.tsx` (not `index.tsx` — follow the ARCHITECTURE.md recommendation to rename to Vite convention)

The member portal's `src/index.tsx` uses `ReactDOM.createRoot` correctly — copy to `src/main.tsx`.

---

## Architecture Patterns

### Recommended Project Structure

The ARCHITECTURE.md in `.planning/research/` defines the full desired structure. For Phase 1 (migration only — no new features), the scope is simpler than what that document describes. Phase 1 must only deliver working screens, not the full auth/hooks/context layer proposed for later phases.

**Phase 1 target structure (migration scope only):**
```
mafs-portal/
├── index.html              # Tailwind CDN + Morocco color tokens + Inter font
├── package.json            # Merged dependencies (see above)
├── vite.config.ts          # Port 5173, react plugin, @ alias to src/
├── tsconfig.json           # ESNext target, strict, jsx: react-jsx
│
└── src/
    ├── main.tsx             # React bootstrap (ReactDOM.createRoot)
    ├── App.tsx              # State machine from member portal (add 'employee' view)
    │
    ├── types.ts             # Unified types (portal superset + dashboard additions)
    ├── constants.ts         # Unified constants (portal version is the right source)
    │
    ├── lib/
    │   └── supabase.ts      # Copy directly from member portal
    │
    ├── services/
    │   └── engine.ts        # Merged engine (see Engine Merge section below)
    │
    └── components/
        ├── Gateway.tsx              # Copy from member portal
        ├── MemberGateway.tsx        # Copy from member portal
        ├── VerificationScreen.tsx   # Copy from member portal
        ├── EnrollmentForm.tsx       # Copy from member portal
        ├── MemberPortal.tsx         # Copy from member portal
        ├── EmployeePortal.tsx       # Copy from member portal + replace dashboard stub
        ├── CoverageModeling.tsx     # Copy from member portal
        ├── EligibilityCheck.tsx     # Copy from member portal
        │
        └── dashboard/
            ├── Calculator.tsx       # Copy from mafs-financial-dashboard/components/
            ├── Dashboard.tsx        # Copy from mafs-financial-dashboard/components/
            ├── Projections.tsx      # Copy from mafs-financial-dashboard/components/
            ├── ClaimsTool.tsx       # Copy from mafs-financial-dashboard/components/
            └── Reserves.tsx         # Copy from mafs-financial-dashboard/components/
```

Note: `Sidebar.tsx` from the financial dashboard is NOT copied — it is the dashboard's standalone navigation shell, which is replaced by the existing `EmployeePortal.tsx` tab navigation. The dashboard components themselves (Dashboard, Projections, Reserves, ClaimsTool, Calculator) get their own sub-navigation inside the EmployeePortal 'dashboard' tab.

### Pattern 1: State Machine Screen Routing

**What:** `App.tsx` uses a `view` state variable (typed discriminated union `AppView`) and a `switch` statement to conditionally render screen components.

**Current AppView union (from `mafs-member-portal/src/types.ts`):**
```typescript
export type AppView = 'gateway' | 'member-gateway' | 'verification' | 'enrollment' | 'member' | 'employee';
```

**No changes needed** — the existing 'employee' view already routes to `EmployeePortal`. The state machine does not need modification for Phase 1.

**Example (verbatim from member portal App.tsx):**
```typescript
// Source: mafs-member-portal/src/App.tsx
case 'employee':
  return <EmployeePortal onBack={() => setView('gateway')} />;
```

### Pattern 2: Tab Navigation Inside EmployeePortal

**What:** `EmployeePortal.tsx` manages `activeTab` state and renders the correct section conditionally.

**Existing stub (line 73-78 of EmployeePortal.tsx):**
```typescript
// Source: mafs-member-portal/src/components/EmployeePortal.tsx
{activeTab === 'dashboard' && (
  <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border">
    <h2 className="text-2xl font-bold text-gray-400">Financials Dashboard — Coming Soon</h2>
  </div>
)}
```

**Replacement target:** Replace this div with a sub-navigation shell that replicates `mafs-financial-dashboard/App.tsx`'s tab structure inline.

**Pattern from dashboard App.tsx:**
```typescript
// Source: mafs-financial-dashboard/App.tsx
const [activeTab, setActiveTab] = useState('calculator');
const renderContent = () => {
  switch (activeTab) {
    case 'calculator': return <Calculator />;
    case 'dashboard': return <Dashboard />;
    case 'projections': return <Projections />;
    case 'claims': return <ClaimsTool />;
    case 'reserves': return <Reserves />;
    default: return <Calculator />;
  }
};
```

This inner `activeTab` state must be scoped to the financials section inside `EmployeePortal` — it uses a different variable name from the outer `activeTab` to avoid shadowing (e.g., `financialsTab`/`setFinancialsTab`).

### Pattern 3: Dashboard Component Import Paths

**What:** All 5 dashboard components use relative imports pointing to `../services/engine`, `../constants`, and `../types`.

**Current import paths in dashboard components:**
```typescript
// From mafs-financial-dashboard/components/Dashboard.tsx
import { DEFAULT_ASSUMPTIONS } from '../constants';
import { generateProjections } from '../services/engine';

// From mafs-financial-dashboard/components/Projections.tsx
import { generateProjections } from '../services/engine';
import { DEFAULT_ASSUMPTIONS } from '../constants';
import { FinancialAssumptions } from '../types';

// From mafs-financial-dashboard/components/ClaimsTool.tsx
import { CoverageTier } from '../types';
import { calculateClaimPayout } from '../services/engine';

// From mafs-financial-dashboard/components/Reserves.tsx
import { runMonteCarlo } from '../services/engine';
import { DEFAULT_ASSUMPTIONS } from '../constants';

// From mafs-financial-dashboard/components/Calculator.tsx
import { calculateMonthlyPremium } from '../services/engine';
import { COVERAGE_LIMITS } from '../constants';
import { CoverageTier } from '../types';
```

**After migration to `src/components/dashboard/`**, the relative imports must update:
- `'../constants'` → `'../../constants'`
- `'../types'` → `'../../types'`
- `'../services/engine'` → `'../../services/engine'`

This is the only change required to make the dashboard components work in the unified app.

### Anti-Patterns to Avoid

- **Importing Sidebar.tsx from the dashboard:** Not needed. The EmployeePortal provides its own navigation. Sidebar.tsx can be left behind.
- **Keeping two engine.ts files:** Every dashboard component imports from a relative path. After migration, there is exactly one engine at `src/services/engine.ts`. Never have two.
- **Skipping the YearProjection type reconciliation:** The portal's `YearProjection` is missing `investmentIncome`. The `generateProjections` function in the dashboard engine *does* compute and include `investmentIncome` in its returned objects. The portal engine's `generateProjections` does NOT. Using the portal engine verbatim will cause TypeScript errors when the dashboard's Projections or Dashboard components try to read `investmentIncome`. Use the dashboard's `YearProjection` definition.
- **Using the portal's `ClaimCalculationResult` unchanged:** The portal definition omits `claimAmount`, `deductibleApplied`, and `coinsuranceRate` which `ClaimsTool.tsx` may reference. Use the dashboard's richer interface.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSS custom colors | Custom CSS file | Tailwind CDN `tailwind.config` inline in `index.html` | Already established pattern in both apps |
| Chart rendering | Custom SVG charts | recharts (already installed) | All existing chart components use it |
| Icon system | Custom SVGs | lucide-react (already installed) | Used throughout both apps |
| DB/auth ops | Raw fetch to Supabase REST | `@supabase/supabase-js` client (already in `lib/supabase.ts`) | Already abstracted correctly |
| Path aliases | None / relative paths everywhere | `@` alias in `vite.config.ts` → `src/` | Cleaner imports; already used in dashboard |

---

## Common Pitfalls

### Pitfall 1: Engine "Superset" Claim is Partially False

**What goes wrong:** Copying the portal engine verbatim and declaring the merge done. `ClaimsTool.tsx` calls `calculateClaimPayout`, `Reserves.tsx` calls `runMonteCarlo` — both absent from the portal engine. The build fails with "module has no exported member" TypeScript errors.

**Why it happens:** The CONTEXT.md and ARCHITECTURE.md claim "portal engine is the superset" — this is true for the actuarial models (SOA/CAS/Takaful/hybrid) but false for claim/reserve calculation functions.

**How to avoid:** The unified `engine.ts` must include all of the following exports:
- From portal engine: `determineAgeBracket`, `calculateMonthlyPremium`, `ficoLoadingFactor`, `soaModel`, `casModel`, `takafulModel`, `hybridModel`, `generateProjections`, `generateScenarioProjections`
- From dashboard engine (must be added): `calculateClaimPayout`, `runMonteCarlo`

**Verification:** After creating `src/services/engine.ts`, grep for all exported names and confirm this complete list is present.

### Pitfall 2: YearProjection Type Mismatch Breaks Dashboard Components

**What goes wrong:** TypeScript error: `Property 'investmentIncome' does not exist on type 'YearProjection'`.

**Root cause:** The portal `YearProjection` interface (in `src/types.ts`) does NOT include `investmentIncome`. The dashboard `YearProjection` DOES. `Projections.tsx` and `Dashboard.tsx` compute/display data returned by `generateProjections()`, which in the dashboard engine includes `investmentIncome` in the returned object.

**Types reconciliation required:**
```typescript
// Use dashboard's richer YearProjection (add investmentIncome)
export interface YearProjection {
  year: number;
  members: number;
  premiumRevenue: number;
  expectedClaims: number;
  adminExpenses: number;
  investmentIncome: number;   // <-- present in dashboard, missing in portal
  netIncome: number;
  reserves: number;
  reserveRatio: number;
  combinedRatio: number;
}
```

Also use the dashboard's `ClaimCalculationResult` (adds `claimAmount`, `deductibleApplied`, `coinsuranceRate`).

### Pitfall 3: Dashboard Components Import Path Not Updated

**What goes wrong:** Dashboard components copied to `src/components/dashboard/` but imports still point to `'../services/engine'` (one level up) instead of `'../../services/engine'` (two levels up). TypeScript cannot resolve the module.

**Warning signs:** Build error `Cannot find module '../services/engine'` immediately after starting the dev server.

**How to avoid:** After copying each component to `src/components/dashboard/`, update all 3 import prefixes: `'../'` → `'../../'` for `constants`, `types`, and `services/engine`.

### Pitfall 4: Tailwind Color Token Mismatch

**What goes wrong:** Member portal components use `morocco-green`, `morocco-dark`, `morocco-red` Tailwind tokens. Dashboard components use `morocco-dark`, `morocco-green`. If the unified `index.html` Tailwind config doesn't include these tokens, all components render with unstyled gray fallbacks (Tailwind purges unknown classes).

**How to avoid:** The unified `index.html` must include the exact Morocco color config from the financial dashboard's `index.html`:
```javascript
tailwind.config = {
  theme: { extend: {
    fontFamily: { sans: ['Inter', 'sans-serif'] },
    colors: {
      morocco: {
        red: '#C1272D',
        green: '#006233',
        green_light: '#008545',
        dark: '#1a1a1a'
      }
    }
  }}
}
```

Note: PROJECT.md specifies maef-green (#0D5F3A) and gold (#D4A843) as brand colors — but existing components use #006233 (morocco-green). Do NOT change the color tokens in Phase 1. Brand system update is deferred to Phase 2.

### Pitfall 5: Financial Dashboard's `calculateMonthlyPremium` Has Fewer Parameters

**What goes wrong:** The portal's `calculateMonthlyPremium` takes 6 arguments `(age, tier, hasSpouse, childrenCount, communityMember?, annualPayment?)`. The dashboard's version takes only 4 `(age, tier, hasSpouse, childrenCount)`. If any portal components call `calculateMonthlyPremium` with 5 or 6 args, those calls are valid against the portal signature. The unified engine uses the portal (superset) signature. Dashboard's `Calculator.tsx` calls it with 4 args — still valid since params 5 and 6 are optional.

**This is not a problem IF** the unified engine uses the portal's signature (with optional params 5 and 6). Do not use the dashboard's shorter signature.

### Pitfall 6: `DEFAULT_ASSUMPTIONS` Values Differ Between Apps

**What goes wrong:** The portal constants have `avgPremium: 85`, the dashboard has `avgPremium: 50`. Dashboard's `Dashboard.tsx` and `Reserves.tsx` use `DEFAULT_ASSUMPTIONS` to seed initial calculations. Using the portal's higher `avgPremium` value will show different KPI numbers than the dashboard's original output.

**Decision needed:** Since the member portal is the "source of truth" per CONTEXT.md, use the portal's `DEFAULT_ASSUMPTIONS`. The dashboard display values will change slightly — this is acceptable for a migration phase with no new features.

**PREMIUM_RATES also differ** — the portal has substantially higher rates for older brackets:
- `'31-45'`: portal `{basic: 45, standard: 67.5, premium: 101.25}` vs dashboard `{basic: 40, standard: 57.5, premium: 85}`
- `'46-60'`: portal `{basic: 70, ...}` vs dashboard `{basic: 57.5, ...}`
- `'61+'`: portal `{basic: 110, ...}` vs dashboard `{basic: 85, ...}`

Use the portal PREMIUM_RATES (they also differ in COVERAGE_LIMITS for Standard and Premium tiers). The portal's limits are the authoritative business logic.

### Pitfall 7: No vite.config.ts in Member Portal

**What goes wrong:** The member portal has no `vite.config.ts`. It relies on Vite defaults (port 3000 is the dashboard's port; Vite default is 5173). The unified app needs an explicit `vite.config.ts` to:
1. Set `server.port = 5173` (required by deliverables)
2. Configure the `@` path alias pointing to `./src`
3. Add the React plugin

**Base config to use:**
```typescript
// mafs-portal/vite.config.ts
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: { port: 5173 },
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
});
```

Note: The dashboard's vite.config includes `define` blocks for `process.env.API_KEY` (Gemini API). This is NOT needed in the unified app — the Gemini integration is dashboard-only and is not being migrated.

---

## Code Examples

### Unified EmployeePortal Dashboard Tab (the core integration)

```typescript
// src/components/EmployeePortal.tsx — replace the "Coming Soon" block

// Add at top of file with other imports:
import Calculator from './dashboard/Calculator';
import FinancialDashboard from './dashboard/Dashboard';
import Projections from './dashboard/Projections';
import ClaimsTool from './dashboard/ClaimsTool';
import Reserves from './dashboard/Reserves';

// Inside EmployeePortal component, add state:
const [financialsTab, setFinancialsTab] = useState<'calculator' | 'dashboard' | 'projections' | 'claims' | 'reserves'>('dashboard');

// Replace the "Coming Soon" div (lines 73-77):
{activeTab === 'dashboard' && (
  <div>
    <div className="flex gap-2 mb-6 border-b pb-2">
      {(['dashboard', 'projections', 'claims', 'reserves', 'calculator'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => setFinancialsTab(tab)}
          className={`px-4 py-2 rounded-t text-sm font-medium ${financialsTab === tab ? 'bg-white border-b-2 border-emerald-600 text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </div>
    {financialsTab === 'dashboard' && <FinancialDashboard />}
    {financialsTab === 'projections' && <Projections />}
    {financialsTab === 'claims' && <ClaimsTool />}
    {financialsTab === 'reserves' && <Reserves />}
    {financialsTab === 'calculator' && <Calculator />}
  </div>
)}
```

### Unified engine.ts export list

The merged engine must export all of these (verified by grepping both source engines):

```typescript
// From portal engine (carry over verbatim):
export const determineAgeBracket = ...
export const calculateMonthlyPremium = ...   // 6-param version with optional community/annual flags
export const ficoLoadingFactor = ...
export interface SOAResult { ... }
export function soaModel(...): SOAResult { ... }
export interface CASResult { ... }
export function casModel(...): CASResult { ... }
export interface TakafulResult { ... }
export function takafulModel(...): TakafulResult { ... }
export interface HybridResult { ... }
export function hybridModel(...): HybridResult { ... }
export const generateProjections = ...       // use portal version (omits investmentIncome in output)
export const generateScenarioProjections = ...

// From dashboard engine (must ADD to portal engine):
export const calculateClaimPayout = ...      // required by ClaimsTool.tsx
export const runMonteCarlo = ...             // required by Reserves.tsx
// (also add private generateGaussian() helper — not exported, but required by runMonteCarlo)
```

**IMPORTANT:** The dashboard's `generateProjections` includes `investmentIncome` in the returned `YearProjection` objects. The portal's does NOT. Since `YearProjection` must include `investmentIncome` (to avoid type errors in dashboard components), the unified engine's `generateProjections` must also compute and include it. Use the **dashboard's** `generateProjections` implementation (which includes `investmentIncome`), not the portal's.

### Unified types.ts — key additions

```typescript
// Use dashboard's richer versions of these two interfaces:

export interface YearProjection {
  year: number;
  members: number;
  premiumRevenue: number;
  expectedClaims: number;
  adminExpenses: number;
  investmentIncome: number;  // ADD this — missing from portal, required by dashboard components
  netIncome: number;
  reserves: number;
  reserveRatio: number;
  combinedRatio: number;
}

export interface ClaimCalculationResult {
  claimAmount: number;       // ADD — missing from portal
  fundPays: number;
  memberPays: number;
  deductibleApplied: number; // ADD — missing from portal
  coinsuranceRate: number;   // ADD — missing from portal
  withinLimits: boolean;
  notes: string[];
}
```

All other types come from the portal's `types.ts` (it is the genuine superset for everything else: `AppView`, `MemberTab`, `EmployeeTab`, `MemberRecord`, `ClaimRecord`, `MembershipRequest`, `ScenarioAssumptions`, `DiscountConfig`).

### tsconfig.json for unified app

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

Use `"moduleResolution": "bundler"` (Vite 6 preference, also used in dashboard tsconfig) rather than the portal's `"Node"` setting.

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 1 |
|--------------|------------------|--------------------|
| Dashboard as standalone app | Dashboard components embedded in staff portal | This IS the migration task |
| Two separate engines | One merged engine | Carry dashboard-only functions in |
| CDN Tailwind | CDN Tailwind (keep) | No change needed — both apps use CDN |
| `index.tsx` entry point | `main.tsx` (Vite convention) | Rename; update index.html script src |

---

## Open Questions

1. **Does `Projections.tsx` or `Dashboard.tsx` reference `investmentIncome` directly?**
   - What we know: The dashboard's `YearProjection` type includes it; the dashboard `generateProjections` produces it
   - What's unclear: Whether these components actually read the field by name in their render logic (files were read but only first 20 lines)
   - Recommendation: Confirm by reading the full component files during planning/implementation. Either way, the `YearProjection` type must include `investmentIncome` for the type to match the function's return value.

2. **Member portal has no `index.html` at its root — where does it live?**
   - What we know: The member portal has no `vite.config.ts` and no `index.html` at the root. The `package.json` runs `tsc && vite build`. Vite 6 defaults to looking for `index.html` at the project root.
   - Likely explanation: The member portal may have been developed using the financial dashboard's `index.html` as a template or is missing the file entirely (perhaps it was served differently). The unified app must create a fresh `index.html`.
   - Recommendation: Write a fresh `index.html` based on the financial dashboard's template with the MAFS title and Morocco color config.

---

## Validation Architecture

`nyquist_validation: true` in `.planning/config.json` — this section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None currently installed in either app — no test infrastructure exists |
| Config file | Wave 0 task: create `mafs-portal/vitest.config.ts` |
| Quick run command | `cd mafs-portal && npm run test -- --run` |
| Full suite command | `cd mafs-portal && npm run test -- --run --reporter=verbose` |
| Build verification | `cd mafs-portal && npm run build` |

Since no test infrastructure exists in either app, Phase 1 validation relies primarily on build verification and smoke checks. The "tests" for this phase are structural verifications, not behavioral unit tests.

### Phase 1 Requirements → Validation Map

| Check ID | Behavior | Validation Type | Command |
|----------|----------|-----------------|---------|
| P1-01 | `npm run build` exits 0 | Build check | `cd /path/to/mafs-portal && npm run build` |
| P1-02 | Dev server starts at localhost:5173 | Process check | `cd mafs-portal && timeout 15 npm run dev` (look for "Local: http://localhost:5173") |
| P1-03 | All portal component files present | File existence | `ls mafs-portal/src/components/*.tsx` |
| P1-04 | All dashboard component files present | File existence | `ls mafs-portal/src/components/dashboard/*.tsx` |
| P1-05 | Engine exports all required functions | TypeScript check (caught by build) | Covered by P1-01 |
| P1-06 | EmployeePortal imports all 4 dashboard components | Grep check | `grep -n "import.*from.*dashboard" mafs-portal/src/components/EmployeePortal.tsx` |
| P1-07 | No import errors (no unresolved modules) | Build check | Covered by P1-01 — TS errors fail the build |
| P1-08 | Unified engine has `calculateClaimPayout` | Grep check | `grep "export.*calculateClaimPayout" mafs-portal/src/services/engine.ts` |
| P1-09 | Unified engine has `runMonteCarlo` | Grep check | `grep "export.*runMonteCarlo" mafs-portal/src/services/engine.ts` |
| P1-10 | `YearProjection` includes `investmentIncome` | Grep check | `grep "investmentIncome" mafs-portal/src/types.ts` |

### Specific Validation Commands

**Build verification (primary gate):**
```bash
cd /Users/ayoubazizi/Documents/Professional/Projects/MAFS/KEEP/mafs-portal
npm install
npm run build
# Must exit 0 with no TypeScript errors
```

**Dev server start check:**
```bash
cd /Users/ayoubazizi/Documents/Professional/Projects/MAFS/KEEP/mafs-portal
npm run dev &
sleep 8
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173
# Must return 200
kill %1
```

**EmployeePortal Financials tab shows all 4 dashboard components:**
```bash
grep -c "import.*from.*dashboard" mafs-portal/src/components/EmployeePortal.tsx
# Must be >= 4 (Dashboard, Projections, Reserves, ClaimsTool)
grep -E "(FinancialDashboard|Projections|ClaimsTool|Reserves)" mafs-portal/src/components/EmployeePortal.tsx
# Must show all 4
```

**Engine exports all required functions:**
```bash
grep "^export" mafs-portal/src/services/engine.ts
# Must include: determineAgeBracket, calculateMonthlyPremium, calculateClaimPayout,
# runMonteCarlo, generateProjections, soaModel, casModel, takafulModel, hybridModel
```

**All component files present:**
```bash
ls mafs-portal/src/components/*.tsx | wc -l
# Must be >= 8 (all portal components)
ls mafs-portal/src/components/dashboard/*.tsx | wc -l
# Must be exactly 5 (Calculator, Dashboard, Projections, ClaimsTool, Reserves)
```

### Wave 0 Gaps

- [ ] `mafs-portal/package.json` — does not exist yet (scaffold task)
- [ ] `mafs-portal/vite.config.ts` — does not exist yet
- [ ] `mafs-portal/tsconfig.json` — does not exist yet
- [ ] `mafs-portal/index.html` — does not exist yet (member portal had no index.html)
- [ ] `mafs-portal/src/main.tsx` — does not exist yet

All Wave 0 gaps are scaffolding tasks, not test infrastructure gaps. There are no behavioral tests to write for this phase — the primary verification is build success (`npm run build` exits 0).

---

## Sources

### Primary (HIGH confidence — direct codebase analysis)

- `mafs-member-portal/src/App.tsx` — routing state machine, AppView union
- `mafs-member-portal/src/types.ts` — full type inventory including missing fields
- `mafs-member-portal/src/services/engine.ts` — export list, missing calculateClaimPayout/runMonteCarlo confirmed
- `mafs-member-portal/src/constants.ts` — PREMIUM_RATES, COVERAGE_LIMITS values
- `mafs-member-portal/src/lib/supabase.ts` — Supabase helper functions
- `mafs-member-portal/package.json` — exact dependency versions
- `mafs-financial-dashboard/App.tsx` — tab structure to replicate inside EmployeePortal
- `mafs-financial-dashboard/types.ts` — richer YearProjection and ClaimCalculationResult
- `mafs-financial-dashboard/services/engine.ts` — calculateClaimPayout, runMonteCarlo, generateGaussian
- `mafs-financial-dashboard/constants.ts` — DEFAULT_ASSUMPTIONS, PREMIUM_RATES (different values confirmed)
- `mafs-financial-dashboard/components/*.tsx` — import patterns for all 5 dashboard components
- `mafs-financial-dashboard/index.html` — Tailwind CDN config with Morocco color tokens
- `mafs-financial-dashboard/vite.config.ts` — @ alias, port config, react plugin
- `mafs-financial-dashboard/tsconfig.json` — moduleResolution: bundler
- `mafs-member-portal/tsconfig.json` — moduleResolution: Node (to be updated to bundler)
- `.planning/config.json` — nyquist_validation: true confirmed
- `.planning/codebase/ARCHITECTURE.md` — pattern documentation
- `.planning/research/ARCHITECTURE.md` — recommended unified structure, anti-patterns
- `.planning/phases/01-unified-app-foundation/01-CONTEXT.md` — locked decisions

### Secondary (MEDIUM confidence)

- ARCHITECTURE.md's claim that "portal engine is the superset" — PARTIALLY VERIFIED (true for actuarial models; false for calculateClaimPayout and runMonteCarlo)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — exact versions read from package.json files
- Architecture patterns: HIGH — directly observed from source files
- Engine merge strategy: HIGH — confirmed by grepping export lists in both engine files
- Type reconciliation: HIGH — both types.ts files read in full; differences are exact
- Import path updates: HIGH — all 5 dashboard component files read for import statements
- Pitfalls: HIGH — derived from direct code analysis, not speculation

**Research date:** 2026-03-24
**Valid until:** This research is based on static file analysis of committed code — valid until files change. No external dependencies or API docs referenced; no staleness risk.
