import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, DollarSign, ShieldAlert, Activity } from 'lucide-react';
import { DEFAULT_ASSUMPTIONS } from '../../constants';
import { generateProjections } from '../../services/engine';

const Dashboard: React.FC = () => {
  // Use Year 1 data for current snapshot
  const year1Data = generateProjections(DEFAULT_ASSUMPTIONS)[0];

  const kpiCards = [
    { label: 'Active Members', value: year1Data.members.toLocaleString(), icon: Users, color: 'bg-blue-500' },
    { label: 'YTD Revenue', value: `$${Math.round(year1Data.premiumRevenue).toLocaleString()}`, icon: DollarSign, color: 'bg-green-500' },
    { label: 'Claims Paid', value: `$${Math.round(year1Data.expectedClaims).toLocaleString()}`, icon: Activity, color: 'bg-red-500' },
    { label: 'Current Reserves', value: `$${Math.round(year1Data.reserves).toLocaleString()}`, icon: ShieldAlert, color: 'bg-indigo-500' },
  ];

  const claimsByType = [
    { name: 'Medical', value: 45, color: '#006233' },
    { name: 'Funeral', value: 25, color: '#C1272D' },
    { name: 'Financial', value: 20, color: '#F59E0B' },
    { name: 'Travel', value: 10, color: '#3B82F6' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Executive Dashboard</h2>
        <p className="text-gray-600">Real-time overview of fund performance and health metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.color} bg-opacity-10`}>
              <card.icon className={`${card.color.replace('bg-', 'text-')}`} size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-semibold text-gray-800 mb-6">Fund Ratios (Year 1)</h3>
           <div className="space-y-6">
             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-gray-600">Loss Ratio (Target: 65%)</span>
                 <span className="font-bold">{(year1Data.expectedClaims / year1Data.premiumRevenue * 100).toFixed(1)}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                 <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(year1Data.expectedClaims / year1Data.premiumRevenue * 100)}%` }}></div>
               </div>
             </div>

             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-gray-600">Reserve Ratio (Target: 150%)</span>
                 <span className="font-bold">{(year1Data.reserveRatio * 100).toFixed(1)}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                 <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, year1Data.reserveRatio * 100 / 2)}%` }}></div>
               </div>
             </div>

             <div>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-gray-600">Expense Ratio (Target: 18%)</span>
                 <span className="font-bold">{(year1Data.adminExpenses / year1Data.premiumRevenue * 100).toFixed(1)}%</span>
               </div>
               <div className="w-full bg-gray-200 rounded-full h-2.5">
                 <div className="bg-gray-500 h-2.5 rounded-full" style={{ width: `${(year1Data.adminExpenses / year1Data.premiumRevenue * 100)}%` }}></div>
               </div>
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h3 className="font-semibold text-gray-800 mb-6">Claims Distribution (Simulated)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={claimsByType} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                 <XAxis type="number" unit="%" />
                 <YAxis dataKey="name" type="category" width={80} />
                 <Tooltip />
                 <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                    {claimsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
