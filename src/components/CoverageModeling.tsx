import React, { useState, useMemo } from 'react';
import { CoverageTier } from '../types';
import { soaModel, casModel, takafulModel, hybridModel, generateScenarioProjections } from '../services/engine';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { SCENARIOS } from '../constants';

const MODEL_INFO = {
  SOA: {
    full: 'Society of Actuaries — Life & Health',
    color: '#3B82F6',
    replicates: 'Traditional life & health insurance (e.g., Blue Cross, Aetna, MetLife)',
    method: 'Age-band mortality/morbidity tables (CSO 2017), long-term reserve modeling, expense loading',
    strengths: ['Proven long-term reserve accuracy', 'Mortality table precision by age', 'Widely accepted regulatory standard'],
    weaknesses: ['Ignores credit risk', 'Less responsive to short-term claim spikes', 'Not Sharia-compliant'],
    keyMetrics: ['Loss Ratio', 'Combined Ratio', 'Reserve Ratio', 'Mortality Loading'],
  },
  CAS: {
    full: 'Casualty Actuarial Society — P&C',
    color: '#F59E0B',
    replicates: 'Property & Casualty insurance (e.g., State Farm, Allstate, Travelers)',
    method: 'Frequency × Severity loss model, GLM-based credit score loading, catastrophe buffer, short-tail reserves',
    strengths: ['Highly responsive to credit/financial risk', 'Best for short-term catastrophic events', 'GLM credit integration standard'],
    weaknesses: ['Less accurate for long-term mortality', 'Profit motive baked in', 'Not Sharia-compliant'],
    keyMetrics: ['Pure Risk Premium', 'CAT Loading', 'Claim Frequency', 'Claim Severity'],
  },
  Takaful: {
    full: 'Islamic Takaful / Sharia-Compliant Mutual Aid',
    color: '#10B981',
    replicates: 'Takaful operators (e.g., Salama Islamic Arab Insurance, Takaful Malaysia, Noor Takaful)',
    method: 'Tabarru (donation) pool, Wakala operator fee, no-interest (riba-free) reserves, surplus sharing with members',
    strengths: ['Surplus returned to members', 'No profit motive', 'Sharia-compliant', 'Community solidarity model'],
    weaknesses: ['Lower reserves in adverse years', 'Credit risk not fully priced', 'Relies on community participation'],
    keyMetrics: ['Tabarru Pool', 'Wakala Fee', 'Surplus Return', 'Net Contribution'],
  },
};

const CoverageModeling: React.FC = () => {
  const [age, setAge] = useState(49);
  const [tier, setTier] = useState<CoverageTier>('Standard');
  const [ficoScore, setFicoScore] = useState(640);
  const [hasSpouse, setHasSpouse] = useState(false);
  const [children, setChildren] = useState(0);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'models' | 'projections'>('models');

  const soa = useMemo(() => soaModel(age, tier, ficoScore, hasSpouse, children), [age, tier, ficoScore, hasSpouse, children]);
  const cas = useMemo(() => casModel(age, tier, ficoScore, hasSpouse, children), [age, tier, ficoScore, hasSpouse, children]);
  const takaful = useMemo(() => takafulModel(age, tier, ficoScore, hasSpouse, children), [age, tier, ficoScore, hasSpouse, children]);
  const hybrid = useMemo(() => hybridModel(age, tier, ficoScore, hasSpouse, children, soa, cas, takaful), [soa, cas, takaful]);

  const scenarioData = useMemo(() => SCENARIOS.map(s => ({ label: s.label, projections: generateScenarioProjections(s) })), []);

  const getFicoLabel = (s: number) => s >= 800 ? 'Exceptional' : s >= 740 ? 'Very Good' : s >= 670 ? 'Good' : s >= 580 ? 'Fair' : 'Poor';
  const getFicoColor = (s: number) => s >= 740 ? 'text-emerald-600' : s >= 670 ? 'text-blue-600' : s >= 580 ? 'text-amber-500' : 'text-red-500';

  const comparisonData = [
    { name: 'SOA', premium: soa.finalPremium, color: MODEL_INFO.SOA.color },
    { name: 'CAS', premium: cas.finalPremium, color: MODEL_INFO.CAS.color },
    { name: 'Takaful (net)', premium: takaful.netContribution, color: MODEL_INFO.Takaful.color },
    { name: 'MAFS Hybrid', premium: hybrid.effectiveCost, color: '#8B5CF6' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Actuarial Coverage Modeling</h2>
          <p className="text-slate-500 text-sm mt-1">Enter a member profile to run all three models and generate a hybrid recommendation.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveView('models')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'models' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Model Analysis</button>
          <button onClick={() => setActiveView('projections')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeView === 'projections' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Reserve Projections</button>
        </div>
      </div>

      {activeView === 'models' && (
        <>
          {/* ── Member Profile Input ── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Member Profile (Mock Data)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Age: <span className="text-slate-800 font-bold text-sm">{age}</span></label>
                <input type="range" min="18" max="80" value={age} onChange={e => setAge(+e.target.value)} className="w-full accent-emerald-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>18</span><span>80</span></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">
                  FICO: <span className={`font-bold text-sm ${getFicoColor(ficoScore)}`}>{ficoScore} — {getFicoLabel(ficoScore)}</span>
                </label>
                <input type="range" min="300" max="850" value={ficoScore} onChange={e => setFicoScore(+e.target.value)} className="w-full accent-emerald-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>300</span><span>850</span></div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-2 block">Coverage Tier</label>
                <div className="flex gap-2">
                  {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map(t => (
                    <button key={t} onClick={() => setTier(t)}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${tier === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-xs font-semibold text-gray-500">Spouse</label>
                <button onClick={() => setHasSpouse(!hasSpouse)}
                  className={`w-12 h-6 rounded-full transition-all ${hasSpouse ? 'bg-emerald-500' : 'bg-gray-300'} relative`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${hasSpouse ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Children: <span className="font-bold text-slate-800">{children}</span></label>
                <input type="range" min="0" max="3" step="1" value={children} onChange={e => setChildren(+e.target.value)} className="w-full accent-emerald-600" />
                <div className="flex justify-between text-xs text-gray-400"><span>0</span><span>3</span></div>
              </div>
            </div>
          </div>

          {/* ── Comparison Bar Chart ── */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
            <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Monthly Premium Comparison — All Models</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tickFormatter={v => `$${v}`} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="premium" radius={[8, 8, 0, 0]}>
                    {comparisonData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Three Model Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {[
              { key: 'SOA', result: soa, fields: [
                { label: 'Mortality Loading', value: `$${soa.mortalityLoading}/mo` },
                { label: 'Morbidity Loading', value: `$${soa.morbidityLoading}/mo` },
                { label: 'Expense Loading', value: `$${soa.expenseLoading}/mo` },
                { label: 'Reserve Contribution', value: `$${soa.reserveContribution}/mo` },
                { label: 'Loss Ratio', value: `${(soa.lossRatio * 100).toFixed(0)}%` },
              ]},
              { key: 'CAS', result: cas, fields: [
                { label: 'Claim Frequency', value: `${(cas.claimFrequency * 100).toFixed(0)}%/yr` },
                { label: 'Avg Claim Severity', value: `$${cas.claimSeverity.toLocaleString()}` },
                { label: 'Pure Risk Premium', value: `$${cas.pureRisk}/mo` },
                { label: 'CAT Buffer', value: `$${cas.catLoading}/mo` },
                { label: 'Loss Ratio', value: `${(cas.lossRatio * 100).toFixed(0)}%` },
              ]},
              { key: 'Takaful', result: takaful, fields: [
                { label: 'Tabarru (Donation)', value: `$${takaful.tabarruContribution}/mo` },
                { label: 'Wakala Fee', value: `$${takaful.wakalaFee}/mo` },
                { label: 'Family Takaful', value: `$${takaful.familyTakaful}/mo` },
                { label: 'Surplus Return (est.)', value: `-$${takaful.surplusReturn}/mo` },
                { label: 'Net Contribution', value: `$${takaful.netContribution}/mo` },
              ]},
            ].map(({ key, result, fields }) => {
              const info = MODEL_INFO[key as keyof typeof MODEL_INFO];
              const premium = key === 'SOA' ? (result as typeof soa).finalPremium
                : key === 'CAS' ? (result as typeof cas).finalPremium
                : (result as typeof takaful).netContribution;
              const isExpanded = expandedModel === key;
              return (
                <div key={key} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                  <div className="p-5" style={{ borderTop: `4px solid ${info.color}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{key}</h4>
                      <span className="text-2xl font-bold" style={{ color: info.color }}>${premium.toFixed(2)}<span className="text-xs text-gray-400 font-normal">/mo</span></span>
                    </div>
                    <p className="text-xs text-gray-500 mb-4 leading-tight">{info.full}</p>
                    <div className="space-y-2 mb-4">
                      {fields.map(f => (
                        <div key={f.label} className="flex justify-between text-xs">
                          <span className="text-gray-500">{f.label}</span>
                          <span className="font-bold text-gray-800">{f.value}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setExpandedModel(isExpanded ? null : key)}
                      className="w-full flex items-center justify-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors pt-2 border-t">
                      {isExpanded ? <><ChevronUp size={14} /> Hide Details</> : <><ChevronDown size={14} /> Model Details</>}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 border-t bg-slate-50 text-xs space-y-3 pt-4">
                      <div>
                        <p className="font-bold text-gray-600 mb-1">Replicates</p>
                        <p className="text-gray-700">{info.replicates}</p>
                      </div>
                      <div>
                        <p className="font-bold text-gray-600 mb-1">Method</p>
                        <p className="text-gray-700 leading-relaxed">{info.method}</p>
                      </div>
                      <div>
                        <p className="font-bold text-emerald-600 mb-1">Strengths</p>
                        {info.strengths.map(s => <p key={s} className="text-gray-700">✓ {s}</p>)}
                      </div>
                      <div>
                        <p className="font-bold text-red-500 mb-1">Weaknesses</p>
                        {info.weaknesses.map(s => <p key={s} className="text-gray-700">✗ {s}</p>)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-600 mb-1">Key Metrics</p>
                        <div className="flex flex-wrap gap-1">{info.keyMetrics.map(m => <span key={m} className="bg-white border rounded px-2 py-0.5 text-gray-600">{m}</span>)}</div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Hybrid Recommendation ── */}
          <div className="bg-gradient-to-br from-violet-900 to-emerald-900 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-violet-400" />
              <h3 className="font-bold text-lg">MAFS Hybrid Model — Recommendation</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              {[
                { label: 'SOA Weight', value: `${(hybrid.soaWeight * 100).toFixed(0)}%`, sub: 'Mortality tables' },
                { label: 'CAS Weight', value: `${(hybrid.casWeight * 100).toFixed(0)}%`, sub: 'Freq/Sev model' },
                { label: 'Takaful Weight', value: `${(hybrid.takafulWeight * 100).toFixed(0)}%`, sub: 'Surplus sharing' },
                { label: 'Effective Cost', value: `$${hybrid.effectiveCost}/mo`, sub: 'After surplus return' },
              ].map(item => (
                <div key={item.label} className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="text-xs text-white/70 mt-1">{item.label}</p>
                  <p className="text-xs text-white/50">{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/10 rounded-xl p-4 flex items-start gap-3">
              <Info size={16} className="text-violet-300 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-white/90 leading-relaxed">{hybrid.recommendation}</p>
            </div>
          </div>
        </>
      )}

      {activeView === 'projections' && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Projected Reserve Growth — 5 Year Forecast</h3>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" type="number" domain={[1, 5]} tickFormatter={v => `Year ${v}`} />
                <YAxis tickFormatter={v => `$${v / 1000}k`} />
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
      )}
    </div>
  );
};

export default CoverageModeling;
