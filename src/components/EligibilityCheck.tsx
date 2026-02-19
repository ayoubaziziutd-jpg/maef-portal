import React, { useState } from 'react';
import { ELIGIBILITY_REQUIREMENTS } from '../constants';
import { CheckCircle2, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

interface EligibilityCheckProps {
  onPass: () => void;
  onBack: () => void;
}

const EligibilityCheck: React.FC<EligibilityCheckProps> = ({ onPass, onBack }) => {
  const [checked, setChecked] = useState<boolean[]>(new Array(ELIGIBILITY_REQUIREMENTS.length).fill(false));
  const allChecked = checked.every(Boolean);

  const toggleCheck = (idx: number) => {
    const next = [...checked];
    next[idx] = !next[idx];
    setChecked(next);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-maef-green">
          <ArrowLeft size={16} /> Back to Home
        </button>
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <h2 className="text-2xl font-bold text-maef-green">Eligibility Check</h2>
          {ELIGIBILITY_REQUIREMENTS.map((req, idx) => (
            <button key={idx} onClick={() => toggleCheck(idx)} className="w-full flex items-center gap-3 p-4 rounded-xl border text-left">
              {checked[idx] ? <CheckCircle2 className="text-maef-green" /> : <Circle className="text-gray-300" />}
              <span className="text-sm">{req}</span>
            </button>
          ))}
          
          <button 
            onClick={onPass} 
            disabled={!allChecked} 
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 ${allChecked ? 'bg-maef-green text-white' : 'bg-gray-100 text-gray-400'}`}
          >
            Proceed to Enrollment <ArrowRight size={16} />
          </button>

          {/* THE FIX: Non-blocking skip button */}
          <button onClick={onPass} className="w-full py-2 text-sm text-gray-400 hover:text-maef-green transition-colors">
            Skip for now (Preview Portal)
          </button>
        </div>
      </div>
    </div>
  );
};

export default EligibilityCheck;
