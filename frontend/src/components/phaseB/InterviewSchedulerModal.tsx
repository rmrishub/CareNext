import React, { useState } from 'react';
import { usePhaseB } from '../../context/PhaseBContext';
import type { Caregiver, Interview } from '../../types';

interface Props {
  caregiver: Caregiver;
  onClose: () => void;
  onConfirmedSelection: (caregiver: Caregiver) => void;
}

export const InterviewSchedulerModal: React.FC<Props> = ({
  caregiver,
  onClose,
  onConfirmedSelection
}) => {
  const { scheduleIntroCall, selectCaregiver, loading, error } = usePhaseB();

  const [selectedDate, setSelectedDate] = useState<string>('2026-09-18');
  const [selectedSlot, setSelectedSlot] = useState<string>('10:00');
  const [scheduledInterview, setScheduledInterview] = useState<Interview | null>(null);

  const availableSlots = [
    { time: '10:00', label: '10:00 AM - 10:15 AM' },
    { time: '11:30', label: '11:30 AM - 11:45 AM' },
    { time: '14:00', label: '02:00 PM - 02:15 PM' },
    { time: '16:30', label: '04:30 PM - 04:45 PM' }
  ];

  const handleSchedule = async () => {
    const isoStart = `${selectedDate}T${selectedSlot}:00Z`;
    try {
      const interview = await scheduleIntroCall(caregiver.id, isoStart);
      setScheduledInterview(interview);
    } catch (err) {
      // Handled in context
    }
  };

  const handleConfirmCaregiver = async () => {
    await selectCaregiver(caregiver);
    onConfirmedSelection(caregiver);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              Phase B2 — 10m Moderated Intro Call
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Introductory Call with {caregiver.fullName}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 text-rose-700 p-3 rounded-xl text-xs mt-4">
            {error}
          </div>
        )}

        {!scheduledInterview ? (
          /* Step 1: Slot Selection */
          <div className="py-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Select Call Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Available 10-Minute Time Slots
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableSlots.map(slot => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`py-3 px-4 text-xs font-bold rounded-xl border transition-all ${
                      selectedSlot === slot.time
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-300'
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-xs text-amber-800">
              ℹ️ <strong>Intro Call Policy</strong>: A 10-minute moderated audio/video call allows you to discuss patient comfort and specific daily routines prior to confirming selection and advance deposit.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Confirm Call Slot'}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Confirmed Call Room & Selection Trigger */
          <div className="py-6 space-y-6 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Introductory Call Scheduled!</h4>
              <p className="text-xs text-gray-500 mt-1">
                Scheduled for {selectedDate} at {selectedSlot}
              </p>
            </div>

            {/* Video Meeting Link */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-left">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                Video Meeting Link
              </span>
              <a
                href={scheduledInterview.meetingReference || '#'}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-emerald-700 underline truncate block mt-1 hover:text-emerald-800"
              >
                {scheduledInterview.meetingReference}
              </a>
            </div>

            <div className="pt-4 border-t space-y-3">
              <button
                onClick={handleConfirmCaregiver}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-lg"
              >
                {loading ? 'Confirming...' : `Confirm & Select ${caregiver.fullName}`}
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs text-gray-500 font-semibold hover:text-gray-700"
              >
                Close & Return Later
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

