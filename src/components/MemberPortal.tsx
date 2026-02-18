import React, { useState, useEffect } from 'react';
import { MemberTab, CoverageTier } from '../types';
import { COVERAGE_LIMITS, COVERAGE_TYPES, DISCOUNTS } from '../constants';
import { calculateMonthlyPremium } from '../services/engine';
import {  
  Heart, Calculator, FileText, UserCog, Phone, ArrowLeft,  
  Shield, CheckCircle2, Globe, Clock, User
} from 'lucide-react';

interface MemberPortalProps {
  onBack: () => void;
}

const MemberPortal: React.FC<MemberPortalProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<MemberTab>('values');

  const tabs: { id: MemberTab; label: string; icon: React.ElementType }[] = [
    { id: 'values', label: 'Our Mission', icon: Heart },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'request', label: 'File a Request', icon: FileText },
    { id: 'update', label: 'Update Info', icon: UserCog },
    { id: 'contact', label: 'Contact Support', icon: Phone }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-emerald-950 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-emerald-800">
          <button onClick={onBack} className="flex items-center gap-2 text-emerald-300 hover:text-white text-sm mb-4 min-h-[44px]">
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-maef-green rounded-full flex items-center justify-center">
              <Shield className="text-white" size={16} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">MAEF</h1>
              <p className="text-xs text-emerald-400">Member Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {tabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all min-h-[44px] ${
                  isActive ? 'bg-maef-green text-white shadow-lg' : 'text-emerald-400 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {activeTab === 'values' && <ValuesSection />}
        {activeTab === 'calculator' && <CalculatorSection />}
        {/* Placeholder for other sections */}
        {(activeTab === 'request' || activeTab === 'update' || activeTab === 'contact') && (
          <div className="max-w-4xl mx-auto p-12 text-center bg-white rounded-2xl border">
            <h2 className="text-2xl font-bold text-gray-400">Section Coming Soon</h2>
            <p className="text-gray-400 mt-2">The AI is still generating the internal forms for this section.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUB-SECTIONS ---

const ValuesSection = () => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Mission & Values</h2>
    <p className="text-xl text-maef-green font-semibold mb-6" dir="rtl">التضامن - Solidarity</p>
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
      <p className="text-gray-700 text-lg leading-relaxed">
        The Moroccan American Emergency Fund provides financial security to community members facing crises through a sustainable, peer-supported model.
      </p>
    </div>
  </div>
);

const CalculatorSection = () => {
  const [age, setAge] = useState(30);
  const [tier, setTier] = useState<CoverageTier>('Standard');
  const [premium, setPremium] = useState(0);

  useEffect(() => {
    setPremium(calculateMonthlyPremium(age, tier, false, 0));
  }, [age, tier]);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Contribution Calculator</h2>
      <div className="bg-white p-8 rounded-2xl border shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-4">Select Age: {age}</label>
        <input 
          type="range" min="18" max="80" value={age} 
          onChange={(e) => setAge(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-maef-green mb-8"
        />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(['Basic', 'Standard', 'Premium'] as CoverageTier[]).map((t) => (
            <button 
              key={t} onClick={() => setTier(t)}
              className={`p-4 rounded-xl border font-bold transition-all ${tier === t ? 'bg-maef-green text-white' : 'bg-white'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 text-center">
          <p className="text-emerald-800 text-sm font-medium uppercase tracking-wider">Estimated Monthly Contribution</p>
          <p className="text-5xl font-bold text-maef-green mt-2">${premium.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default MemberPortal;
