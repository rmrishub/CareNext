import React from 'react';
import { HeartPulse, UserCheck, LogOut, MapPin, ShieldCheck, FileText, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentStep, setCurrentStep, activeElder } = useOnboarding();

  const steps = [
    { key: 'GEO_VERIFICATION', label: '1. Location', icon: MapPin },
    { key: 'PERSONA', label: '2. Patient Persona', icon: FileText },
    { key: 'ASSESSMENT', label: '3. Home Assessment', icon: Calendar },
    { key: 'DASHBOARD', label: '4. Summary', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => user && setCurrentStep('DASHBOARD')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">CareConnect</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                Chennai
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none">Managed Elder Care Platform</p>
          </div>
        </div>

        {/* Phase A Stepper in Header (when logged in) */}
        {user && currentStep !== 'AUTH' && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {steps.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.key;
              const isPast = (
                (step.key === 'GEO_VERIFICATION' && (currentStep === 'PERSONA' || currentStep === 'ASSESSMENT' || currentStep === 'DASHBOARD')) ||
                (step.key === 'PERSONA' && (currentStep === 'ASSESSMENT' || currentStep === 'DASHBOARD')) ||
                (step.key === 'ASSESSMENT' && currentStep === 'DASHBOARD')
              );

              return (
                <button
                  key={step.key}
                  onClick={() => {
                    if (step.key === 'PERSONA' && !activeElder?.location?.serviceable) return;
                    setCurrentStep(step.key as any);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isActive 
                      ? 'bg-white text-teal-800 shadow-sm font-semibold' 
                      : isPast
                        ? 'text-slate-600 hover:text-slate-900'
                        : 'text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : isPast ? 'text-teal-500' : 'text-slate-400'}`} />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* User Context & Logout */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-800 leading-snug">{user.fullName}</span>
                <span className="text-[11px] text-teal-700 font-medium capitalize">
                  {user.role.replace('_', ' ').toLowerCase()}
                </span>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>Sponsor Verification Portal</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

