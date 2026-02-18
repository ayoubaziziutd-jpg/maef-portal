import React, { useState, useMemo } from 'react';
import { EmployeeTab } from '../types';
import { 
  SAMPLE_MEMBERS, SAMPLE_CLAIMS, SCENARIOS, 
  COVERAGE_TYPES, DEFAULT_ASSUMPTIONS 
} from '../constants';
import { 
  generateScenarioProjections, 
  determineAgeBracket, 
  calculateMonthlyPremium 
} from '../services/engine';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Database, Layers, BarChart3, Scale, ArrowLeft, 
  Search, Shield, Briefcase 
} from 'lucide-react';

interface EmployeePortalProps {
  onBack: () => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<EmployeeTab>('database');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-gray-700">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 min-h-[44px]">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={16} />
            </div>
            <h1 className="font-bold text-lg leading-tight">MAEF Admin</h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {[
            { id: 'database', label: 'Member Database', icon: Database },
            { id: 'coverage', label: 'Coverage Modeling', icon: Layers },
            { id: 'dashboard', label: 'Financials', icon: BarChart3 },
            { id: 'legal', label: 'Compliance', icon: Scale }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as EmployeeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                activeTab === item.id ? 'bg-amber-500 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {activeTab === 'database' && <DatabaseView />}
        {activeTab === 'coverage' && <ScenarioModeling />}
        {activeTab === 'legal' && <LegalCompliance />}
      </main>
    </div>
  );
};

const DatabaseView = () => (
  <div className="max-w-6xl mx-auto">
    <h2 className="text-2xl font-bold mb-6">Member Database (Primary Key: Member ID)</h2>
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Tier</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Last Payment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {SAMPLE_MEMBERS.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-mono font-bold text-maef-green">{m.id}</td>
              <td className="px-6 py-4">{m.name}</td>
              <td className="px-6 py-4">{m.tier}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{m.status}</span>
              </td>
              <td className="px-6 py-4 text-gray-500">{m.lastPaymentDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ScenarioModeling = () => {
  const scenarioData = useMemo(() => {
    return SCENARIOS.map((s) => ({
      label: s.label,
      projections: generateScenarioProjections(s)
    }));
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Financial Growth Projections</h2>
      <div className="bg-white p-6 rounded-xl border shadow-sm h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" type="number" domain={[1, 5]} tickFormatter={(v) => `Year ${v}`} />
            <YAxis tickFormatter={(v) => `$${(v / 1000)}k`} />
            <Tooltip />
            <Legend />
            {scenarioData.map((sd, idx) => (
              <Line 
                key={sd.label} 
                data={sd.projections} 
                dataKey="reserves" 
                name={sd.label} 
                stroke={idx === 0 ? '#3B82F6' : idx === 1 ? '#F59E0B' : '#10B981'} 
                strokeWidth={3} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const LegalCompliance = () => (
  <div className="max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold mb-6 text-red-600">Critical Compliance Language</h2>
    <div className="bg-white p-8 rounded-2xl border-2 border-red-100">
      <h3 className="font-bold text-lg mb-4">501(c)(8) Fraternal Benefit Society Rules</h3>
      <p className="text-gray-600 mb-4">This organization is NOT insurance. Strictly avoid these terms:</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-red-50 rounded-lg text-red-800 text-sm">X Never say "Insurance Policy"</div>
        <div className="p-4 bg-green-50 rounded-lg text-green-800 text-sm">✓ Say "Member Benefit"</div>
      </div>
    </div>
  </div>
);

export default EmployeePortal;
