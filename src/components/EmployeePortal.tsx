import React, { useState, useMemo } from 'react';
import { EmployeeTab } from '../types';
import { 
  SAMPLE_MEMBERS, SCENARIOS, 
  COVERAGE_TYPES 
} from '../constants';
import { generateScenarioProjections } from '../services/engine';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Database, Layers, BarChart3, Scale, ArrowLeft, 
  Shield, Trash2, Edit3, Info
} from 'lucide-react';

interface EmployeePortalProps {
  onBack: () => void;
}

const EmployeePortal: React.FC<EmployeePortalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<EmployeeTab>('database');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-700">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 min-h-[44px]">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
              <Shield className="text-slate-900" size={16} />
            </div>
            <h1 className="font-bold text-lg leading-tight">MAFS Admin</h1>
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
                activeTab === item.id ? 'bg-maef-green text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
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
        {activeTab === 'coverage' && <CoverageModelingSection />}
        {activeTab === 'legal' && <LegalSection />}
      </main>
    </div>
  );
};

const DatabaseView = () => (
  <div className="max-w-6xl mx-auto">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-3xl font-bold text-slate-900">Relational Member Database</h2>
      <button className="bg-maef-green text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-emerald-800">
        + Add New Member
      </button>
    </div>
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-600 font-bold border-b">
          <tr>
            <th className="px-6 py-4">PK: Member ID</th>
            <th className="px-6 py-4">Full Name</th>
            <th className="px-6 py-4">Tier</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {SAMPLE_MEMBERS.map((m) => (
            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 font-mono font-bold text-maef-green">{m.id}</td>
              <td className="px-6 py-4 font-medium">{m.name}</td>
              <td className="px-6 py-4">{m.tier}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">{m.status}</span>
              </td>
              <td className="px-6 py-4 text-right space-x-3">
                <button className="text-slate-400 hover:text-maef-green"><Edit3 size={18} /></button>
                <button className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const CoverageModelingSection = () => {
  const [modelType, setModelType] = useState('Islamic Relief');
  
  const scenarioData = useMemo(() => {
    return SCENARIOS.map((s) => ({
      label: s.label,
      projections: generateScenarioProjections(s)
    }));
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Actuarial Coverage Modeling</h2>
      
      {/* Model Framework Selector */}
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-maef-green font-bold">
          <Layers size={20} />
          <h3>Select Theoretical Framework</h3>
        </div>
        <div className="flex gap-4">
          {['SOA', 'CAS', 'Islamic Relief'].map((m) => (
            <button
              key={m}
              onClick={() => setModelType(m)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${
                modelType === m ? 'bg-maef-green text-white border-maef-green shadow-lg' : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {m} Model
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-white/50 rounded-xl flex items-start gap-3 border border-emerald-100">
          <Info className="text-maef-green shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-emerald-800 leading-relaxed">
            {modelType === 'SOA' && "Utilizing Society of Actuaries Life & Health benchmarks for long-term mortality and morbidity trends."}
            {modelType === 'CAS' && "Utilizing Casualty Actuarial Society frameworks for short-tail catastrophic events (e.g., repatriation, sudden disability)."}
            {modelType === 'Islamic Relief' && "Takaful-compliant mutual aid model. Emphasis on 'Tabarru' (donations) and surplus distribution, operating on zero-interest reserve modeling."}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-[450px]">
        <h3 className="font-bold text-slate-800 mb-6 flex justify-between">
          Projected Reserve Growth (5-Year Forecast)
          <span className="text-xs text-slate-400 font-normal">Scenario: {modelType} Weighted</span>
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                stroke={idx === 0 ? '#3B82F6' : idx === 1 ? '#F59E0B' : '#0D5F3A'} 
                strokeWidth={4} 
                dot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const LegalSection = () => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-slate-900 mb-6">Compliance & Critical Language</h2>
    <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm">
      <div className="bg-red-50 p-6 rounded-2xl mb-6">
        <h3 className="text-red-800 font-bold mb-2">501(c)(8) Fraternal Benefit Society Rules</h3>
        <p className="text-sm text-red-700 leading-relaxed">
          MAFS operates as a fraternal benefit society. To maintain this legal distinction, all documentation must emphasize the mutual aid nature of the society. 
          The term "Policy" must be replaced with "Benefit Certificate" in all official correspondence.
        </p>
      </div>
    </div>
  </div>
);

export default EmployeePortal;
