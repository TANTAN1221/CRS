// =====================================================================
// CIVIL REGISTRY PORTAL - ADMINISTRATOR REACT PAGES
// Analytics Overview, User & Custom Claims Management, RBAC Matrix,
// Services & Informational Fee CRUD, Requirements, Schedules & Audit Logs
// =====================================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  CheckCircle2,
  Users,
  Clock,
  Shield,
  UserPlus,
  Plus,
  Trash2,
  Download,
  Lock,
  Search,
  Check,
  Minus,
} from 'lucide-react';
import PortalLayout, {
  StatusBadge,
  formatCurrency,
  formatDate,
} from '../../components/PortalLayout';
import VisualAppointmentCalendar from '../../components/VisualAppointmentCalendar';
import { usePortal } from '../../context/PortalContext';
import { TIME_SLOTS } from '../../services/firebase';

export function AdminDashboardPage() {
  const { applications, appointments, usersList, auditLogs } = usePortal();

  const recentApps = applications.slice(0, 5);
  const recentLogs = auditLogs.slice(0, 5);

  return (
    <PortalLayout>
      <div className="bg-navy-pattern text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-200 font-semibold">
            <span className="accent-bar" />
            CENTRAL GOVERNANCE CONSOLE
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Portal Executive Overview
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl">
            Monitor live application throughput, personnel review status, active user accounts, and recent system activity.
          </p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#0e2756] flex items-center justify-center flex-shrink-0">
            <Folder className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Submitted
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {applications.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Approved
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {
                applications.filter((a) =>
                  ['ready_for_appointment', 'completed'].includes(a.status)
                ).length
              }
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#0e2756] flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Accounts
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {usersList.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Appointments
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {appointments.filter((a) => a.status === 'reserved').length}
            </div>
          </div>
        </div>
      </div>

      {/* Live Operational Snapshot (Recent Citizen Forms & Recent Audit Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-serif font-bold text-base text-slate-900">
                Recent Citizen Form Submissions
              </h2>
              <p className="text-xs text-slate-500">
                Live applications and their current personnel review status
              </p>
            </div>
          </div>

          {recentApps.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No citizen forms submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentApps.map((app) => (
                <div
                  key={app.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#0e2756]">
                        {app.reference_no}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {app.subject_details?.fullName || app.applicant_name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {app.service_name} • Reviewer:{' '}
                      {app.assignedOfficer || 'Registry Officer'}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-serif font-bold text-base text-slate-900">
                Recent System Activity
              </h2>
              <p className="text-xs text-slate-500">
                Latest actions recorded across the portal
              </p>
            </div>
            <Link
              to="/admin/reports"
              className="text-xs font-semibold text-[#0e2756] hover:underline"
            >
              View All
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentLogs.map((log) => (
                <div key={log.id} className="py-2.5 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-[#0e2756]">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {formatDate(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-slate-700">{log.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

export function AdminUsersPage() {
  const { usersList, provisionUser, changeUserRole, showToast } = usePortal();
  const [modalOpen, setModalOpen] = useState(false);
  const [rbacModalOpen, setRbacModalOpen] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    role: 'personnel',
  });

  // Enforced Separation-of-Duties RBAC Policy Matrix (Shown in Advisory Modal)
  const rbacRows = [
    {
      title: 'Submit Document Form & AI ID Auto-Fill',
      desc: 'Fill out civil registry certificate forms and attach supporting ID scans',
      citizen: true,
      personnel: false,
      admin: false,
    },
    {
      title: 'Track Own Form & Personnel Review Progress',
      desc: 'View personal form-filling checklist and assigned officer review updates',
      citizen: true,
      personnel: false,
      admin: false,
    },
    {
      title: 'Book & Reschedule Own Office Visit Slot',
      desc: 'Reserve a personal counter visit date and time window',
      citizen: true,
      personnel: false,
      admin: false,
    },
    {
      title: 'Inspect All Citizen Forms & Review Queue',
      desc: 'Access the master queue of submitted citizen forms and uploaded attachments',
      citizen: false,
      personnel: true,
      admin: true,
    },
    {
      title: 'Approve or Return Citizen Forms for Correction',
      desc: 'Verify form completeness, record review remarks, and approve or return forms',
      citizen: false,
      personnel: true,
      admin: false,
    },
    {
      title: 'Manage Office Counter Check-Ins',
      desc: 'Check in arriving citizens at the office counter and mark visit completion',
      citizen: false,
      personnel: true,
      admin: false,
    },
    {
      title: 'Configure Services, Checklists & Slot Capacities',
      desc: 'Manage certificate types, required document checklists, and appointment schedules',
      citizen: false,
      personnel: false,
      admin: true,
    },
    {
      title: 'Manage User Accounts, Roles & Security Audit Logs',
      desc: 'Provision personnel/admin accounts, assign roles, and export system audit logs',
      citizen: false,
      personnel: false,
      admin: true,
    },
  ];

  const handleCreate = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      showToast('Passwords do not match. Please check again.', 'error', 'Password Mismatch');
      return;
    }
    try {
      await provisionUser(form);
      showToast(
        `Created account for ${form.email} as ${form.role.toUpperCase()}!`,
        'success',
        'User Created'
      );
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        role: 'personnel',
      });
      setModalOpen(false);
    } catch (err) {
      showToast(err.message || 'Could not create user', 'error', 'Error');
    }
  };

  return (
    <PortalLayout>
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Users & Role Assignment
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage registered system accounts, assign user roles (`applicant`, `personnel`, `admin`), and view role restriction advisories.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRbacModalOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold rounded-md flex items-center gap-1.5 shadow-2xs"
          >
            <Shield className="w-4 h-4 text-[#0e2756]" /> View RBAC Policy Advisory
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-5 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white text-xs font-semibold rounded-md flex items-center gap-2 shadow-xs"
          >
            <UserPlus className="w-4 h-4" /> Add System User
          </button>
        </div>
      </div>

      {/* REGISTERED ACCOUNTS & ROLE ASSIGNMENT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-slate-900">
            Registered Accounts & Role Assignment
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            {usersList.length} Active Accounts
          </span>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden space-y-3">
          {usersList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
              No registered user accounts yet.
            </div>
          ) : (
            usersList.map((u) => (
              <div
                key={u.email}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {u.first_name} {u.last_name}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500">{u.email}</div>
                  </div>
                  <span className="uppercase font-bold text-[#0e2756] bg-blue-50 px-2.5 py-1 rounded">
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-600">
                    {u.phone_number || 'No phone number'}
                  </span>
                  <select
                    value={u.role}
                    onChange={(e) => {
                      changeUserRole(u.email, e.target.value);
                      showToast(
                        `Updated ${u.email} role to ${e.target.value.toUpperCase()}`,
                        'success',
                        'Role Updated'
                      );
                    }}
                    className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                  >
                    <option value="applicant">applicant</option>
                    <option value="personnel">personnel</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-slate-500">
                    No registered user accounts yet.
                  </td>
                </tr>
              ) : (
                usersList.map((u) => (
                  <tr key={u.email} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">
                        {u.first_name} {u.last_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{u.phone_number || '—'}</td>
                    <td className="py-3.5 px-4 uppercase font-bold text-[#0e2756]">
                      {u.role}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={u.role}
                        onChange={(e) => {
                          changeUserRole(u.email, e.target.value);
                          showToast(
                            `Updated ${u.email} role to ${e.target.value.toUpperCase()}`,
                            'success',
                            'Role Updated'
                          );
                        }}
                        className="border border-slate-300 rounded px-2 py-1 text-xs font-semibold"
                      >
                        <option value="applicant">applicant</option>
                        <option value="personnel">personnel</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC Policy & Role Restrictions Advisory Modal */}
      {rbacModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="RBAC Policy and Role Restrictions Advisory"
          onClick={() => setRbacModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[86vh] flex flex-col border border-slate-200 overflow-hidden animate-fade-in"
          >
            <div className="bg-navy-pattern text-white px-5 py-4 flex items-center justify-between gap-3 flex-shrink-0">
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  RBAC Policy & Role Restrictions Advisory
                </h3>
                <p className="text-[11px] text-blue-100/90 mt-0.5">
                  Official separation-of-duties restrictions across Citizen, Personnel, and Admin roles
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRbacModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="overflow-y-auto flex-1 text-xs divide-y divide-slate-100">
              <div className="hidden sm:flex px-5 py-3 bg-slate-50 border-b border-slate-200 items-center justify-between font-bold text-slate-600">
                <span>System Capability & Access Scope</span>
                <div className="grid grid-cols-3 gap-4 text-center w-72">
                  <span>Citizen</span>
                  <span>Personnel</span>
                  <span>Admin</span>
                </div>
              </div>
              {rbacRows.map((r) => {
                const renderAccessBadge = (allowed, roleLabel) => (
                  <div className="flex sm:justify-center items-center justify-between gap-1.5">
                    <span className="sm:hidden text-[11px] font-semibold text-slate-600">
                      {roleLabel}
                    </span>
                    {allowed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                        <Check className="w-3 h-3 text-emerald-600" /> Allowed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium text-[11px]">
                        <Minus className="w-3 h-3 text-slate-400" /> Restricted
                      </span>
                    )}
                  </div>
                );

                return (
                  <div
                    key={r.title}
                    className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900">{r.title}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 sm:w-72 bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-lg flex-shrink-0">
                      {renderAccessBadge(r.citizen, 'Citizen')}
                      {renderAccessBadge(r.personnel, 'Personnel')}
                      {renderAccessBadge(r.admin, 'Admin')}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
              <span className="text-emerald-800 font-semibold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-700" /> Policy Enforced Across Portal
              </span>
              <button
                type="button"
                onClick={() => setRbacModalOpen(false)}
                className="px-4 py-1.5 bg-[#0e2756] text-white rounded-lg font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add System User"
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs border border-slate-200 animate-fade-in"
          >
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-slate-900">
                  Add System User Account
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Create a new login account with email, password, and assigned role
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    placeholder="0917 555 0144"
                    value={form.phone_number}
                    onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned System Role *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="form-input text-xs"
                >
                  <option value="personnel">Registry Officer (Personnel)</option>
                  <option value="admin">Portal Administrator</option>
                  <option value="applicant">Citizen Applicant</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Repeat password"
                    value={form.confirm_password}
                    onChange={(e) =>
                      setForm({ ...form, confirm_password: e.target.value })
                    }
                    className="form-input text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg font-semibold"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

export function AdminRolesPage() {
  return <AdminUsersPage />;
}

export function AdminServicesPage() {
  const {
    services,
    saveService,
    requirements,
    addRequirement,
    deleteRequirement,
    showToast,
  } = usePortal();
  const [editing, setEditing] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState('birth_cert');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const reqs = requirements[selectedServiceId] || [];

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Civil Registry Services & Requirements Checklists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage civil registry service turnaround days and supporting document checklists in one place. Payment is collected at the counter upon verification and personal appearance.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              id: `srv-${Date.now()}`,
              code: 'NEW-05',
              name: '',
              description: '',
              processing_days: 3,
            })
          }
          className="px-5 py-2.5 bg-[#0e2756] text-white text-xs font-semibold rounded-md flex items-center gap-2 self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {services.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#0e2756] bg-blue-50 px-2 py-0.5 rounded">
                {s.code}
              </span>
              <span className="font-semibold text-slate-700">
                {s.processing_days} Working Days
              </span>
            </div>
            <div className="font-bold text-sm text-slate-900">{s.name}</div>
            <p className="text-[11px] text-slate-500">{s.description}</p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-amber-800 font-semibold">
                Payment at Counter Upon Verification
              </span>
              <button
                type="button"
                onClick={() => setEditing(s)}
                className="px-3 py-1.5 bg-[#0e2756] text-white rounded-lg font-semibold"
              >
                Edit Service
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="py-3.5 px-4">Code</th>
              <th className="py-3.5 px-4">Service Name</th>
              <th className="py-3.5 px-4">Payment Policy</th>
              <th className="py-3.5 px-4">Turnaround</th>
              <th className="py-3.5 px-4 text-right">Edit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {services.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0e2756]">
                  {s.code}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900">{s.name}</div>
                  <div className="text-[11px] text-slate-500">{s.description}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-700 font-medium">
                  At Counter Upon Verification & Appearance
                </td>
                <td className="py-3.5 px-4 text-slate-600">
                  {s.processing_days} Working Days
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => setEditing(s)}
                    className="px-2.5 py-1 border border-slate-300 rounded font-semibold"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Integrated Service Requirements Checklist Editor */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="font-serif font-bold text-base sm:text-lg text-slate-900">
              Supporting Document Checklists per Service
            </h2>
            <p className="text-xs text-slate-500">
              Select a service to view or customize its required and conditional upload items.
            </p>
          </div>
          <select
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
            className="form-input text-xs w-full sm:w-72"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!newName.trim()) return;
            addRequirement(selectedServiceId, {
              id: `req-${Date.now()}`,
              serviceId: selectedServiceId,
              name: newName.trim(),
              description: newDesc.trim() || 'Clear PDF/JPG/PNG scan up to 10 MB',
              is_mandatory: true,
            });
            setNewName('');
            setNewDesc('');
            showToast('Requirement added!', 'success', 'Saved');
          }}
          className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-2.5 text-xs"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New requirement title (e.g. Valid Government ID)"
            className="form-input text-xs flex-1 bg-white"
            required
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description / condition instructions"
            className="form-input text-xs flex-1 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#0e2756] text-white rounded-md font-semibold whitespace-nowrap"
          >
            Add Requirement
          </button>
        </form>

        <div className="space-y-2.5">
          {reqs.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="font-bold text-slate-900">{r.name}</div>
                <div className="text-slate-500 mt-0.5">{r.description}</div>
              </div>
              <button
                type="button"
                onClick={() => deleteRequirement(selectedServiceId, r.id)}
                className="text-rose-600 hover:bg-rose-50 p-2 rounded flex-shrink-0"
                title="Remove requirement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setEditing(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 modal-overlay"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden text-xs animate-fade-in"
          >
            <div className="bg-navy-pattern text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">
                Configure Civil Registry Service
              </h3>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold"
              >
                Close
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveService(editing);
                showToast('Service configuration saved!', 'success', 'Saved');
                setEditing(null);
              }}
              className="p-6 space-y-3"
            >
              <input
                type="text"
                required
                placeholder="Service Code"
                value={editing.code}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                className="form-input text-xs"
              />
              <input
                type="text"
                required
                placeholder="Service Name"
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="form-input text-xs"
              />
              <textarea
                rows="2"
                required
                placeholder="Description"
                value={editing.description}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                className="form-input text-xs"
              />
              <div>
                <label className="block font-semibold mb-1">Turnaround Days</label>
                <input
                  type="number"
                  value={editing.processing_days}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      processing_days: parseInt(e.target.value || 1, 10),
                    })
                  }
                  className="form-input text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg font-semibold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

export function AdminRequirementsPage() {
  const { services, requirements, addRequirement, deleteRequirement, showToast } =
    usePortal();
  const [selectedServiceId, setSelectedServiceId] = useState('birth_cert');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const reqs = requirements[selectedServiceId] || [];

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Service Requirements Checklists
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure mandatory supporting documents (PDF, JPG, PNG up to 10 MB) per service.
          </p>
        </div>
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="form-input text-xs w-full sm:w-72"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!newName.trim()) return;
          addRequirement(selectedServiceId, {
            id: `req-${Date.now()}`,
            serviceId: selectedServiceId,
            name: newName.trim(),
            description: newDesc.trim() || 'Clear PDF/JPG/PNG scan up to 10 MB',
            is_mandatory: true,
          });
          setNewName('');
          setNewDesc('');
          showToast('Requirement added!', 'success', 'Saved');
        }}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 text-xs"
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New requirement title (e.g. Valid Government ID)"
          className="form-input text-xs flex-1"
          required
        />
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Description / instructions"
          className="form-input text-xs flex-1"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-[#0e2756] text-white rounded-md font-semibold whitespace-nowrap"
        >
          Add Requirement
        </button>
      </form>

      <div className="space-y-3">
        {reqs.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between text-xs"
          >
            <div>
              <div className="font-bold text-slate-900">{r.name}</div>
              <div className="text-slate-500 mt-0.5">{r.description}</div>
            </div>
            <button
              type="button"
              onClick={() => deleteRequirement(selectedServiceId, r.id)}
              className="text-rose-600 hover:bg-rose-50 p-2 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}

export function AdminAppointmentsPage() {
  const {
    scheduleConfig,
    saveScheduleConfig,
    getDateAvailabilitySummary,
    showToast,
  } = usePortal();

  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [globalCapacity, setGlobalCapacity] = useState(
    scheduleConfig?.defaultCapacity || 8
  );

  const dateSummary = getDateAvailabilitySummary(selectedDate);
  const currentOverride = scheduleConfig?.dateOverrides?.[selectedDate] || {};
  const isClosedExplicit = Boolean(scheduleConfig?.closedDates?.[selectedDate]);
  const isOpenExplicit = Boolean(scheduleConfig?.openDates?.[selectedDate]);
  const activeWeekdays = scheduleConfig?.operatingWeekdays || [1, 2, 3, 4, 5];
  const globalActiveSlots = scheduleConfig?.activeTimeSlots || TIME_SLOTS;
  const dateActiveSlots = currentOverride.activeTimeSlots || globalActiveSlots;
  const dateCapacity = Number(
    currentOverride.capacity ?? scheduleConfig?.defaultCapacity ?? 8
  );

  const weekdayList = [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
    { day: 6, label: 'Sat' },
    { day: 0, label: 'Sun' },
  ];

  const handleToggleWeekday = async (dayNum) => {
    const exists = activeWeekdays.includes(dayNum);
    const nextWeekdays = exists
      ? activeWeekdays.filter((d) => d !== dayNum)
      : [...activeWeekdays, dayNum].sort();
    await saveScheduleConfig(
      { operatingWeekdays: nextWeekdays },
      `Updated operating weekdays (${nextWeekdays.length} days active)`
    );
    showToast('Operating weekdays updated in real time!', 'success', 'Schedule Updated');
  };

  const handleSaveGlobalCapacity = async () => {
    const cap = Math.max(1, Number(globalCapacity || 8));
    await saveScheduleConfig(
      { defaultCapacity: cap },
      `Set default slot capacity to ${cap} citizens per 30-min slot`
    );
    showToast(
      `Default slot capacity set to ${cap} citizens per time slot!`,
      'success',
      'Capacity Updated'
    );
  };

  const handleToggleDateOpenClosed = async (makeOpen) => {
    const nextClosed = { ...(scheduleConfig?.closedDates || {}) };
    const nextOpen = { ...(scheduleConfig?.openDates || {}) };

    if (makeOpen) {
      delete nextClosed[selectedDate];
      nextOpen[selectedDate] = 'Opened by Administrator';
    } else {
      delete nextOpen[selectedDate];
      nextClosed[selectedDate] = 'Closed by Administrator';
    }

    await saveScheduleConfig(
      { closedDates: nextClosed, openDates: nextOpen },
      `Marked date ${selectedDate} as ${makeOpen ? 'OPEN' : 'CLOSED'}`
    );
    showToast(
      `${selectedDate} is now ${makeOpen ? 'Open for Citizen Booking' : 'Closed'}!`,
      'success',
      'Date Availability Updated'
    );
  };

  const handleDateCapacityChange = async (newCapValue) => {
    const cap = Math.max(1, Number(newCapValue || 1));
    const nextOverrides = {
      ...(scheduleConfig?.dateOverrides || {}),
      [selectedDate]: {
        ...currentOverride,
        capacity: cap,
      },
    };
    await saveScheduleConfig(
      { dateOverrides: nextOverrides },
      `Set slot capacity on ${selectedDate} to ${cap} citizens`
    );
    showToast(
      `Max citizen capacity for ${selectedDate} updated to ${cap} per slot!`,
      'success',
      'Date Capacity Saved'
    );
  };

  const handleToggleSlotForDate = async (slotLabel) => {
    const exists = dateActiveSlots.includes(slotLabel);
    const nextSlots = exists
      ? dateActiveSlots.filter((s) => s !== slotLabel)
      : TIME_SLOTS.filter((s) => [...dateActiveSlots, slotLabel].includes(s));

    const nextOverrides = {
      ...(scheduleConfig?.dateOverrides || {}),
      [selectedDate]: {
        ...currentOverride,
        activeTimeSlots: nextSlots,
      },
    };
    await saveScheduleConfig(
      { dateOverrides: nextOverrides },
      `Updated active time slots for ${selectedDate} (${nextSlots.length} active)`
    );
  };

  const handlePerSlotCapacityChange = async (slotLabel, newCap) => {
    const cap = Math.max(1, Number(newCap || 1));
    const nextSlotCaps = {
      ...(currentOverride.slotCapacities || {}),
      [slotLabel]: cap,
    };
    const nextOverrides = {
      ...(scheduleConfig?.dateOverrides || {}),
      [selectedDate]: {
        ...currentOverride,
        slotCapacities: nextSlotCaps,
      },
    };
    await saveScheduleConfig(
      { dateOverrides: nextOverrides },
      `Set capacity for ${selectedDate} (${slotLabel}) to ${cap} citizens`
    );
  };

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Visual Appointment Calendar & Capacity Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure operating days, open or close specific calendar dates, toggle 30-minute time slots, and set maximum citizen capacity per slot in real time.
          </p>
        </div>
      </div>

      {/* Global Operating Days & Default Capacity Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-sm text-slate-900">
                1. Weekly Operating Days
              </h2>
              <p className="text-[11px] text-slate-500">
                Tap a day of the week to enable or disable regular citizen bookings
              </p>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekdayList.map((w) => {
              const active = activeWeekdays.includes(w.day);
              return (
                <button
                  key={w.day}
                  type="button"
                  onClick={() => handleToggleWeekday(w.day)}
                  className={`py-2.5 rounded-lg font-bold border transition-all ${
                    active
                      ? 'bg-[#0e2756] text-white border-[#0e2756] shadow-2xs'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <h2 className="font-serif font-bold text-sm text-slate-900">
              2. Default Maximum Citizen Capacity per Slot
            </h2>
            <p className="text-[11px] text-slate-500">
              Applies to all 30-minute time slots unless overridden on a specific date
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="number"
              min={1}
              max={50}
              value={globalCapacity}
              onChange={(e) => setGlobalCapacity(e.target.value)}
              className="form-input text-xs w-28 tabular-nums"
            />
            <button
              type="button"
              onClick={handleSaveGlobalCapacity}
              className="px-4 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg font-semibold whitespace-nowrap"
            >
              Apply Default Capacity
            </button>
          </div>
        </div>
      </div>

      {/* Main Split View: Visual Calendar (Left 7 Cols) + Selected Date Slot & Capacity Editor (Right 5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <VisualAppointmentCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            mode="admin"
            showTimeSlotPicker={false}
          />
        </div>

        {/* Right Panel: Selected Date Controls */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5 text-xs">
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0e2756]">
                Selected Calendar Date
              </div>
              <h3 className="font-serif font-bold text-lg text-slate-900 mt-0.5">
                {formatDate(selectedDate)} ({selectedDate})
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dateSummary.totalAvailable} open of {dateSummary.totalCapacity} total capacity ({dateSummary.totalBooked} booked)
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                dateSummary.isOpen
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              {dateSummary.isOpen ? 'Date Open' : 'Date Closed'}
            </span>
          </div>

          {/* Open / Close This Specific Date */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              Date Availability Override
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleDateOpenClosed(true)}
                className={`py-2.5 px-3 rounded-lg font-bold border transition-all ${
                  dateSummary.isOpen
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Open This Date
              </button>
              <button
                type="button"
                onClick={() => handleToggleDateOpenClosed(false)}
                className={`py-2.5 px-3 rounded-lg font-bold border transition-all ${
                  !dateSummary.isOpen
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Close / Holiday
              </button>
            </div>
            {(isClosedExplicit || isOpenExplicit) && (
              <p className="text-[11px] text-slate-500">
                Custom override active for {selectedDate}.
              </p>
            )}
          </div>

          {/* Per-Date Default Capacity */}
          {dateSummary.isOpen && (
            <>
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="block font-bold text-slate-800">
                  Max Citizens per Slot on {selectedDate}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={dateCapacity}
                    onChange={(e) => handleDateCapacityChange(e.target.value)}
                    className="form-input text-xs w-28 tabular-nums"
                  />
                  <span className="text-[11px] text-slate-500">
                    citizens per 30-min slot on this date
                  </span>
                </div>
              </div>

              {/* Time Slots Toggle & Per-Slot Capacity List */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">
                    Active Time Slots & Per-Slot Capacity
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {dateActiveSlots.length} of {TIME_SLOTS.length} enabled
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                  {TIME_SLOTS.map((slotLabel) => {
                    const isEnabled = dateActiveSlots.includes(slotLabel);
                    const slotInfo = dateSummary.slots.find(
                      (s) => s.timeSlot === slotLabel
                    );
                    const slotCap =
                      currentOverride.slotCapacities?.[slotLabel] ?? dateCapacity;
                    const booked = slotInfo?.bookedCount || 0;

                    return (
                      <div
                        key={slotLabel}
                        className={`p-2.5 flex items-center justify-between gap-2 ${
                          isEnabled ? 'bg-white' : 'bg-slate-50 opacity-60'
                        }`}
                      >
                        <label className="flex items-center gap-2 cursor-pointer min-w-0">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleSlotForDate(slotLabel)}
                            className="rounded text-[#0e2756]"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {slotLabel}
                            </div>
                            <div className="text-[10px] text-slate-500 tabular-nums">
                              {booked} booked •{' '}
                              {isEnabled
                                ? `${Math.max(0, slotCap - booked)} available`
                                : 'Disabled'}
                            </div>
                          </div>
                        </label>

                        {isEnabled && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="text-[10px] text-slate-500">Max:</span>
                            <input
                              type="number"
                              min={1}
                              max={50}
                              value={slotCap}
                              onChange={(e) =>
                                handlePerSlotCapacityChange(slotLabel, e.target.value)
                              }
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-center tabular-nums"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}

export function AdminReportsPage() {
  const { auditLogs, showToast } = usePortal();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = auditLogs.filter((l) => {
    const matchType = typeFilter === 'all' || l.targetType === typeFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (l.targetId || '').toLowerCase().includes(q) ||
      (l.actorName || '').toLowerCase().includes(q) ||
      (l.action || '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const handleExportCsv = () => {
    let csv =
      'data:text/csv;charset=utf-8,Timestamp,Actor,Role,Action,TargetType,TargetId,Summary\n';
    filtered.forEach((r) => {
      csv += `"${r.timestamp}","${r.actorName}","${r.role}","${r.action}","${r.targetType}","${r.targetId}","${(r.summary || '').replace(/"/g, '""')}"\n`;
    });
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `Civil_Registry_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Audit trail exported to CSV!', 'success', 'CSV Exported');
  };

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            System Security Audit Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Append-only activity log recording every document submission, personnel review, and appointment update.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          className="px-5 py-2.5 bg-[#0e2756] text-white text-xs font-semibold rounded-md flex items-center gap-2 self-start"
        >
          <Download className="w-4 h-4" /> Export Audit Trail (CSV)
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by reference ID, actor, or action..."
            className="form-input form-input-icon text-xs"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="form-input text-xs w-full sm:w-60"
        >
          <option value="all">All Target Types</option>
          <option value="application">Applications</option>
          <option value="appointment">Appointments</option>
          <option value="user">Users & RBAC</option>
        </select>
      </div>

      {/* Mobile Audit Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400">
            No audit log records yet.
          </div>
        ) : (
          filtered.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-[#0e2756] border border-blue-200">
                  {log.action}
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{log.actorName}</span>
                <span className="font-mono font-bold text-slate-700">{log.targetId}</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{log.summary}</p>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 uppercase">
            Immutable Security Audit Stream
          </span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Read-Only Audit Record
          </span>
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor & Role</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target ID</th>
              <th className="py-3 px-4">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                  {formatDate(log.timestamp)}
                </td>
                <td className="py-3 px-4 font-sans">
                  <div className="font-bold text-slate-900">{log.actorName}</div>
                  <div className="text-[10px] uppercase text-slate-400">{log.role}</div>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0e2756] border border-blue-200">
                    {log.action}
                  </span>
                </td>
                <td className="py-3 px-4 font-bold text-slate-800">{log.targetId}</td>
                <td className="py-3 px-4 font-sans text-slate-600">{log.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
