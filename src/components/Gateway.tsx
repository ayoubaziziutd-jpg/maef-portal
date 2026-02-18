import React from 'react';
import { Users, Briefcase, Shield } from 'lucide-react';

interface GatewayProps {
  onSelect: (view: 'eligibility' | 'employee') => void;
}

const Gateway: React.FC<GatewayProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 mb-6">
          <Shield className="text-gold" size={40} />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Moroccan American Emergency Fund</h1>
        <p className="text-xl text-emerald-200 mb-8" dir="rtl">التضامن - Solidarity</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
          <button onClick={() => onSelect('eligibility')} className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all">
            <Users className="text-white mb-4" size={28} />
            <h2 className="text-2xl font-bold text-white mb-2">Member Portal</h2>
            <p className="text-emerald-200 text-sm">Join the community and manage your membership.</p>
          </button>
          
          <button onClick={() => onSelect('employee')} className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all">
            <Briefcase className="text-white mb-4" size={28} />
            <h2 className="text-2xl font-bold text-white mb-2">Employee Access</h2>
            <p className="text-emerald-200 text-sm">Manage databases and financial modeling.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gateway;
