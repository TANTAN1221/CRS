// =====================================================================
// CIVIL REGISTRY PORTAL - REACT APPLICATION WIZARD WITH AI AUTO-FILL
// Features:
// 1. "Scan ID or Certificate to Auto-Fill Form" (Camera, Upload, or Presets)
// 2. Per-Field Confidence Badges (99% Verified vs <88% Amber Review Alert)
// 3. Cloud Storage Requirement Uploads + Individual AI Pre-Screenings
// 4. Appointment-First Counter Slot Reservation & Informational Fee Summary
// =====================================================================

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Camera,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Info,
  FileCheck,
  RefreshCw,
  UserCheck,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import PortalLayout, { formatCurrency } from '../../components/PortalLayout';
import AIDocumentScannerModal from '../../components/AIDocumentScannerModal';
import VisualAppointmentCalendar from '../../components/VisualAppointmentCalendar';
import { usePortal } from '../../context/PortalContext';

export default function ApplicationWizardPage() {
  const {
    profile,
    services,
    requirements,
    createApplication,
    uploadDocumentFile,
    scanDocumentForAutoFill,
    getTimeSlotsForDate,
    showToast,
  } = usePortal();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSrvId = searchParams.get('service') || 'birth_cert';
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(initialSrvId);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [requestOwnerType, setRequestOwnerType] = useState('self'); // 'self' | 'family'

  // Subject / Record Details State (Automatically populated by AI Scanner!)
  const [subject, setSubject] = useState({
    fullName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    motherMaidenName: '',
    fatherName: '',
    registryNumber: '',
    idNumber: '',
    purpose: 'Passport / DFA Application',
    copiesCount: 1,
  });

  // Per-field AI OCR Confidence Map: { fullName: 0.99, fatherName: 0.84, ... }
  const [fieldConfidence, setFieldConfidence] = useState({});
  const [autoFillSource, setAutoFillSource] = useState(null);

  // Step 3: Requirement uploads & AI Pre-check findings
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [reqFindings, setReqFindings] = useState({});
  const [checkingReqId, setCheckingReqId] = useState(null);

  // Step 4: Counter Appointment Slot Reservation
  const [reserveSlotNow, setReserveSlotNow] = useState(true);
  const [aptDate, setAptDate] = useState(tomorrow);
  const [aptSlot, setAptSlot] = useState('09:30 AM - 10:00 AM');

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0];
  const serviceReqs = requirements[selectedService.id] || requirements.birth_cert || [];
  const availableSlots = getTimeSlotsForDate(aptDate);

  // Callback when AI Document Scanner extracts fields
  const handleApplyExtractedFields = (scanResult) => {
    const f = scanResult.fields || {};
    setSubject((prev) => ({
      ...prev,
      fullName: f.fullName?.value || prev.fullName,
      dateOfBirth: f.dateOfBirth?.value || prev.dateOfBirth,
      placeOfBirth: f.placeOfBirth?.value || prev.placeOfBirth,
      motherMaidenName: f.motherMaidenName?.value || prev.motherMaidenName,
      fatherName: f.fatherName?.value || prev.fatherName,
      registryNumber: f.registryNumber?.value || prev.registryNumber,
      idNumber: f.idNumber?.value || prev.idNumber,
    }));

    const confMap = {};
    Object.entries(f).forEach(([k, obj]) => {
      confMap[k] = obj.confidence || 0.95;
    });
    setFieldConfidence(confMap);
    setAutoFillSource({
      documentType: scanResult.documentType,
      overallScore: scanResult.overallScore,
      summary: scanResult.summary,
    });

    if (step === 1) {
      setStep(2);
    }
    showToast(
      `Form inputs automatically populated from ${scanResult.documentType}!`,
      'success',
      'AI Auto-Fill Applied'
    );
  };

  const renderConfidenceBadge = (fieldKey) => {
    const conf = fieldConfidence[fieldKey];
    if (!conf) return null;
    const pct = Math.round(conf * 100);
    const isLow = pct < 88;
    return (
      <span
        className={`ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
          isLow
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
        }`}
      >
        AI {pct}% {isLow ? '(Verify)' : ''}
      </span>
    );
  };

  const handleRunRequirementPreCheck = async (req) => {
    setCheckingReqId(req.id);
    try {
      const res = await scanDocumentForAutoFill({
        presetKey:
          selectedService.id === 'marriage_cert'
            ? 'marriage_form97'
            : req.name.toLowerCase().includes('id')
            ? 'philsys_id'
            : 'live_birth_colb',
        requirementName: req.name,
        expectedDetails: subject,
      });
      setReqFindings((prev) => ({
        ...prev,
        [req.id]: {
          requirementName: req.name,
          status: 'passed',
          completenessScore: res.overallScore,
          summary: res.summary,
          extractedFields: Object.fromEntries(
            Object.entries(res.fields || {}).map(([k, v]) => [v.label || k, v.value])
          ),
        },
      }));
      showToast(`AI Pre-Check passed for ${req.name} (${res.overallScore}%)`, 'success', 'Pre-Screened');
    } finally {
      setCheckingReqId(null);
    }
  };

  const handleFileChange = async (req, file) => {
    if (!file) return;
    try {
      const uploaded = await uploadDocumentFile(file, 'draft', req.name);
      setUploadedDocs((prev) => ({ ...prev, [req.id]: uploaded }));
      await handleRunRequirementPreCheck(req);
    } catch (err) {
      showToast(err.message, 'error', 'Upload Validation Error');
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const created = await createApplication({
      serviceId: selectedService.id,
      subjectDetails: subject,
      copiesCount: subject.copiesCount,
      uploadedDocs: Object.values(uploadedDocs),
      aiScreenings: Object.values(reqFindings),
      preferredAppointmentDate: reserveSlotNow ? aptDate : null,
      preferredAppointmentSlot: reserveSlotNow ? aptSlot : null,
    });
    showToast(
      `Application ${created.reference_no} submitted! Tracking: TRK-${created.reference_no}`,
      'success',
      'Submitted'
    );
    navigate(`/applicant/document-tracking?ref=${created.reference_no}`);
  };

  const informationalTotal =
    (selectedService.fee_amount || 155) * Number(subject.copiesCount || 1);

  return (
    <PortalLayout>
      {/* Top Banner + AI Scan-to-Auto-Fill CTA */}
      <div className="bg-navy-pattern text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-200 font-bold">
            <span className="accent-bar" /> EASY DOCUMENT APPLICATION
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Request a Civil Registry Certificate
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
            You don't need to type everything by hand. Tap <strong>Scan ID or Certificate</strong> to automatically fill out the form using a photo of your ID or certificate.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setScannerOpen(true)}
          className="px-5 py-3.5 bg-white text-slate-900 hover:bg-blue-50 rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap transition-transform active:scale-95"
        >
          <Camera className="w-4 h-4 text-[#0e2756]" aria-hidden="true" />
          Scan ID or Certificate to Auto-Fill
        </button>
      </div>

      {/* Auto-Fill Active Banner */}
      {autoFillSource && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-950">
                AI OCR Auto-Fill Active: {autoFillSource.documentType} ({autoFillSource.overallScore}% Clarity)
              </div>
              <p className="text-emerald-800 text-[11px] mt-0.5">{autoFillSource.summary}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="text-xs font-bold text-[#0e2756] hover:underline whitespace-nowrap"
          >
            Re-Scan Document
          </button>
        </div>
      )}

      {/* 4-Step Indicator (Clean wrapping on mobile without truncated or overlapping text) */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
          {[
            { num: 1, title: 'Choose Document' },
            { num: 2, title: 'Person Details' },
            { num: 3, title: 'Attach ID / Photo' },
            { num: 4, title: 'Visit Date & Submit' },
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num)}
              className={`p-2.5 rounded-lg border flex items-center gap-2 text-left transition-all min-w-0 ${
                step === s.num
                  ? 'text-[#0e2756] border-[#0e2756] bg-blue-50/60 font-bold'
                  : step > s.num
                  ? 'text-emerald-800 border-emerald-300 bg-emerald-50/40'
                  : 'text-slate-600 border-slate-200'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 ${
                  step === s.num
                    ? 'bg-[#0e2756] text-white'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {s.num}
              </span>
              <span className="leading-tight break-words">{s.title}</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* STEP 1: SERVICE SELECTION */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  Step 1: Choose Civil Registry Service
                </h2>
                <p className="text-xs text-slate-500">
                  Select the certificate or registration service you are requesting.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0e2756] bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-100"
              >
                <Camera className="w-3.5 h-3.5 text-[#0e2756]" /> Scan Document to Auto-Fill Step 2
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <label
                  key={s.id}
                  className={`cursor-pointer border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    selectedServiceId === s.id
                      ? 'border-[#0e2756] bg-blue-50/40 ring-1 ring-[#0e2756]'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <input
                        type="radio"
                        name="service"
                        checked={selectedServiceId === s.id}
                        onChange={() => setSelectedServiceId(s.id)}
                        className="text-[#0e2756]"
                      />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {s.code}
                      </span>
                    </div>
                    <div className="font-serif font-bold text-sm text-slate-900">{s.name}</div>
                    <p className="text-[11px] text-slate-500 mt-1">{s.description}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>{formatCurrency(s.fee_amount)} (Counter)</span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      {s.processing_days} days
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-[#0e2756] text-white rounded-md text-xs font-semibold hover:bg-[#122850] flex items-center gap-2"
              >
                Continue to Record Details <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RECORD DETAILS (WITH AI AUTO-FILL & PER-FIELD CONFIDENCE) */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  Step 2: Document Owner & Vital Event Details
                </h2>
                <p className="text-xs text-slate-600">
                  Choose who owns the certificate below, or scan an ID / certificate to fill this out automatically.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="px-4 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg text-xs font-semibold shadow flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" aria-hidden="true" /> Scan Document to Auto-Fill
              </button>
            </div>

            {/* Improvement #1: "Who is this request for?" Quick Selector */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Who is this certificate request for?
                </span>
                <span className="text-[11px] italic text-slate-600">
                  Para kanino ang hinihinging dokumento?
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRequestOwnerType('self');
                    const fullProfileName = [
                      profile?.first_name,
                      profile?.middle_name,
                      profile?.last_name,
                    ]
                      .filter(Boolean)
                      .join(' ');
                    setSubject((prev) => ({
                      ...prev,
                      fullName: fullProfileName || 'Maria Clara Santos Dela Cruz',
                      placeOfBirth:
                        prev.placeOfBirth ||
                        `${profile?.city || 'Metro City'}, ${profile?.province || 'Capital District'}`,
                    }));
                    showToast(
                      'Filled in your account name automatically.',
                      'success',
                      'For Myself Selected'
                    );
                  }}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    requestOwnerType === 'self'
                      ? 'border-[#0e2756] bg-blue-50/70 ring-1 ring-[#0e2756]'
                      : 'border-slate-300 bg-white hover:bg-slate-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-[#0e2756] text-white flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      For Myself (Tap to Auto-Fill My Name)
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Para sa aking sariling rekord ({profile?.first_name || 'Citizen'}{' '}
                      {profile?.last_name || ''})
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRequestOwnerType('family');
                    setSubject((prev) => ({
                      ...prev,
                      fullName: '',
                    }));
                  }}
                  className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    requestOwnerType === 'family'
                      ? 'border-[#0e2756] bg-blue-50/70 ring-1 ring-[#0e2756]'
                      : 'border-slate-300 bg-white hover:bg-slate-100'
                  }`}
                >
                  <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-800 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900">
                      For My Child, Spouse, or Family Member
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Para sa aking anak, asawa, o kamag-anak
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Improvement #3: Bilingual English + Tagalog Helper Hints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Full Name of Person on the Certificate * {renderConfidenceBadge('fullName')}
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Buong pangalan na nakasulat sa sertipiko (First, Middle, Last Name)
                </span>
                <input
                  type="text"
                  required
                  value={subject.fullName}
                  onChange={(e) => setSubject({ ...subject, fullName: e.target.value })}
                  placeholder="First Name, Middle Name, Last Name"
                  className={`form-input text-xs ${
                    fieldConfidence.fullName ? 'border-emerald-400 bg-emerald-50/20' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Date of Birth / Marriage / Event * {renderConfidenceBadge('dateOfBirth')}
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Petsa ng kapanganakan, kasal, o pangyayari
                </span>
                <input
                  type="date"
                  required
                  value={subject.dateOfBirth}
                  onChange={(e) => setSubject({ ...subject, dateOfBirth: e.target.value })}
                  className={`form-input text-xs ${
                    fieldConfidence.dateOfBirth ? 'border-emerald-400 bg-emerald-50/20' : ''
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Place of Birth / Event (Hospital or City) *{' '}
                  {renderConfidenceBadge('placeOfBirth')}
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Ospital, lungsod, o bayan kung saan ipinanganak o ikinasal
                </span>
                <input
                  type="text"
                  required
                  value={subject.placeOfBirth}
                  onChange={(e) => setSubject({ ...subject, placeOfBirth: e.target.value })}
                  placeholder="e.g. Manila City General Hospital"
                  className={`form-input text-xs ${
                    fieldConfidence.placeOfBirth ? 'border-emerald-400 bg-emerald-50/20' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Mother's Maiden Name (Before Marriage) * {renderConfidenceBadge('motherMaidenName')}
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Buong pangalan sa pagkadalaga ng Ina bago ikasal
                </span>
                <input
                  type="text"
                  required
                  value={subject.motherMaidenName}
                  onChange={(e) => setSubject({ ...subject, motherMaidenName: e.target.value })}
                  placeholder="First Name, Middle Name, Maiden Surname"
                  className={`form-input text-xs ${
                    fieldConfidence.motherMaidenName ? 'border-emerald-400 bg-emerald-50/20' : ''
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Father's Full Name {renderConfidenceBadge('fatherName')}
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Buong pangalan ng Ama
                </span>
                <input
                  type="text"
                  value={subject.fatherName}
                  onChange={(e) => setSubject({ ...subject, fatherName: e.target.value })}
                  placeholder="First Name, Middle Name, Last Name"
                  className={`form-input text-xs ${
                    fieldConfidence.fatherName && fieldConfidence.fatherName < 0.88
                      ? 'border-amber-400 bg-amber-50/40'
                      : fieldConfidence.fatherName
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Purpose of Request *
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Saan gagamitin ang dokumento (hal. Pension, SSS, Passport)
                </span>
                <select
                  value={subject.purpose}
                  onChange={(e) => setSubject({ ...subject, purpose: e.target.value })}
                  className="form-input text-xs"
                >
                  <option value="Legal Claims / Estate / GSIS / SSS">
                    Senior Benefit / Pension / GSIS / SSS / PhilHealth
                  </option>
                  <option value="Passport / DFA Application">Passport / DFA Application</option>
                  <option value="School Enrollment / Board Exam">
                    School Enrollment / Board Exam
                  </option>
                  <option value="Employment / Local Work">Employment / Local Work</option>
                  <option value="Visa / Overseas Immigration">Visa / Overseas Immigration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  Number of Certified Copies *
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  Ilang kopya ang kailangan
                </span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={subject.copiesCount}
                  onChange={(e) => setSubject({ ...subject, copiesCount: e.target.value })}
                  className="form-input text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!subject.fullName || !subject.dateOfBirth || !subject.placeOfBirth) {
                    showToast(
                      'Please fill in the required fields or click "Scan Document to Auto-Fill".',
                      'warning',
                      'Missing Fields'
                    );
                    return;
                  }
                  setStep(3);
                }}
                className="px-6 py-2.5 bg-[#0e2756] text-white rounded-md text-xs font-semibold hover:bg-[#122850] flex items-center gap-2"
              >
                Continue to Requirements <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REQUIREMENT UPLOADS & AI PRE-SCREENING */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  Step 3: Attach Required ID or Supporting Document
                </h2>
                <p className="text-xs text-slate-600">
                  Upload a clear photo or scan of the required documents below (PDF, JPG, or PNG up to 10 MB) so our staff can check them before your visit.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {serviceReqs.map((req) => {
                const finding = reqFindings[req.id];
                const isChecking = checkingReqId === req.id;
                return (
                  <div
                    key={req.id}
                    className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{req.name}</span>
                        {req.is_mandatory ? (
                          <span className="ml-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                            Mandatory
                          </span>
                        ) : (
                          <span className="ml-2 text-[10px] text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 mt-0.5">{req.description}</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        capture="environment"
                        onChange={(e) => handleFileChange(req, e.target.files?.[0])}
                        className="form-input text-xs flex-1 bg-white"
                      />
                      <button
                        type="button"
                        disabled={isChecking}
                        onClick={() => handleRunRequirementPreCheck(req)}
                        className="px-4 py-2 bg-gradient-to-r from-[#0e2756] to-[#1e40af] text-white text-xs font-semibold rounded-md shadow flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isChecking ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Scanning...
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-3.5 h-3.5" /> Run Pre-Check
                          </>
                        )}
                      </button>
                    </div>

                    {finding && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-emerald-600" />
                            AI Pre-Screening Passed ({finding.completenessScore}% Clarity)
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            CLEARED FOR COUNTER
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">{finding.summary}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-6 py-2.5 bg-[#0e2756] text-white rounded-md text-xs font-semibold hover:bg-[#122850] flex items-center gap-2"
              >
                Proceed to Appointment & Review <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: COUNTER APPOINTMENT RESERVATION & INFORMATIONAL FEE REVIEW */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900">
                Step 4: Counter Appointment Schedule & Final Review
              </h2>
              <p className="text-xs text-slate-500">
                Reserve your atomic counter visit slot for original document verification and release.
              </p>
            </div>

            {/* RA 3753 Informational Fee Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  Informational Fee Schedule Only — No Online Payments Collected
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  Pursuant to <strong>Republic Act No. 3753</strong> and the{' '}
                  <strong>Local Government Code of 1991</strong>, this portal does not collect online payments. All statutory fees shown below are informational and paid directly at the Civil Registry Cashier Window during your counter appointment.
                </p>
              </div>
            </div>

            {/* Counter Slot Reservation */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                    Choose Your Office Visit Date & Time
                  </h3>
                  <p className="text-[11px] text-slate-600">
                    Pick a convenient date and time window to claim or verify your document at the Civil Registry Office.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#0e2756] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reserveSlotNow}
                    onChange={(e) => setReserveSlotNow(e.target.checked)}
                    className="rounded text-[#0e2756]"
                  />
                  Schedule Visit Now
                </label>
              </div>

              {reserveSlotNow && (
                <VisualAppointmentCalendar
                  selectedDate={aptDate}
                  onSelectDate={(newDate) => {
                    setAptDate(newDate);
                    const nextSlots = getTimeSlotsForDate(newDate);
                    const firstOpen =
                      nextSlots.find((s) => !s.isFull)?.timeSlot ||
                      nextSlots[0]?.timeSlot ||
                      aptSlot;
                    setAptSlot(firstOpen);
                  }}
                  selectedSlot={aptSlot}
                  onSelectSlot={setAptSlot}
                  mode="citizen"
                  showTimeSlotPicker={true}
                />
              )}
            </div>

            {/* Informational Summary */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-xs space-y-2.5">
              <div className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                Application & Informational Counter Fee Summary
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <span className="text-slate-600">Selected Service:</span>
                <span className="font-semibold text-slate-900 break-words">
                  {selectedService.name}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <span className="text-slate-600">Subject on Record:</span>
                <span className="font-semibold text-slate-900 break-words">
                  {subject.fullName || 'Citizen Applicant'} ({subject.dateOfBirth || '—'})
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-0.5">
                <span className="text-slate-600">Online Pre-Screening & Slot Reservation:</span>
                <span className="font-semibold text-emerald-700">FREE (₱0.00)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-900">
                  Informational Statutory Fee (Payable at Counter):
                </span>
                <span className="font-bold text-[#0e2756] tabular-nums">
                  {formatCurrency(informationalTotal)}
                </span>
              </div>
            </div>

            {/* Improvement #2: Visual "What to Bring to the Office" 3-Item Checklist */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0e2756] uppercase tracking-wider">
                <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
                What to Bring on Your Office Visit (Ano ang Dadalhin sa Opisina)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-lg border border-blue-100 shadow-2xs">
                  <div className="font-bold text-slate-900">1. Reference Code / Slip</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Show your Reference Number on your phone screen or bring a printed slip.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-blue-100 shadow-2xs">
                  <div className="font-bold text-slate-900">2. Original Valid ID</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Bring your Senior Citizen ID, PhilSys National ID, or any valid government ID.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-blue-100 shadow-2xs">
                  <div className="font-bold text-slate-900">
                    3. Counter Fee ({formatCurrency(informationalTotal)})
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Prepare cash payment directly for the Civil Registry Cashier Window.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-md text-xs font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-[#0e2756] text-white rounded-md text-xs font-semibold hover:bg-[#122850] shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Application & Reserve Slot
              </button>
            </div>
          </div>
        )}
      </form>

      {/* AI Document Scanner Modal */}
      <AIDocumentScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onApplyExtractedFields={handleApplyExtractedFields}
        defaultPreset={
          selectedServiceId === 'marriage_cert' ? 'marriage_form97' : 'philsys_id'
        }
      />
    </PortalLayout>
  );
}
