import React, { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { generateProjections } from '../../services/engine';
import { DEFAULT_ASSUMPTIONS } from '../../constants';
import { FinancialAssumptions } from '../../types';
import { Sliders } from 'lucide-react';

const Projections: React.FC = () => {
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>(DEFAULT_ASSUMPTIONS);

  const data = useMemo(() => generateProjections(assumptions), [assumptions]);

  const updateAssumption = (key: keyof FinancialAssumptions, value: number) => {
    setAssumptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 mb-2">5-Year Financial Model</h2>
           <p className="text-gray-600">Simulate fund sustainability based on growth and claims variables.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
        {/* Controls */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 space-y-6">
           <h3 className="font-semibold flex items-center gap-2 text-gray-800">
             <Sliders size={18} />
             Model Inputs
           </h3>

           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Starting Members</label>
             <input
               type="number"
               className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
               value={assumptions.startingMembers}
               onChange={(e) => updateAssumption('startingMembers', parseInt(e.target.value))}
             />
           </div>

           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Annual Growth Rate ({(assumptions.annualGrowthRate * 100).toFixed(0)}%)</label>
             <input
               type="range" min="0" max="1" step="0.05"
               className="w-full mt-1 accent-morocco-green"
               value={assumptions.annualGrowthRate}
               onChange={(e) => updateAssumption('annualGrowthRate', parseFloat(e.target.value))}
             />
           </div>

           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Claims Frequency ({(assumptions.claimsFrequency * 100).toFixed(0)}%)</label>
             <input
               type="range" min="0.05" max="0.5" step="0.01"
               className="w-full mt-1 accent-morocco-green"
               value={assumptions.claimsFrequency}
               onChange={(e) => updateAssumption('claimsFrequency', parseFloat(e.target.value))}
             />
           </div>

           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Avg Claim Size ($)</label>
             <input
               type="number"
               className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
               value={assumptions.avgClaimSize}
               onChange={(e) => updateAssumption('avgClaimSize', parseInt(e.target.value))}
             />
           </div>

           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase">Avg Premium ($/mo)</label>
             <input
               type="number"
               className="w-full mt-1 p-2 border border-gray-300 rounded text-sm"
               value={assumptions.avgPremium}
               onChange={(e) => updateAssumption('avgPremium', parseInt(e.target.value))}
             />
           </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-3 grid grid-cols-1 gap-6">
           {/* Revenue vs Claims Chart */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue vs. Claims Projection</h4>
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                       <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} />
                   <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                   <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                   <Legend />
                   <Area type="monotone" dataKey="premiumRevenue" name="Revenue" stroke="#059669" fillOpacity={1} fill="url(#colorRev)" />
                   <Area type="monotone" dataKey="expectedClaims" name="Claims" stroke="#DC2626" fillOpacity={1} fill="url(#colorClaims)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>

           {/* Reserves Chart */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h4 className="text-sm font-semibold text-gray-700 mb-4">Cumulative Reserves Growth</h4>
             <div className="h-48">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                   <XAxis dataKey="year" tickFormatter={(val) => `Year ${val}`} />
                   <YAxis tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                   <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                   <Line type="monotone" dataKey="reserves" name="Total Reserves" stroke="#4F46E5" strokeWidth={3} dot={{r: 4}} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Year</th>
              <th className="px-6 py-3">Members</th>
              <th className="px-6 py-3">Revenue</th>
              <th className="px-6 py-3">Claims Cost</th>
              <th className="px-6 py-3">Net Income</th>
              <th className="px-6 py-3">End Reserves</th>
              <th className="px-6 py-3 text-right">Reserve Ratio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => (
              <tr key={row.year} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium">Year {row.year}</td>
                <td className="px-6 py-3">{row.members.toLocaleString()}</td>
                <td className="px-6 py-3 text-green-700">${Math.round(row.premiumRevenue).toLocaleString()}</td>
                <td className="px-6 py-3 text-red-700">${Math.round(row.expectedClaims).toLocaleString()}</td>
                <td className={`px-6 py-3 font-medium ${row.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.round(row.netIncome).toLocaleString()}
                </td>
                <td className="px-6 py-3 font-bold text-gray-800">${Math.round(row.reserves).toLocaleString()}</td>
                <td className="px-6 py-3 text-right">
                  <span className={`px-2 py-1 rounded text-xs ${
                    row.reserveRatio >= 1.5 ? 'bg-green-100 text-green-800' :
                    row.reserveRatio >= 1.0 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(row.reserveRatio * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Projections;
