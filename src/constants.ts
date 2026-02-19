import { AgeBracket, CoverageLimits, CoverageTier, PremiumRates, ScenarioAssumptions, DiscountConfig } from "./types";

export const PREMIUM_RATES: Record<AgeBracket, PremiumRates> = {
  '18-30': { basic: 30, standard: 45, premium: 67.5 },
  '31-45': { basic: 45, standard: 67.5, premium: 101.25 },
  '46-60': { basic: 70, standard: 105, premium: 157.5 },
  '61+': { basic: 110, standard: 165, premium: 247.5 }
};

export const COVERAGE_LIMITS: Record<CoverageTier, CoverageLimits> = {
  'Basic': { perIncident: 5000, annualMax: 15000, deductible: 500, coinsurance: 0.20 },
  'Standard': { perIncident: 15000, annualMax: 45000, deductible: 250, coinsurance: 0.15 },
  'Premium': { perIncident: 50000, annualMax: 150000, deductible: 100, coinsurance: 0.10 }
};

export const FAMILY_MULTIPLIERS = {
  spouse: 1.60,
  child: 0.30,
  maxChildren: 3
};

export const DISCOUNTS: DiscountConfig = {
  communityDiscount: 0.10,
  annualPaymentDiscount: 0.05
};

export const DEFAULT_ASSUMPTIONS = {
  startingMembers: 200,
  avgPremium: 85,
  annualGrowthRate: 0.15,
  claimsFrequency: 0.20,
  avgClaimSize: 3500,
  adminCostRatio: 0.18,
  investmentReturn: 0.03,
  targetReserveRatio: 1.5
};

export const SCENARIOS: ScenarioAssumptions[] = [
  { label: 'Conservative', memberGrowth: 0.10, claimsFrequency: 0.25, avgClaimSize: 4500, adminCostRatio: 0.20, premiumIncrease: 0 },
  { label: 'Moderate', memberGrowth: 0.20, claimsFrequency: 0.20, avgClaimSize: 3500, adminCostRatio: 0.18, premiumIncrease: 0.05 },
  { label: 'Aggressive', memberGrowth: 0.30, claimsFrequency: 0.15, avgClaimSize: 2500, adminCostRatio: 0.15, premiumIncrease: 0.10 }
];

export const COVERAGE_TYPES = [
  { key: 'Medical', label: 'Medical Emergencies', description: 'Surgery, accidents, emergency hospitalization', color: '#006233' },
  { key: 'Financial', label: 'Financial Emergencies', description: 'Foreclosure prevention, urgent debt', color: '#F59E0B' },
  { key: 'Funeral', label: 'Funeral & Burial', description: 'Funeral expenses, burial, repatriation', color: '#C1272D' },
  { key: 'Travel', label: 'Emergency Travel', description: 'Emergency travel to Morocco for family crises', color: '#3B82F6' }
] as const;

export const ELIGIBILITY_REQUIREMENTS = [
  'Must be at least 18 years old',
  'Must have Moroccan heritage (at least one parent/grandparent) OR be married to someone of Moroccan heritage',
  'Must reside legally in the United States',
  'Must pass background check (criminal/fraud screening)',
  'Must agree to community participation expectations'
];

export const SAMPLE_MEMBERS = [
  { id: 'M001', name: 'Ahmed Benali', age: 28, tier: 'Standard' as CoverageTier, hasSpouse: false, childrenCount: 0, joinDate: '2025-01-15', status: 'Active' as const, claimsYtd: 0, lastPaymentDate: '2026-02-01' },
  { id: 'M002', name: 'Fatima El Amrani', age: 42, tier: 'Premium' as CoverageTier, hasSpouse: true, childrenCount: 2, joinDate: '2024-11-01', status: 'Active' as const, claimsYtd: 4200, lastPaymentDate: '2026-02-01' },
  { id: 'M005', name: 'Omar Idrissi', age: 63, tier: 'Premium' as CoverageTier, hasSpouse: true, childrenCount: 0, joinDate: '2024-09-01', status: 'Active' as const, claimsYtd: 12500, lastPaymentDate: '2026-02-01' }
];

export const SAMPLE_CLAIMS = [
  { id: 'C001', memberId: 'M002', memberName: 'Fatima El Amrani', tier: 'Premium' as CoverageTier, date: '2026-01-10', type: 'Medical' as const, amount: 5000, fundPays: 4655, memberPays: 345, status: 'Paid' as const },
  { id: 'C005', memberId: 'M005', memberName: 'Omar Idrissi', tier: 'Premium' as CoverageTier, date: '2026-02-05', type: 'Funeral' as const, amount: 8000, fundPays: 7505, memberPays: 495, status: 'Pending' as const }
];