# Coding Conventions

**Analysis Date:** 2026-03-17

## Naming Patterns

**Files:**
- Components: PascalCase with `.tsx` extension (e.g., `Calculator.tsx`, `Sidebar.tsx`, `MemberPortal.tsx`)
- Services and utilities: camelCase with `.ts` extension (e.g., `engine.ts`, `supabase.ts`)
- Type/interface files: `types.ts`, `constants.ts` (lowercase)
- Barrel exports use default exports

**Functions:**
- camelCase for all functions (e.g., `calculateMonthlyPremium`, `determineAgeBracket`, `generateProjections`)
- Exported utility functions are prefixed with action verbs: `calculate*`, `determine*`, `generate*`, `fetch*`, `submit*`, `upload*`
- Private/internal functions use camelCase without prefix

**Variables:**
- camelCase for all variables and state
- React state variables follow pattern: `const [stateName, setStateName] = useState(initial)`
- Props are camelCase and typed with interfaces ending in `Props`
- Constants are UPPER_SNAKE_CASE for immutable values (e.g., `PREMIUM_RATES`, `COVERAGE_LIMITS`, `DEFAULT_ASSUMPTIONS`, `FAMILY_MULTIPLIERS`)

**Types:**
- PascalCase for all type and interface names (e.g., `AgeBracket`, `CoverageTier`, `FinancialAssumptions`, `MemberRecord`)
- Union types use PascalCase string literals (e.g., `'18-30' | '31-45' | '46-60' | '61+'`)
- Record/mapping types use generics: `Record<AgeBracket, PremiumRates>`
- Interface names describe entities (nouns): `MemberRecord`, `ClaimCalculationResult`, `YearProjection`

## Code Style

**Formatting:**
- No explicit linter or formatter configured (no .eslintrc, .prettierrc files)
- Indentation: 2 spaces (observed in all source files)
- Line length: No hard limit enforced (lines up to 168 characters observed)
- Semicolons: Always present at end of statements
- Trailing commas: Not present in multi-line structures

**Linting:**
- TypeScript compiler set to `strict: true` mode
- `forceConsistentCasingInFileNames: true` enforced
- `isolatedModules: true` for better bundler compatibility
- `skipLibCheck: true` to skip type checking for dependencies

**Configuration files:**
- `tsconfig.json` in each project root
- Vite used as build tool with `vite.config.ts`
- React 19.x and TypeScript 5.7-5.8 for both projects

## Import Organization

**Order:**
1. External React/library imports (e.g., `import React, { useState } from 'react'`)
2. Third-party library imports (e.g., `recharts`, `lucide-react`, `@supabase/supabase-js`)
3. Local type/interface imports (e.g., `import { CoverageTier } from '../types'`)
4. Local constants imports (e.g., `import { PREMIUM_RATES } from '../constants'`)
5. Local service/utility imports (e.g., `import { calculateMonthlyPremium } from '../services/engine'`)
6. Local component imports (e.g., `import Sidebar from './components/Sidebar'`)

**Path Aliases:**
- Financial dashboard uses `@` alias: `@/*` maps to current directory (e.g., `import { types } from '@/types'`)
- Member portal does not use path aliases; uses relative imports

**Examples:**
```typescript
// Financial Dashboard - with alias
import { DEFAULT_ASSUMPTIONS } from "@/constants";
import { generateProjections } from "@/services/engine";

// Member Portal - relative imports
import { calculateMonthlyPremium } from '../services/engine';
import { CoverageTier } from '../types';
```

## Error Handling

**Patterns:**
- Database/async operations: Destructure `{ data, error }` from Supabase, throw if error exists
- Try-catch blocks used for Supabase operations that may fail
- Silently catch errors in demo/preview mode with comments explaining fallback behavior
- No global error boundary observed; errors are handled locally

**Examples:**
```typescript
// Supabase pattern - throw on error
export async function submitApplication(data: {...}) {
  const { error } = await supabase.from('applications').insert({...});
  if (error) throw error;
}

// Try-catch with silent fallback
const handleSubmit = async () => {
  try {
    await submitApplication({...});
  } catch {
    // Supabase not yet configured — still proceed for demo purposes
  }
  setSubmitted(true);
};
```

## Logging

**Framework:** Native `console` only (no logging library)

**Patterns:**
- No explicit logging observed in production code
- Comments use plain text explanations rather than logging
- Type errors caught at compile time via strict TypeScript

## Comments

**When to Comment:**
- Comments explain "why" not "what" (code readability handles "what")
- Algorithm explanations for complex logic (e.g., Monte Carlo simulation comments)
- Legal/business requirement notes (e.g., "Starting reserves assumed at $500/member for initial capitalization")
- JSX structure comments: `{/* Section name */}` for grouping JSX blocks

**JSDoc/TSDoc:**
- No JSDoc/TSDoc patterns observed
- Functions are self-documenting via TypeScript types and descriptive names

**Examples:**
```typescript
// Algorithm explanation
// Box-Muller transform for standard normal distribution
function generateGaussian() {
  // ... implementation
}

// Business logic comment
// Starting reserves assumed at $500/member for initial capitalization simulation
let reserves = members * 500;

// JSX section comment
{/* Input Section */}
<div className="lg:col-span-2 space-y-6">
  {/* ... */}
</div>
```

## Function Design

**Size:**
- Average function length: 15-50 lines (observed in services and components)
- Complex calculations broken into smaller functions
- Component functions are larger (100+ lines for full form layouts)

**Parameters:**
- Named parameters preferred over positional args
- Default parameters used for optional flags (e.g., `simulations: number = 500`)
- Destructuring used for object parameters in database functions

**Return Values:**
- Functions return typed objects with all fields specified
- Result objects use descriptive field names (e.g., `ClaimCalculationResult`, `SOAResult`)
- Array functions return sorted/processed results

**Examples:**
```typescript
// Simple function with defaults
export const runMonteCarlo = (
  members: number,
  frequency: number,
  avgClaim: number,
  simulations: number = 500
) => {
  const results: number[] = [];
  // ... calculation
  results.sort((a, b) => a - b);
  return {
    median: results[Math.floor(simulations * 0.5)],
    p95: results[Math.floor(simulations * 0.95)],
    p99: results[Math.floor(simulations * 0.99)],
    worstCase: results[results.length - 1],
    bestCase: results[0]
  };
};

// Complex function with intermediate steps
export const calculateClaimPayout = (
  claimAmount: number,
  tier: CoverageTier,
  annualClaimsYtd: number = 0
): ClaimCalculationResult => {
  const limits = COVERAGE_LIMITS[tier];
  const notes: string[] = [];
  // ... step-by-step calculations
  return { claimAmount, fundPays, memberPays, notes };
};
```

## Module Design

**Exports:**
- Services export named functions (no default export)
- Components export as default export: `export default ComponentName`
- Types/interfaces always exported as named exports
- Constants exported as named exports

**Barrel Files:**
- Not used in current structure
- Imports are always direct from source files

**Examples:**
```typescript
// types.ts - named exports
export type AgeBracket = '18-30' | '31-45' | '46-60' | '61+';
export interface MemberRecord { ... }

// services/engine.ts - named function exports
export const calculateMonthlyPremium = (...) => { ... };
export const determineAgeBracket = (...) => { ... };

// components/Calculator.tsx - default component export
const Calculator: React.FC = () => { ... };
export default Calculator;
```

## React Patterns

**Component Declaration:**
- Functional components only using `React.FC` type annotation
- useState for local state management
- useEffect for side effects with dependency arrays
- useRef for DOM element references

**Props Typing:**
- All components have `Props` interface
- Interface defines all accepted props
- Default values set in function parameters

**Styling:**
- Tailwind CSS for all styling (no CSS modules or styled-components)
- Color names referenced from custom config (e.g., `morocco-green`, `morocco-dark`, `morocco-red`)
- Responsive classes used: `sm:`, `md:`, `lg:` prefixes

**Event Handlers:**
- Arrow functions preferred for event handlers
- Type inference from event: `(e: React.ChangeEvent<HTMLInputElement>)`
- State update functions passed as callbacks to child components

**Examples:**
```typescript
interface CalculatorProps {
  onComplete: () => void;
  initialAge?: number;
}

const Calculator: React.FC<CalculatorProps> = ({ onComplete, initialAge = 35 }) => {
  const [age, setAge] = useState<number>(initialAge);

  useEffect(() => {
    setPremium(calculateMonthlyPremium(age, tier, spouse, children));
  }, [age, tier, spouse, children]);

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAge(parseInt(e.target.value));
  };

  return (
    <input
      type="range"
      value={age}
      onChange={handleAgeChange}
      className="w-full h-2 bg-gray-200 rounded-lg accent-morocco-green"
    />
  );
};
```

---

*Convention analysis: 2026-03-17*
