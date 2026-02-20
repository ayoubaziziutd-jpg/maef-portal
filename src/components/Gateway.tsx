import React, { useState } from 'react';
import { Users, Briefcase, LogIn, Compass, X } from 'lucide-react';

interface GatewayProps {
  onSelectMember: () => void;
  onSelectEmployee: () => void;
}

const Gateway: React.FC<GatewayProps> = ({ onSelectMember, onSelectEmployee }) => {
  const [showMemberPopup, setShowMemberPopup] = useState(false);

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col justify-end pb-16 px-6">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url('/logo.png')`, filter: 'brightness(0.5)' }} />
      <div className="relative z-10 grid grid-cols-2 gap-10 w-full max-w-3xl mx-auto">
        <button onClick={() => setShowMemberPopup(true)} className="bg-black/40 backdrop-blur-sm border-2 border-amber-400/70 rounded-2xl py-10 px-6 hover:bg-black/60 transition-all hover:scale-[1.03] flex flex-col items-center justify-center gap-3">
          <Users className="text-amber-400" size={44} />
          <span className="text-3xl font-bold text-white">Members</span>
        </button>
        <button onClick={onSelectEmployee} className="bg-black/40 backdrop-blur-sm border-2 border-white/40 rounded-2xl py-10 px-6 hover:bg-black/60 transition-all hover:scale-[1.03] flex flex-col items-center justify-center gap-3">
          <Briefcase className="text-white" size={44} />
          <span className="text-3xl font-bold text-white">Staff</span>
        </button>
      </div>
      {showMemberPopup && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-emerald-950 rounded-3xl p-10 w-full max-w-md mx-6 relative shadow-2xl border border-white/10">
            <button onClick={() => setShowMemberPopup(false)} className="absolute top-4 right-4 text-emerald-400 hover:text-white"><X size={22} /></button>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Member Access</h2>
            <p className="text-emerald-400 text-center text-sm mb-8">How would you like to continue?</p>
            <div className="flex flex-col gap-4">
              <button onClick={onSelectMember} className="flex items-center gap-5 bg-white/10 border border-amber-400/40 rounded-2xl p-6 hover:bg-white/20 transition-all">
                <div className="w-14 h-14 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0"><LogIn className="text-amber-400" size={28} /></div>
                <div className="text-left"><p className="text-white font-bold text-lg">Sign In</p><p className="text-emerald-300 text-sm">Access your existing member account</p></div>
              </button>
              <button onClick={onSelectMember} className="flex items-center gap-5 bg-white/10 border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all">
                <div className="w-14 h-14 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0"><Compass className="text-emerald-300" size={28} /></div>
                <div className="text-left"><p className="text-white font-bold text-lg">Explore</p><p className="text-emerald-300 text-sm">Browse the portal & learn about membership</p></div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gateway;
