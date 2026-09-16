import React, { useState } from 'react';
import { usePhaseB } from '../../context/PhaseBContext';
import type { Caregiver, PaymentOrder } from '../../types';

interface Props {
  caregiver: Caregiver;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const PaymentCheckoutModal: React.FC<Props> = ({
  caregiver,
  onClose,
  onPaymentSuccess
}) => {
  const { createDepositOrder, verifyDepositPayment, loading, error } = usePhaseB();

  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  const depositAmount = caregiver.dailyRate;

  const handleCreateOrder = async () => {
    try {
      const order = await createDepositOrder(caregiver.id, depositAmount);
      setPaymentOrder(order);
    } catch (err) {
      // Handled in context
    }
  };

  const handleSimulatePayment = async () => {
    if (!paymentOrder) return;
    setVerifying(true);
    try {
      const mockTxId = `pay_rzp_${Date.now()}`;
      const verified = await verifyDepositPayment(paymentOrder.id, mockTxId);
      if (verified) {
        setSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
        }, 1500);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              Phase B3 — Advance Service Deposit
            </span>
            <h3 className="text-xl font-bold text-gray-900 mt-2">
              Advance Deposit Checkout
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

        {success ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <h4 className="text-xl font-bold text-gray-900">Payment Verified!</h4>
            <p className="text-xs text-gray-500">
              Your advance deposit of ₹{depositAmount} has been verified and recorded.
            </p>
          </div>
        ) : !paymentOrder ? (
          /* Step 1: Breakdown */
          <div className="py-6 space-y-6">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Selected Caregiver</span>
                <span className="font-bold text-gray-900">{caregiver.fullName}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>Service Locality</span>
                <span className="font-bold text-gray-900">{caregiver.serviceLocalities[0] || 'Chennai'}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-600 font-medium">
                <span>1-Day Advance Deposit</span>
                <span className="font-bold text-gray-900">₹{depositAmount}</span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-bold text-emerald-900">
                <span>Total Amount Due</span>
                <span>₹{depositAmount} INR</span>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
              🔒 <strong>Trusted Pricing Security</strong>: Order created via server-side pricing algorithm. Payment handled securely via Razorpay gateway.
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-5 py-3 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-lg disabled:opacity-50"
              >
                {loading ? 'Generating Order...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        ) : (
          /* Step 2: Gateway Simulation */
          <div className="py-6 space-y-6">
            <div className="border border-emerald-500/20 bg-emerald-50 p-4 rounded-2xl text-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Razorpay Order ID</span>
              <span className="text-base font-bold text-emerald-900 block mt-1">{paymentOrder.gatewayOrderId}</span>
              <span className="text-2xl font-bold text-gray-900 block mt-2">₹{paymentOrder.amount} INR</span>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={verifying}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 shadow-xl flex items-center justify-center space-x-2"
            >
              {verifying ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  <span>Verifying Server Signature...</span>
                </>
              ) : (
                <span>Pay ₹{paymentOrder.amount} (Razorpay Checkout)</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
