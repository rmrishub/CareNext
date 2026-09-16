import React from 'react';
import React, { useState } from 'react';
import { 
  MapPin, 
  Calendar, 
  Heart, 
  Edit3, 
  PlusCircle, 
  Stethoscope, 
  User, 
  Activity, 
  Utensils, 
  Clock, 
  CheckCircle2
  CheckCircle2,
  Users,
  Video,
  CreditCard,
  FileCheck
} from 'lucide-react';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { usePhaseB } from '../../context/PhaseBContext';
import { CaregiverMatchingWizard } from '../phaseB/CaregiverMatchingWizard';
import { InterviewSchedulerModal } from '../phaseB/InterviewSchedulerModal';
import { PaymentCheckoutModal } from '../phaseB/PaymentCheckoutModal';
import { SLAAgreementModal } from '../phaseB/SLAAgreementModal';
import type { Caregiver } from '../../types';

export const SponsorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeElder, activeAssessment, setCurrentStep, resetOnboarding } = useOnboarding();
  const { activeElder, setCurrentStep } = useOnboarding();
  const { phaseState, selectedCaregiver } = usePhaseB();

  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'PHASE_B_MATCHING'>('DASHBOARD');
  const [interviewCaregiver, setInterviewCaregiver] = useState<Caregiver | null>(null);
  const [paymentCaregiver, setPaymentCaregiver] = useState<Caregiver | null>(null);
  const [slaCaregiver, setSlaCaregiver] = useState<Caregiver | null>(null);

  if (!activeElder) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-3">
          <User className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No Elder Profile Found</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Begin Phase A onboarding to create a verified patient profile.
        </p>
        <button
          onClick={() => setCurrentStep('GEO_VERIFICATION')}
          className="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-xl shadow-sm transition"
        >
          Start Onboarding
        </button>
      </div>
    );
  }

  const loc = activeElder.location;

  if (viewMode === 'PHASE_B_MATCHING') {
    return (
      <CaregiverMatchingWizard
        elderId={activeElder.id}
        onSelectCaregiverForInterview={(cg) => setInterviewCaregiver(cg)}
        onProceedToPayment={(cg) => setPaymentCaregiver(cg)}
        onBack={() => setViewMode('DASHBOARD')}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-800/60 border border-teal-500/30 text-teal-200 text-xs font-semibold mb-3">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            <span>Phase A Intake Complete • Chennai Corridors</span>
            <span>Care Profile Active • {loc?.locality || 'Chennai'} Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Care Profile: {activeElder.name}
          </h1>
          <p className="text-teal-100/80 text-xs sm:text-sm mt-1 max-w-xl">
            Sponsor: <span className="font-semibold text-white">{user?.fullName}</span> • Mobile: <span className="font-mono text-white">{user?.phone || user?.email}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setViewMode('PHASE_B_MATCHING')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Caregiver Matching (Phase B)</span>
          </button>
          <button
            onClick={() => setCurrentStep('PERSONA')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Persona</span>
          </button>
          <button
            onClick={resetOnboarding}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Another Elder</span>
          </button>
        </div>
      </div>

      {/* Phase B Progress Tracker Widget */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Phase B Workflow Tracker
            </h3>
            <p className="text-xs text-slate-500">Caregiver matching, introductory call, advance deposit & SLA agreement</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            phaseState?.phaseStatus === 'COMPLETED'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            {phaseState?.phaseStatus === 'COMPLETED' ? '✔ Phase B Complete' : 'In Progress'}
          </span>
        </div>

        {/* 4 Step Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* B1 Matching */}
          <div className="p-3 rounded-2xl border bg-slate-50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">B1: Matching</span>
            <span className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              {phaseState?.matchingStatus || 'IN_PROGRESS'}
            </span>
          </div>

          {/* B2 Intro Call */}
          <div className="p-3 rounded-2xl border bg-slate-50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">B2: Intro Call</span>
            <span className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <Video className="w-3.5 h-3.5 text-emerald-600" />
              {phaseState?.interviewStatus || 'NOT_STARTED'}
            </span>
          </div>

          {/* B3 Payment */}
          <div className="p-3 rounded-2xl border bg-slate-50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">B3: Deposit</span>
            <span className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              {phaseState?.paymentStatus || 'NOT_STARTED'}
            </span>
          </div>

          {/* B4 SLA */}
          <div className="p-3 rounded-2xl border bg-slate-50 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase">B4: SLA Agreement</span>
            <span className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              {phaseState?.slaStatus || 'NOT_STARTED'}
            </span>
          </div>
        </div>

        {/* Selected Caregiver Callout or Action Button */}
        {selectedCaregiver ? (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
            <div className="flex items-center space-x-3">
              <img src={selectedCaregiver.profilePhoto || ''} alt={selectedCaregiver.fullName} className="w-12 h-12 rounded-full object-cover border border-emerald-500" />
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Confirmed Caregiver</span>
                <h4 className="font-bold text-gray-900 text-sm">{selectedCaregiver.fullName}</h4>
                <p className="text-xs text-gray-500">₹{selectedCaregiver.dailyRate}/day • {selectedCaregiver.primaryLanguage}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {phaseState?.paymentStatus !== 'PAID' && (
                <button
                  onClick={() => setPaymentCaregiver(selectedCaregiver)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Pay Deposit (₹{selectedCaregiver.dailyRate})
                </button>
              )}

              {phaseState?.paymentStatus === 'PAID' && phaseState?.slaStatus !== 'ACCEPTED' && (
                <button
                  onClick={() => setSlaCaregiver(selectedCaregiver)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Sign SLA Agreement
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setViewMode('PHASE_B_MATCHING')}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
            >
              <span>Explore Matched Caregivers →</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Elder Clinical Persona Overview (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Persona Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-teal-600" />
                  Clinical & Daily Lifestyle Persona
                </h2>
                <span className="text-xs text-slate-500">Structured family-supplied care intake</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {activeElder.personaStatus}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {activeElder.mobilityLevel.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Age & Gender</span>
                <span className="font-bold text-slate-800 text-sm">{activeElder.age} yrs • {activeElder.gender}</span>
            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 block font-medium">Age & Gender</span>
                <span className="font-bold text-slate-800">{activeElder.age} yrs, {activeElder.gender}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Primary Language</span>
                <span className="font-bold text-teal-700 text-sm">{activeElder.primaryLanguage}</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 block font-medium">Mobility Level</span>
                <span className="font-bold text-teal-800">{activeElder.mobilityLevel}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Shift Preference</span>
                <span className="font-bold text-slate-800 text-sm">{activeElder.shiftPreference.replace(/_/g, ' ')}</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 block font-medium">Primary Language</span>
                <span className="font-bold text-slate-800">{activeElder.primaryLanguage}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">DOB</span>
                <span className="font-bold text-slate-800 text-sm">{activeElder.dateOfBirth || 'N/A'}</span>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 block font-medium">Shift Preference</span>
                <span className="font-bold text-slate-800">{activeElder.shiftPreference}</span>
              </div>
            </div>

            {/* Medical Conditions & Devices */}
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Known Conditions & Medical Support
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeElder.medicalConditions?.length ? (
                    activeElder.medicalConditions.map(c => (
                      <span key={c} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-medium border border-slate-200">
                        {c}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No medical conditions specified</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  Attendant Care Requirements
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeElder.careRequirements?.length ? (
                    activeElder.careRequirements.map(r => (
                      <span key={r} className="px-2.5 py-1 bg-teal-50 text-teal-900 rounded-lg text-xs font-semibold border border-teal-200">
                        {r}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Standard companionship & hygiene</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Utensils className="w-4 h-4 text-teal-600" />
                  Dietary Constraints & Cuisine
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {activeElder.dietaryPreferences?.length ? (
                    activeElder.dietaryPreferences.map(d => (
                      <span key={d} className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg text-xs font-medium border border-amber-200">
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Regular home food</span>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Routine & Family Instructions */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Routine & Special Cultural Notes
              </span>
              <p className="text-slate-700 leading-relaxed">
                {activeElder.additionalNotes || 'No additional family notes recorded.'}
              </p>
              {activeElder.dailyRoutine && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-4 text-[11px] text-slate-500">
                  {activeElder.dailyRoutine.wakeTime && (
                    <span>Wake: <strong className="text-slate-700">{activeElder.dailyRoutine.wakeTime}</strong></span>
                  )}
                  {activeElder.dailyRoutine.bedTime && (
                    <span>Sleep: <strong className="text-slate-700">{activeElder.dailyRoutine.bedTime}</strong></span>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Right Column: Location & Assessment Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Verified Location Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                Care Address
              </h3>
              <button
                onClick={() => setCurrentStep('GEO_VERIFICATION')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                Edit
              </button>
            </div>

            {loc ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                  <div className="font-bold text-sm">{loc.locality}, Chennai</div>
                  <div className="text-emerald-800 mt-0.5">{loc.addressLine1}</div>
                  {loc.addressLine2 && <div className="text-emerald-800">{loc.addressLine2}</div>}
                  <div className="text-emerald-700 font-mono mt-1">PIN: {loc.postalCode}</div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-500">
                  <div>Status: <span className="font-semibold text-emerald-700">{loc.verificationStatus}</span></div>
                  <div>Coordinates: <span className="font-mono text-slate-700">{loc.latitude}° N, {loc.longitude}° E</span></div>
                </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs">
                <div className="font-bold text-sm">{loc.locality}, Chennai</div>
                <div className="text-emerald-800 mt-0.5">{loc.addressLine1}</div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">No verified address linked yet.</div>
              <div className="text-xs text-slate-500">No address linked yet.</div>
            )}
          </div>
        </div>
      </div>

          {/* Home Assessment Booking Status */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                Home Assessment
              </h3>
              <button
                onClick={() => setCurrentStep('ASSESSMENT')}
                className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
              >
                {activeAssessment ? 'Manage' : 'Book'}
              </button>
            </div>
      {/* Modals */}
      {interviewCaregiver && (
        <InterviewSchedulerModal
          caregiver={interviewCaregiver}
          onClose={() => setInterviewCaregiver(null)}
          onConfirmedSelection={(cg) => {
            setInterviewCaregiver(null);
            setPaymentCaregiver(cg);
          }}
        />
      )}

            {activeAssessment ? (
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{activeAssessment.preferredDate}</span>
                  <span className="px-2 py-0.5 bg-teal-200/80 text-teal-950 font-bold text-[10px] rounded">
                    {activeAssessment.status}
                  </span>
                </div>
                <div className="text-teal-800 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{activeAssessment.preferredTime.replace(/_/g, ' ')}</span>
                </div>
                <p className="text-[11px] text-teal-700/90 pt-1 border-t border-teal-200/60">
                  Care Manager assigned from Chennai Metropolitan Care Hub.
                </p>
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed border-slate-200 rounded-xl space-y-2">
                <Stethoscope className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="text-xs font-medium text-slate-600">No Clinical Assessment Scheduled</p>
                <p className="text-[11px] text-slate-400">
                  Schedule a home visit for in-person vitals and mobility review.
                </p>
                <button
                  onClick={() => setCurrentStep('ASSESSMENT')}
                  className="mt-2 px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition"
                >
                  Schedule Assessment
                </button>
              </div>
            )}
          </div>
      {paymentCaregiver && (
        <PaymentCheckoutModal
          caregiver={paymentCaregiver}
          onClose={() => setPaymentCaregiver(null)}
          onPaymentSuccess={() => {
            const cg = paymentCaregiver;
            setPaymentCaregiver(null);
            setSlaCaregiver(cg);
          }}
        />
      )}

          {/* Phase Transition to Matching Info */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs space-y-2 shadow-md">
            <span className="font-bold text-teal-400 uppercase tracking-wider block text-[11px]">
              What's Next? (Phase B Preview)
            </span>
            <p className="text-slate-300 leading-relaxed">
              With the verified address in Chennai and finalized patient persona, our operations team activates the Caregiver Buffer Pool for proximity matching.
            </p>
          </div>

        </div>

      </div>

      {slaCaregiver && (
        <SLAAgreementModal
          caregiver={slaCaregiver}
          onClose={() => setSlaCaregiver(null)}
          onSLAAccepted={() => {
            setSlaCaregiver(null);
          }}
        />
      )}
    </div>
  );
};
