import React, { useState, useEffect } from 'react';
import { calculateMonthlyPremium } from '../../services/engine';
import { COVERAGE_LIMITS } from '../../constants';
import { CoverageTier } from '../../types';
import { Info, Check, User, Users, Baby, Shield } from 'lucide-react';

const Calculator: React.FC = () => {
  const [age, setAge] = useState<number>(35);
  const [tier, setTier] = useState<CoverageTier>('Standard');
  const [spouse, setSpouse] = useState<boolean>(false);
  const [children, setChildren] = useState<number>(0);
  const [premium, setPremium] = useState<number>(0);

  useEffect(() => {
    setPremium(calculateMonthlyPremium(age, tier, spouse, children));
  }, [age, tier, spouse, children]);

  const limits = COVERAGE_LIMITS[tier];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Member Premium Calculator</h2>
        <p className="text-gray-600">Estimate monthly contributions based on your family structure and coverage needs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-morocco-green" /> Primary Member
            </h3>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="18"
                  max="80"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-morocco-green"
                />
                <span className="text-2xl font-bold text-gray-900 w-12 text-center">{age}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">Coverage Tier</label>
              <div className="grid grid-cols-3 gap-3">
                {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                      tier === t
                        ? 'bg-morocco-green text-white border-morocco-green shadow-md'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={18} className="text-morocco-green" /> Family Coverage
            </h3>

            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
              <div>
                <span className="block text-sm font-medium text-gray-900">Include Spouse</span>
                <span className="text-xs text-gray-500">+60% of base premium</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={spouse}
                  onChange={(e) => setSpouse(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-morocco-green"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="block text-sm font-medium text-gray-900">Children (Under 26)</span>
                <span className="text-xs text-gray-500">+30% each (max 3 billed)</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setChildren(Math.max(0, children - 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="font-semibold w-6 text-center">{children}</span>
                <button
                  onClick={() => setChildren(Math.min(10, children + 1))}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-morocco-green to-morocco-green_light text-white rounded-xl shadow-xl overflow-hidden sticky top-6">
            <div className="p-6 text-center border-b border-white/10">
              <h3 className="text-sm font-medium text-green-100 uppercase tracking-wider mb-1">Estimated Monthly Premium</h3>
              <div className="flex items-center justify-center text-5xl font-bold tracking-tight">
                <span className="text-2xl mr-1 mt-2">$</span>
                {premium.toFixed(2)}
              </div>
              <p className="text-xs text-green-100 mt-2 opacity-80">
                ${(premium * 12).toLocaleString()} per year
              </p>
            </div>

            <div className="p-6 bg-white/5">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Shield size={16} />
                {tier} Coverage Benefits
              </h4>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between items-center">
                  <span className="text-green-100">Per Incident Max</span>
                  <span className="font-bold">${limits.perIncident.toLocaleString()}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-green-100">Annual Max</span>
                  <span className="font-bold">${limits.annualMax.toLocaleString()}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-green-100">Deductible</span>
                  <span className="font-bold">${limits.deductible}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-green-100">Coinsurance</span>
                  <span className="font-bold">{(limits.coinsurance * 100)}%</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-black/20 text-xs text-center text-green-100/70">
              *Not an insurance policy. Mutual aid estimate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
