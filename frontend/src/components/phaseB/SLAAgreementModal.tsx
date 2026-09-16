import React, { useState, useEffect } from 'react';
import { usePhaseB } from '../../context/PhaseBContext';
import type { Caregiver, SLAAgreement } from '../../types';

interface Props {
  caregiver: Caregiver;
  onClose: () => void;
  onSLAAccepted: () => void;
}

export const SLAAgreementModal: React.FC<Props> = ({
  caregiver,
  onClose,
  onSLAAccepted
}) => {
  const { loadSLADocument, acceptSLA, loading, error } = usePhaseB();

  const [slaDoc, setSlaDoc] = useState<SLAAgreement | null>(null);
  const [acceptedName, setAcceptedName] = useState<string>('');
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);

  useEffect(() => {
    loadSLADocument(caregiver.id).then(doc => setSlaDoc(doc)).catch(() => {});
  }, [caregiver.id]);

  const handleAccept = async () => {
    if (!isChecked || !acceptedName.trim()) return;
    try {
      await acceptSLA(acceptedName.trim());
      setCompleted(true);
      setTimeout(() => {
        onSLAAccepted();
      }, 1500);
    } catch (err) {
      // Handled in context
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl max-h-[90vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              Phase B4 — Service Level Agreement (SLA)
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Digital Service Level Agreement
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

        {completed ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              🎉
            </div>
            <h4 className="text-2xl font-bold text-gray-900">Phase B Complete!</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Your SLA agreement has been accepted and recorded. CareConnect Phase B is fully completed and ready for daily care activation.
            </p>
          </div>
        ) : (
          <>
            {/* Agreement Content Box */}
            <div className="my-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 overflow-y-auto max-h-60 text-xs text-gray-700 font-mono space-y-3">
              <h4 className="font-bold text-gray-900 text-sm">{slaDoc?.title || 'CareConnect Service Level Agreement'}</h4>
              <p className="whitespace-pre-line leading-relaxed">{slaDoc?.content}</p>
            </div>

            {/* Signature & Acceptance Inputs */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Full Name (Digital Signature)
                </label>
                <input
                  type="text"
                  placeholder="Enter your full legal name"
                  value={acceptedName}
                  onChange={(e) => setAcceptedName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <span className="text-xs text-gray-600 font-medium">
                  I explicitly acknowledge and accept the terms of this Service Level Agreement (Version {slaDoc?.version || 'v1.0'}).
                </span>
              </label>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccept}
                  disabled={loading || !isChecked || !acceptedName.trim()}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Recording Acceptance...' : 'Sign & Complete Phase B'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
