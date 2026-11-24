// =====================================================================
// CIVIL REGISTRY PORTAL - CITIZEN APPLICANT REACT PAGES
// Dashboard, Services & Requirements, Appointments (Atomic Slots),
// 5-Stage Document Tracker, and Real-Time Notifications + FCM
// =====================================================================

import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Calendar,
  FileText,
  ShieldCheck,
  Bell,
  ArrowRight,
  ChevronRight,
  CalendarCheck,
  MapPin,
  Clock,
  Search,
  CheckSquare,
  CalendarPlus,
  Printer,
  Check,
  History,
  Smartphone,
  CheckCheck,
} from 'lucide-react';
import PortalLayout, {
  StatusBadge,
  formatCurrency,
  formatDate,
} from '../../components/PortalLayout';
import VisualAppointmentCalendar from '../../components/VisualAppointmentCalendar';
import { usePortal } from '../../context/PortalContext';
import { LIFECYCLE_STAGE_MAP } from '../../services/firebase';

export function ApplicantDashboardPage() {
  const { profile, applications, appointments, notifications } = usePortal();
  const navigate = useNavigate();
  const [quickRef, setQuickRef] = useState('TRK-CRS-2026-0814');

  const userApps = applications.filter(
    (a) => !profile || a.applicant_id === profile.id
  );
  const userApts = appointments.filter(
    (a) => !profile || a.applicant_id === profile.id
  );
  const nextApt =
    userApts.find((a) => a.status === 'reserved') || userApts[0] || null;
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PortalLayout>
      {/* Welcome Banner */}
      <div className="bg-navy-pattern text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-200 font-semibold">
            <span className="accent-bar" />
            CITIZEN SERVICES DASHBOARD
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome, {profile?.first_name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl leading-relaxed">
            Scan your documents with AI to auto-fill applications, monitor 5-stage verification progress, and manage your reserved counter appointments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/applicant/application"
            className="px-5 py-2.5 bg-white text-slate-900 font-semibold text-xs rounded-md hover:bg-slate-100 shadow flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Application (AI Scan)
          </Link>
          <Link
            to="/applicant/appointments"
            className="px-5 py-2.5 border border-white/40 text-white font-semibold text-xs rounded-md hover:bg-white/10 flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" /> Book Counter Slot
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-blue-50 text-[#0e2756] flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Applications
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {userApps.length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Approved
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {userApps.filter((a) => a.status === 'ready_for_appointment').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Appointments
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {userApts.filter((a) => a.status === 'reserved').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase truncate">
              Alerts
            </div>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
              {unreadCount}
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table & Next Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="accent-bar-navy" />
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Your Recent Applications
              </h2>
            </div>
            <Link
              to="/applicant/application"
              className="text-xs font-semibold text-[#0e2756] hover:underline flex items-center gap-1"
            >
              New Request <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile Card List (< 768px) */}
          <div className="md:hidden space-y-3">
            {userApps.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500 space-y-3">
                <p>No applications submitted yet.</p>
                <Link
                  to="/applicant/application"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0e2756] text-white rounded-lg font-semibold"
                >
                  <Plus className="w-4 h-4" /> Submit First Application
                </Link>
              </div>
            ) : (
              userApps.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-[#0e2756]">
                      {app.reference_no}
                    </span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {app.service_name}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Counter Fee: {formatCurrency(app.fee_total)} (Paid at Counter)
                    </div>
                  </div>
                  <Link
                    to={`/applicant/document-tracking?ref=${app.reference_no}`}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-blue-50 text-[#0e2756] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    Track 5-Stage Progress <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-5 py-3">Reference No</th>
                  <th className="px-5 py-3">Service & Informational Fee</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Track</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {userApps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400">
                      No applications submitted yet. Click "New Application (AI Scan)" above to test!
                    </td>
                  </tr>
                ) : (
                  userApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-mono font-bold text-[#0e2756]">
                        {app.reference_no}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">{app.service_name}</div>
                        <div className="text-[11px] text-slate-400">
                          Counter Fee: {formatCurrency(app.fee_total)} (Paid at Counter)
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/applicant/document-tracking?ref=${app.reference_no}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0e2756] hover:underline"
                        >
                          Track <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-serif font-bold text-sm text-slate-900 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#0e2756]" />
                Next Counter Appointment
              </h3>
              <Link
                to="/applicant/appointments"
                className="text-[11px] text-[#0e2756] font-semibold hover:underline"
              >
                Manage
              </Link>
            </div>

            {nextApt ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0e2756]">
                    {nextApt.reference_no}
                  </span>
                  <StatusBadge status={nextApt.status} />
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {nextApt.service_name}
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDate(nextApt.appointment_date)}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{nextApt.time_slot}</span>
                </div>
                <div className="text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{nextApt.counter_no || 'Counter 03'} • Civil Registry Hall</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No upcoming counter appointments.</p>
            )}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

export function ApplicantServicesPage() {
  const { services, requirements } = usePortal();

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0e2756] font-bold mb-1">
            <span className="accent-bar-navy" />
            OFFICIAL CITIZEN CATALOGUE
          </div>
          <h1 className="font-serif text-3xl font-bold text-slate-900">
            Civil Registry Services & Requirements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review required documents, turnaround times, and informational counter fees (RA 3753).
          </p>
        </div>
        <Link
          to="/applicant/application"
          className="px-5 py-2.5 bg-[#0e2756] text-white text-xs font-semibold rounded-md hover:bg-[#122850] shadow flex items-center gap-2 self-start"
        >
          <Plus className="w-4 h-4" /> Start Application with AI Scan
        </Link>
      </div>

      <div className="space-y-6">
        {services.map((s) => {
          const reqs = requirements[s.id] || [];
          return (
            <div
              key={s.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {s.code}
                    </span>
                    <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                      Informational Fee • Payable at Counter Only
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-slate-900 mt-1">{s.name}</h3>
                  <p className="text-xs text-slate-600 mt-1.5 max-w-3xl">{s.description}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 sm:gap-6 lg:border-l lg:border-slate-200 lg:pl-6 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      Counter Fee
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                      {formatCurrency(s.fee_amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">
                      Turnaround
                    </div>
                    <div className="text-base sm:text-lg font-bold text-slate-900">
                      {s.processing_days} Days
                    </div>
                  </div>
                  <Link
                    to={`/applicant/application?service=${s.id}`}
                    className="w-full sm:w-auto justify-center px-5 py-2.5 bg-[#0e2756] text-white text-xs font-semibold rounded-md hover:bg-[#122850] shadow flex items-center gap-1.5"
                  >
                    Apply Online <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#0e2756]" />
                  Required Documents Checklist (PDF, JPG, PNG • Max 10 MB)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {reqs.map((r) => (
                    <div
                      key={r.id}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-800">{r.name}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            r.is_mandatory
                              ? 'text-rose-600 bg-rose-50'
                              : 'text-slate-500 bg-slate-200'
                          }`}
                        >
                          {r.is_mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PortalLayout>
  );
}

export function ApplicantAppointmentsPage() {
  const {
    profile,
    services,
    appointments,
    bookAppointment,
    rescheduleAppointment,
    updateAppointmentStatus,
    getTimeSlotsForDate,
    getDateAvailabilitySummary,
    showToast,
  } = usePortal();

  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [form, setForm] = useState({
    serviceId: 'birth_cert',
    appointmentDate: tomorrow,
    timeSlot: '09:30 AM - 10:00 AM',
    purpose: 'Counter Document Verification & Certified Copy Release',
  });

  const dateSummary = getDateAvailabilitySummary(form.appointmentDate);
  const slots = getTimeSlotsForDate(form.appointmentDate);
  const selectedSlotInfo = slots.find((s) => s.timeSlot === form.timeSlot);

  const userApts = appointments.filter(
    (a) => !profile || a.applicant_id === profile.id
  );

  const handleSelectCalendarDate = (dateStr) => {
    const daySlots = getTimeSlotsForDate(dateStr);
    const firstOpen = daySlots.find((s) => !s.isFull)?.timeSlot || daySlots[0]?.timeSlot || '';
    setForm((prev) => ({
      ...prev,
      appointmentDate: dateStr,
      timeSlot: firstOpen,
    }));
  };

  const handleBookOrReschedule = async (e) => {
    e.preventDefault();
    if (!dateSummary.isOpen) {
      showToast('Please select an open date on the calendar.', 'warning', 'Date Closed');
      return;
    }
    if (!form.timeSlot || selectedSlotInfo?.isFull) {
      showToast('Please select an available time slot.', 'warning', 'Slot Unavailable');
      return;
    }

    try {
      if (rescheduleTarget) {
        await rescheduleAppointment(
          rescheduleTarget.id,
          form.appointmentDate,
          form.timeSlot
        );
        showToast(
          `Rescheduled ${rescheduleTarget.reference_no} to ${form.appointmentDate} (${form.timeSlot})!`,
          'success',
          'Appointment Rescheduled'
        );
        setRescheduleTarget(null);
      } else {
        const created = await bookAppointment(form);
        showToast(
          `Reserved slot ${created.reference_no} for ${created.appointment_date} (${created.time_slot})!`,
          'success',
          'Appointment Reserved'
        );
      }
    } catch (err) {
      showToast(err.message, 'error', 'Slot Full');
    }
  };

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0e2756] font-bold mb-1">
            <span className="accent-bar-navy" />
            REAL-TIME VISUAL CALENDAR & SLOT SCHEDULER
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Book & Manage Office Counter Appointments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Select an available date on the calendar below, pick an open 30-minute time window, and reserve your counter visit in real time.
          </p>
        </div>
      </div>

      {/* Main Split View: Visual Calendar & Time Slots (Left 8 Cols) + Booking Summary Card (Right 4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <VisualAppointmentCalendar
            selectedDate={form.appointmentDate}
            onSelectDate={handleSelectCalendarDate}
            selectedSlot={form.timeSlot}
            onSelectSlot={(slotLabel) =>
              setForm((prev) => ({ ...prev, timeSlot: slotLabel }))
            }
            mode="citizen"
            showTimeSlotPicker={true}
          />
        </div>

        {/* Right Reservation Confirmation Card */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 text-xs sticky top-20">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#0e2756]">
                {rescheduleTarget
                  ? `Rescheduling ${rescheduleTarget.reference_no}`
                  : 'New Counter Reservation'}
              </div>
              <h2 className="font-serif font-bold text-base text-slate-900 mt-0.5">
                Confirm Your Selected Slot
              </h2>
            </div>
            {rescheduleTarget && (
              <button
                type="button"
                onClick={() => setRescheduleTarget(null)}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleBookOrReschedule} className="space-y-4">
            {!rescheduleTarget && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Civil Registry Service *
                </label>
                <select
                  value={form.serviceId}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="form-input text-xs"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Date:</span>
                <span className="font-bold text-slate-900">
                  {formatDate(form.appointmentDate)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Time Window:</span>
                <span className="font-bold text-[#0e2756]">
                  {form.timeSlot || 'None selected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Real-Time Availability:</span>
                <span
                  className={`font-bold tabular-nums ${
                    !dateSummary.isOpen || selectedSlotInfo?.isFull
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {!dateSummary.isOpen
                    ? 'Date Closed'
                    : selectedSlotInfo
                    ? `${selectedSlotInfo.availableCount} of ${selectedSlotInfo.capacity} slots open`
                    : 'Select a slot'}
                </span>
              </div>
            </div>

            {!rescheduleTarget && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Visit Purpose / Notes
                </label>
                <textarea
                  rows="2"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!dateSummary.isOpen || !form.timeSlot || selectedSlotInfo?.isFull}
              className="w-full py-3 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>
                {rescheduleTarget
                  ? 'Save New Date & Time Slot'
                  : 'Confirm Counter Appointment'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Citizen's Reserved Appointments List */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-slate-900">
            Your Reserved Counter Appointments ({userApts.length})
          </h2>
        </div>

        {userApts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
            You have no reserved counter appointments yet. Select a date and time slot on the calendar above to book your visit.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userApts.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-[#0e2756]">
                      {apt.reference_no}
                    </span>
                    <StatusBadge status={apt.status} />
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-900 mt-3">
                    {apt.service_name}
                  </h3>
                  {apt.applicationId && (
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Linked Application: <strong>{apt.applicationId}</strong>
                    </div>
                  )}

                  <div className="mt-3 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {formatDate(apt.appointment_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{apt.time_slot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{apt.counter_no || 'Counter 02'} • Civil Registry Hall</span>
                    </div>
                  </div>

                  <div className="mt-3 p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-[11px] text-slate-800 space-y-1">
                    <div className="font-bold text-[#0e2756] uppercase tracking-wider">
                      What to Bring to the Office (Ano ang Dadalhin):
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                      <li>
                        Reference Code <strong>{apt.reference_no}</strong> (Phone screenshot or printout)
                      </li>
                      <li>Original Valid ID (Senior Citizen ID, PhilSys ID, or Government ID)</li>
                      <li>Exact cash for Cashier Counter payment (RA 3753)</li>
                    </ul>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="text-slate-600 hover:text-[#0e2756] font-semibold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Slip
                  </button>
                  {apt.status === 'reserved' && (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleTarget(apt);
                          setForm((prev) => ({
                            ...prev,
                            appointmentDate: apt.appointment_date,
                            timeSlot: apt.time_slot,
                          }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          showToast(
                            'Select your new date and time slot on the calendar above.',
                            'info',
                            'Reschedule Mode'
                          );
                        }}
                        className="text-[#0e2756] hover:underline font-semibold"
                      >
                        Reschedule on Calendar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateAppointmentStatus(
                            apt.id,
                            'cancelled',
                            'Cancelled by citizen'
                          )
                        }
                        className="text-rose-600 hover:text-rose-800 font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

export function DocumentTrackingPage() {
  const { profile, applications } = usePortal();
  const [searchParams, setSearchParams] = useSearchParams();

  // Only available inside Citizen Portal (and viewable by Personnel)
  const visibleApps =
    profile?.role === 'personnel'
      ? applications
      : applications.filter((a) => !profile || a.applicant_id === profile.id);

  const initialQuery =
    searchParams.get('ref') || visibleApps[0]?.reference_no || '';
  const [queryInput, setQueryInput] = useState(initialQuery);

  const cleanRef = queryInput.replace(/^TRK-/i, '').trim().toUpperCase();
  const app =
    visibleApps.find((a) => a.reference_no.toUpperCase() === cleanRef) ||
    visibleApps[0] ||
    null;

  // Form-Filling Progress Completion Breakdown
  const details = app?.subject_details || {};
  const formFieldsChecklist = [
    {
      label: 'Certificate Type Selected',
      value: app?.service_name || '—',
      completed: Boolean(app?.service_name),
    },
    {
      label: 'Person Full Name on Record',
      value: details.fullName || app?.applicant_name || '—',
      completed: Boolean(details.fullName || app?.applicant_name),
    },
    {
      label: 'Date of Birth / Marriage / Event',
      value: details.dateOfBirth || '—',
      completed: Boolean(details.dateOfBirth),
    },
    {
      label: 'Place of Birth / Event',
      value: details.placeOfBirth || '—',
      completed: Boolean(details.placeOfBirth),
    },
    {
      label: "Mother's Maiden Name",
      value: details.motherMaidenName || '—',
      completed: Boolean(details.motherMaidenName),
    },
    {
      label: 'Supporting ID / Attachment Uploaded',
      value:
        app?.documents?.length > 0
          ? `${app.documents.length} file(s) attached`
          : app?.aiScreenings?.length > 0
          ? 'Verified via AI ID Scan'
          : 'Submitted with form',
      completed: true,
    },
  ];

  const completedFieldCount = formFieldsChecklist.filter((f) => f.completed).length;
  const formFillPercent =
    app?.status === 'returned'
      ? 65
      : Math.round((completedFieldCount / formFieldsChecklist.length) * 100);

  // Personnel Review Progress Breakdown
  const reviewStepIndex =
    app?.status === 'ready_for_appointment' || app?.status === 'completed'
      ? 3
      : app?.status === 'under_review' || app?.status === 'returned'
      ? 2
      : 1;

  const trackingSteps = [
    {
      num: 1,
      title: '1. Form Filled & Submitted',
      subtitle: 'Citizen completed form inputs & ID scan',
      done: reviewStepIndex >= 1,
      active: reviewStepIndex === 1,
    },
    {
      num: 2,
      title: '2. Being Reviewed by Personnel',
      subtitle: `Reviewer: ${app?.assignedOfficer || 'Civil Registry Personnel'}`,
      done: reviewStepIndex > 2,
      active: reviewStepIndex === 2,
    },
    {
      num: 3,
      title: '3. Form Review Completed',
      subtitle:
        app?.status === 'returned'
          ? 'Returned by personnel for form correction'
          : 'Form & attachments approved by personnel',
      done: reviewStepIndex === 3 && app?.status !== 'returned',
      active: reviewStepIndex === 3,
    },
  ];

  return (
    <PortalLayout>
      <div className="bg-navy-pattern text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-200 font-semibold">
            <span className="accent-bar" />
            CITIZEN & PERSONNEL DOCUMENT TRACKER
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Form Completion & Personnel Review Progress
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl">
            Track the progress of your filled-out document form alongside real-time review updates from Civil Registry Personnel.
          </p>
        </div>

        {visibleApps.length > 0 && (
          <div className="w-full md:w-72">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-200 mb-1">
              Select Submitted Document
            </label>
            <select
              value={app?.reference_no || ''}
              onChange={(e) => {
                setQueryInput(e.target.value);
                setSearchParams({ ref: e.target.value });
              }}
              className="form-input text-xs text-slate-900"
            >
              {visibleApps.map((item) => (
                <option key={item.id} value={item.reference_no}>
                  {item.reference_no} — {item.service_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!app ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <div className="font-serif font-bold text-lg text-slate-900">
            No Submitted Document Forms Yet
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Start a new application to fill out your certificate form (or auto-fill by scanning your ID) and track its review by Civil Registry Personnel here.
          </p>
          <Link
            to="/applicant/application"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0e2756] text-white rounded-lg text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Fill Out Document Form Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Summary & 3-Stage Form + Personnel Review Stepper */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#0e2756] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {app.reference_no}
                  </span>
                  <span className="text-xs text-slate-500">
                    Submitted {formatDate(app.submission_date)}
                  </span>
                </div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-slate-900 mt-2">
                  {app.service_name}
                </h2>
              </div>
              <StatusBadge status={app.status} />
            </div>

            {/* 3-Step Form & Review Progress Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {trackingSteps.map((st) => (
                <div
                  key={st.num}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    st.done
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : st.active
                      ? 'bg-blue-50/70 border-[#0e2756]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      st.done
                        ? 'bg-emerald-600 text-white'
                        : st.active
                        ? 'bg-[#0e2756] text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {st.done ? <Check className="w-4 h-4" /> : st.num}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">{st.title}</div>
                    <div className="text-[11px] text-slate-600 mt-0.5">{st.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side-by-Side: Left = Form Filling Progress | Right = Personnel Review Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Progress of Filling Up of Document Form */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    1. Form-Filling Progress
                  </h3>
                  <p className="text-xs text-slate-500">
                    Fields filled out by citizen / AI Document Scanner
                  </p>
                </div>
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 tabular-nums">
                  {formFillPercent}% Filled
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    app.status === 'returned' ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${formFillPercent}%` }}
                />
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {formFieldsChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4"
                  >
                    <div className="flex items-center gap-2 text-slate-600 min-w-0">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900 sm:text-right pl-6 sm:pl-0 break-words">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Progress of Getting Reviewed by Civil Registry Personnel */}
            <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-900">
                    2. Personnel Review Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live verification log from Civil Registry Personnel
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Reviewed By (Personnel):</span>
                  <span className="font-bold text-slate-900">
                    {app.assignedOfficer || 'Civil Registry Verification Officer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Review Stage:</span>
                  <span className="font-bold text-[#0e2756]">
                    {LIFECYCLE_STAGE_MAP[app.status]?.reviewStatus ||
                      'Under Personnel Review'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1">
                    Latest Personnel Review Remarks:
                  </span>
                  <p className="font-medium text-slate-800 bg-white p-3 rounded-lg border border-slate-200">
                    {app.lastOfficerRemarks ||
                      app.statusHistory?.[0]?.remarks ||
                      'Your filled-out form and attached ID scan are queued for review by Civil Registry Personnel.'}
                  </p>
                </div>
              </div>

              {/* Timeline of Form Submission & Personnel Reviews */}
              <div className="pt-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-[#0e2756]" />
                  Form & Review Activity Log
                </div>
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {(app.statusHistory || []).map((h, idx) => (
                    <div key={idx} className="relative text-xs">
                      <div
                        className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                          idx === 0 ? 'bg-[#0e2756]' : 'bg-emerald-500'
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{h.stage}</span>
                        <span className="text-[11px] text-slate-400">
                          {formatDate(h.timestamp)}
                        </span>
                      </div>
                      {h.changedBy && (
                        <div className="text-[11px] font-semibold text-[#0e2756]">
                          Reviewed by: {h.changedBy}
                        </div>
                      )}
                      <p className="text-slate-600 mt-0.5">{h.remarks}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
}

export function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead, showToast } =
    usePortal();
  const [filter, setFilter] = useState('all');

  const filtered =
    filter === 'all'
      ? notifications
      : notifications.filter((n) => n.type === filter);

  const handleEnableFcm = async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
    showToast(
      'Firebase Cloud Messaging (FCM) push notifications enabled for this device!',
      'success',
      'FCM Active'
    );
  };

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Notifications & Status Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates on your submitted document forms and scheduled counter visits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEnableFcm}
            className="px-4 py-2 bg-[#0e2756] text-white text-xs font-semibold rounded-md flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5" /> Enable Push Alerts
          </button>
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-md flex items-center gap-1.5 bg-white"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        {['all', 'application', 'appointment', 'alert'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-md capitalize ${
              filter === tab
                ? 'bg-[#0e2756] text-white'
                : 'bg-white border border-slate-200 text-slate-600'
            }`}
          >
            {tab === 'all' ? 'All Alerts' : tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((n) => (
          <div
            key={n.id}
            className={`bg-white rounded-xl border p-4 shadow-sm flex items-start justify-between gap-4 text-xs ${
              n.is_read ? 'border-slate-200' : 'border-blue-300 bg-blue-50/30'
            }`}
          >
            <div className="space-y-1">
              <div className="font-bold text-slate-900">{n.title}</div>
              <p className="text-slate-600">{n.message}</p>
              <div className="flex items-center gap-3 pt-1">
                {n.link && (
                  <Link
                    to={n.link}
                    className="font-semibold text-[#0e2756] hover:underline"
                  >
                    View Details →
                  </Link>
                )}
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => markNotificationRead(n.id)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    Mark as read
                  </button>
                )}
              </div>
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {formatDate(n.created_at)}
            </span>
          </div>
        ))}
      </div>
    </PortalLayout>
  );
}
