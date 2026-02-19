import { COVERAGE_LIMITS, FAMILY_MULTIPLIERS, PREMIUM_RATES, DISCOUNTS } from "../constants";
import { AgeBracket, ClaimCalculationResult, CoverageTier, FinancialAssumptions, ScenarioAssumptions, YearProjection } from "../types";

export const determineAgeBracket = (age: number): AgeBracket => {
  if (age < 31) return '18-30';
  if (age < 46) return '31-45';
  if (age < 61) return '46-60';
  return '61+';
};

export const calculateMonthlyPremium = (
  age: number,
  tier: CoverageTier,
  hasSpouse: boolean,
  childrenCount: number,
  communityMember: boolean = false,
  annualPayment: boolean = false
): number => {
  const bracket = determineAgeBracket(age);
  let base = PREMIUM_RATES[bracket][tier.toLowerCase() as keyof typeof PREMIUM_RATES[AgeBracket]];
  
  const billableChildren = Math.min(childrenCount, FAMILY_MULTIPLIERS.maxChildren);
  
  if (hasSpouse) base *= FAMILY_MULTIPLIERS.spouse;
  base += (base * (FAMILY_MULTIPLIERS.child * billableChildren));

  if (communityMember) base *= (1 - DISCOUNTS.communityDiscount);
  if (annualPayment) base *= (1 - DISCOUNTS.annualPaymentDiscount);

  return parseFloat(base.toFixed(2));
};

export const generateProjections = (assumptions: FinancialAssumptions): YearProjection[] => {
  const projections: YearProjection[] = [];
  let members = assumptions.startingMembers;
  let reserves = members * 500; // Starting seed capital

  for (let year = 1; year <= 5; year++) {
    const annualPremiumRevenue = members * assumptions.avgPremium * 12;
    const expectedClaims = members * assumptions.claimsFrequency * assumptions.avgClaimSize;
    const adminExpenses = annualPremiumRevenue * assumptions.adminCostRatio;
    const investmentIncome = reserves * assumptions.investmentReturn;

    const netIncome = annualPremiumRevenue + investmentIncome - expectedClaims - adminExpenses;
    reserves += netIncome;

    const reserveRatio = expectedClaims > 0 ? (reserves / expectedClaims) : 0;
    const combinedRatio = annualPremiumRevenue > 0 ? ((expectedClaims + adminExpenses) / annualPremiumRevenue) : 0;

    projections.push({
      year,
      members: Math.round(members),
      premiumRevenue: annualPremiumRevenue,
      expectedClaims,
      adminExpenses,
      netIncome,
      reserves,
      reserveRatio,
      combinedRatio
    });

    members *= (1 + assumptions.annualGrowthRate);
  }
  return projections;
};

export const generateScenarioProjections = (
  scenario: ScenarioAssumptions,
  startingMembers: number = 200,
  avgPremium: number = 85
): YearProjection[] => {
  return generateProjections({
    startingMembers,
    avgPremium: avgPremium * (1 + scenario.premiumIncrease),
    annualGrowthRate: scenario.memberGrowth,
    claimsFrequency: scenario.claimsFrequency,
    avgClaimSize: scenario.avgClaimSize,
    adminCostRatio: scenario.adminCostRatio,
    investmentReturn: 0.03,
    targetReserveRatio: 1.5
  });
};
