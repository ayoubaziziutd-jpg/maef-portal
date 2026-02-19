import React, { useState, useEffect } from 'react';
import { MemberTab, CoverageTier } from '../types';
import { COVERAGE_LIMITS } from '../constants';
import { calculateMonthlyPremium } from '../services/engine';
import {
  Heart, Calculator, FileText, UserCog, Phone, ArrowLeft,
  Shield, ChevronRight, X, CheckCircle2, Star, Upload
} from 'lucide-react';

interface MemberPortalProps {
  onBack: () => void;
  onStartVerification: () => void;
  isExploreMode: boolean;
}

const TIER_DETAILS = {
  Basic: {
    color: 'emerald',
    monthly: '~$30–$110',
    perIncident: '$5,000',
    annualMax: '$15,000',
    deductible: '$500',
    coinsurance: '20%',
    coverages: ['Medical Emergency', 'Funeral & Burial'],
    notCovered: ['Financial Emergency', 'Emergency Travel'],
    description: 'Essential protection for life\'s most critical emergencies. Covers urgent medical events and funeral expenses.'
  },
  Standard: {
    color: 'blue',
    monthly: '~$45–$165',
    perIncident: '$15,000',
    annualMax: '$45,000',
    deductible: '$250',
    coinsurance: '15%',
    coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel'],
    notCovered: ['Financial Emergency'],
    description: 'Comprehensive protection with added travel coverage for family crises in Morocco.'
  },
  Premium: {
    color: 'amber',
    monthly: '~$67–$247',
    perIncident: '$50,000',
    annualMax: '$150,000',
    deductible: '$100',
    coinsurance: '10%',
    coverages: ['Medical Emergency', 'Funeral & Burial', 'Emergency Travel', 'Financial Emergency'],
    notCovered: [],
    description: 'Maximum protection including financial emergencies such as foreclosure prevention. Full Takaful shield.'
  }
};

const COVERAGE_BUBBLES = [
  {
    key: 'Medical',
    label: 'Medical Emergencies',
    icon: '🏥',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    detail: 'Covers emergency surgery, hospitalization, ER visits, and acute medical events. Basic, Standard, and Premium tiers. Per-incident limits apply based on tier. Does not cover routine or preventive care.'
  },
  {
    key: 'Financial',
    label: 'Financial Emergencies',
    icon: '💰',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    detail: 'Covers urgent financial crises including foreclosure prevention and emergency debt relief. Available on Premium tier only. Subject to discretionary approval by MAFS staff based on available reserves and documented need.'
  },
  {
    key: 'Funeral',
    label: 'Funeral & Burial',
    icon: '🕌',
    color: 'bg-rose-100 border-rose-300 text-rose-800',
    detail: 'Covers funeral expenses, burial costs, and repatriation to Morocco for deceased members or immediate family members covered under the benefit certificate. Available on Basic, Standard, and Premium tiers.'
  },
  {
    key: 'Travel',
    label: 'Emergency Travel',
    icon: '✈️',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    detail: 'Covers emergency travel to Morocco for documented family crises such as serious illness or death of an immediate family member. Available on Standard and Premium tiers. Requires prior authorization from MAFS staff.'
  }
];

const MemberPortal: React.FC<MemberPortalProps> = ({ onBack, onStartVerification, isExploreMode }) => {
  const [activeTab, setActiveTab] = useState<MemberTab>('values');

  const tabs: { id: MemberTab; label: string; icon: React.ElementType }[] = [
    { id: 'values', label: 'Our Mission', icon: Heart },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'become-member', label: 'Become a Member', icon: Star },
    { id: 'request', label: 'File a Request', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: UserCog },
    { id: 'contact', label: 'Contact Support', icon: Phone },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-950 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-emerald-800">
          <button onClick={onBack} className="flex items-center gap-2 text-emerald-300 hover:text-white text-sm mb-4">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
              <Shield className="text-white" size={16} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">MAFS</h1>
              <p className="text-xs text-emerald-400">
                {isExploreMode ? 'Explore Mode' : 'Member Portal'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-600 text-white shadow-lg' : 'text-emerald-400 hover:bg-emerald-900 hover:text-white'
                } ${item.id === 'become-member' ? 'border border-amber-400/40' : ''}`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {isExploreMode && activeTab !== 'become-member' && activeTab !== 'values' && activeTab !== 'calculator' && (
          <div className="max-w-4xl mx-auto mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
            <Star className="text-amber-500 flex-shrink-0" size={20} />
            <p className="text-amber-800 text-sm">You are in Explore Mode. <button onClick={() => setActiveTab('become-member')} className="font-bold underline">Apply for membership</button> to access all features.</p>
          </div>
        )}
        {activeTab === 'values' && <MissionSection />}
        {activeTab === 'calculator' && <CalculatorSection />}
        {activeTab === 'become-member' && <BecomeMemberSection onStartVerification={onStartVerification} />}
        {activeTab === 'profile' && <ProfileSection />}
        {(activeTab === 'request' || activeTab === 'update' || activeTab === 'contact') && (
          <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border">
            <h2 className="text-2xl font-bold text-gray-400">Coming Soon</h2>
            <p className="text-gray-400 mt-2">This section is being built out.</p>
          </div>
        )}
      </main>
    </div>
  );
};

/* ─── Mission Section ─── */
const MissionSection = () => {
  const [activeBubble, setActiveBubble] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'mission' | 'business'>('mission');

  const coreValues = [
    { icon: '🛡️', title: 'Takaful', desc: 'Mutual guarantee — the community pools resources so every member is protected.' },
    { icon: '⚖️', title: 'Adalah', desc: 'Justice and equity in how contributions and benefits are calculated and distributed.' },
    { icon: '🤝', title: 'Amanah', desc: 'Trust and integrity in the management of community funds.' },
    { icon: '❤️', title: 'Rahma', desc: 'Compassion — we respond quickly and without judgment when a member faces hardship.' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Mission & Business Model</h2>
      <p className="text-emerald-700 font-semibold mb-8">التضامن — Solidarity</p>

      {/* Toggle */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSection('mission')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'mission' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}
        >
          Core Values & Mission
        </button>
        <button
          onClick={() => setActiveSection('business')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeSection === 'business' ? 'bg-white shadow text-emerald-800' : 'text-gray-500'}`}
        >
          Business Model & Coverage
        </button>
      </div>

      {activeSection === 'mission' && (
        <div>
          <div className="bg-white p-8 rounded-2xl border mb-8 shadow-sm">
            <p className="text-gray-700 text-lg leading-relaxed">
              The Moroccan American Financial Support organization provides financial security to community members facing crises through a sustainable, peer-supported mutual aid model. Rooted in the Islamic tradition of Takaful, MAFS ensures that no member of our Ummah faces hardship alone.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {coreValues.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{v.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'business' && (
        <div>
          <p className="text-gray-600 mb-6">Click on any coverage type to learn more about what it includes and which tiers offer it.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {COVERAGE_BUBBLES.map((b) => (
              <button
                key={b.key}
                onClick={() => setActiveBubble(activeBubble === b.key ? null : b.key)}
                className={`${b.color} border-2 rounded-2xl p-6 text-center transition-all hover:scale-[1.04] ${activeBubble === b.key ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              >
                <div className="text-4xl mb-3">{b.icon}</div>
                <p className="font-bold text-sm leading-tight">{b.label}</p>
              </button>
            ))}
          </div>

          {activeBubble && (() => {
            const bubble = COVERAGE_BUBBLES.find(b => b.key === activeBubble)!;
            return (
              <div className={`${bubble.color} border-2 rounded-2xl p-6 mb-8 relative`}>
                <button onClick={() => setActiveBubble(null)} className="absolute top-4 right-4"><X size={18} /></button>
                <div className="text-3xl mb-2">{bubble.icon}</div>
                <h3 className="font-bold text-lg mb-2">{bubble.label}</h3>
                <p className="text-sm leading-relaxed">{bubble.detail}</p>
              </div>
            );
          })()}

          {/* Tier Comparison */}
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tier Comparison</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map((tier) => {
              const d = TIER_DETAILS[tier];
              return (
                <div key={tier} className="bg-white rounded-2xl border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-lg text-gray-900">{tier}</h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{d.monthly}/mo</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">{d.description}</p>
                  <div className="space-y-1 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Limits</p>
                    <p className="text-xs text-gray-700">Per Incident: <strong>{d.perIncident}</strong></p>
                    <p className="text-xs text-gray-700">Annual Max: <strong>{d.annualMax}</strong></p>
                    <p className="text-xs text-gray-700">Deductible: <strong>{d.deductible}</strong></p>
                    <p className="text-xs text-gray-700">Coinsurance: <strong>{d.coinsurance}</strong></p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Covered</p>
                    {d.coverages.map(c => (
                      <div key={c} className="flex items-center gap-2 text-xs text-emerald-700">
                        <CheckCircle2 size={12} /> {c}
                      </div>
                    ))}
                    {d.notCovered.map(c => (
                      <div key={c} className="flex items-center gap-2 text-xs text-gray-400">
                        <X size={12} /> {c}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Calculator Section ─── */
const CalculatorSection = () => {
  const [age, setAge] = useState(30);
  const [tier, setTier] = useState<CoverageTier>('Standard');
  const [ficoScore, setFicoScore] = useState(700);
  const [premium, setPremium] = useState(0);

  const getFicoLabel = (score: number) => {
    if (score >= 800) return { label: 'Exceptional', color: 'text-emerald-600', discount: 0.10 };
    if (score >= 740) return { label: 'Very Good', color: 'text-emerald-500', discount: 0.05 };
    if (score >= 670) return { label: 'Good', color: 'text-blue-600', discount: 0 };
    if (score >= 580) return { label: 'Fair', color: 'text-amber-500', discount: -0.10 };
    return { label: 'Poor', color: 'text-red-500', discount: -0.20 };
  };

  const fico = getFicoLabel(ficoScore);

  useEffect(() => {
    const base = calculateMonthlyPremium(age, tier, false, 0);
    const adjusted = base * (1 - fico.discount);
    setPremium(adjusted);
  }, [age, tier, ficoScore]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Contribution Calculator</h2>
      <p className="text-gray-500 mb-6 text-sm">Estimated pricing based on age, tier, and FICO credit score range. Final pricing determined after staff review.</p>
      <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-8">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Age: <span className="text-emerald-700">{age}</span></label>
          <input type="range" min="18" max="80" value={age} onChange={(e) => setAge(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1"><span>18</span><span>80</span></div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            FICO Credit Score: <span className={`font-bold ${fico.color}`}>{ficoScore} — {fico.label}</span>
          </label>
          <input type="range" min="300" max="850" value={ficoScore} onChange={(e) => setFicoScore(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>300 Poor</span><span>580 Fair</span><span>670 Good</span><span>740 Very Good</span><span>800+ Exceptional</span>
          </div>
          {fico.discount !== 0 && (
            <p className={`text-xs mt-2 font-medium ${fico.discount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {fico.discount > 0 ? `✓ ${(fico.discount * 100).toFixed(0)}% discount applied for strong credit` : `⚠ ${Math.abs(fico.discount * 100).toFixed(0)}% surcharge applied for credit risk`}
            </p>
          )}
          {ficoScore < 580 && (
            <p className="text-xs text-red-600 font-medium mt-1">⚠ Applicants with Poor credit may not be eligible for membership.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Coverage Tier</label>
          <div className="grid grid-cols-3 gap-4">
            {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map((t) => (
              <button key={t} onClick={() => setTier(t)}
                className={`p-4 rounded-xl border-2 font-bold transition-all ${tier === t ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center">
          <p className="text-emerald-800 text-sm font-medium uppercase tracking-wider">Estimated Monthly Contribution</p>
          <p className="text-5xl font-bold text-emerald-700 mt-2">${premium.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Estimate only. Actual pricing determined after staff review and screening.</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Become a Member ─── */
const BecomeMemberSection = ({ onStartVerification }: { onStartVerification: () => void }) => (
  <div className="max-w-3xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Become a Member</h2>
    <p className="text-gray-500 mb-8">Join the MAFS community and protect yourself and your family with Takaful-based mutual aid.</p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {[
        { step: '1', title: 'Apply', desc: 'Complete the verification screen with your personal info and agree to our legal terms.' },
        { step: '2', title: 'Review', desc: 'MAFS staff review your background and credit screening (3–5 business days).' },
        { step: '3', title: 'Join', desc: 'Upon approval, select your tier and begin contributing to the community pool.' },
      ].map(s => (
        <div key={s.step} className="bg-white rounded-2xl border p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-lg flex items-center justify-center mx-auto mb-4">{s.step}</div>
          <h3 className="font-bold text-gray-900 mb-2">{s.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
      <h3 className="font-bold text-amber-800 mb-2">What to expect</h3>
      <ul className="text-amber-700 text-sm space-y-2">
        <li>• Background check (criminal & fraud screening)</li>
        <li>• Credit & financial screening (FICO-based tier determination)</li>
        <li>• Bankruptcy records check</li>
        <li>• Identity document verification</li>
      </ul>
    </div>

    <button onClick={onStartVerification}
      className="w-full bg-emerald-700 text-white py-4 rounded-2xl font-bold text-lg hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2">
      Start Application <ChevronRight size={20} />
    </button>
  </div>
);

/* ─── Profile Section ─── */
const ProfileSection = () => {
  const [showDiscountForm, setShowDiscountForm] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h2>

      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-700 mb-4">Account Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-400 text-xs mb-1">Member ID</p><p className="font-bold text-emerald-700">M001</p></div>
          <div><p className="text-gray-400 text-xs mb-1">Status</p><span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">Active</span></div>
          <div><p className="text-gray-400 text-xs mb-1">Current Tier</p><p className="font-bold">Standard</p></div>
          <div><p className="text-gray-400 text-xs mb-1">Member Since</p><p className="font-bold">Jan 15, 2025</p></div>
        </div>
      </div>

      {/* Heritage Discount */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-700">Heritage Discount Program</h3>
          <button onClick={() => setShowDiscountForm(!showDiscountForm)}
            className="text-sm text-emerald-700 font-bold hover:underline">
            {showDiscountForm ? 'Cancel' : 'Apply for Discount'}
          </button>
        </div>
        <p className="text-gray-500 text-sm mb-4">Members of Moroccan heritage may qualify for a 10% contribution discount. Submit documentation through this form for staff review.</p>

        {showDiscountForm && (
          <div className="border-t pt-4 space-y-4">
            <p className="text-xs text-gray-500">Provide proof of Moroccan heritage (e.g. parent's birth certificate, passport, marriage certificate).</p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-emerald-500 transition-colors">
              <Upload className="text-gray-400 mb-2" size={24} />
              <span className="text-sm text-gray-500">Upload heritage documentation</span>
              <input type="file" className="hidden" accept="image/*,.pdf" />
            </label>
            <button className="w-full bg-emerald-700 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-800">
              Submit for Review
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberPortal;
