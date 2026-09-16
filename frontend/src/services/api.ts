import type { 
  AuthResponse, 
  User, 
  Elder, 
  ElderLocation, 
  LocationVerifyResponse, 
  HomeAssessment,
  Caregiver,
  CaregiverRecommendationResponse,
  ShortlistResponse,
  Interview,
  PaymentOrder,
  SLAAgreement,
  PhaseBState
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('careconnect_token');
  }

  setToken(token: string) {
    localStorage.setItem('careconnect_token', token);
  }

  clearToken() {
    localStorage.removeItem('careconnect_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // --- Auth Endpoints ---
  async sendOtp(phone: string, channel: string = 'WHATSAPP'): Promise<{ success: boolean; message: string; phone: string; dev_otp?: string }> {
    return this.request('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone, channel }),
    });
  }

  async verifyOtp(phone: string, otp: string, fullName?: string, email?: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, fullName, email }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async loginWithGoogle(idToken: string, fullName?: string, email?: string): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken, fullName, email }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/me');
  }

  // --- Elder Endpoints ---
  async createElder(data: { name: string; age: number; gender: string; dateOfBirth?: string | null }): Promise<Elder> {
    return this.request<Elder>('/elders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getElder(id: string): Promise<Elder> {
    return this.request<Elder>(`/elders/${id}`);
  }

  async listElders(): Promise<Elder[]> {
    return this.request<Elder[]>('/elders');
  }

  async updateElder(id: string, data: Partial<Elder>): Promise<Elder> {
    return this.request<Elder>(`/elders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- Location Endpoints ---
  async verifyLocation(data: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    simulateState?: string;
  }): Promise<LocationVerifyResponse> {
    return this.request<LocationVerifyResponse>('/elder-locations/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async persistElderLocation(elderId: string, data: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
    latitude: number;
    longitude: number;
  }): Promise<ElderLocation> {
    return this.request<ElderLocation>(`/elders/${elderId}/location`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // --- Assessment Endpoints ---
  async createHomeAssessment(data: {
    elderId: string;
    preferredDate: string;
    preferredTime: string;
    notes?: string;
  }): Promise<HomeAssessment> {
    return this.request<HomeAssessment>('/home-assessments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getHomeAssessment(id: string): Promise<HomeAssessment> {
    return this.request<HomeAssessment>(`/home-assessments/${id}`);
  }

  async listHomeAssessments(): Promise<HomeAssessment[]> {
    return this.request<HomeAssessment[]>('/home-assessments');
  }

  // ==========================================
  // PHASE B API METHODS
  // ==========================================

  // --- B1: Matching & Profiles ---
  async getCaregiverRecommendations(elderId: string): Promise<CaregiverRecommendationResponse> {
    return this.request<CaregiverRecommendationResponse>(`/elders/${elderId}/caregiver-recommendations/`);
  }

  async getCaregiverProfile(caregiverId: string): Promise<Caregiver> {
    return this.request<Caregiver>(`/caregivers/${caregiverId}/`);
  }

  async addToShortlist(elderId: string, caregiverId: string): Promise<ShortlistResponse> {
    return this.request<ShortlistResponse>(`/elders/${elderId}/shortlist/`, {
      method: 'POST',
      body: JSON.stringify({ caregiverId }),
    });
  }

  async getShortlist(elderId: string): Promise<ShortlistResponse[]> {
    return this.request<ShortlistResponse[]>(`/elders/${elderId}/shortlist/`);
  }

  async removeFromShortlist(elderId: string, caregiverId: string): Promise<void> {
    return this.request<void>(`/elders/${elderId}/shortlist/${caregiverId}/`, {
      method: 'DELETE',
    });
  }

  // --- B2: Interview / Intro Call ---
  async getCaregiverAvailability(caregiverId: string): Promise<any[]> {
    return this.request<any[]>(`/caregivers/${caregiverId}/availability/`);
  }

  async scheduleInterview(data: {
    elderId: string;
    caregiverId: string;
    scheduledStart: string;
    durationMinutes?: number;
    meetingType?: string;
    notes?: string;
  }): Promise<Interview> {
    return this.request<Interview>('/interviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInterview(interviewId: string): Promise<Interview> {
    return this.request<Interview>(`/interviews/${interviewId}/`);
  }

  async cancelInterview(interviewId: string): Promise<Interview> {
    return this.request<Interview>(`/interviews/${interviewId}/cancel/`, {
      method: 'POST',
    });
  }

  async confirmCaregiverSelection(elderId: string, caregiverId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/caregiver-selection/', {
      method: 'POST',
      body: JSON.stringify({ elderId, caregiverId }),
    });
  }

  // --- B3: Payment & Deposit ---
  async createPaymentOrder(data: {
    elderId: string;
    caregiverId: string;
    amount: number;
    currency?: string;
    description?: string;
  }): Promise<PaymentOrder> {
    return this.request<PaymentOrder>('/payments/create-order/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPayment(data: {
    paymentOrderId: string;
    gatewayTransactionId: string;
    gatewaySignature?: string;
  }): Promise<{ success: boolean; message: string; paymentOrderId: string; status: string }> {
    return this.request<{ success: boolean; message: string; paymentOrderId: string; status: string }>('/payments/verify/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(orderId: string): Promise<PaymentOrder> {
    return this.request<PaymentOrder>(`/payments/${orderId}/status/`);
  }

  // --- B4: SLA Agreement & Status ---
  async getSLAAgreement(elderId: string, caregiverId: string): Promise<SLAAgreement> {
    return this.request<SLAAgreement>(`/sla/current/?elder_id=${elderId}&caregiver_id=${caregiverId}`);
  }

  async acceptSLAAgreement(slaId: string, acceptedBy: string): Promise<SLAAgreement> {
    return this.request<SLAAgreement>(`/sla/${slaId}/accept/`, {
      method: 'POST',
      body: JSON.stringify({ acceptedBy }),
    });
  }

  async getPhaseBStatus(elderId: string): Promise<PhaseBState> {
    return this.request<PhaseBState>(`/phase-b/${elderId}/status/`);
  }
}

export const api = new ApiService();
