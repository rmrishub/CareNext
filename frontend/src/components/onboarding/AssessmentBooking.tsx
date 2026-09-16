import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  ArrowRight, 
  UserCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { useOnboarding } from '../../context/OnboardingContext';
import type { HomeAssessment } from '../../types';

export const AssessmentBooking: React.FC = () => {
  const { activeElder, activeAssessment, setActiveAssessment, setCurrentStep } = useOnboarding();

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const [preferredDate, setPreferredDate] = useState(minDateStr);
  const [preferredTime, setPreferredTime] = useState<'MORNING_9_12' | 'AFTERNOON_12_4' | 'EVENING_4_7'>('MORNING_9_12');
  const [notes, setNotes] = useState('Elder has mild morning fatigue; please assess transfer safety and mobility.');
  
  const [isBooking, setIsBooking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState<HomeAssessment | null>(activeAssessment);

  const verifiedLocation = activeElder?.location;

  const handleBookAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeElder) return;
    
    if (!verifiedLocation || !verifiedLocation.serviceable) {
      setErrorMessage('A verified residential address in Chennai is required to schedule a home assessment.');
      return;
    }

    setErrorMessage('');
    setIsBooking(true);
    try {
      const assessment = await api.createHomeAssessment({
        elderId: activeElder.id,
        preferredDate,
        preferredTime,
        notes
      });
      setActiveAssessment(assessment);
      setBookingSuccess(assessment);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to schedule home assessment.');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      
      {/* Step Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 uppercase tracking-wider mb-1">
          <span>Phase A.3</span>
          <span>•</span>
          <span>Home Assessment Booking (Optional / Recommended)</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Schedule Clinical Home Assessment
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          A licensed CareConnect Care Manager visits the elder’s home in Chennai to evaluate vitals, mobility ergonomics, and finalize attendant matching.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>{errorMessage}</div>
        </div>
      )}

      {bookingSuccess ? (
        /* Confirmed Booking State */
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-base">Home Assessment Request Confirmed</h3>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                Booking ID: <span className="font-mono font-semibold">{bookingSuccess.id.slice(0, 8)}</span> • Status: <span className="font-bold">{bookingSuccess.status}</span>
              </p>
            </div>
          </div>

          {/* Appointment Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Scheduled Date & Slot</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-teal-600" />
                <span>{bookingSuccess.preferredDate}</span>
              </div>
              <div className="text-slate-600 mt-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{bookingSuccess.preferredTime.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">Care Location Snapshot</span>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-600" />
                <span>{bookingSuccess.addressSnapshot?.locality || verifiedLocation?.locality}, Chennai</span>
              </div>
              <div className="text-slate-600 mt-1 text-[11px]">
                {bookingSuccess.addressSnapshot?.addressLine1 || verifiedLocation?.addressLine1}
              </div>
            </div>
          </div>

          {/* Next Steps Checklist */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-teal-600" />
              What Happens Next?
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>Our Chennai Care Manager will call your primary contact number 24 hours prior to confirm arrival.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>The 45-minute home visit reviews medication schedules, fall risks, and bathroom accessibility.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>Following the assessment, caregiver profiles matching your elder's shift and language will be presented for review.</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setBookingSuccess(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Modify booking preferences
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep('DASHBOARD')}
              className="px-6 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2"
            >
              <span>View Onboarding Summary</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleBookAssessment} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {/* Recommendation Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-sm">Recommended Step</span>
              <p className="mt-0.5 text-teal-800 leading-relaxed">
                While optional, a home clinical assessment allows our nurse supervisor to verify vitals, evaluate room ergonomics, and ensure seamless handoff to the assigned caregiver.
              </p>
            </div>
          </div>

          {/* Frozen Address Snapshot Preview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                Verified Assessment Address
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                Verified Chennai Zone
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {verifiedLocation?.addressLine1}, {verifiedLocation?.locality}, Chennai — {verifiedLocation?.postalCode}
            </p>
            {verifiedLocation?.landmark && (
              <p className="text-xs text-slate-500 mt-0.5">Landmark: {verifiedLocation.landmark}</p>
            )}
          </div>

          {/* Date and Time Slot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                min={minDateStr}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Time Slot <span className="text-rose-500">*</span>
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
              >
                <option value="MORNING_9_12">Morning (9:00 AM – 12:00 PM)</option>
                <option value="AFTERNOON_12_4">Afternoon (12:00 PM – 4:00 PM)</option>
                <option value="EVENING_4_7">Evening (4:00 PM – 7:00 PM)</option>
              </select>
            </div>
          </div>

          {/* Care Manager Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specific Instructions for Visiting Care Manager (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please bring a digital blood pressure monitor; elder rests in the master bedroom on 1st floor..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep('DASHBOARD')}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 font-medium order-2 sm:order-1"
            >
              Skip assessment for now & view summary →
            </button>

            <button
              type="submit"
              disabled={isBooking}
              className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              {isBooking ? (
                <span className="animate-pulse">Confirming Appointment...</span>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Confirm Clinical Assessment Booking</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
