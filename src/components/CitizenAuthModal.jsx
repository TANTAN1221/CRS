// =====================================================================
// CIVIL REGISTRY PORTAL - CITIZEN SIGN IN & PORTAL CREATION MODAL
// 100% Live Firebase Auth, Cloud Firestore & Realtime DB (`crss-cd118`)
// Zero Demo Accounts — Real Firebase Account Authentication Only
// =====================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortal } from '../context/PortalContext';

export default function CitizenAuthModal({
  isOpen,
  onClose,
  initialTab = 'login',
  redirectAfterAuth = null,
}) {
  const { login, register, showToast } = usePortal();
  const navigate = useNavigate();
  const [tab, setTab] = useState(initialTab); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);

  // Sign In state (Clean empty fields — no demo accounts)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up (Create Citizen Portal) state
  const [regForm, setRegForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: 'Metro City',
    province: 'Capital District',
    role: 'applicant',
    password: '',
    confirmPassword: '',
    consent: true,
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, isOpen]);

  // Allow Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const navigateByRole = (role) => {
    if (redirectAfterAuth) {
      navigate(redirectAfterAuth);
      return;
    }
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'personnel') navigate('/personnel/dashboard');
    else navigate('/applicant/services');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      showToast(`Welcome, ${user.first_name}!`, 'success', 'Signed In');
      onClose();
      navigateByRole(user.role);
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error', 'Sign-In Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regForm.password !== regForm.confirmPassword) {
      showToast('Passwords do not match. Please check again.', 'error', 'Password Mismatch');
      return;
    }
    setSubmitting(true);
    try {
      const created = await register(regForm);
      showToast(
        `Account created in Firebase for ${created.first_name} ${created.last_name}!`,
        'success',
        'Account Created'
      );
      onClose();
      navigateByRole(created.role);
    } catch (err) {
      showToast(err.message || 'Could not create account', 'error', 'Registration Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Citizen Portal Sign In and Registration"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 modal-overlay"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[88vh] flex flex-col border border-slate-200 overflow-hidden animate-fade-in"
      >
        {/* Sticky Top Header */}
        <div className="bg-navy-pattern text-white px-4 py-3.5 sm:px-6 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="min-w-0">
            <h2 className="font-serif text-base sm:text-lg font-bold truncate">
              {tab === 'login' ? 'Sign In to Portal' : 'Create Citizen Portal Account'}
            </h2>
            <p className="text-[11px] text-blue-100/90 truncate">
              {tab === 'login'
                ? 'Sign in with your registered account'
                : 'Register your citizen profile to apply & track forms online'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close and go back"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex-shrink-0 transition-colors"
          >
            <span>Close</span>
          </button>
        </div>

        {/* Sticky Mode Switch Tabs */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200 text-xs font-bold flex-shrink-0">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`py-2 rounded-lg flex items-center justify-center transition-all ${
              tab === 'login'
                ? 'bg-[#0e2756] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`py-2 rounded-lg flex items-center justify-center transition-all ${
              tab === 'register'
                ? 'bg-[#0e2756] text-white shadow-xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <span>Create Account</span>
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto flex-1">
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="username"
                  spellCheck={false}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input text-xs"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input text-xs"
                  placeholder="Enter your password"
                />
              </div>

              <div className="pt-1 space-y-2.5">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#0e2756] hover:bg-[#122850] text-white font-semibold text-xs rounded-lg shadow-md flex items-center justify-center disabled:opacity-60"
                >
                  <span>{submitting ? 'Signing In…' : 'Sign In'}</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg flex items-center justify-center"
                >
                  <span>Back to Page</span>
                </button>
              </div>

              <div className="text-center pt-1 text-xs text-slate-600">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setTab('register')}
                  className="text-[#0e2756] font-bold hover:underline"
                >
                  Create Account
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="p-4 sm:p-6 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    autoComplete="given-name"
                    value={regForm.firstName}
                    onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })}
                    placeholder="Juan"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    autoComplete="family-name"
                    value={regForm.lastName}
                    onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })}
                    placeholder="Dela Cruz"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    spellCheck={false}
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="juan@example.com"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={regForm.phoneNumber}
                    onChange={(e) => setRegForm({ ...regForm, phoneNumber: e.target.value })}
                    placeholder="0917 555 0192"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Home Address *</label>
                <input
                  type="text"
                  required
                  autoComplete="street-address"
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="House No., Street, Barangay, City"
                  className="form-input text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={regForm.confirmPassword}
                    onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                    placeholder="Repeat password"
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={regForm.consent}
                  onChange={(e) => setRegForm({ ...regForm, consent: e.target.checked })}
                  className="mt-0.5 rounded text-[#0e2756] flex-shrink-0"
                />
                <span className="text-slate-600 text-[11px] leading-relaxed">
                  I agree to the processing of my civil registry data under{' '}
                  <strong>RA 10173 (Data Privacy Act of 2012)</strong>.
                </span>
              </label>

              <div className="pt-1 space-y-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#0e2756] hover:bg-[#122850] text-white font-semibold rounded-lg shadow-md flex items-center justify-center disabled:opacity-60"
                >
                  <span>
                    {submitting ? 'Creating Account…' : 'Create Account'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg flex items-center justify-center"
                >
                  <span>Back to Page</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
