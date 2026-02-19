import React, { useState, useMemo } from 'react';
import { EmployeeTab, CoverageTier, MembershipRequest } from '../types';
import { SAMPLE_MEMBERS, SCENARIOS, COVERAGE_TYPES } from '../constants';
import { generateScenarioProjections } from '../services/engine';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Database, Layers, BarChart3, Scale, ArrowLeft,
  Shield, Trash2, Edit3, Info, Bell, CheckCircle2, X, AlertCircle
} from 'lucide-react';

interface EmployeePortalProps {
  onBack: () => void;
}

const SAMPLE_REQUESTS: MembershipRequest[] = [
  { id: 'APP001', name: 'Youssef Alami', address: '142 Oak St, Dearborn, MI 48126', email: 'y.alami@email.com', age: 34, submittedDate: '2026-02-17', status: 'Pending Review', creditScore: 712, backgroundClear: true, bankruptcyClear: true, estimatedTier: 'Standard' },
  { id: 'APP002', name: 'Sara Mansouri', address: '88 Elm Ave, Paterson, NJ 07501', email: 's.mansouri@email.com', age: 28, submittedDate: '2026-02-16', status: 'Pending Review', creditScore: 650, backgroundClear: true, bankruptcyClear: true, estimatedTier: 'Basic' },
  { id: 'APP003', name: 'Khalid Bensouda', address: '220 Pine Rd, Chicago, IL 60616', email: 'k.bensouda@email.com', age: 45, submittedDate: '2026-02-15', status: 'Approved', creditScore: 790, backgroundClear: true, bankruptcyClear: true, estimatedTier: 'Premium' },
  { id: 'APP004', name: 'Nadia Tahiri', address: '55 Maple Ln, Houston, TX 77001', email: 'n.tahiri@email.com', age: 39, submittedDate: '2026-02-14', status: 'Denied', creditScore: 520, backgroundClear: false, bankruptcyClear: false, estimatedTier: 'Basic' },
];

const TIER_DETAILS = {
  Basic: { perIncident: '$5,000', annualMax: '$15,000', deductible: '$500', coinsurance: '20%', coverages: ['Medical Emergency', 'Funeral & Burial'], notCovered: ['Financial Emergency', 'Emergency Travel'] },
  Standard: { perIncident: '$15,000', annualMax: '$45,000', deductible: '$250', coinsurance: '15%', coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel'], notCovered: ['Financial Emergency'] },
  Premium: { perIncident: '$50,000', annualMax: '$150,000', deductible: '$100', coinsurance: '10%', coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel', 'Financial Emergency'], notCovered: [] },
};

const EmployeePortal: React.FC<EmployeePortalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<EmployeeTab>('requests');
  const [requests, setRequests] = useState<MembershipRequest[]>(SAMPLE_REQUESTS);

  const pendingCount = requests.filter(r => r.status === 'Pending Review').length;

  const tabs = [
    { id: 'requests', label: 'Membership Requests', icon: Bell, badge: pendingCount },
    { id: 'database', label: 'Member Database', icon: Database },
    { id: 'coverage', label: 'Coverage Modeling', icon: Layers },
    { id: 'dashboard', label: 'Financials', icon: BarChart3 },
    { id: 'legal', label: 'Compliance', icon: Scale },
  ];

  const handleApprove = (id: string) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
  const handleDeny = (id: string) => setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Denied' } : r));

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-700">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <Shield className="text-slate-900" size={16} />
            </div>
            <h1 className="font-bold text-lg leading-tight">MAFS Admin</h1>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as EmployeeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium text-sm flex-1 text-left">{item.label}</span>
              {'badge' in item && (item.badge ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {activeTab === 'requests' && <MembershipRequestsView requests={requests} onApprove={handleApprove} onDeny={handleDeny} />}
        {activeTab === 'database' && <DatabaseView />}
        {activeTab === 'coverage' && <CoverageModelingSection />}
        {activeTab === 'legal' && <LegalSection />}
        {activeTab === 'dashboard' && (
          <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border">
            <h2 className="text-2xl font-bold text-gray-400">Financials Dashboard</h2>
            <p className="text-gray-400 mt-2">Coming soon.</p>
          </div>
        )}
      </main>
    </div>
  );
};

/* ─── Membership Requests ─── */
const MembershipRequestsView = ({
  requests, onApprove, onDeny
}: {
  requests: MembershipRequest[];
  onApprove: (id: string) => void;
  onDeny: (id: string) => void;
}) => {
  const [selected, setSelected] = useState<MembershipRequest | null>(null);

  const getFicoColor = (score: number) => {
    if (score >= 740) return 'text-emerald-600';
    if (score >= 670) return 'text-blue-600';
    if (score >= 580) return 'text-amber-500';
    return 'text-red-500';
  };

  const getFicoLabel = (score: number) => {
    if (score >= 800) return 'Exceptional';
    if (score >= 740) return 'Very Good';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Membership Requests</h2>
          <p className="text-slate-500 text-sm mt-1">Review background/credit reports and approve or deny applications. Members cannot select a tier until approved.</p>
        </div>
        <div className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-xl text-sm">
          {requests.filter(r => r.status === 'Pending Review').length} Pending
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{r.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    r.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-red-100 text-red-700'
                  }`}>{r.status}</span>
                </div>
                <p className="text-gray-500 text-sm">{r.address} · {r.email} · Age {r.age}</p>
                <p className="text-gray-400 text-xs mt-1">Application ID: {r.id} · Submitted {r.submittedDate}</p>
              </div>
              <button onClick={() => setSelected(selected?.id === r.id ? null : r)}
                className="text-sm text-emerald-700 font-bold hover:underline ml-4">
                {selected?.id === r.id ? 'Hide Report' : 'View Report'}
              </button>
            </div>

            {selected?.id === r.id && (
              <div className="mt-6 border-t pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Credit Report */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Credit Report</p>
                  <p className={`text-3xl font-bold ${getFicoColor(r.creditScore)}`}>{r.creditScore}</p>
                  <p className={`text-sm font-semibold ${getFicoColor(r.creditScore)}`}>{getFicoLabel(r.creditScore)}</p>
                  <p className="text-xs text-gray-400 mt-1">FICO Score 8</p>
                  <div className="mt-3 text-xs">
                    <p className="font-semibold text-gray-600 mb-1">Recommended Tier</p>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">{r.estimatedTier}</span>
                  </div>
                </div>

                {/* Background Check */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Background Check</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {r.backgroundClear ? <CheckCircle2 className="text-emerald-600" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
                      <span className="text-sm font-medium text-gray-700">Criminal / Fraud</span>
                      <span className={`text-xs font-bold ${r.backgroundClear ? 'text-emerald-600' : 'text-red-600'}`}>{r.backgroundClear ? 'Clear' : 'FLAG'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.bankruptcyClear ? <CheckCircle2 className="text-emerald-600" size={18} /> : <AlertCircle className="text-red-500" size={18} />}
                      <span className="text-sm font-medium text-gray-700">Bankruptcy</span>
                      <span className={`text-xs font-bold ${r.bankruptcyClear ? 'text-emerald-600' : 'text-red-600'}`}>{r.bankruptcyClear ? 'Clear' : 'Active'}</span>
                    </div>
                  </div>
                  {(!r.backgroundClear || !r.bankruptcyClear) && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">
                      ⚠ Flags detected — recommend denial.
                    </div>
                  )}
                </div>

                {/* Decision */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Decision</p>
                  {r.status === 'Pending Review' ? (
                    <div className="space-y-3">
                      <button onClick={() => onApprove(r.id)}
                        className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors">
                        ✓ Approve ({r.estimatedTier} Tier)
                      </button>
                      <button onClick={() => onDeny(r.id)}
                        className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-bold text-sm hover:bg-red-200 transition-colors">
                        ✗ Deny Application
                      </button>
                      <p className="text-xs text-gray-400 text-center">Applicant cannot select a tier until approved.</p>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-lg text-center font-bold text-sm ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {r.status}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Database ─── */
const DatabaseView = () => {
  const [showTiers, setShowTiers] = useState(false);

  const TIER_DETAILS = {
    Basic: { perIncident: '$5,000', annualMax: '$15,000', deductible: '$500', coinsurance: '20%', coverages: ['Medical Emergency', 'Funeral & Burial'] },
    Standard: { perIncident: '$15,000', annualMax: '$45,000', deductible: '$250', coinsurance: '15%', coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel'] },
    Premium: { perIncident: '$50,000', annualMax: '$150,000', deductible: '$100', coinsurance: '10%', coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel', 'Financial Emergency'] },
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Relational Member Database</h2>
        <div className="flex gap-3">
          <button onClick={() => setShowTiers(!showTiers)}
            className="border border-slate-300 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100">
            {showTiers ? 'Hide' : 'View'} Tier Details
          </button>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700">
            + Add New Member
          </button>
        </div>
      </div>

      {showTiers && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map(tier => {
            const d = TIER_DETAILS[tier];
            return (
              <div key={tier} className="bg-white rounded-xl border p-4 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">{tier} Tier</h4>
                <div className="text-xs space-y-1 text-gray-600 mb-3">
                  <p>Per Incident: <strong>{d.perIncident}</strong></p>
                  <p>Annual Max: <strong>{d.annualMax}</strong></p>
                  <p>Deductible: <strong>{d.deductible}</strong></p>
                  <p>Coinsurance: <strong>{d.coinsurance}</strong></p>
                </div>
                <div className="space-y-1">
                  {d.coverages.map(c => (
                    <div key={c} className="flex items-center gap-1 text-xs text-emerald-700">
                      <CheckCircle2 size={10} /> {c}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b">
            <tr>
              <th className="px-6 py-4">Member ID</th>
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Tier</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SAMPLE_MEMBERS.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-mono font-bold text-emerald-600">{m.id}</td>
                <td className="px-6 py-4 font-medium">{m.name}</td>
                <td className="px-6 py-4">{m.tier}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">{m.status}</span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button className="text-slate-400 hover:text-emerald-600"><Edit3 size={18} /></button>
                  <button className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Coverage Modeling ─── */
const CoverageModelingSection = () => {
  const [modelType, setModelType] = useState('Islamic Relief');
  const scenarioData = useMemo(() => SCENARIOS.map((s) => ({ label: s.label, projections: generateScenarioProjections(s) })), []);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Actuarial Coverage Modeling</h2>
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-8 shadow-sm">
        <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold"><Layers size={20} /><h3>Select Theoretical Framework</h3></div>
        <div className="flex gap-4">
          {['SOA', 'CAS', 'Islamic Relief'].map((m) => (
            <button key={m} onClick={() => setModelType(m)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border ${modelType === m ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg' : 'bg-white text-slate-600 border-slate-200'}`}>
              {m} Model
            </button>
          ))}
        </div>
        <div className="mt-4 p-4 bg-white/50 rounded-xl flex items-start gap-3 border border-emerald-100">
          <Info className="text-emerald-700 shrink-0 mt-0.5" size={16} />
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
            <YAxis tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip />
            <Legend />
            {scenarioData.map((sd, idx) => (
              <Line key={sd.label} data={sd.projections} dataKey="reserves" name={sd.label}
                stroke={idx === 0 ? '#3B82F6' : idx === 1 ? '#F59E0B' : '#059669'}
                strokeWidth={4} dot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

/* ─── Legal ─── */
const LegalSection = () => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-slate-900 mb-6">Compliance & Critical Language</h2>
    <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm">
      <div className="bg-red-50 p-6 rounded-2xl mb-6">
        <h3 className="text-red-800 font-bold mb-2">501(c)(8) Fraternal Benefit Society Rules</h3>
        <p className="text-sm text-red-700 leading-relaxed">
          MAFS operates as a fraternal benefit society. All documentation must emphasize the mutual aid nature of the society.
          The term "Policy" must be replaced with "Benefit Certificate" in all official correspondence.
        </p>
      </div>
    </div>
  </div>
);

export default EmployeePortal;
