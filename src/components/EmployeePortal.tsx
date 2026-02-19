import React, { useState, useMemo } from 'react';
import { EmployeeTab, CoverageTier, MembershipRequest } from '../types';
import { SAMPLE_MEMBERS, SCENARIOS } from '../constants';
import { generateScenarioProjections, soaModel, casModel, takafulModel, hybridModel } from '../services/engine';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  Database, Layers, BarChart3, Scale, ArrowLeft,
  Shield, Trash2, Edit3, Bell, CheckCircle2, X, AlertCircle
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

const EmployeePortal: React.FC<EmployeePortalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<EmployeeTab>('requests');
  const [requests, setRequests] = useState<MembershipRequest[]>(SAMPLE_REQUESTS);
  const pendingCount = requests.filter(r => r.status === 'Pending Review').length;

  const tabs = [
    { id: 'requests', label: 'Membership Requests', icon: Bell, badge: pendingCount },
    { id: 'database', label: 'Member Database', icon: Database },
    { id: 'coverage', label: 'Actuarial Lab', icon: Layers },
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
            <h1 className="font-bold text-lg">MAFS Admin</h1>
          </div>
        </div>
        <nav className="flex-1 py-6 px-3 space-y-1">
          {tabs.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id as EmployeeTab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
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
            <h2 className="text-2xl font-bold text-gray-400">Financials Dashboard — Coming Soon</h2>
          </div>
        )}
      </main>
    </div>
  );
};

/* ─── Membership Requests ─── */
const MembershipRequestsView = ({ requests, onApprove, onDeny }: { requests: MembershipRequest[]; onApprove: (id: string) => void; onDeny: (id: string) => void }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getFicoColor = (score: number) => score >= 740 ? 'text-emerald-600' : score >= 670 ? 'text-blue-600' : score >= 580 ? 'text-amber-500' : 'text-red-500';
  const getFicoLabel = (score: number) => score >= 800 ? 'Exceptional' : score >= 740 ? 'Very Good' : score >= 670 ? 'Good' : score >= 580 ? 'Fair' : 'Poor';

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Membership Requests</h2>
          <p className="text-slate-500 text-sm mt-1">Members cannot select a tier until approved here.</p>
        </div>
        <div className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded-xl text-sm">
          {requests.filter(r => r.status === 'Pending Review').length} Pending
        </div>
      </div>
      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className="bg-white rounded-2xl border shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900 text-lg">{r.name}</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === 'Pending Review' ? 'bg-amber-100 text-amber-700' : r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
                </div>
                <p className="text-gray-500 text-sm">{r.address} · {r.email} · Age {r.age}</p>
                <p className="text-gray-400 text-xs mt-1">ID: {r.id} · Submitted {r.submittedDate}</p>
              </div>
              <button onClick={() => setSelectedId(selectedId === r.id ? null : r.id)} className="text-sm text-emerald-700 font-bold hover:underline ml-4">
                {selectedId === r.id ? 'Hide Report' : 'View Report'}
              </button>
            </div>
            {selectedId === r.id && (
              <div className="mt-6 border-t pt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Credit Report</p>
                  <p className={`text-3xl font-bold ${getFicoColor(r.creditScore)}`}>{r.creditScore}</p>
                  <p className={`text-sm font-semibold ${getFicoColor(r.creditScore)}`}>{getFicoLabel(r.creditScore)}</p>
                  <p className="text-xs text-gray-400 mt-1">FICO Score 8</p>
                  <div className="mt-3 text-xs">
                    <p className="font-semibold text-gray-600 mb-1">Recommended Tier</p>
                    <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded">{r.estimatedTier}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Background Check</p>
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
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2 text-xs text-red-700">⚠ Flags detected — recommend denial.</div>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3">Decision</p>
                  {r.status === 'Pending Review' ? (
                    <div className="space-y-3">
                      <button onClick={() => onApprove(r.id)} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700">✓ Approve ({r.estimatedTier})</button>
                      <button onClick={() => onDeny(r.id)} className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-bold text-sm hover:bg-red-200">✗ Deny</button>
                      <p className="text-xs text-gray-400 text-center">Member cannot select tier until approved.</p>
                    </div>
                  ) : (
                    <div className={`p-3 rounded-lg text-center font-bold text-sm ${r.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{r.status}</div>
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
  const TIER_INFO = {
    Basic: { perIncident: '$5,000', annualMax: '$15,000', deductible: '$500', coinsurance: '20%', coverages: ['Medical Emergency', 'Funeral & Burial'] },
    Standard: { perIncident: '$15,000', annualMax: '$45,000', deductible: '$250', coinsurance: '15%', coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel'] },
    Premium: { perIncident: '$50,000', annualMax: '$150,000', deductible: '$100', coinsurance: '10%', coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel', 'Financial Emergency'] },
  };
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Member Database</h2>
        <div className="flex gap-3">
          <button onClick={() => setShowTiers(!showTiers)} className="border border-slate-300 text-slate-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100">{showTiers ? 'Hide' : 'View'} Tier Details</button>
          <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700">+ Add Member</button>
        </div>
      </div>
      {showTiers && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map(tier => {
            const d = TIER_INFO[tier];
            return (
              <div key={tier} className="bg-white rounded-xl border p-4 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">{tier}</h4>
                <div className="text-xs space-y-1 text-gray-600 mb-3">
                  <p>Per Incident: <strong>{d.perIncident}</strong></p>
                  <p>Annual Max: <strong>{d.annualMax}</strong></p>
                  <p>Deductible: <strong>{d.deductible}</strong></p>
                  <p>Coinsurance: <strong>{d.coinsurance}</strong></p>
                </div>
                {d.coverages.map(c => <div key={c} className="flex items-center gap-1 text-xs text-emerald-700"><CheckCircle2 size={10} />{c}</div>)}
              </div>
            );
          })}
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
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
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-mono font-bold text-emerald-600">{m.id}</td>
                <td className="px-6 py-4 font-medium">{m.name}</td>
                <td className="px-6 py-4">{m.tier}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">{m.status}</span></td>
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

/* ─── Actuarial Lab ─── */
const CoverageModelingSection = () => {
  const [activeView, setActiveView] = useState<'simulator' | 'projections' | 'models'>('simulator');
  const [age, setAge] = useState(49);
  const [ficoScore, setFicoScore] = useState(650);
  const [tier, setTier] = useState<CoverageTier>('Standard');
  const [hasSpouse, setHasSpouse] = useState(false);
  const [children, setChildren] = useState(0);
  const [mockData, setMockData] = useState({ startingMembers: 200, avgPremium: 85, memberGrowth: 0.20, claimsFrequency: 0.20, avgClaimSize: 3500, adminCostRatio: 0.18 });

  const soa = useMemo(() => soaModel(age, tier, ficoScore, hasSpouse, children), [age, tier, ficoScore, hasSpouse, children]);
  const cas = useMemo(() => casModel(age, tier, ficoScore, hasSpouse, children), [age, tier, ficoScore, hasSpouse, children]);
  const takaful = useMemo(() => takafulModel(age, tier, ficoScore, hasSpouse, children), [age, tier, ficoScore, hasSpouse, children]);
  const hybrid = useMemo(() => hybridModel(age, tier, ficoScore, hasSpouse, children, soa, cas, takaful), [age, tier, ficoScore, hasSpouse, children, soa, cas, takaful]);

  const scenarioData = useMemo(() => SCENARIOS.map((s) => ({
    label: s.label,
    projections: generateScenarioProjections(s, mockData.startingMembers, mockData.avgPremium)
  })), [mockData]);

  const getFicoLabel = (s: number) => s >= 800 ? 'Exceptional' : s >= 740 ? 'Very Good' : s >= 670 ? 'Good' : s >= 580 ? 'Fair' : 'Poor';

  const MODEL_INFO = [
    {
      key: 'SOA', title: 'SOA — Society of Actuaries',
      replicates: 'Traditional Life & Health Insurance (MetLife, Prudential, AIG)',
      method: 'Age-band mortality & morbidity tables (CSO 2017), long-term reserves, 22% expense loading, 15% reserve build',
      strengths: ['Best for age-based death/disability risk', 'Long-term reserve adequacy', 'Regulatory compliance baseline'],
      weaknesses: ["Doesn't model short-term catastrophic spikes", 'No credit/fraud risk factor', 'Assumes stable long-term pools'],
      useFor: 'Older members (55+), life benefit pricing, reserve floor calculations',
    },
    {
      key: 'CAS', title: 'CAS — Casualty Actuarial Society',
      replicates: 'P&C Insurance: Auto, Home, Catastrophe (State Farm, Allstate, Lloyd\'s)',
      method: 'Frequency × Severity loss model, GLM credit loading, 12% cat buffer, 28% expense, 8% profit margin',
      strengths: ['Best for sudden/acute event pricing', 'Credit score risk loading (GLM)', 'Catastrophe buffer'],
      weaknesses: ["Doesn't account for long-term mortality", 'Profit motive built in', 'Requires large loss datasets'],
      useFor: 'Medical emergencies, funeral claims, emergency travel — short-duration high-cost events',
    },
    {
      key: 'Takaful', title: 'Islamic Sharia — Takaful Model',
      replicates: 'Takaful operators: Salama Islamic Arab Insurance, Takaful Malaysia, Watania',
      method: '65% Tabarru pool, 20% Wakala fee, no-interest reserves, ~22% end-of-year surplus returned to members',
      strengths: ['Halal — no riba, no gharar', 'Surplus returned to community', 'No credit discrimination (Islamic equity)'],
      weaknesses: ['Pool vulnerable with small membership', 'No profit margin = limited growth capital', 'Requires disciplined claims management'],
      useFor: 'Core contribution structure — Tabarru pool is the backbone of MAFS',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-slate-900 mb-6">Actuarial Modeling Lab</h2>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit mb-8">
        {[{ id: 'simulator', label: '👤 Member Simulator' }, { id: 'projections', label: '📊 Pool Projections' }, { id: 'models', label: '📚 Model Breakdown' }].map(t => (
          <button key={t.id} onClick={() => setActiveView(t.id as any)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeView === t.id ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* SIMULATOR */}
      {activeView === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-5">
            <h3 className="font-bold text-slate-800">Member Profile</h3>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Age: <span className="text-emerald-700">{age}</span></label>
              <input type="range" min="18" max="80" value={age} onChange={e => setAge(+e.target.value)} className="w-full accent-emerald-600 mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">FICO: <span className="text-emerald-700">{ficoScore} — {getFicoLabel(ficoScore)}</span></label>
              <input type="range" min="300" max="850" value={ficoScore} onChange={e => setFicoScore(+e.target.value)} className="w-full accent-emerald-600 mt-1" />
              <div className="flex justify-between text-xs text-slate-400 mt-1"><span>300 Poor</span><span>580 Fair</span><span>670 Good</span><span>740+ Very Good</span></div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Tier</label>
              <div className="flex gap-2">
                {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map(t => (
                  <button key={t} onClick={() => setTier(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${tier === t ? 'bg-emerald-700 text-white border-emerald-700' : 'border-slate-200 text-slate-600'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setHasSpouse(!hasSpouse)} className={`w-10 h-6 rounded-full transition-all relative ${hasSpouse ? 'bg-emerald-600' : 'bg-slate-300'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${hasSpouse ? 'left-5' : 'left-1'}`} />
              </button>
              <span className="text-sm text-slate-700">Has Spouse</span>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Children: <span className="text-emerald-700">{children}</span></label>
              <input type="range" min="0" max="3" value={children} onChange={e => setChildren(+e.target.value)} className="w-full accent-emerald-600 mt-1" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'SOA Model', value: soa.finalPremium, sub: `Loss ratio: ${(soa.lossRatio * 100).toFixed(0)}%` },
                { label: 'CAS Model', value: cas.finalPremium, sub: `Loss ratio: ${(cas.lossRatio * 100).toFixed(0)}%` },
                { label: 'Takaful Net', value: takaful.netContribution, sub: `Surplus: $${takaful.surplusReturn}` },
              ].map(m => (
                <div key={m.label} className="bg-white rounded-xl border shadow-sm p-4 text-center">
                  <p className="text-xs font-bold text-slate-500 mb-1">{m.label}</p>
                  <p className="text-2xl font-bold text-slate-900">${m.value.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 mt-1">{m.sub}</p>
                </div>
              ))}
            </div>

            <div className="bg-emerald-900 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">MAFS Hybrid Model</h3>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-500/30 px-2 py-1 rounded">SOA {(hybrid.soaWeight * 100).toFixed(0)}%</span>
                  <span className="bg-amber-500/30 px-2 py-1 rounded">CAS {(hybrid.casWeight * 100).toFixed(0)}%</span>
                  <span className="bg-emerald-500/30 px-2 py-1 rounded">Takaful {(hybrid.takafulWeight * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div><p className="text-emerald-300 text-xs mb-1">Blended Premium</p><p className="text-3xl font-bold">${hybrid.blendedPremium.toFixed(2)}</p></div>
                <div><p className="text-emerald-300 text-xs mb-1">Surplus Return</p><p className="text-3xl font-bold text-amber-300">−${hybrid.surplusReturn.toFixed(2)}</p></div>
                <div><p className="text-emerald-300 text-xs mb-1">Effective Cost</p><p className="text-3xl font-bold text-emerald-300">${hybrid.effectiveCost.toFixed(2)}</p></div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-emerald-200 leading-relaxed">💡 {hybrid.recommendation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs font-bold text-blue-600 uppercase mb-3">SOA Breakdown</p>
                <div className="space-y-1 text-xs">
                  {[['Mortality loading', soa.mortalityLoading], ['Morbidity loading', soa.morbidityLoading], ['Expense (22%)', soa.expenseLoading], ['Reserve build (15%)', soa.reserveContribution]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-bold">${(v as number).toFixed(2)}</span></div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl border p-4">
                <p className="text-xs font-bold text-amber-600 uppercase mb-3">CAS Breakdown</p>
                <div className="space-y-1 text-xs">
                  {[['Pure risk (freq×sev)', cas.pureRisk], ['Cat loading (12%)', cas.catLoading], ['Expense (28%)', cas.expenseLoading], ['Profit margin (8%)', cas.profitMargin]].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="font-bold">${(v as number).toFixed(2)}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROJECTIONS */}
      {activeView === 'projections' && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Starting Members', key: 'startingMembers', min: 50, max: 2000, step: 50, pct: false },
              { label: 'Avg Monthly Premium ($)', key: 'avgPremium', min: 20, max: 300, step: 5, pct: false },
              { label: 'Annual Growth', key: 'memberGrowth', min: 0.05, max: 0.50, step: 0.05, pct: true },
              { label: 'Claims Frequency', key: 'claimsFrequency', min: 0.05, max: 0.50, step: 0.05, pct: true },
              { label: 'Avg Claim Size ($)', key: 'avgClaimSize', min: 500, max: 15000, step: 500, pct: false },
              { label: 'Admin Cost Ratio', key: 'adminCostRatio', min: 0.05, max: 0.35, step: 0.01, pct: true },
            ].map(f => (
              <div key={f.key} className="bg-white rounded-xl border p-4">
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">
                  {f.label}: <span className="text-emerald-700">{f.pct ? `${((mockData[f.key as keyof typeof mockData] as number) * 100).toFixed(0)}%` : mockData[f.key as keyof typeof mockData]}</span>
                </label>
                <input type="range" min={f.min} max={f.max} step={f.step}
                  value={mockData[f.key as keyof typeof mockData] as number}
                  onChange={e => setMockData(prev => ({ ...prev, [f.key]: parseFloat(e.target.value) }))}
                  className="w-full accent-emerald-600" />
              </div>
            ))}
          </div>
          <div className="bg-white p-8 rounded-2xl border shadow-sm" style={{ height: 420 }}>
            <h3 className="font-bold text-slate-800 mb-4">5-Year Reserve Projection</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" type="number" domain={[1, 5]} tickFormatter={v => `Yr ${v}`} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number | undefined) => v != null ? `$${v.toLocaleString()}` : ''} />
                <Legend />
                {scenarioData.map((sd, idx) => (
                  <Line key={sd.label} data={sd.projections} dataKey="reserves" name={sd.label}
                    stroke={['#3B82F6', '#F59E0B', '#059669'][idx]} strokeWidth={3} dot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MODEL BREAKDOWN */}
      {activeView === 'models' && (
        <div className="space-y-6">
          {MODEL_INFO.map(m => (
            <div key={m.key} className="bg-white rounded-2xl border shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{m.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Replicates: <span className="font-semibold text-slate-700">{m.replicates}</span></p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">{m.key}</span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-slate-600 leading-relaxed"><span className="font-bold">Method: </span>{m.method}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase mb-2">Strengths</p>
                  <ul className="space-y-1">{m.strengths.map(s => <li key={s} className="text-xs text-slate-600 flex gap-1"><span className="text-emerald-500">✓</span>{s}</li>)}</ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-500 uppercase mb-2">Weaknesses</p>
                  <ul className="space-y-1">{m.weaknesses.map(s => <li key={s} className="text-xs text-slate-600 flex gap-1"><span className="text-red-400">✗</span>{s}</li>)}</ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase mb-2">Use For MAFS</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{m.useFor}</p>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-emerald-900 text-white rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3">🔀 MAFS Hybrid Model Logic</h3>
            <p className="text-emerald-200 text-sm leading-relaxed mb-4">
              The hybrid dynamically weights all three frameworks based on the member profile. Younger healthy members get more Takaful weight (lower cost, surplus return). Older members get more SOA weight (mortality tables matter more). High-risk credit profiles get more CAS GLM loading.
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-white/10 rounded-xl p-3"><p className="font-bold text-blue-300 mb-1">SOA weight increases:</p><p className="text-emerald-200">Age &gt; 40, Premium tier</p></div>
              <div className="bg-white/10 rounded-xl p-3"><p className="font-bold text-amber-300 mb-1">CAS weight increases:</p><p className="text-emerald-200">FICO &lt; 620, high claim frequency</p></div>
              <div className="bg-white/10 rounded-xl p-3"><p className="font-bold text-emerald-300 mb-1">Takaful weight increases:</p><p className="text-emerald-200">Age &lt; 35, good credit, low-risk</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Legal ─── */
const LegalSection = () => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-slate-900 mb-6">Compliance & Critical Language</h2>
    <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm">
      <div className="bg-red-50 p-6 rounded-2xl">
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
