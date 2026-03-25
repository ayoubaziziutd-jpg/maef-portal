import React, { useMemo, useState } from 'react';
import { runMonteCarlo } from '../../services/engine';
import { DEFAULT_ASSUMPTIONS } from '../../constants';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const Reserves: React.FC = () => {
  const [members, setMembers] = useState(500);

  // Use default assumptions for frequency/severity
  const riskProfile = useMemo(() => {
    return runMonteCarlo(
      members,
      DEFAULT_ASSUMPTIONS.claimsFrequency,
      DEFAULT_ASSUMPTIONS.avgClaimSize
    );
  }, [members]);

  const requiredReserves = {
    operating: (members * 50 * 12 * 0.18) * 0.5, // 6 months expenses
    claims: riskProfile.median * 1.5, // 1.5x expected claims
    catastrophic: riskProfile.median * 1.5 * 0.1 // 10% buffer
  };

  const totalRequired = requiredReserves.operating + requiredReserves.claims + requiredReserves.catastrophic;

  const chartData = [
    { name: 'Best Case', value: riskProfile.bestCase },
    { name: 'Median', value: riskProfile.median },
    { name: '95th %ile', value: riskProfile.p95 },
    { name: '99th %ile', value: riskProfile.p99 },
    { name: 'Worst Case', value: riskProfile.worstCase },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Reserve Adequacy & Risk Analysis</h2>
        <p className="text-gray-600">Determine required capital reserves based on Monte Carlo simulations of claim risk.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Active Membership Size</label>
            <input
               type="range" min="100" max="5000" step="50"
               className="w-full mb-2 accent-morocco-green"
               value={members}
               onChange={(e) => setMembers(parseInt(e.target.value))}
             />
             <div className="text-center font-bold text-2xl text-morocco-green">{members} Members</div>
          </div>

          <div className="bg-morocco-green/5 p-6 rounded-xl border border-morocco-green/20">
            <h3 className="font-semibold text-morocco-green mb-4">Reserve Requirements</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between">
                <span className="text-gray-600">Operating (6mo)</span>
                <span className="font-medium">${Math.round(requiredReserves.operating).toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Claims (1.5x Exp)</span>
                <span className="font-medium">${Math.round(requiredReserves.claims).toLocaleString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Catastrophic (10%)</span>
                <span className="font-medium">${Math.round(requiredReserves.catastrophic).toLocaleString()}</span>
              </li>
              <li className="pt-3 border-t border-morocco-green/20 flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total Required</span>
                <span className="text-morocco-green">${Math.round(totalRequired).toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
             <div className="flex items-center justify-between mb-6">
               <h3 className="font-semibold text-gray-800">Monte Carlo Simulation: Annual Claims Risk</h3>
               <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                 <TrendingUp size={14} />
                 500 Iterations
               </div>
             </div>

             <div className="h-80">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" />
                   <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                   <Tooltip formatter={(val: unknown) => typeof val === 'number' ? `$${Math.round(val).toLocaleString()}` : String(val)} />
                   <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                   <ReferenceLine y={totalRequired} label="Target Reserves" stroke="green" strokeDasharray="3 3" />
                 </BarChart>
               </ResponsiveContainer>
             </div>

             <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex gap-3">
               <AlertTriangle className="text-yellow-600 shrink-0" />
               <p className="text-sm text-yellow-800">
                 <strong>Risk Note:</strong> The 99th percentile risk represents a 1-in-100 year event.
                 Current reserves should ideally cover at least the 95th percentile of simulated claims to ensure solvency during adverse years.
               </p>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reserves;
