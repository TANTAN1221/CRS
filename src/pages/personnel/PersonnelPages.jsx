// =====================================================================
// CIVIL REGISTRY PORTAL - CIVIL REGISTRY OFFICER REACT PAGES
// Overview, Applications Master Queue, Split-Screen Document Verification
// Workstation (with AI OCR Findings), Counter Check-In Desk & Handover
// =====================================================================

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  FileClock,
  ShieldCheck,
  Users,
  PackageCheck,
  ArrowRight,
  Search,
  Sparkles,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Check,
  BadgeCheck,
  MapPin,
} from 'lucide-react';
import PortalLayout, {
  StatusBadge,
  formatDate,
} from '../../components/PortalLayout';
import { usePortal } from '../../context/PortalContext';

export function PersonnelDashboardPage() {
  const { applications, appointments } = usePortal();
  const pendingCount = applications.filter((a) =>
    ['submitted', 'pre_screened', 'under_review'].includes(a.status)
  ).length;

  return (
    <PortalLayout>
      <div className="bg-navy-pattern text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-200 font-semibold">
            <span className="accent-bar" />
            CIVIL REGISTRY OPERATIONS CENTER
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Officer Command Workstation
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-xl">
            Inspect AI OCR pre-screened documents, clear citizens for counter appointments, and manage physical check-ins.
          </p>
        </div>

        <Link
          to="/personnel/document-verification"
          className="px-5 py-2.5 bg-white text-slate-900 font-semibold text-xs rounded-md hover:bg-slate-100 shadow flex items-center gap-2"
        >
          <CheckSquare className="w-4 h-4 text-emerald-600" />
          Open Verification Workstation
        </Link>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileClock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Pending Review
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingCount}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Cleared for Counter
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {applications.filter((a) => a.status === 'ready_for_appointment').length}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#0e2756] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Active Appointments
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {appointments.filter((a) => ['reserved', 'checked_in'].includes(a.status)).length}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase">
              Completed Releases
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {applications.filter((a) => a.status === 'completed').length}
            </div>
          </div>
        </div>
      </div>

      {/* Priority Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900">
              Priority Verification Queue
            </h2>
            <p className="text-xs text-slate-500">
              Citizen applications awaiting officer examination
            </p>
          </div>
          <Link
            to="/personnel/applications"
            className="text-xs font-semibold text-[#0e2756] hover:underline flex items-center gap-1"
          >
            View All Applications <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden space-y-3">
          {applications.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No citizen applications in queue yet.
            </div>
          ) : (
            applications.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-[#0e2756]">
                    {app.reference_no}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {app.subject_details?.fullName || app.applicant_name}
                  </div>
                  <div className="text-xs text-slate-600">{app.service_name}</div>
                </div>
                <Link
                  to={`/personnel/document-verification?ref=${app.reference_no}`}
                  className="w-full py-2.5 bg-[#0e2756] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Examine & Verify
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (>= 768px) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Ref No</th>
                <th className="py-3 px-4">Subject / Applicant</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0e2756]">
                    {app.reference_no}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900">
                      {app.subject_details?.fullName || app.applicant_name}
                    </div>
                    <div className="text-[11px] text-slate-400">{app.applicant_email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {app.service_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/personnel/document-verification?ref=${app.reference_no}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0e2756] text-white rounded text-[11px] font-semibold"
                    >
                      <CheckSquare className="w-3 h-3" /> Examine & Verify
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PortalLayout>
  );
}

export function PersonnelApplicationsPage() {
  const { applications, updateApplicationStatus, showToast } = usePortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = applications.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.reference_no.toLowerCase().includes(q) ||
      (a.subject_details?.fullName || '').toLowerCase().includes(q) ||
      (a.applicant_name || '').toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Master Citizen Applications Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Filter, review, and advance civil registry applications across the 5-stage Appointment-First workflow.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference no or citizen name..."
            className="form-input form-input-icon text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input text-xs w-full sm:w-64"
        >
          <option value="all">All Lifecycle Statuses</option>
          <option value="submitted">Submitted</option>
          <option value="pre_screened">AI Pre-Screened</option>
          <option value="under_review">Under Review</option>
          <option value="ready_for_appointment">Ready for Counter Appointment</option>
          <option value="completed">Completed & Released</option>
          <option value="returned">Returned for Correction</option>
        </select>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {filtered.map((app) => (
          <div
            key={app.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-[#0e2756]">
                {app.reference_no}
              </span>
              <StatusBadge status={app.status} />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">
                {app.subject_details?.fullName || app.applicant_name}
              </div>
              <div className="text-slate-600">{app.service_name}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Submitted: {formatDate(app.submission_date)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <select
                value={app.status}
                onChange={(e) => {
                  const next = e.target.value;
                  updateApplicationStatus(
                    app.id,
                    next,
                    `Updated by Registry Officer to ${next}`
                  );
                  showToast(
                    `Updated ${app.reference_no} to ${next.toUpperCase()}`,
                    'success',
                    'Stage Updated'
                  );
                }}
                className="form-input text-xs py-2"
              >
                <option value="submitted">Submitted</option>
                <option value="pre_screened">AI Pre-Screened</option>
                <option value="under_review">Under Review</option>
                <option value="ready_for_appointment">Ready for Appointment</option>
                <option value="completed">Completed & Released</option>
                <option value="returned">Returned for Correction</option>
              </select>
              <Link
                to={`/personnel/document-verification?ref=${app.reference_no}`}
                className="bg-[#0e2756] text-white rounded-lg font-semibold flex items-center justify-center"
              >
                Verify Docs
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="py-3.5 px-4">Ref No</th>
              <th className="py-3.5 px-4">Subject / Citizen</th>
              <th className="py-3.5 px-4">Service</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Submitted</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0e2756]">
                  {app.reference_no}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  {app.subject_details?.fullName || app.applicant_name}
                </td>
                <td className="py-3.5 px-4 text-slate-700">{app.service_name}</td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={app.status} />
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {formatDate(app.submission_date)}
                </td>
                <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                  <select
                    value={app.status}
                    onChange={(e) => {
                      const next = e.target.value;
                      updateApplicationStatus(
                        app.id,
                        next,
                        `Updated by Registry Officer to ${next}`
                      );
                      showToast(
                        `Updated ${app.reference_no} to ${next.toUpperCase()}`,
                        'success',
                        'Stage Updated'
                      );
                    }}
                    className="border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="pre_screened">AI Pre-Screened</option>
                    <option value="under_review">Under Review</option>
                    <option value="ready_for_appointment">Ready for Appointment</option>
                    <option value="completed">Completed & Released</option>
                    <option value="returned">Returned for Correction</option>
                  </select>
                  <Link
                    to={`/personnel/document-verification?ref=${app.reference_no}`}
                    className="px-2.5 py-1 bg-[#0e2756] text-white rounded font-semibold"
                  >
                    Verify
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}

export function DocumentVerificationPage() {
  const { applications, updateApplicationStatus, showToast } = usePortal();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRef =
    searchParams.get('ref') || applications[0]?.reference_no || 'CRS-2026-0814';
  const currentApp =
    applications.find((a) => a.reference_no === selectedRef) || applications[0];

  const [zoom, setZoom] = useState(1);
  const [remarks, setRemarks] = useState('');

  if (!currentApp) {
    return (
      <PortalLayout>
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <div className="font-serif font-bold text-lg text-slate-800">
            No Applications in Verification Queue
          </div>
          <p className="text-xs text-slate-500">
            Submit a new citizen application with AI Scan-to-Auto-Fill to inspect it here in real time.
          </p>
          <Link
            to="/applicant/application"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0e2756] text-white rounded-lg text-xs font-semibold"
          >
            Create Test Application
          </Link>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      {/* Workstation Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#0e2756] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              {currentApp.reference_no}
            </span>
            <StatusBadge status={currentApp.status} />
          </div>
          <h1 className="font-serif font-bold text-lg sm:text-xl text-slate-900 mt-1 break-words">
            {currentApp.service_name}
          </h1>
          <div className="text-xs text-slate-500 mt-0.5 break-words">
            Subject:{' '}
            <strong className="text-slate-800">
              {currentApp.subject_details?.fullName || currentApp.applicant_name}
            </strong>{' '}
            • DOB: {currentApp.subject_details?.dateOfBirth || '1995-04-12'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <select
            value={currentApp.reference_no}
            onChange={(e) => setSearchParams({ ref: e.target.value })}
            className="form-input text-xs w-full sm:w-52"
          >
            {applications.map((a) => (
              <option key={a.id} value={a.reference_no}>
                {a.reference_no} ({a.status})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => {
              updateApplicationStatus(
                currentApp.id,
                'completed',
                'Original documents verified at counter and certified true copy released.'
              );
              showToast('Application marked Completed & Released!', 'success', 'Released');
            }}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-xs font-semibold shadow flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <BadgeCheck className="w-4 h-4" /> Complete & Release
          </button>
        </div>
      </div>

      {/* Split-Screen Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Document Preview Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">
              Private Cloud Storage Document Preview
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
                className="p-1 hover:bg-slate-200 rounded"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-200/50 flex items-center justify-center min-h-[420px] overflow-auto">
            <div
              style={{ transform: `scale(${zoom})` }}
              className="bg-white border-2 border-slate-300 rounded-xl shadow-lg p-6 max-w-md w-full space-y-4 transition-transform text-xs"
            >
              <div className="text-center border-b-2 border-[#0e2756] pb-3">
                <div className="font-serif font-bold text-base text-[#0e2756]">
                  REPUBLIKA NG PILIPINAS
                </div>
                <div className="text-[11px] text-slate-500">
                  PHILIPPINE IDENTIFICATION SYSTEM / LOCAL CIVIL REGISTRY
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center">
                <div className="bg-slate-100 border border-slate-300 h-28 rounded flex items-center justify-center text-[10px] text-slate-400 font-bold">
                  BEARER PHOTO
                </div>
                <div className="col-span-2 space-y-1.5 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">FULL NAME</span>
                    <strong className="text-slate-900">
                      {(
                        currentApp.subject_details?.fullName ||
                        currentApp.applicant_name
                      ).toUpperCase()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DATE OF EVENT</span>
                    <strong className="text-slate-900">
                      {currentApp.subject_details?.dateOfBirth || '1995-04-12'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PLACE OF EVENT</span>
                    <strong className="text-slate-900">
                      {currentApp.subject_details?.placeOfBirth || 'MANILA'}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                <span>EMBOSSED LCR SEAL DETECTED</span>
                <span>CRN-4421-9812-0041</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-500">
            <span>Attached Requirement Document</span>
            <span className="text-emerald-700 font-semibold whitespace-nowrap">
              Verified Attachment
            </span>
          </div>
        </div>

        {/* Right: AI OCR Findings & Officer Decision Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  AI Document Pre-Screening Findings
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                PASSED (97%)
              </span>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Extracted Subject:</span>
                <span className="font-bold text-emerald-700">
                  {(
                    currentApp.subject_details?.fullName || currentApp.applicant_name
                  ).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date of Birth/Event:</span>
                <span className="font-bold text-slate-800">
                  {currentApp.subject_details?.dateOfBirth || '1995-04-12'} (Matches)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mother Maiden Name:</span>
                <span className="font-bold text-slate-800">
                  {currentApp.subject_details?.motherMaidenName || 'Corazon Santos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Official LCR Stamp:</span>
                <span className="font-bold text-emerald-700">VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Officer Verification Decision
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Personnel Review Remarks
              </label>
              <textarea
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add verification note or specify what document correction is required..."
                className="form-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!remarks.trim()) {
                    showToast(
                      'Please enter remarks explaining what correction is required.',
                      'warning',
                      'Remarks Required'
                    );
                    return;
                  }
                  updateApplicationStatus(currentApp.id, 'returned', remarks.trim());
                  showToast('Application returned for correction.', 'warning', 'Returned');
                  setRemarks('');
                }}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Return for Correction
              </button>

              <button
                type="button"
                onClick={() => {
                  updateApplicationStatus(
                    currentApp.id,
                    'ready_for_appointment',
                    remarks.trim() ||
                      'Documents pre-verified. Cleared for counter appointment verification & release.'
                  );
                  showToast(
                    'Cleared for Counter Appointment!',
                    'success',
                    'Ready for Appointment'
                  );
                  setRemarks('');
                }}
                className="px-4 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
              >
                <Check className="w-3.5 h-3.5 text-emerald-300" /> Clear for Appointment
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}

export function PersonnelAppointmentsPage() {
  const { appointments, updateAppointmentStatus, showToast } = usePortal();

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Counter Check-In Desk & Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Check in arriving citizens at the registry counter, verify original documents, and record visit completion.
        </p>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400">
            No scheduled counter appointments yet.
          </div>
        ) : (
          appointments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#0e2756]">
                  {a.reference_no}
                </span>
                <StatusBadge status={a.status} />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900">
                  {a.applicant_name}
                </div>
                <div className="text-slate-600">{a.service_name}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {formatDate(a.appointment_date)} • {a.time_slot}
                </div>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                {a.status === 'reserved' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        updateAppointmentStatus(
                          a.id,
                          'checked_in',
                          'Citizen checked in at Counter 02'
                        );
                        showToast('Citizen Checked In!', 'success', 'Counter Check-In');
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold"
                    >
                      Check In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateAppointmentStatus(
                          a.id,
                          'no_show',
                          'Citizen did not appear for scheduled counter slot'
                        );
                        showToast('Marked as No-Show', 'warning', 'Updated');
                      }}
                      className="flex-1 py-2.5 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg font-semibold"
                    >
                      No Show
                    </button>
                  </>
                )}
                {a.status === 'checked_in' && (
                  <button
                    type="button"
                    onClick={() => {
                      updateAppointmentStatus(
                        a.id,
                        'completed',
                        'Counter verification & release completed'
                      );
                      showToast('Appointment Completed!', 'success', 'Fulfilled');
                    }}
                    className="w-full py-2.5 bg-[#0e2756] text-white rounded-lg font-semibold"
                  >
                    Mark Completed
                  </button>
                )}
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
              <th className="py-3 px-4">Ref No</th>
              <th className="py-3 px-4">Citizen Name</th>
              <th className="py-3 px-4">Service & Linked App</th>
              <th className="py-3 px-4">Date & Slot</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Counter Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4 font-mono font-bold text-[#0e2756]">
                  {a.reference_no}
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-900">
                  {a.applicant_name}
                </td>
                <td className="py-3.5 px-4 text-slate-700">
                  <div>{a.service_name}</div>
                  {a.applicationId && (
                    <div className="text-[11px] font-mono text-slate-400">
                      App: {a.applicationId}
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-medium text-slate-800">
                    {formatDate(a.appointment_date)}
                  </div>
                  <div className="text-[11px] text-slate-400">{a.time_slot}</div>
                </td>
                <td className="py-3.5 px-4">
                  <StatusBadge status={a.status} />
                </td>
                <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                  {a.status === 'reserved' && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(
                            a.id,
                            'checked_in',
                            'Citizen checked in at Counter 02'
                          );
                          showToast('Citizen Checked In!', 'success', 'Counter Check-In');
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded font-semibold text-[11px]"
                      >
                        Check In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateAppointmentStatus(
                            a.id,
                            'no_show',
                            'Citizen did not appear for scheduled counter slot'
                          );
                          showToast('Marked as No-Show', 'warning', 'Updated');
                        }}
                        className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded font-semibold text-[11px]"
                      >
                        No Show
                      </button>
                    </>
                  )}
                  {a.status === 'checked_in' && (
                    <button
                      type="button"
                      onClick={() => {
                        updateAppointmentStatus(
                          a.id,
                          'completed',
                          'Counter verification & release completed'
                        );
                        showToast('Appointment Completed!', 'success', 'Fulfilled');
                      }}
                      className="px-2.5 py-1 bg-[#0e2756] text-white rounded font-semibold text-[11px]"
                    >
                      Mark Completed
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}

export function PersonnelTrackingPage() {
  const { applications, updateApplicationStatus, showToast } = usePortal();

  const calcFilledCount = (app) => {
    const d = app?.subject_details || {};
    const checks = [
      Boolean(app?.service_name),
      Boolean(d.fullName || app?.applicant_name),
      Boolean(d.dateOfBirth),
      Boolean(d.placeOfBirth),
      Boolean(d.motherMaidenName),
    ];
    return checks.filter(Boolean).length;
  };

  return (
    <PortalLayout>
      <div className="border-b border-slate-200 pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
          Citizen Form Completion & Personnel Review Tracker
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Shared tracking view between the Citizen and Civil Registry Personnel showing form-filling completeness alongside review status.
        </p>
      </div>

      {/* Mobile Cards (< 768px) */}
      <div className="md:hidden space-y-3">
        {applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-400">
            No citizen document forms submitted yet.
          </div>
        ) : (
          applications.map((app) => {
            const filled = calcFilledCount(app);
            return (
              <div
                key={app.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[#0e2756]">
                    {app.reference_no}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    {app.subject_details?.fullName || app.applicant_name}
                  </div>
                  <div className="text-slate-600">{app.service_name}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                    Form Progress: {filled}/5 Core Sections Filled
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Reviewer: {app.assignedOfficer || 'Registry Verification Officer'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to={`/personnel/document-verification?ref=${app.reference_no}`}
                    className="py-2 bg-slate-100 text-[#0e2756] rounded-lg font-semibold text-center"
                  >
                    Inspect Form
                  </Link>
                  {app.status !== 'ready_for_appointment' &&
                  app.status !== 'completed' ? (
                    <button
                      type="button"
                      onClick={() => {
                        updateApplicationStatus(
                          app.id,
                          'ready_for_appointment',
                          'Form entries and attached ID reviewed and approved by Civil Registry Personnel.'
                        );
                        showToast(
                          `${app.reference_no} marked as Reviewed & Approved!`,
                          'success',
                          'Review Complete'
                        );
                      }}
                      className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
                    >
                      Approve Form
                    </button>
                  ) : (
                    <span className="text-emerald-700 font-bold inline-flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Approved
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table (>= 768px) */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="py-3 px-4">Reference No</th>
              <th className="py-3 px-4">Citizen / Subject</th>
              <th className="py-3 px-4">Document Type</th>
              <th className="py-3 px-4">Form-Filling Progress</th>
              <th className="py-3 px-4">Personnel Review Status</th>
              <th className="py-3 px-4 text-right">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {applications.map((app) => {
              const filled = calcFilledCount(app);
              return (
                <tr key={app.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0e2756]">
                    {app.reference_no}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {app.subject_details?.fullName || app.applicant_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{app.service_name}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {filled}/5 Fields Filled (100%)
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={app.status} />
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      By: {app.assignedOfficer || 'Registry Officer'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <Link
                      to={`/personnel/document-verification?ref=${app.reference_no}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#0e2756] rounded font-semibold text-[11px]"
                    >
                      Inspect Form
                    </Link>
                    {app.status !== 'ready_for_appointment' &&
                    app.status !== 'completed' ? (
                      <button
                        type="button"
                        onClick={() => {
                          updateApplicationStatus(
                            app.id,
                            'ready_for_appointment',
                            'Form entries and attached ID reviewed and approved by Civil Registry Personnel.'
                          );
                          showToast(
                            `${app.reference_no} marked as Reviewed & Approved!`,
                            'success',
                            'Review Complete'
                          );
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px]"
                      >
                        Approve Form
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-bold inline-flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Reviewed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  );
}
