import React, { useState } from 'react';
import { Phone, MessageSquare, ArrowRight, CheckCircle2, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AuthModal: React.FC = () => {
  const { loginWithOtp, loginWithGoogle } = useAuth();
  
  const [phone, setPhone] = useState('+919876543210');
  const [fullName, setFullName] = useState('Suresh Kumar');
  const [email, setEmail] = useState('suresh.kumar@example.com');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await api.sendOtp(phone, 'WHATSAPP');
      if (res.dev_otp) {
        setDevOtpHint(res.dev_otp);
      }
      setStep('OTP');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send OTP. Please check your number.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      await loginWithOtp(phone, otp, fullName, email);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      await loginWithGoogle('google-auth-sponsor-token', fullName, email);
    } catch (err: any) {
      setErrorMessage(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickTest = () => {
    setPhone('+919876543210');
    setFullName('Suresh Kumar');
    setEmail('suresh.kumar@example.com');
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Family Sponsor Sign-In</h2>
        <p className="text-sm text-slate-600 mt-1">
          Access your elder care onboarding portal and verified Chennai network.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium leading-relaxed">
          {errorMessage}
        </div>
      )}

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Suresh Kumar"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number (WhatsApp Enabled)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports Indian (+91) and overseas/NRI mobile numbers.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address (Optional)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="suresh@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">Sending OTP...</span>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Continue with WhatsApp OTP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google Sign-In</span>
          </button>

          {/* Quick Dev Preset */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={fillQuickTest}
              className="inline-flex items-center gap-1.5 text-xs text-teal-700 hover:text-teal-800 font-medium"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Default Demo Sponsor</span>
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-800 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Code dispatched to {phone}</p>
              <p className="text-teal-700/80 mt-0.5">Please check WhatsApp or messages for your 6-digit OTP.</p>
              {devOtpHint && (
                <button
                  type="button"
                  onClick={() => setOtp(devOtpHint)}
                  className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-teal-200/60 hover:bg-teal-200 text-teal-900 rounded font-mono font-semibold"
                >
                  Click to auto-fill dev code: {devOtpHint}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Enter 6-Digit Verification Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl border border-slate-300 focus:border-teal-600 bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-sm transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">Verifying...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Enter CareConnect</span>
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => setStep('PHONE')}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              ← Change mobile number
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

