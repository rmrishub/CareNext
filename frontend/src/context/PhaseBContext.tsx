import React, { createContext, useContext, useState } from 'react';
import type { Caregiver, Interview, PaymentOrder, SLAAgreement, PhaseBState, RecommendationMatch } from '../types';
import { api } from '../services/api';

interface PhaseBContextType {
  activeElderId: string | null;
  setActiveElderId: (id: string | null) => void;
  phaseState: PhaseBState | null;
  recommendations: RecommendationMatch[];
  shortlist: Caregiver[];
  selectedCaregiver: Caregiver | null;
  activeInterview: Interview | null;
  activePaymentOrder: PaymentOrder | null;
  activeSLA: SLAAgreement | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRecommendations: (elderId: string) => Promise<void>;
  toggleShortlist: (caregiver: Caregiver) => Promise<void>;
  selectCaregiver: (caregiver: Caregiver) => Promise<void>;
  scheduleIntroCall: (caregiverId: string, startTime: string) => Promise<Interview>;
  createDepositOrder: (caregiverId: string, amount: number) => Promise<PaymentOrder>;
  verifyDepositPayment: (orderId: string, txId: string) => Promise<boolean>;
  loadSLADocument: (caregiverId: string) => Promise<SLAAgreement>;
  acceptSLA: (acceptedBy: string) => Promise<void>;
  refreshStatus: (elderId: string) => Promise<void>;
}

const PhaseBContext = createContext<PhaseBContextType | undefined>(undefined);

export const PhaseBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeElderId, setActiveElderId] = useState<string | null>(null);
  const [phaseState, setPhaseState] = useState<PhaseBState | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationMatch[]>([]);
  const [shortlist, setShortlist] = useState<Caregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<Caregiver | null>(null);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [activePaymentOrder, setActivePaymentOrder] = useState<PaymentOrder | null>(null);
  const [activeSLA, setActiveSLA] = useState<SLAAgreement | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = async (elderId: string) => {
    try {
      const state = await api.getPhaseBStatus(elderId);
      setPhaseState(state);
      if (state.selectedCaregiver) {
        setSelectedCaregiver(state.selectedCaregiver);
      }
    } catch (err: any) {
      console.warn("Failed to fetch Phase B status:", err);
    }
  };

  const fetchRecommendations = async (elderId: string) => {
    setLoading(true);
    setError(null);
    try {
      setActiveElderId(elderId);
      const res = await api.getCaregiverRecommendations(elderId);
      setRecommendations(res.recommendations);
      
      const slRes = await api.getShortlist(elderId);
      setShortlist(slRes.map(item => item.caregiver));
      
      await refreshStatus(elderId);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch caregiver recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const toggleShortlist = async (caregiver: Caregiver) => {
    if (!activeElderId) return;
    const isShortlisted = shortlist.some(c => c.id === caregiver.id);
    try {
      if (isShortlisted) {
        await api.removeFromShortlist(activeElderId, caregiver.id);
        setShortlist(prev => prev.filter(c => c.id !== caregiver.id));
      } else {
        await api.addToShortlist(activeElderId, caregiver.id);
        setShortlist(prev => [...prev, caregiver]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update shortlist.');
    }
  };

  const selectCaregiver = async (caregiver: Caregiver) => {
    if (!activeElderId) return;
    setLoading(true);
    try {
      await api.confirmCaregiverSelection(activeElderId, caregiver.id);
      setSelectedCaregiver(caregiver);
      await refreshStatus(activeElderId);
    } catch (err: any) {
      setError(err.message || 'Failed to select caregiver.');
    } finally {
      setLoading(false);
    }
  };

  const scheduleIntroCall = async (caregiverId: string, startTime: string): Promise<Interview> => {
    if (!activeElderId) throw new Error("No active elder profile selected.");
    setLoading(true);
    try {
      const interview = await api.scheduleInterview({
        elderId: activeElderId,
        caregiverId,
        scheduledStart: startTime,
        durationMinutes: 10,
        meetingType: "VIDEO_CALL"
      });
      setActiveInterview(interview);
      await refreshStatus(activeElderId);
      return interview;
    } catch (err: any) {
      setError(err.message || 'Failed to schedule intro call.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createDepositOrder = async (caregiverId: string, amount: number): Promise<PaymentOrder> => {
    if (!activeElderId) throw new Error("No active elder profile selected.");
    setLoading(true);
    try {
      const order = await api.createPaymentOrder({
        elderId: activeElderId,
        caregiverId,
        amount,
        currency: "INR",
        description: "CareConnect Phase B Advance Service Deposit"
      });
      setActivePaymentOrder(order);
      await refreshStatus(activeElderId);
      return order;
    } catch (err: any) {
      setError(err.message || 'Failed to create payment order.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyDepositPayment = async (orderId: string, txId: string): Promise<boolean> => {
    if (!activeElderId) return false;
    setLoading(true);
    try {
      const res = await api.verifyPayment({
        paymentOrderId: orderId,
        gatewayTransactionId: txId
      });
      if (res.success) {
        await refreshStatus(activeElderId);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message || 'Payment verification failed.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loadSLADocument = async (caregiverId: string): Promise<SLAAgreement> => {
    if (!activeElderId) throw new Error("No active elder profile selected.");
    setLoading(true);
    try {
      const sla = await api.getSLAAgreement(activeElderId, caregiverId);
      setActiveSLA(sla);
      return sla;
    } catch (err: any) {
      setError(err.message || 'Failed to load SLA document.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const acceptSLA = async (acceptedBy: string) => {
    if (!activeSLA || !activeElderId) return;
    setLoading(true);
    try {
      const updatedSla = await api.acceptSLAAgreement(activeSLA.id, acceptedBy);
      setActiveSLA(updatedSla);
      await refreshStatus(activeElderId);
    } catch (err: any) {
      setError(err.message || 'Failed to accept SLA agreement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhaseBContext.Provider
      value={{
        activeElderId,
        setActiveElderId,
        phaseState,
        recommendations,
        shortlist,
        selectedCaregiver,
        activeInterview,
        activePaymentOrder,
        activeSLA,
        loading,
        error,
        fetchRecommendations,
        toggleShortlist,
        selectCaregiver,
        scheduleIntroCall,
        createDepositOrder,
        verifyDepositPayment,
        loadSLADocument,
        acceptSLA,
        refreshStatus
      }}
    >
      {children}
    </PhaseBContext.Provider>
  );
};

export const usePhaseB = () => {
  const ctx = useContext(PhaseBContext);
  if (!ctx) throw new Error('usePhaseB must be used within a PhaseBProvider');
  return ctx;
};
