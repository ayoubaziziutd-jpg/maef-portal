# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Multi-application React SPA with component-driven UI architecture and shared business logic layer.

**Key Characteristics:**
- Tab-based navigation using React state management
- Stateless calculation engine decoupled from components
- TypeScript-first type safety across all projects
- Vite-powered build with client-side rendering only
- Shared domain model (types, constants, engine logic)

## Layers

**Presentation Layer (UI Components):**
- Purpose: Render domain data and handle user interactions
- Location: `mafs-financial-dashboard/components/` and `mafs-member-portal/src/components/`
- Contains: React functional components with hooks, styled with Tailwind CSS
- Depends on: Services layer (engine, supabase)
- Used by: App.tsx entry point

**Services/Business Logic Layer:**
- Purpose: Encapsulate domain calculations, data models, and external integrations
- Location: `mafs-financial-dashboard/services/engine.ts`, `mafs-member-portal/src/services/engine.ts`, `mafs-member-portal/src/lib/supabase.ts`
- Contains: Premium calculation, claim processing, financial projections, actuarial models (SOA, CAS, Takaful)
- Depends on: Types and constants
- Used by: Components via direct function imports

**Domain Layer (Types & Constants):**
- Purpose: Define shared data structures, validation rules, and business parameters
- Location: `*/types.ts` and `*/constants.ts`
- Contains: TypeScript interfaces, enums, default values, pricing tables, coverage limits
- Depends on: Nothing (pure data)
- Used by: All other layers

**Data Access Layer:**
- Purpose: Handle external API calls and authentication
- Location: `mafs-member-portal/src/lib/supabase.ts`
- Contains: Supabase client initialization, database queries (applications, documents), auth operations
- Depends on: @supabase/supabase-js SDK
- Used by: Components requiring data persistence or member authentication

## Data Flow

**Premium Calculation Flow:**

1. User inputs (age, tier, family composition) in Calculator component (`mafs-financial-dashboard/components/Calculator.tsx`)
2. Component calls `calculateMonthlyPremium()` from `services/engine.ts`
3. Engine determines age bracket, applies family multipliers, returns monthly premium
4. Component displays result with coverage limits from `COVERAGE_LIMITS` constant
5. Premium persists locally in component state (React useState)

**Member Portal Navigation Flow:**

1. App.tsx maintains `view` state (type `AppView`) with initial value 'gateway'
2. Each screen component receives `onBack()` and navigation callbacks as props
3. Callbacks update parent `view` state, triggering conditional render of next screen
4. Flow: Gateway → MemberGateway → Member Portal (with internal tabs)
5. MemberPortal component (`src/components/MemberPortal.tsx`) uses internal tab state for subtabs

**Data Persistence Flow (Member Portal):**

1. EnrollmentForm or VerificationScreen collects user data
2. Component calls `submitApplication()` from `lib/supabase.ts`
3. Supabase async operation inserts record into `applications` table
4. Success triggers navigation to next flow state; error displayed to user
5. EmployeePortal can fetch applications via `fetchApplications()` for staff review

**Actuarial Model Flow:**

1. CoverageModeling or advanced calculator calls one of three actuarial functions:
   - `soaModel()` - Society of Actuaries life/health model
   - `casModel()` - Casualty Actuarial Society property/casualty model
   - `takafulModel()` - Islamic cooperative mutual aid model
2. Each function takes (age, tier, ficoScore, hasSpouse, children)
3. Functions return detailed breakdown with premium, loadings, and reasoning
4. `hybridModel()` blends all three using weighted factors (age, credit risk)
5. Frontend displays blended premium with recommendation text

**State Management:**
- Client-side only via React hooks (useState)
- No Redux, Context API, or external state management library
- Each component manages its own local state
- Parent-child communication via props and callbacks
- Supabase handles server-side persistence

## Key Abstractions

**Premium Calculation Engine:**
- Purpose: Encapsulate actuarial pricing logic independent of UI
- Examples: `calculateMonthlyPremium()`, `calculateClaimPayout()`, `determineAgeBracket()` in both `services/engine.ts` files
- Pattern: Pure functions (no side effects) that take immutable inputs and return results
- Reused across: Financial dashboard and member portal with identical core logic

**Actuarial Models:**
- Purpose: Support multiple insurance/mutual aid methodologies
- Examples: `soaModel()`, `casModel()`, `takafulModel()`, `hybridModel()` in `mafs-member-portal/src/services/engine.ts`
- Pattern: Specialized calculation functions with domain-specific terminology (mortality rates, morbidity loading, tabarru contribution)
- Feature: Hybrid blending to provide multi-perspective pricing recommendation

**Financial Projection Engine:**
- Purpose: Generate multi-year fund viability scenarios
- Examples: `generateProjections()`, `generateScenarioProjections()`, `runMonteCarlo()` in `services/engine.ts`
- Pattern: Iterative calculation with reserve accumulation and ratio computation
- Output: Array of `YearProjection` objects (5-year horizon default)

**Supabase Integration Layer:**
- Purpose: Abstract database and auth operations behind simple async functions
- Examples: `submitApplication()`, `fetchApplications()`, `updateApplicationStatus()`, `signIn()` in `lib/supabase.ts`
- Pattern: Async functions that wrap Supabase client calls with error handling
- Scope: Limited to applications (membership requests) and storage (documents)

**Type System:**
- Purpose: Provide compile-time safety for domain concepts
- Key types: `AgeBracket`, `CoverageTier`, `MemberRecord`, `ClaimRecord`, `AppView`, `MemberTab`
- Pattern: Discriminated unions (`type AppView = 'gateway' | 'member-gateway' | ...`) for type-safe state machines
- Reuse: Shared types between financial-dashboard and member-portal via identical interface definitions

## Entry Points

**Financial Dashboard:**
- Location: `mafs-financial-dashboard/index.tsx` (bootstrap) → `App.tsx` (main)
- Triggers: Browser navigation to deployed dashboard URL
- Responsibilities:
  1. Render tab-based navigation (Sidebar component)
  2. Conditionally render active tab content (Calculator, Dashboard, Projections, ClaimsTool, Reserves)
  3. Manage tab state via `activeTab` and `setActiveTab`

**Member Portal:**
- Location: `mafs-member-portal/src/index.tsx` (bootstrap) → `App.tsx` (main)
- Triggers: Browser navigation to deployed portal URL
- Responsibilities:
  1. Manage multi-screen navigation flow (type-safe via `AppView` union type)
  2. Track authentication state (`enterAsMember`, `view`)
  3. Route between Gateway, MemberGateway, VerificationScreen, EnrollmentForm, MemberPortal, EmployeePortal

**Tab Navigation (Financial Dashboard):**
- Sidebar.tsx provides clickable nav items
- App.tsx renderContent() switch statement shows appropriate component
- Tabs: 'calculator', 'dashboard', 'projections', 'claims', 'reserves'

**Tab Navigation (Member Portal - Secondary):**
- MemberPortal.tsx maintains internal `activeTab` state
- Tabs: 'values', 'calculator', 'become-member', 'request', 'update', 'profile', 'contact'
- EmployeePortal.tsx has its own tabs: 'database', 'requests', 'coverage', 'dashboard', 'legal'

## Error Handling

**Strategy:** Try-catch in async operations with user-facing error messages; graceful fallbacks for null states.

**Patterns:**
- **Supabase operations** - Functions throw errors on failure; caller component catches and displays toast/alert
- **Calculation functions** - Pure functions return valid results; no error throwing (invalid inputs handled by validation before call)
- **Component mounting** - index.tsx validates root element exists before mounting React; throws if missing
- **Type safety** - TypeScript prevents passing invalid enums/types; build fails before deployment

## Cross-Cutting Concerns

**Logging:**
- No centralized logging framework detected
- Console.log would be used for debugging (development only)

**Validation:**
- Input validation happens at component level (range constraints on sliders, dropdown selections)
- Age range: 18-80
- Children count: 0-10 (displayed) but only 3 billed
- Coverage tier limited to 'Basic' | 'Standard' | 'Premium'
- No backend validation layer; frontend bears responsibility

**Authentication:**
- Member portal offers `signIn()` and `signOut()` via Supabase
- Auth state not persisted in component tree (session stored server-side)
- `getSession()` function available to check current auth status
- Employee portal implies separate auth mechanism (not implemented in frontend code visible)

---

*Architecture analysis: 2026-03-17*
