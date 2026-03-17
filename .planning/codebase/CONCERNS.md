# Codebase Concerns

**Analysis Date:** 2026-03-17

## Tech Debt

**Incomplete Supabase Integration:**
- Issue: Database layer partially implemented but not fully connected. Supabase client initialized in `src/lib/supabase.ts` but error handling silently fails in production flow.
- Files: `mafs-member-portal/src/lib/supabase.ts`, `mafs-member-portal/src/components/VerificationScreen.tsx` (lines 93-95)
- Impact: Membership applications are accepted but silently fail to persist. Users believe applications submitted when they aren't stored. No data recovery path.
- Fix approach: Implement proper error handling with user feedback. Add retry logic or queue system for failed submissions. Create integration tests with Supabase.

**Unvalidated Form Inputs:**
- Issue: Forms accept user input without server-side validation. Client-side validation only checks presence, not format or safety.
- Files: `mafs-member-portal/src/components/VerificationScreen.tsx` (line 79: `isFormComplete` only checks if fields exist), `mafs-member-portal/src/components/EnrollmentForm.tsx`
- Impact: Invalid emails, phone numbers, addresses can be submitted. No XSS protection on text fields. No rate limiting on submissions.
- Fix approach: Add comprehensive validation schema (zod/yup). Implement server-side validation. Add rate limiting and CSRF tokens.

**Type Casting Bypass:**
- Issue: Type safety violated with `as any` cast in event handler.
- Files: `mafs-member-portal/src/components/EmployeePortal.tsx` (line 290: `setActiveView(t.id as any)`)
- Impact: Loses TypeScript type checking. Could accept invalid tab IDs at runtime. Masks type errors.
- Fix approach: Use proper type-safe union on click handler instead of casting.

**Hardcoded Sample Data Mixed with Real UI:**
- Issue: Sample member data and requests hardcoded in components alongside production UI logic.
- Files: `mafs-member-portal/src/components/EmployeePortal.tsx` (lines 18-23: `SAMPLE_REQUESTS`), `mafs-member-portal/src/constants.ts` (SAMPLE_MEMBERS)
- Impact: Easy to accidentally expose sample data in production. No clear separation between demo and real flows. Tests not isolated from UI state.
- Fix approach: Move sample data to separate fixtures file. Use feature flags or environment detection to conditionally render demo vs. real data.

**Magic Numbers Throughout Actuarial Engine:**
- Issue: Hardcoded percentages and ratios scattered across calculation functions without clear documentation.
- Files: `mafs-member-portal/src/services/engine.ts` (lines 22-25, 66-67, 73-74, 123-125, 172-174, etc.)
- Impact: Difficult to audit calculations. Changes require code edits, not configuration. Business logic tightly coupled to implementation.
- Fix approach: Extract all constants to `constants.ts` with clear variable names. Document each value's source (SOA tables, regulatory requirement, business decision).

---

## Known Bugs

**Premium Calculation Family Multiplier Edge Case:**
- Symptoms: Family premium calculations apply multiplier incorrectly when spouse and children both present. 60% spouse multiplier + 30% per child creates compounding that doesn't match actuarial intent.
- Files: `mafs-member-portal/src/services/engine.ts` (lines 72-74), `mafs-financial-dashboard/services/engine.ts` (lines 20-22)
- Trigger: Select "Has Spouse" + set children > 0 in calculator. Compare to standalone pricing and notice non-linear growth.
- Workaround: None currently. Manual calculation needed to verify output.
- Root cause: Multipliers compound instead of being applied additive. SOA model (line 73: `finalPremium *= 1.60`) then adds child multiplier without resetting base.

**Tier Information Inconsistency:**
- Symptoms: Coverage limits and pricing displayed in multiple locations with slight variations. MemberPortal shows different monthly ranges than calculator.
- Files: `mafs-member-portal/src/components/MemberPortal.tsx` (lines 16-50: TIER_DETAILS), `mafs-member-portal/src/components/EmployeePortal.tsx` (lines 171-175: TIER_INFO), `mafs-member-portal/src/constants.ts`
- Trigger: View tier details in multiple screens and compare. Notice Basic tier shows "~$30–$110/mo" vs. calculator showing different values.
- Workaround: Calculate manually using engine functions.
- Root cause: Multiple definitions of same data. No single source of truth for tier limits.

**Credit Score Discount Not Applied in Calculator:**
- Symptoms: Takaful model excludes credit scoring (`solidarityFactor` only applied for very poor credit), but CAS model applies GLM loading. Calculator shows FICO adjustment but some models don't use it.
- Files: `mafs-member-portal/src/services/engine.ts` (lines 176-178: solidarityFactor logic), calculator doesn't pass credit-aware adjustments consistently
- Trigger: Enter FICO score between 580-620 in calculator. No surcharge appears even though CAS model should apply it.
- Workaround: None. Pricing displayed is incomplete.
- Root cause: Takaful model intentionally doesn't discriminate on credit (Islamic principle), but UI promises credit-based pricing.

---

## Security Considerations

**FCRA Compliance Risk - Data Collection Without Consent Record:**
- Risk: Application collects FICO scores and background check data but no audit trail of explicit consent timestamp stored.
- Files: `mafs-member-portal/src/components/VerificationScreen.tsx` (lines 21-26: authorization language), `mafs-member-portal/src/lib/supabase.ts` (lines 10-26: submitApplication doesn't log consent)
- Current mitigation: Legal text displayed to user. Checkbox validation required.
- Recommendations:
  - Store explicit consent timestamp in `applications.consent_recorded_at`
  - Log all screening requests to compliance audit table
  - Implement 30-day retention policy with automatic deletion
  - Add explicit "I authorize [specific checks]" checkboxes (not just one agreement checkbox)

**PII Storage in Browser State:**
- Risk: Form data stored in React component state (VerificationScreen.tsx line 65: `form` state). No encryption during form completion. Could be exposed if browser compromised or dev tools accessed.
- Files: `mafs-member-portal/src/components/VerificationScreen.tsx` (lines 65-66, 75-77)
- Current mitigation: Data sent via HTTPS to Supabase. No localStorage persistence.
- Recommendations:
  - Clear form state on component unmount
  - Implement sensitive field masking (show last 4 digits only)
  - Add Content Security Policy headers to prevent XSS
  - Encrypt field values in transit using TLS 1.3+

**Financial Data Exposure in UI State:**
- Risk: Premium calculations and financial projections stored in component state without access control. Anyone with browser dev tools can inspect full financial model.
- Files: `mafs-member-portal/src/components/EmployeePortal.tsx` (lines 243: mockData state), `mafs-financial-dashboard/components/Dashboard.tsx`
- Current mitigation: None. Data is plaintext in React state.
- Recommendations:
  - Move sensitive calculations server-side
  - Return only user-specific data needed for UI
  - Implement role-based access control (RBAC) at API level
  - Audit sensitive endpoints for proper authorization checks

**Supabase Anonymous Key Exposed:**
- Risk: `VITE_SUPABASE_ANON_KEY` used for client-side database access. If leaked, anyone can insert/read from public tables.
- Files: `mafs-member-portal/src/lib/supabase.ts` (lines 3-4)
- Current mitigation: Key marked as "ANON" in supabase config (limited to specific tables/RLS policies). Environment variable not hardcoded.
- Recommendations:
  - Implement Row-Level Security (RLS) on all tables in Supabase
  - Rotate anonKey quarterly
  - Monitor Supabase audit logs for suspicious queries
  - Use RLS policies to restrict applicant data to their own records only

**Heritage Discount Documentation Upload No Validation:**
- Risk: File upload for heritage documentation (MemberPortal.tsx line 429) accepts any file type without validation. No server-side scanning.
- Files: `mafs-member-portal/src/components/MemberPortal.tsx` (lines 426-430)
- Current mitigation: HTML5 accept="image/*,.pdf" (client-side only, can be bypassed)
- Recommendations:
  - Implement server-side MIME type validation
  - Scan uploaded files with antivirus/malware detector
  - Set max file size (5MB)
  - Implement automatic expiration of stored documents (30 days)
  - Add audit log for all document uploads

---

## Performance Bottlenecks

**Recalculation on Every State Change:**
- Problem: Actuarial models (SOA, CAS, Takaful, Hybrid) recalculate on every slider adjustment without debouncing.
- Files: `mafs-member-portal/src/components/EmployeePortal.tsx` (lines 245-248: useMemo dependencies re-run on every keystroke), `mafs-member-portal/src/components/CoverageModeling.tsx` (lines 50-53)
- Current performance: Noticeable lag on age slider (Gaussian random generation in `generateGaussian()` runs 500x per simulation)
- Improvement path:
  - Add 300ms debounce to slider inputs
  - Memoize projection calculations at scenario level, not individual state
  - Move Monte Carlo simulation to Web Worker to avoid blocking main thread
  - Implement progressive rendering (show loading skeleton while calculating)

**Large JSON Payloads in Financial Dashboard:**
- Problem: Dashboard generates 5-year projections for all scenarios on component mount. Each scenario runs 5 years × 12 months of calculations.
- Files: `mafs-financial-dashboard/components/Dashboard.tsx` (line 9: `generateProjections` called on render), `mafs-financial-dashboard/services/engine.ts` (lines 253-283)
- Current performance: ~200ms calculation time blocks UI on mount
- Improvement path:
  - Lazy-load projection data only when tab is active
  - Cache results with Suspense boundaries
  - Pagination: show Year 1 by default, load others on demand
  - Consider server-side rendering of dashboard

**Unoptimized Chart Re-renders:**
- Problem: Recharts charts re-render on every data point change even if chart container size unchanged.
- Files: `mafs-member-portal/src/components/EmployeePortal.tsx` (lines 410-424), `mafs-financial-dashboard/components/Dashboard.tsx` (lines 85-98)
- Current performance: Smooth scrolling jank when adjusting sliders with charts visible
- Improvement path:
  - Wrap charts in React.memo to prevent unnecessary re-renders
  - Use `isAnimationActive={false}` on Tooltip to reduce DOM updates
  - Implement virtualization for long data series
  - Consider switching to Visx (lower-level library) for performance-critical charts

---

## Fragile Areas

**Actuarial Model Logic — High Mathematical Complexity:**
- Files: `mafs-member-portal/src/services/engine.ts` (entire file, especially lines 55-250)
- Why fragile: Three independent actuarial models (SOA, CAS, Takaful) with overlapping but distinct logic. Hybrid model blends them with weighting logic. Small changes propagate unpredictably.
- Safe modification:
  1. Write comprehensive unit tests for each model with known inputs/outputs
  2. Test edge cases: age 18, age 80, FICO 300, FICO 850
  3. Create regression test suite with fixtures from insurance industry standards
  4. Do not modify weighting logic without running full projection scenarios
- Test coverage gaps: No tests found. Models are untested.

**Employee Portal Membership Request Approval Flow:**
- Files: `mafs-member-portal/src/components/EmployeePortal.tsx` (lines 38-39: handleApprove/Deny, lines 69-71: conditional rendering)
- Why fragile: Approval/denial state managed entirely in component state. No persistence. Page refresh loses all changes. No audit trail.
- Safe modification:
  1. Add console warnings before implementing state mutations
  2. Mock Supabase calls before connecting real database
  3. Test all status transitions: Pending → Approved, Pending → Denied, Approved → ?
  4. Validate that tier assignment matches credit score rules
- Test coverage gaps: No tests. No persistence layer. State is ephemeral.

**Tier Details Duplicated Across Components:**
- Files: `MemberPortal.tsx` (lines 16-50), `EmployeePortal.tsx` (lines 171-175), `constants.ts`
- Why fragile: Same data defined in 3+ places. Updating one source doesn't update others. Easy to create inconsistencies.
- Safe modification:
  1. Consolidate all tier definitions into single `constants.ts` export
  2. Create TypeScript type that enforces completeness
  3. Add unit test that validates all tier objects have same keys
  4. Use ESLint plugin to warn on duplicate object literals
- Test coverage gaps: No validation that tier objects are consistent.

**Premium Calculator — No Bounds Checking:**
- Files: `mafs-member-portal/src/components/MemberPortal.tsx` (line 298: `calculateMonthlyPremium` called without input validation)
- Why fragile: calculateMonthlyPremium accepts any age (0-150+) but only tested for 18-80. Behavior undefined outside range.
- Safe modification:
  1. Add guards: `if (age < 18 || age > 100) throw new Error(...)`
  2. Define valid ranges for all inputs in types file
  3. Add runtime validation with zod schema
  4. Document assumptions: "Age range 18-80. Outside range, use tier floor/ceiling."
- Test coverage gaps: No boundary tests. No input validation.

---

## Scaling Limits

**Member Database — No Pagination:**
- Current capacity: ~1000 members before observable lag (all loaded in single table)
- Limit: React renders all members in single tbody. No virtual scrolling.
- Scaling path:
  1. Implement pagination: 50 members/page with server-side query
  2. Add filters: by tier, status, join date
  3. Implement virtual scrolling if pagination not feasible
  4. Move database query server-side with pagination cursor
  - Files to update: `EmployeePortal.tsx` (line 216: table rendering)

**Financial Projections — Scenario Combinations Explode:**
- Current capacity: 3 scenarios × 5 years = manageable
- Limit: If expanding to 10+ scenarios or adding monthly granularity (60 data points), calculation time becomes prohibitive
- Scaling path:
  1. Implement lazy loading: calculate only active scenario
  2. Pre-compute common scenarios server-side at startup
  3. Add caching layer: store results in IndexedDB
  4. Consider worker pool for parallel scenario calculations
  - Files affected: `EmployeePortal.tsx` (lines 250-253), `engine.ts` (generateScenarioProjections)

**Supabase Row Limit on Free Tier:**
- Current usage: ~50 sample applications + future member records
- Limit: Free tier has storage limits. No backup strategy documented.
- Scaling path:
  1. Implement database cleanup: archive applications > 1 year old
  2. Set up automated backups to S3
  3. Plan migration path to paid tier before limit hit
  4. Implement data retention policies (GDPR compliance)
  - Files: `supabase.ts` (add cleanup function)

---

## Dependencies at Risk

**No Supabase Version Lock:**
- Risk: `package.json` likely uses `^1.x.x` version (auto-upgrade). Breaking changes in minor versions not caught.
- Impact: Authentication changes, API signature changes could break app at deploy time.
- Migration plan:
  - Pin Supabase to exact version: `"@supabase/supabase-js": "2.39.1"`
  - Test before each major version upgrade
  - Review changelog for breaking changes

**Recharts Not Type-Safe with Dynamic Data:**
- Risk: Recharts expects exact shape of data. Missing fields cause silent render failures.
- Impact: Dashboard charts fail silently if projection data structure changes.
- Migration plan:
  - Add runtime validation of chart data with zod
  - Use TypeScript strict mode on chart components
  - Add error boundary around chart components

**React 18 Concurrent Features Not Used:**
- Risk: No Suspense boundaries or error boundaries. State updates block UI.
- Impact: Calculator sliders feel sluggish when performing calculations.
- Migration plan:
  - Wrap calculation logic in React.startTransition
  - Add Suspense fallbacks for async data
  - Implement Error Boundary at route level

---

## Missing Critical Features

**No Authentication/Authorization:**
- Problem: Employee portal accessible without login. Anyone can approve/deny applications.
- Blocks: Can't deploy to production. FCRA requires audit trail of who approved each application.
- Implementation needed: Supabase Auth for employee logins, RLS policies per role, audit logging.

**No Data Persistence:**
- Problem: All application data lost on page refresh. Calculations ephemeral.
- Blocks: Can't be production system. No member records survive downtime.
- Implementation needed: Full Supabase integration with RLS, transactions for multi-step processes.

**No Document Upload Infrastructure:**
- Problem: Heritage discount form accepts files but has nowhere to store them. Upload function non-functional.
- Blocks: Can't verify heritage claims. Program unenforceable.
- Implementation needed: Supabase Storage integration, virus scanning, document verification workflow.

**No Email Notifications:**
- Problem: Application submitted but user not notified of status. No way to reach applicants.
- Blocks: Can't complete onboarding flow. Applications stuck in limbo.
- Implementation needed: Email service (SendGrid/AWS SES), email templates, status update notifications.

**No Admin Dashboard for Operations:**
- Problem: Only hardcoded tabs for membership/database. No reporting, no analytics, no manual member management.
- Blocks: Staff can't diagnose issues, can't manually fix data problems, can't run reports.
- Implementation needed: Query builder UI, bulk member management, claims reporting, financial dashboards.

---

## Test Coverage Gaps

**Actuarial Engine — Completely Untested:**
- What's not tested: All three models (SOA, CAS, Takaful), hybrid weighting, edge cases
- Files: `mafs-member-portal/src/services/engine.ts`, `mafs-financial-dashboard/services/engine.ts`
- Risk: Changes to calculation logic could silently produce incorrect premiums. No regression detection.
- Priority: **HIGH** — This is core to pricing accuracy and regulatory compliance
- Test approach: Create fixtures with known insurance industry inputs/outputs, validate output to ±0.01

**Components — No Unit/Integration Tests:**
- What's not tested: All React components (EmployeePortal, MemberPortal, forms, calculator)
- Files: Everything in `src/components/`
- Risk: UI changes could break application flow. Button clicks might not navigate correctly.
- Priority: **MEDIUM** — Behavior is testable but not critical if manual QA thorough
- Test approach: Test library for component interaction, mock Supabase, snapshot tests for forms

**Validation Functions — No Tests:**
- What's not tested: Form validation, input bounds checking, tier determination logic
- Files: `src/components/VerificationScreen.tsx` (line 79: isFormComplete), `engine.ts` (determineAgeBracket)
- Risk: Invalid data accepted. Age 500 produces undefined behavior. No email validation.
- Priority: **MEDIUM** — Security and UX impact
- Test approach: Parameterized tests for boundary cases (age 0, 18, 100, 150), invalid formats

**Financial Projections — No Validation Tests:**
- What's not tested: Reserve calculations, combined ratio calculations, Monte Carlo variance
- Files: `mafs-financial-dashboard/services/engine.ts` (lines 77-118, 121-161)
- Risk: Projections could be mathematically invalid. Reserves go negative. No warning.
- Priority: **MEDIUM** — Financial accuracy risk
- Test approach: Verify reserves never negative, combined ratio bounded [0, 2], validate projection shape

**Database Integration — No Tests:**
- What's not tested: Supabase queries, error handling, data persistence
- Files: `mafs-member-portal/src/lib/supabase.ts`
- Risk: Silent failures when network down. Applications not actually saved. No recovery.
- Priority: **HIGH** — Data loss risk
- Test approach: Mock Supabase client, test error paths, verify retry logic (if added)

---

*Concerns audit: 2026-03-17*
