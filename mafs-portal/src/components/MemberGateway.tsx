import React from 'react';
import { ArrowLeft, LogIn, Compass } from 'lucide-react';

interface MemberGatewayProps {
  onSignIn: () => void;
  onExplore: () => void;
  onBack: () => void;
}

const MemberGateway: React.FC<MemberGatewayProps> = ({ onSignIn, onExplore, onBack }) => {
  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full text-center">
        <button onClick={onBack} className="flex items-center gap-2 text-emerald-400 hover:text-white text-sm mb-10 mx-auto">
          <ArrowLeft size={16} /> Back
        </button>

        <h1 className="text-4xl font-bold text-white mb-2">Member Access</h1>
        <p className="text-emerald-400 mb-10">How would you like to continue?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <button
            onClick={onSignIn}
            className="bg-white/10 border border-white/20 rounded-2xl p-10 hover:bg-white/20 transition-all hover:scale-[1.02] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-amber-400/20 flex items-center justify-center">
              <LogIn className="text-amber-400" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Sign In</h2>
              <p className="text-emerald-300 text-sm">Access your existing member account</p>
            </div>
          </button>

          <button
            onClick={onExplore}
            className="bg-white/10 border border-white/20 rounded-2xl p-10 hover:bg-white/20 transition-all hover:scale-[1.02] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-400/20 flex items-center justify-center">
              <Compass className="text-emerald-300" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Explore</h2>
              <p className="text-emerald-300 text-sm">Browse the portal & learn about membership</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberGateway;
