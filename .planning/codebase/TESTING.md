# Testing Patterns

**Analysis Date:** 2026-03-17

## Test Framework

**Status:** No testing framework currently configured

**Note:** No test files (`.test.ts`, `.spec.ts`), no jest.config, vitest.config, or testing libraries found in either project. Testing setup is not present in the codebase.

**Development Environment:**
- Runtime: Node.js with ES modules
- Build tool: Vite 6.0+
- TypeScript: 5.7-5.8
- React: 19.0+

## Recommended Testing Approach

While no formal testing framework is currently in place, projects should use one of the following:

**Option A: Vitest (Recommended for Vite projects)**
- Fastest setup with Vite
- Near-drop-in replacement for Jest
- ESM native support

**Option B: Jest**
- Industry standard
- Comprehensive feature set
- Requires additional Vite configuration

## Test File Organization

**Recommended Location:**
- Co-located with source: `src/services/__tests__/engine.test.ts` next to `src/services/engine.ts`
- Or separate test directory: `tests/services/engine.test.ts`

**Naming Convention:**
- Test files: `[filename].test.ts` or `[filename].spec.ts`
- Test directory structure mirrors source structure

## Test Structure Patterns

Based on code analysis, tests should follow these patterns:

**Unit Test Pattern for Services:**
```typescript
// tests/services/engine.test.ts
describe('Premium Calculation Engine', () => {
  describe('determineAgeBracket', () => {
    it('should return correct age bracket for given age', () => {
      expect(determineAgeBracket(25)).toBe('18-30');
      expect(determineAgeBracket(35)).toBe('31-45');
      expect(determineAgeBracket(50)).toBe('46-60');
      expect(determineAgeBracket(65)).toBe('61+');
    });
  });

  describe('calculateMonthlyPremium', () => {
    it('should calculate premium with base rate', () => {
      const premium = calculateMonthlyPremium(35, 'Standard', false, 0);
      expect(premium).toBeGreaterThan(0);
      expect(Number.isFinite(premium)).toBe(true);
    });

    it('should apply spouse multiplier', () => {
      const basePremium = calculateMonthlyPremium(35, 'Standard', false, 0);
      const withSpouse = calculateMonthlyPremium(35, 'Standard', true, 0);
      expect(withSpouse).toBeGreaterThan(basePremium);
    });

    it('should apply children multiplier correctly', () => {
      const base = calculateMonthlyPremium(35, 'Standard', false, 0);
      const withChildren = calculateMonthlyPremium(35, 'Standard', false, 2);
      expect(withChildren).toBeGreaterThan(base);
    });
  });
});
```

**Component Test Pattern:**
```typescript
// tests/components/Calculator.test.tsx
import { render, screen, userEvent } from '@testing-library/react';
import Calculator from '@/components/Calculator';

describe('Calculator Component', () => {
  it('should render calculator form', () => {
    render(<Calculator />);
    expect(screen.getByText('Member Premium Calculator')).toBeInTheDocument();
  });

  it('should update premium when age changes', async () => {
    const { rerender } = render(<Calculator />);
    const ageInput = screen.getByRole('slider');

    await userEvent.clear(ageInput);
    await userEvent.type(ageInput, '45');

    rerender(<Calculator />);
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
  });

  it('should display coverage limits for selected tier', () => {
    render(<Calculator />);
    const standardButton = screen.getByRole('button', { name: 'Standard' });

    userEvent.click(standardButton);
    expect(screen.getByText('$25,000')).toBeInTheDocument(); // Per incident max
  });
});
```

**Async/Promise Test Pattern:**
```typescript
// For Supabase operations in lib/supabase.ts
describe('Supabase Database Operations', () => {
  it('should submit application with all required fields', async () => {
    const mockData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '555-1234',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    };

    await expect(submitApplication(mockData)).resolves.not.toThrow();
  });

  it('should throw on database error', async () => {
    const invalidData = { first_name: '', last_name: '' };
    await expect(submitApplication(invalidData as any)).rejects.toThrow();
  });
});
```

## Mocking

**Framework:** Use jest.mock() or vitest.mock() depending on test runner

**Patterns:**
- Mock external services (Supabase, API calls)
- Mock calculation functions in component tests
- Mock React Router navigation

**What to Mock:**
- Database operations (Supabase client calls)
- Network requests and API calls
- External third-party libraries
- Child components when testing parent components in isolation

**What NOT to Mock:**
- Pure calculation functions (determineAgeBracket, calculateMonthlyPremium)
- Type definitions and interfaces
- Constants (PREMIUM_RATES, COVERAGE_LIMITS)
- React hooks like useState, useEffect (test through rendered output)

**Mock Example:**
```typescript
// Mock Supabase in component tests
vi.mock('../lib/supabase', () => ({
  submitApplication: vi.fn().mockResolvedValue(undefined),
  fetchApplications: vi.fn().mockResolvedValue([]),
}));

// Mock calculation engine
vi.mock('../services/engine', () => ({
  calculateMonthlyPremium: vi.fn(() => 57.50),
  determineAgeBracket: vi.fn(() => '31-45'),
}));
```

## Fixtures and Factories

**Test Data Location:**
- `tests/fixtures/` directory for shared test data
- `tests/factories/` directory for data builders

**Pattern:**
```typescript
// tests/fixtures/memberData.ts
export const mockMemberRecord = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'John Doe',
  age: 35,
  ageBracket: '31-45' as const,
  tier: 'Standard' as CoverageTier,
  hasSpouse: true,
  childrenCount: 2,
  monthlyPremium: 57.50,
  joinDate: '2024-01-15',
  status: 'Active' as const,
  claimsYtd: 0,
  lastPaymentDate: '2026-03-01'
};

export const mockClaimRecord = {
  id: 'claim-001',
  memberId: '123e4567-e89b-12d3-a456-426614174000',
  memberName: 'John Doe',
  tier: 'Standard' as CoverageTier,
  date: '2026-03-10',
  type: 'Medical' as CoverageType,
  amount: 5000,
  fundPays: 4000,
  memberPays: 1000,
  status: 'Approved' as const
};

// Factory for creating data with overrides
export function createMemberRecord(overrides?: Partial<MemberRecord>): MemberRecord {
  return { ...mockMemberRecord, ...overrides };
}
```

## Coverage

**Requirements:** Not enforced (no coverage configuration present)

**Recommended Target:**
- Services: 80%+ coverage
- Components: 70%+ coverage
- Constants/types: 0% (types not testable)

**View Coverage:**
```bash
# With Vitest
npm run test -- --coverage

# With Jest
npm run test -- --coverage

# Generate HTML report
npm run test -- --coverage --reporter=html
```

## Test Types

**Unit Tests:**
- Test individual functions in isolation
- Focus on: `services/engine.ts` calculations
- Scope: Pure functions, no side effects
- Example: `determineAgeBracket(35)` should return `'31-45'`

**Integration Tests:**
- Test Supabase operations with mock database
- Test component interactions with services
- Test data flow through multiple layers
- Example: Enrollment form submission → application creation in database

**Component Tests:**
- Test React component rendering
- Test user interactions (clicks, form input)
- Test state updates and re-renders
- Example: Calculator updates premium when age slider changes

**E2E Tests (Optional):**
- Not currently set up
- Could use Cypress or Playwright for full user flows
- Test complete workflows: Login → Verify → Enroll → View Dashboard

## Common Patterns

**Async Testing with Try-Catch (Current Pattern):**

Looking at `src/components/VerificationScreen.tsx`, error handling uses try-catch with silent failures:

```typescript
// Current pattern in codebase
const handleSubmit = async () => {
  try {
    await submitApplication({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      // ...
    });
  } catch {
    // Supabase not yet configured — still proceed for demo purposes
  }
  setSubmitted(true);
};
```

**Test Pattern for This:**
```typescript
describe('VerificationScreen', () => {
  it('should proceed to submitted state even if application fails', async () => {
    vi.mocked(submitApplication).mockRejectedValueOnce(
      new Error('Database unavailable')
    );

    render(<VerificationScreen onSubmit={onSubmit} onBack={onBack} />);
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await userEvent.click(submitButton);

    // Should still show success state despite error
    expect(screen.getByText(/thank you/i)).toBeInTheDocument();
  });
});
```

**Boundary Testing:**

For calculation functions with edge cases:

```typescript
describe('calculateClaimPayout - Edge Cases', () => {
  it('should handle claim amount of zero', () => {
    const result = calculateClaimPayout(0, 'Standard');
    expect(result.fundPays).toBe(0);
    expect(result.memberPays).toBe(0);
  });

  it('should cap claim at per-incident limit', () => {
    const result = calculateClaimPayout(100000, 'Basic');
    expect(result.claimAmount).toBe(100000);
    expect(result.fundPays).toBeLessThanOrEqual(COVERAGE_LIMITS['Basic'].perIncident);
  });

  it('should respect annual maximum', () => {
    const result1 = calculateClaimPayout(20000, 'Standard', 0);
    const result2 = calculateClaimPayout(40000, 'Standard', result1.fundPays);

    expect(result1.fundPays + result2.fundPays).toBeLessThanOrEqual(
      COVERAGE_LIMITS['Standard'].annualMax
    );
  });
});
```

## Test Commands (Recommended Setup)

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

## Dependencies for Testing (To Add)

For Vitest approach:
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^23.0.0"
  }
}
```

---

*Testing analysis: 2026-03-17*
