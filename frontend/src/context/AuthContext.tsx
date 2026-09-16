import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithOtp: (phone: string, otp: string, fullName?: string, email?: string) => Promise<User>;
  loginWithGoogle: (idToken: string, fullName?: string, email?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch {
      setUser(null);
      api.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('careconnect_token');
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const loginWithOtp = async (phone: string, otp: string, fullName?: string, email?: string): Promise<User> => {
    const res = await api.verifyOtp(phone, otp, fullName, email);
    setUser(res.user);
    return res.user;
  };

  const loginWithGoogle = async (idToken: string, fullName?: string, email?: string): Promise<User> => {
    const res = await api.loginWithGoogle(idToken, fullName, email);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithOtp, loginWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
