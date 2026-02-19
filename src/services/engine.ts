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

// ── FICO credit factor (replicates GLM credit score loading used in P&C insurance) ──
export const ficoLoadingFactor = (ficoScore: number): number => {
  if (ficoScore >= 800) return 0.88;   // Exceptional: 12% discount
  if (ficoScore >= 740) return 0.93;   // Very Good: 7% discount
  if (ficoScore >= 670) return 1.00;   // Good: baseline
  if (ficoScore >= 580) return 1.12;   // Fair: 12% surcharge
  return 1.28;                          // Poor: 28% surcharge
};

// ─────────────────────────────────────────────
// SOA MODEL (Society of Actuaries — Life/Health)
// Replicates: Traditional life & health insurance
// Core method: Age-band mortality/morbidity tables, long-term reserves, expense loading
// ─────────────────────────────────────────────
export interface SOAResult {
  basePremium: number;
  mortalityLoading: number;
  morbidityLoading: number;
  expenseLoading: number;
  reserveContribution: number;
  finalPremium: number;
  combinedRatio: number;
  lossRatio: number;
  breakdownPct: { mortality: number; morbidity: number; expense: number; reserve: number };
}

export function soaModel(age: number, tier: CoverageTier, ficoScore: number, hasSpouse: boolean, children: number): SOAResult {
  const bracket = determineAgeBracket(age);
  const base = PREMIUM_RATES[bracket][tier.toLowerCase() as keyof typeof PREMIUM_RATES[AgeBracket]];

  // SOA CSO 2017 mortality rates approximated by age bracket
  const mortalityRates: Record<AgeBracket, number> = { '18-30': 0.0008, '31-45': 0.0020, '46-60': 0.0065, '61+': 0.0190 };
  const morbidityRates: Record<AgeBracket, number> = { '18-30': 0.04, '31-45': 0.07, '46-60': 0.14, '61+': 0.22 };

  const tierMax = COVERAGE_LIMITS[tier].annualMax;
  const mortalityLoading = mortalityRates[bracket] * tierMax / 12;
  const morbidityLoading = morbidityRates[bracket] * tierMax * 0.20 / 12;
  const expenseLoading = base * 0.22; // 22% expense ratio (SOA benchmark)
  const reserveContribution = base * 0.15; // 15% reserve build
  const creditFactor = ficoLoadingFactor(ficoScore);

  let finalPremium = (base + mortalityLoading + morbidityLoading + expenseLoading + reserveContribution) * creditFactor;

  // Family adjustments
  if (hasSpouse) finalPremium *= 1.60;
  finalPremium += finalPremium * 0.30 * Math.min(children, 3);

  const total = mortalityLoading + morbidityLoading + expenseLoading + reserveContribution;
  return {
    basePremium: base,
    mortalityLoading: parseFloat(mortalityLoading.toFixed(2)),
    morbidityLoading: parseFloat(morbidityLoading.toFixed(2)),
    expenseLoading: parseFloat(expenseLoading.toFixed(2)),
    reserveContribution: parseFloat(reserveContribution.toFixed(2)),
    finalPremium: parseFloat(finalPremium.toFixed(2)),
    combinedRatio: 0.88,
    lossRatio: 0.66,
    breakdownPct: {
      mortality: Math.round(mortalityLoading / total * 100),
      morbidity: Math.round(morbidityLoading / total * 100),
      expense: Math.round(expenseLoading / total * 100),
      reserve: Math.round(reserveContribution / total * 100),
    }
  };
}

// ─────────────────────────────────────────────
// CAS MODEL (Casualty Actuarial Society — P&C)
// Replicates: Property & Casualty insurance, catastrophe modeling
// Core method: Frequency × Severity loss model, GLM credit loading, short-tail reserves
// ─────────────────────────────────────────────
export interface CASResult {
  claimFrequency: number;
  claimSeverity: number;
  pureRisk: number;
  catLoading: number;
  expenseLoading: number;
  profitMargin: number;
  finalPremium: number;
  lossRatio: number;
  breakdownPct: { pureRisk: number; cat: number; expense: number; profit: number };
}

export function casModel(age: number, tier: CoverageTier, ficoScore: number, hasSpouse: boolean, children: number): CASResult {
  const bracket = determineAgeBracket(age);

  // CAS frequency/severity by age band (claims per member per year)
  const freqByBracket: Record<AgeBracket, number> = { '18-30': 0.08, '31-45': 0.13, '46-60': 0.22, '61+': 0.35 };
  const sevByTier: Record<CoverageTier, number> = { Basic: 3200, Standard: 5800, Premium: 12000 };

  const freq = freqByBracket[bracket];
  const sev = sevByTier[tier];
  const pureRisk = (freq * sev) / 12;

  const catLoading = pureRisk * 0.12;         // CAS catastrophe buffer
  const expenseLoading = pureRisk * 0.28;     // CAS industry expense ratio
  const profitMargin = pureRisk * 0.08;       // 8% target margin

  const creditFactor = ficoLoadingFactor(ficoScore);
  let finalPremium = (pureRisk + catLoading + expenseLoading + profitMargin) * creditFactor;

  if (hasSpouse) finalPremium *= 1.60;
  finalPremium += finalPremium * 0.30 * Math.min(children, 3);

  const total = pureRisk + catLoading + expenseLoading + profitMargin;
  return {
    claimFrequency: freq,
    claimSeverity: sev,
    pureRisk: parseFloat(pureRisk.toFixed(2)),
    catLoading: parseFloat(catLoading.toFixed(2)),
    expenseLoading: parseFloat(expenseLoading.toFixed(2)),
    profitMargin: parseFloat(profitMargin.toFixed(2)),
    finalPremium: parseFloat(finalPremium.toFixed(2)),
    lossRatio: parseFloat((pureRisk / (pureRisk + expenseLoading + profitMargin)).toFixed(3)),
    breakdownPct: {
      pureRisk: Math.round(pureRisk / total * 100),
      cat: Math.round(catLoading / total * 100),
      expense: Math.round(expenseLoading / total * 100),
      profit: Math.round(profitMargin / total * 100),
    }
  };
}

// ─────────────────────────────────────────────
// TAKAFUL / ISLAMIC SHARIA MODEL
// Replicates: Cooperative mutual aid (Takaful operators — e.g. Salama, Takaful Malaysia)
// Core method: Tabarru (donation) pool, Wakala fee, no-interest reserves, surplus return
// ─────────────────────────────────────────────
export interface TakafulResult {
  tabarruContribution: number;     // Goes into the mutual pool
  wakalaFee: number;               // Operator management fee (no profit motive)
  familyTakaful: number;           // Additional family unit contribution
  surplusReturn: number;           // Estimated end-of-year surplus returned to member
  netContribution: number;         // Effective cost after surplus
  poolReserve: number;             // Estimated pool reserve per member
  breakdownPct: { tabarru: number; wakala: number; family: number };
}

export function takafulModel(age: number, tier: CoverageTier, ficoScore: number, hasSpouse: boolean, children: number): TakafulResult {
  const bracket = determineAgeBracket(age);
  const base = PREMIUM_RATES[bracket][tier.toLowerCase() as keyof typeof PREMIUM_RATES[AgeBracket]];

  // Takaful: ~65% goes to Tabarru pool, ~20% Wakala fee, ~15% family unit
  const tabarruContribution = base * 0.65;
  const wakalaFee = base * 0.20;  // Operator fee (replaces insurance company profit)
  const familyTakaful = hasSpouse ? base * 0.15 * (1 + 0.30 * Math.min(children, 3)) : 0;

  // Takaful does NOT use credit score to discriminate (Islamic equity principle)
  // But we apply a mild solidarity adjustment for very poor credit (fraud risk only)
  const solidarityFactor = ficoScore < 580 ? 1.08 : 1.00;

  const grossContribution = (tabarruContribution + wakalaFee + familyTakaful) * solidarityFactor;

  // Takaful surplus: typically 20-30% of tabarru pool returned if claims < pool
  const surplusReturn = tabarruContribution * 0.22;
  const netContribution = grossContribution - surplusReturn;
  const poolReserve = tabarruContribution * 12 * 0.40; // 40% of annual tabarru retained

  const total = tabarruContribution + wakalaFee + familyTakaful;
  return {
    tabarruContribution: parseFloat(tabarruContribution.toFixed(2)),
    wakalaFee: parseFloat(wakalaFee.toFixed(2)),
    familyTakaful: parseFloat(familyTakaful.toFixed(2)),
    surplusReturn: parseFloat(surplusReturn.toFixed(2)),
    netContribution: parseFloat(netContribution.toFixed(2)),
    poolReserve: parseFloat(poolReserve.toFixed(2)),
    breakdownPct: {
      tabarru: Math.round(tabarruContribution / total * 100),
      wakala: Math.round(wakalaFee / total * 100),
      family: total > 0 ? Math.round(familyTakaful / total * 100) : 0,
    }
  };
}

// ─────────────────────────────────────────────
// MAFS HYBRID MODEL
// Our blend: SOA age-tables + CAS frequency/severity + Takaful surplus sharing
// ─────────────────────────────────────────────
export interface HybridResult {
  soaWeight: number;
  casWeight: number;
  takafulWeight: number;
  blendedPremium: number;
  surplusReturn: number;
  effectiveCost: number;
  recommendation: string;
}

export function hybridModel(
  age: number, tier: CoverageTier, ficoScore: number, hasSpouse: boolean, children: number,
  soa: SOAResult, cas: CASResult, takaful: TakafulResult
): HybridResult {
  // Weighting logic: skew toward Takaful for younger/healthier, SOA for older, CAS for high-risk
  const ageFactor = age > 55 ? 0.40 : age > 40 ? 0.30 : 0.20;
  const creditRisk = ficoScore < 620 ? 0.35 : 0.20;
  const takafulWeight = Math.max(0.10, 0.50 - ageFactor * 0.3 - creditRisk * 0.2);
  const soaWeight = ageFactor;
  const casWeight = parseFloat((1 - takafulWeight - soaWeight).toFixed(2));

  const blendedPremium = parseFloat(
    (soa.finalPremium * soaWeight + cas.finalPremium * casWeight + takaful.netContribution * takafulWeight).toFixed(2)
  );
  const surplusReturn = parseFloat((takaful.surplusReturn * takafulWeight).toFixed(2));
  const effectiveCost = parseFloat((blendedPremium - surplusReturn).toFixed(2));

  let recommendation = '';
  if (age < 35 && ficoScore > 700) recommendation = 'Low-risk profile. Takaful pool pricing is most efficient for this member. High surplus-return probability.';
  else if (age >= 46 && age <= 60 && ficoScore >= 580 && ficoScore < 720) recommendation = 'Moderate-risk profile. SOA mortality tables and CAS frequency model apply meaningful loading. Standard tier is optimal at this stage.';
  else if (age > 60) recommendation = 'Elevated mortality risk per SOA tables. Premium reflects higher long-term reserve requirements. Premium tier strongly recommended.';
  else if (ficoScore < 580) recommendation = 'Credit risk flag. CAS GLM loading applied. Financial Emergency coverage (Premium tier) is not recommended until credit profile improves.';
  else recommendation = 'Balanced profile. Hybrid weighting produces competitive effective cost with Takaful surplus offset.';

  return {
    soaWeight: parseFloat(soaWeight.toFixed(2)),
    casWeight: parseFloat(casWeight.toFixed(2)),
    takafulWeight: parseFloat(takafulWeight.toFixed(2)),
    blendedPremium,
    surplusReturn,
    effectiveCost,
    recommendation,
  };
}

// ─── Legacy helpers (kept for projections chart) ─────────────────
export const generateProjections = (assumptions: FinancialAssumptions): YearProjection[] => {
  const projections: YearProjection[] = [];
  let members = assumptions.startingMembers;
  let reserves = members * 500;
  for (let year = 1; year <= 5; year++) {
    const annualPremiumRevenue = members * assumptions.avgPremium * 12;
    const expectedClaims = members * assumptions.claimsFrequency * assumptions.avgClaimSize;
    const adminExpenses = annualPremiumRevenue * assumptions.adminCostRatio;
    const investmentIncome = reserves * assumptions.investmentReturn;
    const netIncome = annualPremiumRevenue + investmentIncome - expectedClaims - adminExpenses;
    reserves += netIncome;
    const reserveRatio = expectedClaims > 0 ? reserves / expectedClaims : 0;
    const combinedRatio = annualPremiumRevenue > 0 ? (expectedClaims + adminExpenses) / annualPremiumRevenue : 0;
    projections.push({ year, members: Math.round(members), premiumRevenue: annualPremiumRevenue, expectedClaims, adminExpenses, netIncome, reserves, reserveRatio, combinedRatio });
    members *= (1 + assumptions.annualGrowthRate);
  }
  return projections;
};

export const generateScenarioProjections = (scenario: ScenarioAssumptions, startingMembers = 200, avgPremium = 85): YearProjection[] => {
  return generateProjections({
    startingMembers,
    avgPremium: avgPremium * (1 + scenario.premiumIncrease),
    annualGrowthRate: scenario.memberGrowth,
    claimsFrequency: scenario.claimsFrequency,
    avgClaimSize: scenario.avgClaimSize,
    adminCostRatio: scenario.adminCostRatio,
    investmentReturn: 0.03,
    targetReserveRatio: 1.5,
  });
};
