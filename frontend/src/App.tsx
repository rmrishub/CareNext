import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OnboardingProvider, useOnboarding } from './context/OnboardingContext';
import { PhaseBProvider } from './context/PhaseBContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { GeographicVerification } from './components/onboarding/GeographicVerification';
import { PersonaWizard } from './components/onboarding/persona/PersonaWizard';
import { AssessmentBooking } from './components/onboarding/AssessmentBooking';
import { SponsorDashboard } from './components/dashboard/SponsorDashboard';
import { HeartPulse, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { currentStep } = useOnboarding();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center animate-pulse shadow-lg">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-700">Connecting to CareConnect Chennai...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />

      <main className="flex-1">
        {!user || currentStep === 'AUTH' ? (
          <div className="py-12 px-4 sm:px-6">
            <AuthModal />
          </div>
        ) : currentStep === 'GEO_VERIFICATION' ? (
          <GeographicVerification />
        ) : currentStep === 'PERSONA' ? (
          <PersonaWizard />
        ) : currentStep === 'ASSESSMENT' ? (
          <AssessmentBooking />
        ) : (
          <SponsorDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>CareConnect Elder Care Platform • Chennai Metropolitan Care Network</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Phase A & B Intake Engine</span>
            <span>•</span>
            <span>DPDP Act Compliant (asia-south1)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <PhaseBProvider>
          <AppContent />
        </PhaseBProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}

export default App;
