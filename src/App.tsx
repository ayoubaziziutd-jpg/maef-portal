import React, { useState } from 'react';
import Gateway from './components/Gateway';
import MemberGateway from './components/MemberGateway';
import VerificationScreen from './components/VerificationScreen';
import EnrollmentForm from './components/EnrollmentForm';
import MemberPortal from './components/MemberPortal';
import EmployeePortal from './components/EmployeePortal';
import { AppView } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('gateway');
  const [enterAsMember, setEnterAsMember] = useState(false);

  switch (view) {
    case 'gateway':
      return (
        <Gateway
          onSelectMember={() => setView('member-gateway')}
          onSelectEmployee={() => setView('employee')}
        />
      );
    case 'member-gateway':
      return (
        <MemberGateway
          onSignIn={() => { setEnterAsMember(true); setView('member'); }}
          onExplore={() => { setEnterAsMember(false); setView('member'); }}
          onBack={() => setView('gateway')}
        />
      );
    case 'verification':
      return (
        <VerificationScreen
          onSubmit={() => setView('member')}
          onBack={() => setView('member')}
        />
      );
    case 'enrollment':
      return (
        <EnrollmentForm
          onComplete={() => setView('member')}
          onBack={() => setView('verification')}
        />
      );
    case 'member':
      return (
        <MemberPortal
          onBack={() => setView('gateway')}
          onStartVerification={() => setView('verification')}
          isExploreMode={!enterAsMember}
        />
      );
    case 'employee':
      return <EmployeePortal onBack={() => setView('gateway')} />;
    default:
      return <Gateway onSelectMember={() => setView('member-gateway')} onSelectEmployee={() => setView('employee')} />;
  }
};

export default App;
