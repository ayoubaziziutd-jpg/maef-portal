import React, { useState } from 'react';
import Gateway from './components/Gateway';
import EligibilityCheck from './components/EligibilityCheck';
import EnrollmentForm from './components/EnrollmentForm';
import MemberPortal from './components/MemberPortal';
import EmployeePortal from './components/EmployeePortal';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('gateway');

  switch (view) {
    case 'gateway':
      return (
        <Gateway 
          onSelect={(choice) => choice === 'eligibility' ? setView('eligibility') : setView('employee')} 
        />
      );
    case 'eligibility':
      return (
        <EligibilityCheck 
          onPass={() => setView('enrollment')} 
          onBack={() => setView('gateway')} 
        />
      );
    case 'enrollment':
      return (
        <EnrollmentForm 
          onComplete={() => setView('member')} 
          onBack={() => setView('eligibility')} 
        />
      );
    case 'member':
      return <MemberPortal onBack={() => setView('gateway')} />;
    case 'employee':
      return <EmployeePortal onBack={() => setView('gateway')} />;
    default:
      return <Gateway onSelect={() => setView('eligibility')} />;
  }
};

export default App;
