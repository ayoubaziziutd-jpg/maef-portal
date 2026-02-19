export type AgeBracket = '18-30' | '31-45' | '46-60' | '61+';
export type CoverageTier = 'Basic' | 'Standard' | 'Premium';
export type CoverageType = 'Medical' | 'Financial' | 'Funeral' | 'Travel';
export type ScenarioType = 'Conservative' | 'Moderate' | 'Aggressive';
export type AppView = 'gateway' | 'member-gateway' | 'verification' | 'enrollment' | 'member' | 'employee';
export type MemberTab = 'values' | 'calculator' | 'become-member' | 'request' | 'update' | 'profile' | 'contact';
export type EmployeeTab = 'database' | 'requests' | 'coverage' | 'dashboard' | 'legal';

export interface PremiumRates {
  basic: number;
  standard: number;
  premium: number;
}

export interface CoverageLimits {
  perIncident: number;
  annualMax: number;
  deductible: number;
  coinsurance: number;
}

export interface MemberRecord {
  id: string;
  name: string;
  age: number;
  ageBracket: AgeBracket;
  tier: CoverageTier;
  hasSpouse: boolean;
  childrenCount: number;
  monthlyPremium: number;
  joinDate: string;
  status: 'Active' | 'Pending' | 'Suspended' | 'Terminated';
  claimsYtd: number;
  lastPaymentDate: string;
}

export interface ClaimRecord {
  id: string;
  memberId: string;
  memberName: string;
  tier: CoverageTier;
  date: string;
  type: CoverageType;
  amount: number;
  fundPays: number;
  memberPays: number;
  status: 'Pending' | 'Approved' | 'Paid' | 'Denied';
}

export interface MembershipRequest {
  id: string;
  name: string;
  address: string;
  email: string;
  age: number;
  submittedDate: string;
  status: 'Pending Review' | 'Approved' | 'Denied';
  creditScore: number;
  backgroundClear: boolean;
  bankruptcyClear: boolean;
  estimatedTier: CoverageTier;
}

export interface ScenarioAssumptions {
  label: ScenarioType;
  memberGrowth: number;
  claimsFrequency: number;
  avgClaimSize: number;
  adminCostRatio: number;
  premiumIncrease: number;
}

export interface FinancialAssumptions {
  startingMembers: number;
  avgPremium: number;
  annualGrowthRate: number;
  claimsFrequency: number;
  avgClaimSize: number;
  adminCostRatio: number;
  investmentReturn: number;
  targetReserveRatio: number;
}

export interface YearProjection {
  year: number;
  members: number;
  premiumRevenue: number;
  expectedClaims: number;
  adminExpenses: number;
  netIncome: number;
  reserves: number;
  reserveRatio: number;
  combinedRatio: number;
}

export interface ClaimCalculationResult {
  fundPays: number;
  memberPays: number;
  withinLimits: boolean;
  notes: string[];
}

export interface DiscountConfig {
  communityDiscount: number;
  annualPaymentDiscount: number;
}
