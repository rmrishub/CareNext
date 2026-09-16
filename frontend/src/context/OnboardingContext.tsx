import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Elder, HomeAssessment } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export type OnboardingStep = 
  | 'AUTH' 
  | 'GEO_VERIFICATION' 
  | 'PERSONA' 
  | 'ASSESSMENT' 
  | 'DASHBOARD';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  setCurrentStep: (step: OnboardingStep) => void;
  activeElder: Elder | null;
  setActiveElder: (elder: Elder | null) => void;
  activeAssessment: HomeAssessment | null;
  setActiveAssessment: (assessment: HomeAssessment | null) => void;
  loadElderData: (elderId: string) => Promise<void>;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('AUTH');
  const [activeElder, setActiveElder] = useState<Elder | null>(null);
  const [activeAssessment, setActiveAssessment] = useState<HomeAssessment | null>(null);

  useEffect(() => {
    if (user) {
      // If user is authenticated, check if they already have an elder
      api.listElders().then(elders => {
        if (elders && elders.length > 0) {
          const latest = elders[0];
          setActiveElder(latest);
          if (latest.personaStatus === 'SAVED') {
            setCurrentStep('DASHBOARD');
          } else if (latest.location && latest.location.serviceable) {
            setCurrentStep('PERSONA');
          } else {
            setCurrentStep('GEO_VERIFICATION');
          }
        } else {
          setCurrentStep('GEO_VERIFICATION');
        }
      }).catch(() => {
        setCurrentStep('GEO_VERIFICATION');
      });

      // Check for any assessment bookings
      api.listHomeAssessments().then(assessments => {
        if (assessments && assessments.length > 0) {
          setActiveAssessment(assessments[0]);
        }
      }).catch(() => {});
    } else {
      setCurrentStep('AUTH');
      setActiveElder(null);
      setActiveAssessment(null);
    }
  }, [user]);

  const loadElderData = async (elderId: string) => {
    try {
      const elder = await api.getElder(elderId);
      setActiveElder(elder);
    } catch (err) {
      console.error('Failed to load elder:', err);
    }
  };

  const resetOnboarding = () => {
    setActiveElder(null);
    setActiveAssessment(null);
    setCurrentStep('GEO_VERIFICATION');
  };

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      setCurrentStep,
      activeElder,
      setActiveElder,
      activeAssessment,
      setActiveAssessment,
      loadElderData,
      resetOnboarding
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
