import type { 
  AuthResponse, 
  User, 
  Elder, 
  ElderLocation, 
  LocationVerifyResponse, 
  HomeAssessment 
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
}

export const api = new ApiService();
