import React, { useState } from 'react';
import { CoverageTier } from '../types';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EnrollmentFormProps {
  onComplete: () => void;
  onBack: () => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">New Member Enrollment</h2>
          <span className="text-sm font-bold text-maef-green">Step {step} of 3</span>
        </div>
        
        {step === 1 && (
          <div className="space-y-6">
            <p className="text-gray-600">Please upload a document verifying your Moroccan heritage.</p>
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-maef-green">
              <span className="text-gray-400">Click to upload ID or Passport</span>
            </div>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button onClick={onBack} className="flex-1 py-3 border rounded-xl font-bold hover:bg-gray-50">Cancel</button>
          <button 
            onClick={() => step < 3 ? setStep(step + 1) : onComplete()} 
            className="flex-1 py-3 bg-maef-green text-white rounded-xl font-bold hover:bg-emerald-800"
          >
            {step === 3 ? 'Finish' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentForm;
