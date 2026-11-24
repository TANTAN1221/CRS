// =====================================================================
// CIVIL REGISTRY PORTAL - PUBLIC & AUTHENTICATION REACT PAGES
// LandingPage (Inspo 1 & 2 Theme), LoginPage (Demo Fillers), RegisterPage
// =====================================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  ShieldCheck,
  Sparkles,
  Lock,
  Clock,
  Search,
  ChevronRight,
  CalendarCheck,
  Check,
  ArrowLeft,
  Key,
  Mail,
  KeyRound,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { formatCurrency } from '../../components/PortalLayout';
import CitizenAuthModal from '../../components/CitizenAuthModal';

export function LandingPage() {
  const {
    profile,
    services,
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    openAuthModal,
  } = usePortal();

  const dashboardPath =
    profile?.role === 'admin'
      ? '/admin/dashboard'
      : profile?.role === 'personnel'
      ? '/personnel/dashboard'
      : '/applicant/dashboard';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Navbar (Mobile-Responsive without overlapping title & buttons) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <img
              src="/logo.png"
              alt="Civil Registry Logo"
              width={40}
              height={40}
              className="h-9 sm:h-11 w-auto object-contain flex-shrink-0"
            />
            <span className="font-serif font-bold text-sm sm:text-xl lg:text-2xl text-slate-900 tracking-tight truncate">
              Civil Registry Portal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 flex-shrink-0">
            <a href="#home" className="text-slate-900 font-semibold hover:text-[#0e2756]">
              Home
            </a>
            <a href="#services" className="hover:text-[#0e2756]">
              Services
            </a>
          </nav>

          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-slate-300 text-slate-800 text-xs sm:text-sm font-semibold rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openAuthModal('register')}
              className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-5 py-2 bg-[#0e2756] text-white text-xs sm:text-sm font-semibold rounded-md hover:bg-[#122850] shadow-sm transition-colors whitespace-nowrap"
            >
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section (Matches Inspo 1) */}
        <section
          id="home"
          className="relative bg-gradient-to-r from-[#071738] via-[#0b214d] to-[#122d66] text-white overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-blue-200 font-medium">
                <span className="accent-bar" />
                OFFICIAL CIVIL REGISTRY SERVICES
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
                Your Civil Registry Documents, Online
              </h1>

              <p className="text-base sm:text-lg text-blue-100/95 max-w-2xl leading-relaxed font-normal">
                Request Birth, Marriage, and Death Certificates in 4 simple steps. Scan your ID to fill out forms automatically, choose your counter visit schedule, and track your request online.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="px-7 py-3.5 bg-white text-slate-900 font-semibold rounded-md hover:bg-slate-100 transition-colors shadow-lg text-sm"
                >
                  Create Citizen Portal
                </button>
                <Link
                  to={dashboardPath}
                  className="px-7 py-3.5 border border-white/40 text-white font-semibold rounded-md hover:bg-white/10 transition-colors text-sm"
                >
                  Enter Citizen Portal
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-blue-200/90">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <span>Auto-Fill Forms by Scanning ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <span>Pay Directly at the Office Counter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
                  <span>Official & Secure Citizen Records</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1000&q=80"
                  alt="Civil Registry Consultation"
                  width={1000}
                  height={750}
                  loading="eager"
                  className="w-full h-80 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e2756]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg text-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#0e2756] text-white flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-bold text-slate-900 text-sm">
                      AI OCR Scan & Automated Form Inputs
                    </div>
                    <div className="text-slate-500">
                      Scan your ID or certificate on mobile or web to auto-populate required fields
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Civil Registry Services Showcase */}
        <section id="services" className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0e2756] font-bold mb-2">
                <span className="accent-bar-navy" />
                OFFICIAL CERTIFICATES & REGISTRATIONS
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
                Available Civil Registry Services
              </h2>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Pre-screen your documents online and reserve a counter appointment. All statutory fees displayed below are informational only and paid directly at the Civil Registry Cashier Counter under Republic Act 3753.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md border border-slate-200 flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded bg-blue-50 text-[#0e2756]">
                        {s.code}
                      </span>
                      <span className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold">
                        Counter Payment Only
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-[#0e2756]">
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.description}</p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                        Informational Fee
                      </div>
                      <div className="text-xs font-bold text-slate-900">
                        {formatCurrency(s.fee_amount)} • {s.processing_days} days
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0e2756] hover:text-[#183d84]"
                    >
                      Apply in Portal <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#071738] text-white py-10 text-center text-xs text-blue-200/70">
        © 2026 Office of the City Civil Registrar • Official Civil Registry Services Portal
      </footer>

      {/* Citizen Sign In / Create Portal Modal */}
      <CitizenAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}

export function LoginPage() {
  const { login, showToast } = usePortal();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      showToast(`Welcome back, ${user.first_name}!`, 'success', 'Signed In');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'personnel') navigate('/personnel/dashboard');
      else navigate('/applicant/dashboard');
    } catch (err) {
      showToast(err.message, 'error', 'Authentication Error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
            <span className="font-serif font-bold text-lg text-slate-900">
              Civil Registry Portal
            </span>
          </Link>
          <Link
            to="/"
            className="text-xs font-semibold text-slate-600 hover:text-[#0e2756] flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Homepage
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
          <div className="bg-navy-pattern text-white p-6 text-center">
            <h2 className="font-serif text-2xl font-bold">Sign In to Your Account</h2>
            <p className="text-xs text-blue-100/90 mt-1">
              Sign in with your registered account to access your portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Email address
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

            <button
              type="submit"
              className="w-full py-3 bg-[#0e2756] hover:bg-[#122850] text-white font-semibold text-xs rounded-md shadow-md flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign In to Portal
            </button>

            <div className="text-center pt-2 text-xs text-slate-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#0e2756] font-semibold hover:underline">
                Register as a Citizen
              </Link>
            </div>
          </form>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © 2026 Office of the City Civil Registrar. All rights reserved.
      </footer>
    </div>
  );
}

export function RegisterPage() {
  const { register, showToast } = usePortal();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: 'Metro City',
    province: 'Capital District',
    password: '',
    confirmPassword: '',
    consent: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      showToast('Passwords do not match.', 'error', 'Validation Error');
      return;
    }
    const created = await register(form);
    showToast('Account created and ready!', 'success', 'Registered');
    if (created?.role === 'admin') navigate('/admin/dashboard');
    else if (created?.role === 'personnel') navigate('/personnel/dashboard');
    else navigate('/applicant/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-9 w-auto" />
            <span className="font-serif font-bold text-lg text-slate-900">
              Civil Registry Portal
            </span>
          </Link>
          <Link to="/login" className="text-xs font-semibold text-[#0e2756] hover:underline">
            Already registered? Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4 py-10">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-fade-in">
          <div className="bg-navy-pattern text-white p-6 text-center">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-white/20">
              <UserPlus className="w-6 h-6 text-blue-200" />
            </div>
            <h2 className="font-serif text-2xl font-bold">Register Citizen Account</h2>
            <p className="text-xs text-blue-100/80 mt-1">
              Create your profile to scan documents with AI, submit requests, and book slots
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={form.middleName}
                  onChange={(e) => setForm({ ...form, middleName: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="form-input text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <label className="flex items-start gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                className="mt-0.5 rounded text-[#0e2756]"
              />
              <span className="text-slate-600">
                I give my explicit consent under <strong>Republic Act No. 10173 (Data Privacy Act of 2012)</strong> to the collection and automated AI OCR processing of my civil registry documents.
              </span>
            </label>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#0e2756] hover:bg-[#122850] text-white font-semibold rounded-md shadow-md flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Create Citizen Account
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
