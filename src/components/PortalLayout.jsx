// =====================================================================
// CIVIL REGISTRY PORTAL - MOBILE-FIRST RESPONSIVE LAYOUT & FIREBASE DRAWER
// Features:
// - Compact Mobile Header + Slide-Over Mobile Drawer (All Portal Links)
// - Fixed 5-Tab Bottom Navigation Bar with Safe-Area Inset Support
// - Live `crss-cd118` Control Modal with 1-Click "Wipe All Test Data"
// =====================================================================

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  LogOut,
  Flame,
  Home,
  BookOpen,
  FilePlus,
  Calendar,
  Search,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  CalendarCheck,
  PackageCheck,
  Users,
  FileCog,
  Shield,
  X,
  Database,
  Trash2,
  Menu,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  UserPlus,
} from 'lucide-react';
import { usePortal } from '../context/PortalContext';
import CitizenAuthModal from './CitizenAuthModal';

export function StatusBadge({ status }) {
  const map = {
    submitted: 'bg-blue-50 text-blue-700 border-blue-200',
    pre_screened: 'bg-sky-50 text-sky-700 border-sky-200',
    under_review: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ready_for_appointment: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    returned: 'bg-amber-50 text-amber-700 border-amber-200',
    reserved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    checked_in: 'bg-blue-50 text-blue-700 border-blue-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-300',
    no_show: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  const labelMap = {
    submitted: 'Form Submitted',
    pre_screened: 'Form Pre-Checked',
    under_review: 'Under Review',
    ready_for_appointment: 'Reviewed & Approved',
    completed: 'Verified & Done',
    returned: 'Needs Correction',
    reserved: 'Reserved',
    checked_in: 'Checked In',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border whitespace-nowrap flex-shrink-0 ${
        map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
      <span>{labelMap[status] || status}</span>
    </span>
  );
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default function PortalLayout({ children }) {
  const {
    profile,
    role,
    notifications,
    logout,
    toasts,
    firebaseConnected,
    configModalOpen,
    setConfigModalOpen,
    authModalOpen,
    setAuthModalOpen,
    authModalTab,
    openAuthModal,
    seedFirestoreFromClient,
    resetAllTestData,
  } = usePortal();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  // Enforce role-based dashboard redirect so Personnel & Admin never stay stuck on `/applicant/*`
  React.useEffect(() => {
    if (!profile?.role) return;
    const path = location.pathname;
    if (profile.role === 'personnel' && path.startsWith('/applicant')) {
      navigate('/personnel/dashboard', { replace: true });
    } else if (profile.role === 'admin' && path.startsWith('/applicant') && path !== '/applicant/notifications') {
      navigate('/admin/dashboard', { replace: true });
    } else if (profile.role === 'applicant' && (path.startsWith('/admin') || path.startsWith('/personnel'))) {
      navigate('/applicant/dashboard', { replace: true });
    }
  }, [profile?.role, location.pathname, navigate]);

  const unreadCount = notifications.filter(
    (n) => !n.is_read && (!profile || n.user_id === profile.id)
  ).length;

  const navLinks =
    role === 'admin'
      ? [
          { to: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
          { to: '/admin/users', label: 'Users & RBAC', icon: Users },
          { to: '/admin/services', label: 'Services', icon: FileCog },
          { to: '/admin/requirements', label: 'Checklists', icon: CheckSquare },
          { to: '/admin/appointments', label: 'Schedules', icon: Calendar },
          { to: '/admin/reports', label: 'Audit Logs', icon: FolderOpen },
        ]
      : role === 'personnel'
      ? [
          { to: '/personnel/dashboard', label: 'Queue', icon: LayoutDashboard },
          { to: '/personnel/applications', label: 'Requests', icon: FolderOpen },
          { to: '/personnel/document-verification', label: 'Review Forms', icon: CheckSquare },
          { to: '/personnel/tracking', label: 'Form Tracker', icon: PackageCheck },
          { to: '/personnel/appointments', label: 'Appointments', icon: CalendarCheck },
        ]
      : [
          { to: '/applicant/dashboard', label: 'Home', icon: Home },
          { to: '/applicant/services', label: 'Services', icon: BookOpen },
          { to: '/applicant/application', label: 'Apply (AI)', icon: FilePlus },
          { to: '/applicant/document-tracking', label: 'Track Form', icon: Search },
          { to: '/applicant/appointments', label: 'Schedule', icon: Calendar },
        ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 mobile-page-padding">
      {/* Skip to Main Content Link (web-design-guidelines a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0e2756] focus:text-white focus:rounded-lg focus:text-xs focus:font-bold"
      >
        Skip to main content
      </a>

      {/* Compact Mobile-First Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 min-w-0">
              <img
                src="/logo.png"
                alt="Civil Registry Portal Logo"
                width={36}
                height={36}
                className="h-8 sm:h-9 w-auto object-contain flex-shrink-0"
              />
              <div className="truncate">
                <span className="font-serif font-bold text-sm sm:text-lg text-slate-900 block leading-tight truncate">
                  Civil Registry Portal
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block truncate">
                  {role === 'admin'
                    ? 'Admin Center'
                    : role === 'personnel'
                    ? 'Officer Desk'
                    : 'Citizen Portal'}
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 ml-4">
              {navLinks.map((item) => {
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`py-5 border-b-2 transition-colors whitespace-nowrap ${
                      active
                        ? 'text-[#0e2756] border-[#0e2756]'
                        : 'border-transparent hover:text-[#0e2756]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls (Authenticated Firebase Profile + Live DB Controls) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {profile ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 truncate max-w-[140px]">
                  {profile.first_name} {profile.last_name}
                </span>
                <span className="uppercase text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0e2756] text-white">
                  {role}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                aria-label="Open Citizen Sign In or Sign Up Modal"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0e2756] text-white hover:bg-[#122850] transition-colors min-h-[36px]"
              >
                <UserPlus aria-hidden="true" className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <Link
              to="/applicant/notifications"
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              className="relative p-2 text-slate-600 hover:text-[#0e2756] rounded-full hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
              title="Notifications"
            >
              <Bell aria-hidden="true" className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full" />
              )}
            </Link>

            {/* Mobile Hamburger Drawer Trigger (< 1024px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-expanded={mobileMenuOpen}
              aria-label="Open Navigation Menu"
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            >
              <Menu aria-hidden="true" className="w-5 h-5" />
            </button>

            <button
              type="button"
              aria-label="Sign Out"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="hidden lg:flex text-slate-500 hover:text-rose-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Sign Out"
            >
              <LogOut aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Portal Navigation Drawer"
          className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs modal-overlay no-print"
        >
          <div className="bg-white w-72 max-w-[85vw] h-full shadow-2xl p-5 flex flex-col justify-between animate-fade-in overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#0e2756] text-white flex items-center justify-center font-bold text-sm">
                    {(profile?.first_name?.[0] || 'C').toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      {profile?.first_name} {profile?.last_name}
                    </div>
                    <div className="text-[11px] text-slate-500 uppercase">{role}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* All Links for Current Role */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1">
                  Portal Navigation
                </div>
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const active = location.pathname.startsWith(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-[#0e2756] text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full py-2.5 px-3 border border-rose-200 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className="flex-grow max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8"
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-5 px-4 text-center text-[11px] sm:text-xs text-slate-500 no-print">
        © 2026 Office of the City Civil Registrar • Official Civil Registry Services Portal
      </footer>

      {/* Mobile Fixed 5-Tab Bottom Navigation Bar (< 1024px) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg grid grid-cols-5 py-1 px-1 safe-bottom-nav no-print">
        {navLinks.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1.5 rounded-xl min-h-[48px] transition-colors ${
                active ? 'text-[#0e2756] font-bold bg-blue-50/90' : 'text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] mt-0.5 truncate max-w-[68px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Toast Container (aria-live="polite" for assistive tech) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-20 lg:bottom-5 right-3 left-3 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 sm:max-w-sm w-auto pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 bg-white rounded-xl shadow-xl border border-slate-200 border-l-4 border-l-[#0e2756] animate-fade-in"
          >
            {t.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            ) : t.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : t.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-[#0e2756] flex-shrink-0" />
            )}
            <div className="flex-1 text-xs">
              {t.title && <div className="font-bold text-slate-900">{t.title}</div>}
              <div className="text-slate-600 mt-0.5 leading-relaxed">{t.message}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Citizen Sign In / Create Portal Modal */}
      <CitizenAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </div>
  );
}
