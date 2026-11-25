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
  const { applications, appointments, updateApplicationStatus, showToast } = usePortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingCount = applications.filter((a) =>
    ['submitted', 'pre_screened', 'under_review'].includes(a.status)
  ).length;

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
            Inspect uploaded documents, flag items needing applicant correction, clear requests for counter appointments, and manage physical check-ins.
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
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-[#0e2756] flex items-center justify-center">
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

      {/* Unified Searchable Applications Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif font-bold text-lg text-slate-900">
              Citizen Requests & Verification Queue
            </h2>
            <p className="text-xs text-slate-500">
              Search, filter, update stage, or open any application in the verification workstation
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference or name..."
                className="form-input form-input-icon text-xs py-2"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input text-xs py-2 sm:w-52"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Form Submitted</option>
              <option value="pre_screened">Form Pre-Checked</option>
              <option value="under_review">Under Review</option>
              <option value="ready_for_appointment">Reviewed & Approved</option>
              <option value="completed">Verified & Done</option>
              <option value="returned">Needs Correction</option>
            </select>
          </div>
        </div>

        {/* Mobile Cards (< 768px) */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No citizen applications match your filter.
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3 text-xs"
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
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/70">
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
                    className="form-input text-xs py-2 bg-white"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="pre_screened">Pre-Checked</option>
                    <option value="under_review">Under Review</option>
                    <option value="ready_for_appointment">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="returned">Needs Correction</option>
                  </select>
                  <Link
                    to={`/personnel/document-verification?ref=${app.reference_no}`}
                    className="py-2.5 bg-[#0e2756] text-white rounded-lg font-semibold flex items-center justify-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" /> Examine
                  </Link>
                </div>
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
                <th className="py-3 px-4">Submitted</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((app) => (
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
                      className="border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold bg-white"
                    >
                      <option value="submitted">Submitted</option>
                      <option value="pre_screened">Pre-Checked</option>
                      <option value="under_review">Under Review</option>
                      <option value="ready_for_appointment">Approved</option>
                      <option value="completed">Completed</option>
                      <option value="returned">Needs Correction</option>
                    </select>
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
  const {
    applications,
    updateApplicationStatus,
    updateApplicationDocumentReview,
    scanDocumentForAutoFill,
    showToast,
  } = usePortal();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRef =
    searchParams.get('ref') || applications[0]?.reference_no || 'CRS-2026-0814';
  const currentApp =
    applications.find((a) => a.reference_no === selectedRef) || applications[0];

  const [zoom, setZoom] = useState(1);
  const [remarks, setRemarks] = useState('');
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [liveOcrRunning, setLiveOcrRunning] = useState(false);
  const [liveOcrOverrides, setLiveOcrOverrides] = useState({});

  // Reset selected document index when switching applications
  React.useEffect(() => {
    setSelectedDocIndex(0);
    setZoom(1);
  }, [currentApp?.id]);

  if (!currentApp) {
    return (
      <PortalLayout>
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <div className="font-serif font-bold text-lg text-slate-800">
            No Applications in Verification Queue
          </div>
          <p className="text-xs text-slate-500">
            When an applicant submits a service request with uploaded documents, it will appear here in real time for inspection.
          </p>
        </div>
      </PortalLayout>
    );
  }

  const docsList = currentApp.documents || [];
  const activeDoc = docsList[selectedDocIndex] || docsList[0] || null;
  const previewSrc = activeDoc?.downloadUrl || activeDoc?.previewDataUrl || null;
  const isPdfDoc =
    activeDoc?.mimeType?.toLowerCase().includes('pdf') ||
    activeDoc?.fileName?.toLowerCase().endsWith('.pdf') ||
    (typeof previewSrc === 'string' && previewSrc.startsWith('data:application/pdf'));

  // Match the AI OCR comparison finding for the currently selected uploaded document
  const activeDocKey = activeDoc?.id || `idx-${selectedDocIndex}`;
  const activeAiFinding =
    liveOcrOverrides[activeDocKey] ||
    activeDoc?.aiFinding ||
    (currentApp.aiScreenings || []).find(
      (s) =>
        (activeDoc?.requirementName && s.requirementName === activeDoc.requirementName) ||
        (activeDoc?.fileName && s.fileName === activeDoc.fileName)
    ) ||
    (currentApp.aiScreenings || [])[selectedDocIndex] ||
    null;

  const handleRunPersonnelOcrComparison = async () => {
    if (!activeDoc) return;
    setLiveOcrRunning(true);
    try {
      const res = await scanDocumentForAutoFill({
        file: {
          ...activeDoc,
          name: activeDoc.fileName,
          size: activeDoc.fileSizeBytes,
          previewDataUrl: previewSrc,
        },
        requirementName: activeDoc.requirementName || 'Uploaded Document',
        expectedDetails: currentApp.subject_details || {
          fullName: currentApp.applicant_name,
        },
      });
      const findingObj = {
        requirementName: activeDoc.requirementName || activeDoc.fileName,
        status:
          res.readabilityStatus === 'unreadable'
            ? 'unreadable'
            : res.readabilityStatus === 'flagged_for_staff'
            ? 'flagged_for_staff'
            : 'passed',
        readabilityStatus: res.readabilityStatus,
        completenessScore: res.overallScore,
        fileName: activeDoc.fileName,
        summary: res.summary,
        extractedTextSnippet: res.extractedTextSnippet || '',
        comparisonChecks: res.comparisonChecks || [],
      };
      setLiveOcrOverrides((prev) => ({
        ...prev,
        [activeDocKey]: findingObj,
      }));
      showToast(
        `OCR comparison completed for "${activeDoc.requirementName || activeDoc.fileName}". ${res.readabilityStatus === 'verified' ? 'Checks passed.' : 'Staff review required.'}`,
        res.readabilityStatus === 'unreadable' ? 'error' : 'success',
        'OCR Comparison Complete'
      );
    } finally {
      setLiveOcrRunning(false);
    }
  };

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
            Applicant / Subject:{' '}
            <strong className="text-slate-800">
              {currentApp.subject_details?.fullName || currentApp.applicant_name}
            </strong>{' '}
            • Event Date: {currentApp.subject_details?.dateOfBirth || '—'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <select
            value={currentApp.reference_no}
            onChange={(e) => setSearchParams({ ref: e.target.value })}
            className="form-input text-xs w-full sm:w-56"
          >
            {applications.map((a) => (
              <option key={a.id} value={a.reference_no}>
                {a.reference_no} — {a.subject_details?.fullName || a.applicant_name}
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
        {/* Left: Live Client Uploaded Document Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <span className="font-bold text-slate-800 block truncate">
                {activeDoc
                  ? `Viewing (${selectedDocIndex + 1} of ${docsList.length}): ${
                      activeDoc.requirementName || activeDoc.fileName
                    }`
                  : 'Client Uploaded Document Viewer'}
              </span>
              {activeDoc && (
                <span className="text-[11px] font-mono text-slate-500 block truncate">
                  File: {activeDoc.fileName}{' '}
                  {activeDoc.fileSizeBytes
                    ? `(${Math.round(activeDoc.fileSizeBytes / 1024)} KB)`
                    : ''}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 py-1 bg-white border border-slate-300 hover:bg-slate-50 rounded text-[11px] font-semibold"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.0, Number((z + 0.15).toFixed(2))))}
                className="p-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {previewSrc && (
                <a
                  href={previewSrc}
                  download={activeDoc?.fileName || 'uploaded-document'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 bg-[#0e2756] text-white rounded text-[11px] font-semibold hover:bg-[#122850]"
                >
                  Open / Download File
                </a>
              )}
            </div>
          </div>

          {/* Quick Document Switcher Tabs if Client Uploaded Multiple Files */}
          {docsList.length > 1 && (
            <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex flex-wrap gap-1.5">
              {docsList.map((d, idx) => (
                <button
                  key={d.id || idx}
                  type="button"
                  onClick={() => {
                    setSelectedDocIndex(idx);
                    setZoom(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    selectedDocIndex === idx
                      ? 'bg-[#0e2756] text-white border-[#0e2756]'
                      : d.status === 'flagged_by_personnel'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  #{idx + 1}: {(d.requirementName || d.fileName || 'Document').slice(0, 28)}
                </button>
              ))}
            </div>
          )}

          <div className="p-4 sm:p-6 bg-slate-200/60 flex items-center justify-center min-h-[440px] max-h-[640px] overflow-auto">
            {previewSrc ? (
              isPdfDoc ? (
                <iframe
                  src={previewSrc}
                  title={activeDoc?.requirementName || 'Uploaded PDF Document'}
                  className="w-full h-[520px] bg-white rounded-xl border border-slate-300 shadow"
                />
              ) : (
                <div className="overflow-auto flex items-center justify-center w-full">
                  <img
                    src={previewSrc}
                    alt={activeDoc?.requirementName || activeDoc?.fileName || 'Uploaded Document'}
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'top center',
                    }}
                    className="max-w-full max-h-[540px] object-contain rounded-lg shadow-lg border border-slate-300 bg-white transition-transform"
                  />
                </div>
              )
            ) : activeDoc ? (
              /* Fallback Document Sheet when an older or large PDF attachment has metadata only */
              <div
                style={{ transform: `scale(${zoom})` }}
                className="bg-white border-2 border-slate-300 rounded-xl shadow-lg p-6 max-w-md w-full space-y-4 transition-transform text-xs"
              >
                <div className="text-center border-b-2 border-[#0e2756] pb-3">
                  <div className="font-serif font-bold text-base text-[#0e2756]">
                    UPLOADED REQUIREMENT RECORD
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {activeDoc.requirementName || 'Supporting Civil Registry Document'}
                  </div>
                </div>
                <div className="space-y-2 font-mono text-xs bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">ATTACHED FILE NAME</span>
                    <strong className="text-slate-900 break-all">{activeDoc.fileName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">APPLICANT / SUBJECT</span>
                    <strong className="text-slate-900">
                      {currentApp.subject_details?.fullName || currentApp.applicant_name}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DATE & PLACE OF EVENT</span>
                    <strong className="text-slate-900">
                      {currentApp.subject_details?.dateOfBirth || '—'} •{' '}
                      {currentApp.subject_details?.placeOfBirth || '—'}
                    </strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-xs text-slate-500 max-w-sm">
                No uploaded document files attached to this application yet.
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <span>
              {activeDoc
                ? `Requirement: ${activeDoc.requirementName || activeDoc.fileName}`
                : 'Select an uploaded document on the right to inspect it'}
            </span>
            {activeDoc && (
              <div className="flex items-center gap-2">
                {activeDoc.status === 'flagged_by_personnel' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[11px]">
                    Flagged for Applicant Correction
                  </span>
                ) : activeDoc.status === 'verified_by_personnel' ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                    Verified by Personnel
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0e2756] border border-blue-200 font-bold text-[11px]">
                    Uploaded by Applicant
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Uploaded Documents List, Flagging & Officer Decision Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#0e2756]" />
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  Client Uploaded Documents ({docsList.length})
                </h3>
              </div>
              <span className="text-[11px] font-bold text-[#0e2756] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Tap a file to view on left
              </span>
            </div>

            {/* List of Applicant's Uploaded Documents with View, Verify, and Flag Actions */}
            <div className="space-y-2.5 text-xs">
              {docsList.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
                  No uploaded document attachments found on this request.
                </div>
              ) : (
                docsList.map((docItem, idx) => {
                  const isSelected = selectedDocIndex === idx;
                  const isFlagged = docItem.status === 'flagged_by_personnel';
                  const isVerified = docItem.status === 'verified_by_personnel';

                  return (
                    <div
                      key={docItem.id || idx}
                      onClick={() => {
                        setSelectedDocIndex(idx);
                        setZoom(1);
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                        isSelected
                          ? 'border-[#0e2756] bg-blue-50/50 ring-1 ring-[#0e2756]'
                          : isFlagged
                          ? 'border-amber-300 bg-amber-50/40'
                          : isVerified
                          ? 'border-emerald-300 bg-emerald-50/30'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 break-words">
                            {idx + 1}. {docItem.requirementName || `Uploaded Document #${idx + 1}`}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                            {docItem.fileName}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                            isFlagged
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : isVerified
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isSelected
                              ? 'bg-[#0e2756] text-white'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isFlagged
                            ? 'Flagged'
                            : isVerified
                            ? 'Verified'
                            : isSelected
                            ? 'Viewing'
                            : 'Tap to View'}
                        </span>
                      </div>

                      <div
                        className="flex flex-wrap items-center justify-end gap-2 pt-1.5 border-t border-slate-200/70"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDocIndex(idx);
                            setZoom(1);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] font-semibold"
                        >
                          Preview on Left
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await updateApplicationDocumentReview(
                              currentApp.id,
                              docItem.id || idx,
                              'verified_by_personnel',
                              ''
                            );
                            showToast(
                              `Marked "${docItem.requirementName || docItem.fileName}" as Verified.`,
                              'success',
                              'Document Verified'
                            );
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-semibold"
                        >
                          Mark Verified
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const flagNote = `Flagged by Civil Registry Personnel: Please re-upload a clear/correct copy of "${
                              docItem.requirementName || docItem.fileName
                            }".`;
                            await updateApplicationDocumentReview(
                              currentApp.id,
                              docItem.id || idx,
                              'flagged_by_personnel',
                              flagNote
                            );
                            setRemarks((prev) =>
                              prev && prev.includes(flagNote)
                                ? prev
                                : prev
                                ? `${prev}\n${flagNote}`
                                : flagNote
                            );
                            showToast(
                              `Flagged "${docItem.requirementName || docItem.fileName}" for applicant correction.`,
                              'warning',
                              'Document Flagged by Personnel'
                            );
                          }}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-semibold"
                        >
                          Flag Document
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Side-by-Side Comparison: Applicant Form Details vs. AI OCR Extracted Document Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider">
                    Document vs. Applicant Form Comparison
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Compare selected document #{selectedDocIndex + 1} against submitted form details
                  </div>
                </div>
                {activeDoc && previewSrc && (
                  <button
                    type="button"
                    disabled={liveOcrRunning}
                    onClick={handleRunPersonnelOcrComparison}
                    className="px-2.5 py-1.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-md text-[11px] font-semibold disabled:opacity-50"
                  >
                    {liveOcrRunning ? 'Running OCR...' : 'Re-Run OCR Comparison'}
                  </button>
                )}
              </div>

              {/* Submitted Form Details */}
              <div className="space-y-1.5">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Form Full Name:</span>
                  <span className="font-bold text-slate-900 text-right">
                    {currentApp.subject_details?.fullName || currentApp.applicant_name}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Form Date of Event:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {currentApp.subject_details?.dateOfBirth || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Form Place of Event:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {currentApp.subject_details?.placeOfBirth || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-500">Form Mother's Maiden Name:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {currentApp.subject_details?.motherMaidenName || '—'}
                  </span>
                </div>
                {currentApp.subject_details?.fatherName && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">Form Father's Full Name:</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {currentApp.subject_details.fatherName}
                    </span>
                  </div>
                )}
              </div>

              {/* AI OCR Comparison Findings for the Selected Document */}
              {activeAiFinding ? (
                <div
                  className={`p-3 rounded-lg border space-y-2 ${
                    activeAiFinding.status === 'unreadable'
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : activeAiFinding.status === 'flagged_for_staff'
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-bold">
                    <span>OCR document checks</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/80 border">
                      {activeAiFinding.status === 'unreadable'
                        ? 'Unreadable'
                        : activeAiFinding.status === 'flagged_for_staff'
                        ? 'Mismatch / Staff Review'
                        : 'Checks passed'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {activeAiFinding.status === 'unreadable'
                      ? 'Text could not be reliably read. Inspect the original file or request a clearer upload.'
                      : activeAiFinding.status === 'flagged_for_staff'
                      ? `Staff review needed: ${activeAiFinding.comparisonChecks?.filter((check) => !check.matched).map((check) => check.label).join(', ') || 'document details not confirmed'}.`
                      : 'OCR found the expected details. Verify the original before approval.'}
                  </p>
                  {Array.isArray(activeAiFinding.comparisonChecks) &&
                    activeAiFinding.comparisonChecks.length > 0 && (
                      <div className="pt-1.5 border-t border-black/10 space-y-1">
                        {activeAiFinding.comparisonChecks.map((chk, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex items-start justify-between gap-2 text-[11px]"
                          >
                            <span className="font-medium opacity-85">{chk.label}:</span>
                            <span className="font-semibold text-right">{chk.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  {activeAiFinding.extractedTextSnippet && (
                    <details className="text-[11px]">
                      <summary className="cursor-pointer font-semibold">View extracted text</summary>
                      <p className="mt-2 p-2 bg-white/90 rounded border border-slate-200 font-mono text-slate-700 break-words">
                        {activeAiFinding.extractedTextSnippet}
                      </p>
                    </details>
                  )}
                </div>
              ) : (
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500">
                  Tap <strong>Re-Run OCR Comparison</strong> above to extract text from the selected image and compare it against the applicant's form details.
                </div>
              )}
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
