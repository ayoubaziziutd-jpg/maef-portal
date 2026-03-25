import React, { useState } from 'react';
import { CoverageTier } from '../../types';
import { calculateClaimPayout } from '../../services/engine';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ClaimsTool: React.FC = () => {
  const [amount, setAmount] = useState<number>(5000);
  const [tier, setTier] = useState<CoverageTier>('Standard');
  const [ytd, setYtd] = useState<number>(0);

  const result = calculateClaimPayout(amount, tier, ytd);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Claims Estimator</h2>
        <p className="text-gray-600">Calculate coverage payouts and member responsibility based on plan rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Incident Details</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Incident Cost ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-morocco-green focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member Plan</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as CoverageTier)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-morocco-green outline-none"
            >
              <option value="Basic">Basic</option>
              <option value="Standard">Standard</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prior Claims Paid YTD ($)</label>
            <input
              type="number"
              value={ytd}
              onChange={(e) => setYtd(parseFloat(e.target.value) || 0)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-morocco-green outline-none"
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Payout Breakdown</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
              <span className="text-gray-600">Total Bill</span>
              <span className="font-bold text-lg">${result.claimAmount.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center px-3 text-sm">
              <span className="text-red-600 font-medium">(-) Deductible</span>
              <span className="text-red-600">-${result.deductibleApplied}</span>
            </div>

            <div className="flex justify-between items-center px-3 text-sm pb-3 border-b border-gray-300">
              <span className="text-red-600 font-medium">(-) Coinsurance ({(result.coinsuranceRate * 100)}%)</span>
              <span className="text-red-600">-${(result.memberPays - result.deductibleApplied).toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-morocco-green/10 rounded-lg border border-morocco-green/20">
              <span className="text-morocco-green font-bold">Fund Pays</span>
              <span className="text-2xl font-bold text-morocco-green">${result.fundPays.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-gray-200 rounded-lg">
              <span className="text-gray-700 font-bold">Member Pays</span>
              <span className="text-xl font-bold text-gray-800">${result.memberPays.toLocaleString()}</span>
            </div>

            {result.notes.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                   <AlertCircle className="text-yellow-600 mt-0.5" size={16} />
                   <div className="text-xs text-yellow-800">
                     {result.notes.map((note, idx) => <p key={idx}>{note}</p>)}
                   </div>
                </div>
              </div>
            )}

            {result.withinLimits && result.notes.length === 0 && (
               <div className="flex items-center gap-2 text-green-700 text-sm px-3">
                 <CheckCircle2 size={16} />
                 Fully covered within policy limits.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimsTool;
