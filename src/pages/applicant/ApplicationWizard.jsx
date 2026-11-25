// =====================================================================
// CIVIL REGISTRY PORTAL - REACT APPLICATION WIZARD WITH AI AUTO-FILL
// Features:
// 1. Explicit record-subject details for the person being registered
// 2. AI-assisted comparison and review of submitted requirement documents
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
    evaluateChecklistWithAI,
    getTimeSlotsForDate,
    showToast,
  } = usePortal();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSrvId = searchParams.get('service') || 'birth_cert';
  const initialHasFather = searchParams.get('hasFather') === 'no' ? 'no' : 'yes';
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState(initialSrvId);
  const [detailsAttempted, setDetailsAttempted] = useState(false);

  const applicantFullName = [
    profile?.first_name,
    profile?.middle_name,
    profile?.last_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  // Record Details State — the PERSON TO BE REGISTERED (child, deceased, or spouses),
  // which is separate from the signed-in applicant who submits the request.
  const [subject, setSubject] = useState({
    fullName: '',
    regFirstName: '',
    regMiddleName: '',
    regLastName: '',
    regSex: '',
    timeOfBirth: '',
    husbandName: '',
    wifeName: '',
    applicantRelationship: '',
    dateOfBirth: '',
    placeOfBirth: '',
    motherMaidenName: '',
    fatherName: '',
    registryNumber: '',
    idNumber: '',
    purpose: 'Passport / DFA Application',
    copiesCount: 1,
  });

  // Keep the combined "fullName" of the person being registered in sync with the separate name boxes
  React.useEffect(() => {
    const combined =
      selectedServiceId === 'marriage_cert'
        ? [subject.husbandName, subject.wifeName].filter((n) => n?.trim()).join(' & ')
        : [subject.regFirstName, subject.regMiddleName, subject.regLastName]
            .filter((n) => n?.trim())
            .join(' ');
    setSubject((prev) =>
      prev.fullName === combined.trim() ? prev : { ...prev, fullName: combined.trim() }
    );
  }, [
    selectedServiceId,
    subject.regFirstName,
    subject.regMiddleName,
    subject.regLastName,
    subject.husbandName,
    subject.wifeName,
  ]);

  // Step 3: Requirement uploads, Applicant Circumstances & AI Pre-check findings
  const [uploadedDocs, setUploadedDocs] = useState({});
  const [reqFindings, setReqFindings] = useState({});
  const [checkingReqId, setCheckingReqId] = useState(null);
  const [circumstances, setCircumstances] = useState({
    hasFather: initialHasFather, // 'yes' | 'no'
    parentsMaritalStatus: initialHasFather === 'no' ? 'unmarried' : 'married', // 'married' | 'unmarried' | 'unsure'
    childUsesFatherSurname: initialHasFather === 'no' ? 'no' : 'yes', // 'yes' | 'no'
    deathCircumstance: 'natural_attended', // 'natural_attended' | 'medico_legal' | 'unsure'
    deathFilingTiming: 'within_30_days', // 'within_30_days' | 'over_30_days'
    confirmedLateDeathRequirements: false,
    psaBirthAvailable: 'available', // 'available' | 'substitute_baptismal'
    'req-bl-5_type': 'Baptismal certificate',
    'req-bl-6_type': 'Earliest school records (Form 137 or Transcript of Records)',
  });

  // Step 4: Counter Appointment Slot Reservation
  const [reserveSlotNow, setReserveSlotNow] = useState(true);
  const [aptDate, setAptDate] = useState(tomorrow);
  const [aptSlot, setAptSlot] = useState('09:30 AM - 10:00 AM');

  // Persist the in-progress application per signed-in applicant so a refresh,
  // temporary disconnect, or leaving the wizard does not erase their work.
  const draftStorageKey = `crs_application_draft_${profile?.uid || profile?.id || 'guest'}`;
  const draftRestoredKey = React.useRef(null);

  React.useEffect(() => {
    if (typeof window === 'undefined' || draftRestoredKey.current === draftStorageKey) return;
    draftRestoredKey.current = draftStorageKey;
    try {
      const saved = JSON.parse(window.localStorage.getItem(draftStorageKey) || 'null');
      if (!saved) return;
      if (saved.selectedServiceId) setSelectedServiceId(saved.selectedServiceId);
      if (Number.isInteger(saved.step) && saved.step >= 1 && saved.step <= 4) setStep(saved.step);
      if (saved.subject) setSubject((prev) => ({ ...prev, ...saved.subject }));
      if (saved.uploadedDocs) setUploadedDocs(saved.uploadedDocs);
      if (saved.reqFindings) setReqFindings(saved.reqFindings);
      if (saved.circumstances) setCircumstances((prev) => ({ ...prev, ...saved.circumstances }));
      if (typeof saved.reserveSlotNow === 'boolean') setReserveSlotNow(saved.reserveSlotNow);
      if (saved.aptDate) setAptDate(saved.aptDate);
      if (saved.aptSlot) setAptSlot(saved.aptSlot);
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || draftRestoredKey.current !== draftStorageKey) return;
    try {
      const serializableDocs = Object.fromEntries(
        Object.entries(uploadedDocs).map(([key, value]) => {
          const { rawFile, ...safeValue } = value || {};
          return [key, safeValue];
        })
      );
      window.localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          savedAt: new Date().toISOString(),
          step,
          selectedServiceId,
          subject,
          uploadedDocs: serializableDocs,
          reqFindings,
          circumstances,
          reserveSlotNow,
          aptDate,
          aptSlot,
        })
      );
    } catch {
      // Draft persistence is best-effort and must never block the application.
    }
  }, [
    draftStorageKey,
    step,
    selectedServiceId,
    subject,
    uploadedDocs,
    reqFindings,
    circumstances,
    reserveSlotNow,
    aptDate,
    aptSlot,
  ]);

  const selectedService =
    services.find((s) => s.id === selectedServiceId) || services[0];
  const isBirthService = selectedServiceId === 'birth_cert' || selectedServiceId === 'delayed_birth';
  const isDeathService = selectedServiceId === 'death_cert';
  const isMarriageService = selectedServiceId === 'marriage_cert';
  const serviceReqs = requirements[selectedService.id] || requirements.birth_cert || [];
  const availableSlots = getTimeSlotsForDate(aptDate);

  // Live AI-Assisted Document Review Summary against the approved checklist
  const aiChecklistReview = evaluateChecklistWithAI({
    serviceId: selectedService.id,
    reqs: serviceReqs,
    circumstances,
    uploadedDocs,
    reqFindings,
    subject,
  });

  const handleRunRequirementPreCheck = async (
    req,
    fileOverride = null,
    qualityHint = 'clear',
    subSlot = null
  ) => {
    const keyId = subSlot ? `${req.id}__${subSlot.slotKey}` : req.id;
    const itemLabel = subSlot ? `${req.name} (${subSlot.label})` : req.name;
    setCheckingReqId(keyId);
    try {
      const targetFile = fileOverride || uploadedDocs[keyId];

      // Compare each uploaded document against the RIGHT person's name
      // (e.g. Mother's ID vs. mother's name — not the baby's name)
      const slotKey = subSlot?.slotKey;
      const lowerLabel = itemLabel.toLowerCase();
      const expectedNameForDoc =
        slotKey === 'mother_id'
          ? subject.motherMaidenName
          : slotKey === 'father_id'
          ? subject.fatherName
          : slotKey === 'informant_id'
          ? applicantFullName
          : slotKey === 'party1_cenomar'
          ? subject.husbandName
          : slotKey === 'party2_cenomar'
          ? subject.wifeName
          : selectedService.id === 'marriage_cert' && lowerLabel.includes('id')
          ? `${subject.husbandName} ${subject.wifeName}`
          : subject.fullName;

      const res = await scanDocumentForAutoFill({
        presetKey:
          selectedService.id === 'marriage_cert'
            ? 'marriage_form97'
            : itemLabel.toLowerCase().includes('id')
            ? 'philsys_id'
            : 'live_birth_colb',
        file: targetFile
          ? {
              ...targetFile,
              name: targetFile.fileName || targetFile.name,
              size: targetFile.fileSizeBytes || targetFile.size,
            }
          : null,
        qualityHint,
        requirementName: itemLabel,
        expectedDetails: {
          ...subject,
          fullName: expectedNameForDoc?.trim() || subject.fullName,
        },
      });

      const status =
        res.readabilityStatus === 'unreadable'
          ? 'unreadable'
          : res.readabilityStatus === 'flagged_for_staff'
          ? 'flagged_for_staff'
          : 'passed';

      const findingRecord = {
        requirementName: itemLabel,
        status,
        readabilityStatus: res.readabilityStatus || 'verified',
        completenessScore: res.overallScore,
        fileName: res.fileName,
        summary: res.summary,
        extractedTextSnippet: res.extractedTextSnippet || '',
        comparisonChecks: res.comparisonChecks || [],
        extractedFields: Object.fromEntries(
          Object.entries(res.fields || {}).map(([k, v]) => [
            String(v.label || k).replace(/[.#$\/\[\]]/g, '_'),
            v.value,
          ])
        ),
      };

      setReqFindings((prev) => ({
        ...prev,
        [keyId]: findingRecord,
      }));

      // Also attach the AI OCR comparison finding directly onto the uploaded document record
      // so Civil Registry Personnel can inspect both the image/PDF and its OCR comparison side-by-side
      setUploadedDocs((prev) =>
        prev[keyId]
          ? {
              ...prev,
              [keyId]: {
                ...prev[keyId],
                requirementName: itemLabel,
                aiFinding: findingRecord,
              },
            }
          : prev
      );

      if (status === 'unreadable') {
        showToast(
          `Please replace "${itemLabel}" with a clear photo of the actual document.`,
          'error',
          'Please Replace Photo'
        );
      } else if (status === 'flagged_for_staff') {
        showToast(
          `"${itemLabel}" saved — our staff will double-check the details.`,
          'warning',
          'Saved for Staff Check'
        );
      } else {
        showToast(
          `"${itemLabel}" is clear and matches your form!`,
          'success',
          'Document Checked'
        );
      }
    } finally {
      setCheckingReqId(null);
    }
  };

  const handleFileChange = async (req, file, subSlot = null) => {
    if (!file) return;
    const keyId = subSlot ? `${req.id}__${subSlot.slotKey}` : req.id;
    const itemLabel = subSlot ? `${req.name} - ${subSlot.label}` : req.name;
    try {
      const uploaded = await uploadDocumentFile(file, 'draft', itemLabel);
      setUploadedDocs((prev) => ({ ...prev, [keyId]: uploaded }));
      await handleRunRequirementPreCheck(req, uploaded, 'clear', subSlot);
    } catch (err) {
      showToast(err.message, 'error', 'Upload Validation Error');
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    const validation = validateSubjectDetails();
    if (!validation.valid) {
      setStep(2);
      setDetailsAttempted(true);
      showToast(`Complete the record subject details: ${validation.missing.join(', ')}.`, 'warning', 'Missing Record Details');
      return;
    }
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
    if (typeof window !== 'undefined') window.localStorage.removeItem(draftStorageKey);
    navigate(`/applicant/document-tracking?ref=${created.reference_no}`);
  };

  const validateSubjectDetails = () => {
    const missing = [];
    if (isBirthService) {
      if (!subject.applicantRelationship) missing.push('your relationship to the child');
      if (!subject.regFirstName?.trim()) missing.push("child's first name");
      if (!subject.regLastName?.trim()) missing.push("child's surname");
      if (!subject.regSex) missing.push("child's sex");
      if (!subject.dateOfBirth?.trim()) missing.push('child’s date of birth');
      if (!subject.placeOfBirth?.trim()) missing.push('child’s place of birth');
      if (!subject.motherMaidenName?.trim()) missing.push("mother's maiden name");
    } else {
      if (!subject.fullName?.trim()) missing.push('registered person’s full name');
      if (!subject.dateOfBirth?.trim()) missing.push('event date');
      if (!subject.placeOfBirth?.trim()) missing.push('event place');
    }
    return { valid: missing.length === 0, missing };
  };

  const informationalTotal =
    (selectedService.fee_amount || 155) * Number(subject.copiesCount || 1);

  return (
    <PortalLayout>
      {/* Top Hero Banner on the Services Tab */}
      <div className="bg-navy-pattern text-white rounded-2xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-blue-200 font-bold">
            <span className="accent-bar" /> CIVIL REGISTRY SERVICES & REQUESTS
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">
            Welcome, {profile?.first_name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
            Choose a civil registry service, enter the person’s record details, submit the required documents, and schedule your office visit. AI assistance compares the submitted documents against the information you provide.
          </p>
        </div>
      </div>

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
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900">
                Step 1: Choose Civil Registry Service
              </h2>
              <p className="text-xs text-slate-500">
                Select the certificate or registration service you are requesting.
              </p>
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
                    <span>Payment at Counter Upon Verification</span>
                    <span className="text-slate-400 font-normal text-[11px]">
                      {s.processing_days} days
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {/* Father Option directly inside Step 1 when Birth Registration is selected */}
            {(selectedServiceId === 'birth_cert' || selectedServiceId === 'delayed_birth') && (
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-[#0e2756]">
                    Is there a Father listed / acknowledged on this Birth Registration?
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    This tells the system whether both Mother’s and Father’s Valid IDs are required in Step 3, or only the Mother’s Valid ID.
                  </p>
                </div>
                <select
                  value={circumstances.hasFather}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCircumstances((prev) => ({
                      ...prev,
                      hasFather: val,
                      parentsMaritalStatus:
                        val === 'no' ? 'unmarried' : prev.parentsMaritalStatus,
                      childUsesFatherSurname:
                        val === 'no' ? 'no' : prev.childUsesFatherSurname,
                    }));
                  }}
                  className="form-input text-xs bg-white sm:w-80 flex-shrink-0"
                >
                  <option value="yes">
                    Yes — Father is listed (Both Mother’s & Father’s Valid IDs required)
                  </option>
                  <option value="no">
                    No Father listed / Solo Mother (Only Mother’s Valid ID required)
                  </option>
                </select>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-6 py-3 bg-[#0e2756] text-white rounded-lg text-xs font-semibold hover:bg-[#122850] flex items-center justify-center gap-2"
              >
                <span>Next: Person Details</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: RECORD DETAILS */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  Step 2: Your Personal & Vital Event Details
                </h2>
                <p className="text-xs text-slate-600">
                   Identify the person whose civil record is being registered. Your identity as the requester is separate from the child or person named on the record.
                </p>
              </div>
            </div>

            {/* Who Is Submitting This Request (Signed-In Applicant) + Relationship */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0e2756] text-white flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-600">Request submitted by (you):</div>
                  <div className="font-bold text-xs text-slate-900">
                    {applicantFullName || 'Signed-In Applicant'}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  {isBirthService
                    ? 'Your relationship to the child / person being registered *'
                    : isDeathService
                    ? 'Your relationship to the deceased *'
                    : 'Your role in this marriage record *'}
                </label>
                <select
                  value={subject.applicantRelationship}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubject((prev) => {
                      const next = { ...prev, applicantRelationship: val };
                      // Late registration of your OWN birth — fill in your own name
                      if (val === 'Self' && profile) {
                        next.regFirstName = profile.first_name || prev.regFirstName;
                        next.regMiddleName = profile.middle_name || prev.regMiddleName;
                        next.regLastName = profile.last_name || prev.regLastName;
                      }
                      return next;
                    });
                  }}
                  className="form-input text-xs bg-white"
                >
                  <option value="">Select one...</option>
                  {isBirthService && (
                    <>
                      <option value="Mother">I am the Mother</option>
                      <option value="Father">I am the Father</option>
                      {selectedServiceId === 'delayed_birth' && (
                        <option value="Self">I am registering my own birth</option>
                      )}
                      <option value="Legal Guardian">I am the Legal Guardian</option>
                    </>
                  )}
                  {isDeathService && (
                    <>
                      <option value="Spouse">Spouse (Husband / Wife)</option>
                      <option value="Child">Son / Daughter</option>
                      <option value="Parent">Mother / Father</option>
                      <option value="Sibling">Brother / Sister</option>
                      <option value="Other Relative">Other Relative</option>
                    </>
                  )}
                  {isMarriageService && (
                    <>
                      <option value="Husband">I am the Husband</option>
                      <option value="Wife">I am the Wife</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* PERSON TO BE REGISTERED */}
            <div className="space-y-3">
              <div className="font-bold text-xs text-[#0e2756] uppercase tracking-wider">
                {isBirthService
                  ? "Child's Name to Be Registered (Pangalan ng Batang Irerehistro)"
                  : isDeathService
                  ? 'Name of the Deceased (Pangalan ng Namatay)'
                  : 'Names of the Married Couple (Pangalan ng Mag-asawa)'}
              </div>

              {isBirthService && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-950">
                  <div className="font-bold">Record subject: the child being registered</div>
                  <p className="mt-1 leading-relaxed">
                    Enter the child’s legal name exactly as it should appear on the birth record. Uploaded documents will be compared against this child’s name, date, place of birth, and the parent details below—not only against your account name.
                  </p>
                </div>
              )}

              {isMarriageService ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Husband's Full Name *
                    </label>
                    <span className="block text-[11px] italic text-slate-600 mb-1">
                      Buong pangalan ng Asawang Lalaki
                    </span>
                    <input
                      type="text"
                      value={subject.husbandName}
                      onChange={(e) => setSubject({ ...subject, husbandName: e.target.value })}
                      placeholder="First Name, Middle Name, Last Name"
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Wife's Full Name (Maiden Name) *
                    </label>
                    <span className="block text-[11px] italic text-slate-600 mb-1">
                      Buong pangalan ng Asawang Babae bago ikasal
                    </span>
                    <input
                      type="text"
                      value={subject.wifeName}
                      onChange={(e) => setSubject({ ...subject, wifeName: e.target.value })}
                      placeholder="First Name, Middle Name, Maiden Surname"
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      First Name *
                    </label>
                    <span className="block text-[11px] italic text-slate-600 mb-1">Pangalan</span>
                    <input
                      type="text"
                       value={subject.regFirstName}
                      onChange={(e) => setSubject({ ...subject, regFirstName: e.target.value })}
                      placeholder={isBirthService ? "Child's first name" : 'First name'}
                       className={`form-input text-xs ${
                         detailsAttempted && isBirthService && !subject.regFirstName.trim() ? 'border-rose-400 bg-rose-50/30' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Middle Name
                    </label>
                    <span className="block text-[11px] italic text-slate-600 mb-1">
                      Gitnang pangalan (karaniwang apelyido ng ina)
                    </span>
                    <input
                      type="text"
                      value={subject.regMiddleName}
                      onChange={(e) => setSubject({ ...subject, regMiddleName: e.target.value })}
                      placeholder="Middle name"
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">
                      Last Name (Surname) *
                    </label>
                    <span className="block text-[11px] italic text-slate-600 mb-1">Apelyido</span>
                    <input
                      type="text"
                       value={subject.regLastName}
                      onChange={(e) => setSubject({ ...subject, regLastName: e.target.value })}
                      placeholder="Surname"
                       className={`form-input text-xs ${detailsAttempted && isBirthService && !subject.regLastName.trim() ? 'border-rose-400 bg-rose-50/30' : ''}`}
                    />
                  </div>
                </div>
              )}

              {!isMarriageService && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800">Sex *</label>
                    <span className="block text-[11px] italic text-slate-600 mb-1">Kasarian</span>
                    <select
                      value={subject.regSex}
                      onChange={(e) => setSubject({ ...subject, regSex: e.target.value })}
                       className={`form-input text-xs ${detailsAttempted && isBirthService && !subject.regSex ? 'border-rose-400 bg-rose-50/30' : ''}`}
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male (Lalaki)</option>
                      <option value="Female">Female (Babae)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  {isBirthService
                    ? 'Date of Birth'
                    : isDeathService
                    ? 'Date of Death'
                    : 'Date of Marriage'}{' '}
                  *
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  {isBirthService
                    ? 'Petsa ng kapanganakan'
                    : isDeathService
                    ? 'Petsa ng pagkamatay'
                    : 'Petsa ng kasal'}
                </span>
                <input
                  type="date"
                  required
                  value={subject.dateOfBirth}
                  onChange={(e) => setSubject({ ...subject, dateOfBirth: e.target.value })}
                   className={`form-input text-xs ${
                     detailsAttempted && isBirthService && !subject.dateOfBirth.trim() ? 'border-rose-400 bg-rose-50/30' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800">
                  {isBirthService
                    ? 'Place of Birth (Hospital or City)'
                    : isDeathService
                    ? 'Place of Death (Hospital, Home, or City)'
                    : 'Place of Marriage (Church or Venue, City)'}{' '}
                  *
                </label>
                <span className="block text-[11px] italic text-slate-600 mb-1">
                  {isBirthService
                    ? 'Ospital, lungsod, o bayan kung saan ipinanganak'
                    : isDeathService
                    ? 'Lugar kung saan namatay'
                    : 'Lugar kung saan ikinasal'}
                </span>
                <input
                  type="text"
                  required
                  value={subject.placeOfBirth}
                  onChange={(e) => setSubject({ ...subject, placeOfBirth: e.target.value })}
                  placeholder="e.g. Manila City General Hospital"
                   className={`form-input text-xs ${
                     detailsAttempted && isBirthService && !subject.placeOfBirth.trim() ? 'border-rose-400 bg-rose-50/30' : ''
                  }`}
                />
              </div>
            </div>

            {isBirthService && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800">
                     Mother's Maiden Name (Before Marriage) *
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
                       detailsAttempted && isBirthService && !subject.motherMaidenName.trim() ? 'border-rose-400 bg-rose-50/30' : ''
                    }`}
                  />
                </div>
              </div>
            )}

            <div
              className={`grid grid-cols-1 ${
                (selectedServiceId === 'birth_cert' || selectedServiceId === 'delayed_birth') &&
                circumstances.hasFather === 'no'
                  ? 'sm:grid-cols-2'
                  : 'sm:grid-cols-3'
              } gap-4`}
            >
              {!(
                (selectedServiceId === 'birth_cert' || selectedServiceId === 'delayed_birth') &&
                circumstances.hasFather === 'no'
              ) && (
                <div>
                  <label className="block text-xs font-semibold text-slate-800">
                    Father's Full Name
                  </label>
                  <span className="block text-[11px] italic text-slate-600 mb-1">
                    Buong pangalan ng Ama
                  </span>
                  <input
                    type="text"
                    value={subject.fatherName}
                    onChange={(e) => setSubject({ ...subject, fatherName: e.target.value })}
                    placeholder="First Name, Middle Name, Last Name"
                    className="form-input text-xs"
                  />
                </div>
              )}

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

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDetailsAttempted(true);
                  const validation = validateSubjectDetails();
                  if (!validation.valid) {
                    showToast(
                      `Please complete: ${validation.missing.join(', ')}. Enter the record details before uploading documents.`,
                      'warning',
                      'Missing Fields'
                    );
                    return;
                  }
                  setStep(3);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#0e2756] text-white rounded-lg text-xs font-semibold hover:bg-[#122850] flex items-center justify-center gap-2"
              >
                <span>Next: Upload Documents</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REQUIREMENT UPLOADS & AI-ASSISTED DOCUMENT REVIEW */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <h2 className="font-serif font-bold text-lg text-slate-900">
                  Step 3: Civil Registration Document Uploads & AI-Assisted Review
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Selected Service: <strong className="text-[#0e2756]">{selectedService.name}</strong> — {selectedService.description}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
                PDF, JPG, or PNG • Max 10 MB per file
              </span>
            </div>

            {/* Service-Specific Circumstance Selectors for Conditional Requirements */}
            {(selectedService.id === 'birth_cert' || selectedService.id === 'delayed_birth') && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="font-bold text-[#0e2756] uppercase tracking-wider text-[11px]">
                  Parent & Birth Record Circumstances (Determines Which Parent IDs & Affidavits Apply)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Is there a Father listed / acknowledged on the birth record?
                    </label>
                    <select
                      value={circumstances.hasFather}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCircumstances((prev) => ({
                          ...prev,
                          hasFather: val,
                          parentsMaritalStatus:
                            val === 'no' ? 'unmarried' : prev.parentsMaritalStatus,
                          childUsesFatherSurname:
                            val === 'no' ? 'no' : prev.childUsesFatherSurname,
                        }));
                      }}
                      className="form-input text-xs bg-white"
                    >
                      <option value="yes">
                        Yes — Father is listed (Both Mother’s & Father’s Valid IDs required)
                      </option>
                      <option value="no">
                        No Father listed / Solo Mother (Only Mother’s Valid ID required)
                      </option>
                    </select>
                  </div>

                  {circumstances.hasFather !== 'no' && (
                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Are the child’s / registrant’s parents legally married?
                      </label>
                      <select
                        value={circumstances.parentsMaritalStatus}
                        onChange={(e) =>
                          setCircumstances((prev) => ({
                            ...prev,
                            parentsMaritalStatus: e.target.value,
                          }))
                        }
                        className="form-input text-xs bg-white"
                      >
                        <option value="married">
                          Yes — Parents are married (Marriage Certificate applies)
                        </option>
                        <option value="unmarried">No — Parents are unmarried</option>
                        <option value="unsure">Not sure / Needs staff review</option>
                      </select>
                    </div>
                  )}

                  {circumstances.hasFather !== 'no' &&
                    circumstances.parentsMaritalStatus === 'unmarried' && (
                      <div className="sm:col-span-2">
                        <label className="block font-semibold text-slate-800 mb-1">
                          Will the child / registrant use the father’s surname?
                        </label>
                        <select
                          value={circumstances.childUsesFatherSurname}
                          onChange={(e) =>
                            setCircumstances((prev) => ({
                              ...prev,
                              childUsesFatherSurname: e.target.value,
                            }))
                          }
                          className="form-input text-xs bg-white"
                        >
                          <option value="yes">
                            Yes — Child will use father’s surname (AUSF / Acknowledgment required)
                          </option>
                          <option value="no">
                            No — Child will use mother’s surname (AUSF does not apply)
                          </option>
                        </select>
                      </div>
                    )}
                </div>
              </div>
            )}

            {selectedService.id === 'death_cert' && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3 text-xs">
                <div className="font-bold text-[#0e2756] uppercase tracking-wider text-[11px]">
                  Death Registration Circumstances (Determines Conditional Requirements)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Circumstance / Manner of Death
                    </label>
                    <select
                      value={circumstances.deathCircumstance}
                      onChange={(e) =>
                        setCircumstances((prev) => ({
                          ...prev,
                          deathCircumstance: e.target.value,
                        }))
                      }
                      className="form-input text-xs bg-white"
                    >
                      <option value="natural_attended">
                        Medically attended / Natural causes (Medico-Legal report not required)
                      </option>
                      <option value="medico_legal">
                        Sudden, unattended, accidental, suspected foul play, or autopsy (Medico-Legal / Police Report required)
                      </option>
                      <option value="unsure">
                        Not sure — Flag for Civil Registry staff review
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      When is the death being registered?
                    </label>
                    <select
                      value={circumstances.deathFilingTiming}
                      onChange={(e) =>
                        setCircumstances((prev) => ({
                          ...prev,
                          deathFilingTiming: e.target.value,
                          confirmedLateDeathRequirements:
                            e.target.value === 'within_30_days'
                              ? false
                              : prev.confirmedLateDeathRequirements,
                        }))
                      }
                      className="form-input text-xs bg-white"
                    >
                      <option value="within_30_days">
                        Within 30 days from date of death (Timely registration)
                      </option>
                      <option value="over_30_days">
                        More than 30 days after date of death (Late registration applies)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {selectedService.id === 'marriage_cert' && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-bold text-[#0e2756] uppercase tracking-wider text-[11px]">
                  Birth Record Availability for Marriage Certificate
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Do you have a PSA Birth Certificate available?
                  </label>
                  <select
                    value={circumstances.psaBirthAvailable}
                    onChange={(e) =>
                      setCircumstances((prev) => ({
                        ...prev,
                        psaBirthAvailable: e.target.value,
                      }))
                    }
                    className="form-input text-xs bg-white max-w-lg"
                  >
                    <option value="available">
                      Yes — Uploading PSA Birth Certificate
                    </option>
                    <option value="substitute_baptismal">
                      Unavailable — Uploading Baptismal Certificate or supporting records instead
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* Service Document Checklist & Upload Fields with Conditions */}
            <div className="space-y-4">
              {serviceReqs.map((req) => {
                const finding = reqFindings[req.id];
                const uploaded = uploadedDocs[req.id];
                const isChecking = checkingReqId === req.id;

                // Evaluate if this specific requirement is Not Applicable based on circumstances
                const notAppEntry = aiChecklistReview.notApplicableItems.find(
                  (item) => item.id === req.id
                );
                const flaggedEntry = aiChecklistReview.flaggedForStaffItems.find(
                  (item) => item.id === req.id
                );
                const unreadableEntry = aiChecklistReview.unreadableItems.find(
                  (item) => item.id === req.id
                );

                // Special Gate for Death Certificate Late Registration (> 30 days)
                const isLateDeathGate = req.conditionKey === 'death_late_registration_confirm';

                return (
                  <div
                    key={req.id}
                    className={`border rounded-xl p-5 space-y-3 transition-all ${
                      notAppEntry
                        ? 'bg-slate-50/60 border-slate-200 opacity-80'
                        : unreadableEntry
                        ? 'bg-rose-50/40 border-rose-300'
                        : finding?.status === 'passed'
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {/* Header & Condition Badge Beside Relevant Upload Field */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-900">
                            {req.name}
                          </span>
                          {notAppEntry ? (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
                              Does Not Apply
                            </span>
                          ) : req.is_conditional ? (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                              Conditional Requirement
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600">{req.description}</div>
                      </div>

                      {/* Condition Callout Shown Beside Upload Field */}
                      {req.condition && (
                        <div className="sm:max-w-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-[11px] text-slate-700 flex-shrink-0">
                          <span className="font-bold text-[#0e2756] block uppercase text-[10px]">
                            Checklist Condition:
                          </span>
                          <span>{req.condition}</span>
                        </div>
                      )}
                    </div>

                    {/* Supporting Document Dropdown for Late Birth Registration (At least 2 from list of 5) */}
                    {req.supportingOptions && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <label className="block font-semibold text-slate-800">
                          Select which supporting document you are uploading for this slot:
                        </label>
                        <select
                          value={circumstances[req.id + '_type'] || req.supportingOptions[0]}
                          onChange={(e) =>
                            setCircumstances((prev) => ({
                              ...prev,
                              [req.id + '_type']: e.target.value,
                            }))
                          }
                          className="form-input text-xs"
                        >
                          {req.supportingOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Late Death Registration Confirmation Gate before showing upload fields */}
                    {isLateDeathGate && !notAppEntry && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs space-y-2.5">
                        <div className="font-bold text-amber-950">
                          Late Registration (&gt; 30 Days After Date of Death) — Confirm Additional Requirements First
                        </div>
                        <p className="text-[11px] text-amber-900 leading-relaxed">
                          When a death is registered more than 30 days after the date of death, additional requirements apply: (1) Sworn Affidavit for Delayed Registration of Death stating the cause of delay, and (2) Certified copy of Burial/Cremation Permit or Barangay Certification of Death. Please confirm these requirements below before adding your late registration upload.
                        </p>
                        <label className="inline-flex items-center gap-2 font-bold text-[#0e2756] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={Boolean(circumstances.confirmedLateDeathRequirements)}
                            onChange={(e) =>
                              setCircumstances((prev) => ({
                                ...prev,
                                confirmedLateDeathRequirements: e.target.checked,
                              }))
                            }
                            className="rounded text-[#0e2756]"
                          />
                          <span>
                            I confirm the additional late registration requirements and want to unlock the upload field
                          </span>
                        </label>
                      </div>
                    )}

                    {/* If Does Not Apply, explain why in plain language */}
                    {notAppEntry ? (
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between">
                        <span>
                          <strong>Why this item does not apply:</strong> {notAppEntry.reason}
                        </span>
                      </div>
                    ) : isLateDeathGate && !circumstances.confirmedLateDeathRequirements ? (
                      <div className="p-3 bg-white border border-dashed border-amber-300 rounded-lg text-xs text-amber-900">
                        Check the confirmation box above to enable the upload field for Late Registration of Death.
                      </div>
                    ) : Array.isArray(req.subSlots) && req.subSlots.length > 0 ? (
                      /* Dual / Multi-Document Upload Fields (e.g. Valid IDs of Parents = Mother + Father if listed) */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                        {req.subSlots.map((subSlot) => {
                          const slotKeyId = `${req.id}__${subSlot.slotKey}`;
                          const slotFinding = reqFindings[slotKeyId];
                          const slotUploaded = uploadedDocs[slotKeyId];
                          const isSlotChecking = checkingReqId === slotKeyId;
                          const isFatherIdSkipped =
                            subSlot.slotKey === 'father_id' &&
                            circumstances.hasFather === 'no';

                          if (isFatherIdSkipped) {
                            return (
                              <div
                                key={subSlot.slotKey}
                                className="p-3.5 rounded-xl border border-slate-200 bg-slate-100/70 space-y-2 text-xs opacity-80 flex flex-col justify-between"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-700">
                                    {subSlot.label}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600 flex-shrink-0">
                                    Does Not Apply
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-600">
                                  <strong>Why this upload is skipped:</strong> You indicated there is no father listed on the birth record, so only the Mother’s Valid Government-Issued ID is required.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={subSlot.slotKey}
                              className={`p-3.5 rounded-xl border space-y-2.5 bg-white ${
                                slotFinding?.status === 'unreadable'
                                  ? 'border-rose-300'
                                  : slotFinding?.status === 'passed'
                                  ? 'border-emerald-300'
                                  : 'border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs text-slate-900">
                                  {subSlot.label}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                                    subSlot.required === false
                                      ? 'bg-slate-100 text-slate-600'
                                      : 'bg-blue-50 text-[#0e2756] border border-blue-200'
                                  }`}
                                >
                                  {subSlot.required === false ? 'If Available' : 'Required Upload'}
                                </span>
                              </div>

                              {/* Uniform Portal File Picker Control */}
                              <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-300 bg-slate-50/80 hover:border-[#0e2756] hover:bg-blue-50/30 cursor-pointer transition-all">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="px-3.5 py-2 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shadow-2xs flex-shrink-0">
                                    <Camera className="w-3.5 h-3.5" />
                                    <span>
                                      {slotUploaded ? 'Replace File' : 'Choose File / Photo'}
                                    </span>
                                  </span>
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold text-slate-800 truncate">
                                      {slotUploaded
                                        ? slotUploaded.fileName
                                        : 'No file chosen yet'}
                                    </div>
                                    <div className="text-[11px] text-slate-500 truncate">
                                      {slotUploaded?.fileSizeBytes
                                        ? `${Math.round(slotUploaded.fileSizeBytes / 1024)} KB • Attached`
                                        : 'PDF, JPG, or PNG (Max 10 MB)'}
                                    </div>
                                  </div>
                                </div>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  capture="environment"
                                  onChange={(e) =>
                                    handleFileChange(req, e.target.files?.[0], subSlot)
                                  }
                                  className="sr-only"
                                />
                              </label>

                              {isSlotChecking && (
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-[#0e2756] flex items-center gap-2 animate-fade-in">
                                  <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                                  <span>
                                    Checking if your photo is clear and matches your form...
                                  </span>
                                </div>
                              )}

                              {slotFinding && !isSlotChecking && slotFinding.status === 'passed' && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-950 text-xs space-y-1.5 animate-fade-in">
                                  <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                    Document is Clear & Matches Your Form
                                  </div>
                                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                                    {slotFinding.summary}
                                  </p>
                                </div>
                              )}

                              {slotFinding && !isSlotChecking && slotFinding.status === 'unreadable' && (
                                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 text-xs space-y-1.5 animate-fade-in">
                                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                                    Please Upload a Clear Photo of This Document
                                  </div>
                                  <p className="text-[11px] text-rose-800 leading-relaxed">
                                    {slotFinding.summary}
                                  </p>
                                </div>
                              )}

                              {slotFinding && !isSlotChecking && slotFinding.status === 'flagged_for_staff' && (
                                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-950 text-xs space-y-1.5 animate-fade-in">
                                  <div className="font-bold flex items-center gap-1.5 text-amber-900">
                                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                                    Photo Saved — Staff Will Double-Check This Document
                                  </div>
                                  <p className="text-[11px] text-amber-800 leading-relaxed">
                                    {slotFinding.summary}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <>
                        {/* Uniform Portal File Picker Control */}
                        <div className="space-y-2">
                          <label className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-slate-300 bg-white hover:border-[#0e2756] hover:bg-blue-50/20 cursor-pointer transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="px-4 py-2.5 bg-[#0e2756] hover:bg-[#122850] text-white rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-2 shadow-2xs flex-shrink-0">
                                <Camera className="w-4 h-4" />
                                <span>
                                  {uploaded ? 'Replace Attached File' : 'Choose File / Take Photo'}
                                </span>
                              </span>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate">
                                  {uploaded ? uploaded.fileName : 'No file chosen yet'}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {uploaded?.fileSizeBytes
                                    ? `${Math.round(uploaded.fileSizeBytes / 1024)} KB • Attached`
                                    : 'Tap to select a PDF, JPG, or PNG file (Max 10 MB)'}
                                </div>
                              </div>
                            </div>
                            {uploaded && (
                              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-center flex-shrink-0">
                                FILE ATTACHED
                              </span>
                            )}
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              capture="environment"
                              onChange={(e) => handleFileChange(req, e.target.files?.[0])}
                              className="sr-only"
                            />
                          </label>

                          {isChecking && (
                            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-[#0e2756] flex items-center gap-2.5 animate-fade-in">
                              <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                              <span>
                                Checking if your photo is clear and matches your form...
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Concise, Elder-Friendly AI Document Feedback */}
                        {finding && !isChecking && finding.status === 'passed' && (
                          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs space-y-1.5 animate-fade-in">
                            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              Document is Clear & Matches Your Form
                            </div>
                            <p className="text-[11px] text-emerald-800 leading-relaxed">
                              {finding.summary}
                            </p>
                          </div>
                        )}

                        {finding && !isChecking && finding.status === 'unreadable' && (
                          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs space-y-1.5 animate-fade-in">
                            <div className="font-bold flex items-center gap-1.5 text-rose-800">
                              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                              Please Upload a Clear Photo of This Document
                            </div>
                            <p className="text-[11px] text-rose-800 leading-relaxed">
                              {finding.summary}
                            </p>
                          </div>
                        )}

                        {!isChecking && (finding?.status === 'flagged_for_staff' || flaggedEntry) && (
                          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 text-xs space-y-1.5 animate-fade-in">
                            <div className="font-bold flex items-center gap-1.5 text-amber-900">
                              <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              Photo Saved — Staff Will Double-Check This Document
                            </div>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              {finding?.summary || flaggedEntry?.reason}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Simple, Elder-Friendly Document Summary Panel */}
            <div className="bg-white border-2 border-[#0e2756] rounded-2xl overflow-hidden text-xs shadow-sm">
              <div className="bg-navy-pattern text-white px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                    QUICK CHECK OF YOUR DOCUMENTS
                  </div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-white mt-0.5">
                    Checklist Summary for {selectedService.name}
                  </h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] font-bold self-start sm:self-auto ${
                    aiChecklistReview.isReady
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  {aiChecklistReview.isReady
                    ? 'Ready for Next Step'
                    : `${aiChecklistReview.missingItems.length + aiChecklistReview.unreadableItems.length} Item(s) Still Needed`}
                </span>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70">
                {/* 1. Missing Documents */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>1. Documents You Still Need to Attach</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        aiChecklistReview.missingItems.length > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {aiChecklistReview.missingItems.length}
                    </span>
                  </div>
                  {aiChecklistReview.missingItems.length === 0 ? (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      All required documents have been attached.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                      {aiChecklistReview.missingItems.map((m) => (
                        <li key={m.id}>
                          <strong className="text-slate-900">{m.name}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 2. Photos That Need to Be Replaced */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>2. Photos That Need a Clearer Copy</span>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[11px] ${
                        aiChecklistReview.unreadableItems.length > 0
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {aiChecklistReview.unreadableItems.length}
                    </span>
                  </div>
                  {aiChecklistReview.unreadableItems.length === 0 ? (
                    <p className="text-[11px] text-emerald-800 font-medium">
                      None — your attached photos are clear.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-rose-800 list-disc list-inside">
                      {aiChecklistReview.unreadableItems.map((u) => (
                        <li key={u.id}>
                          <strong className="text-rose-950">{u.name}:</strong> Please replace with a clear photo of the actual document.
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 3. Items Not Needed for Your Situation */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>3. Documents You Do Not Need to Submit</span>
                    <span className="px-2 py-0.5 rounded font-mono bg-blue-50 text-[#0e2756] border border-blue-200 text-[11px]">
                      {aiChecklistReview.notApplicableItems.length}
                    </span>
                  </div>
                  {aiChecklistReview.notApplicableItems.length === 0 ? (
                    <p className="text-[11px] text-slate-600">
                      All items on the list apply to your request.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                      {aiChecklistReview.notApplicableItems.map((na) => (
                        <li key={na.id}>
                          <strong className="text-slate-900">{na.name}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* 4. Attached & Ready */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                  <div className="font-bold text-slate-900 flex items-center justify-between">
                    <span>4. Attached Documents Ready for Staff</span>
                    <span className="px-2 py-0.5 rounded font-mono bg-blue-50 text-[#0e2756] border border-blue-200 text-[11px]">
                      {aiChecklistReview.verifiedItems.length +
                        aiChecklistReview.flaggedForStaffItems.length}
                    </span>
                  </div>
                  {aiChecklistReview.verifiedItems.length +
                    aiChecklistReview.flaggedForStaffItems.length ===
                  0 ? (
                    <p className="text-[11px] text-slate-600">
                      Your attached documents will appear here once you choose a photo or file above.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-emerald-900 list-disc list-inside">
                      {[
                        ...aiChecklistReview.verifiedItems,
                        ...aiChecklistReview.flaggedForStaffItems,
                      ].map((v) => (
                        <li key={v.id}>
                          <strong className="text-slate-900">{v.name}</strong> — Attached ({v.fileName || 'Ready'})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full sm:w-auto px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (aiChecklistReview.unreadableItems.length > 0) {
                    showToast(
                      `Please re-upload a clear copy of: ${aiChecklistReview.unreadableItems
                        .map((i) => i.name)
                        .join(', ')}`,
                      'error',
                      'Blurry / Unreadable Upload'
                    );
                    return;
                  }
                  setStep(4);
                }}
                className="w-full sm:w-auto px-6 py-3 bg-[#0e2756] text-white rounded-lg text-xs font-semibold hover:bg-[#122850] flex items-center justify-center gap-2"
              >
                <span>Next: Choose Visit Schedule</span>
                <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: COUNTER APPOINTMENT RESERVATION & FINAL REVIEW */}
        {step === 4 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif font-bold text-lg text-slate-900">
                Step 4: Choose Your Office Visit Schedule & Submit
              </h2>
              <p className="text-xs text-slate-500">
                Choose the date and time you want to visit the Civil Registry Office for document verification and personal appearance.
              </p>
            </div>

            {/* Counter Payment & Personal Appearance Reminder Notice */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">
                  Reminder: Payment at the Counter During Document Verification & Applicant Appearance
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  No online payment is collected on this portal. Please be reminded that payment will be processed directly at the Civil Registry Office counter upon verification of your original documents and your personal appearance during your scheduled appointment.
                </p>
              </div>
            </div>

            {/* Counter Slot Reservation */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
              <div>
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Choose Your Office Visit Date & Time
                </h3>
                <p className="text-[11px] text-slate-600">
                  Pick a convenient date and time window to verify your original documents at the Civil Registry Office.
                </p>
              </div>

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
            </div>

            {/* Application Summary */}
            <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-xs space-y-2.5">
              <div className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-200">
                Application & Appointment Review Summary
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
                <span className="text-slate-600">Requested Certified Copies:</span>
                <span className="font-semibold text-slate-900">{subject.copiesCount} copy/copies</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-900">
                  Payment Reminder:
                </span>
                <span className="font-bold text-[#0e2756]">
                  Payable at Counter During Document Verification & Applicant Appearance
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
                  <div className="font-bold text-slate-900">2. Original Valid ID & Documents</div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Bring your original government ID and supporting documents for counter verification.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-blue-100 shadow-2xs">
                  <div className="font-bold text-slate-900">
                    3. Counter Payment Upon Appearance
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Payment will be settled at the Civil Registry counter upon document verification and personal appearance.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-3 bg-[#0e2756] text-white rounded-lg text-xs font-semibold hover:bg-[#122850] shadow-sm flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 flex-shrink-0" />
                <span>Submit Request & Confirm Visit</span>
              </button>
            </div>
          </div>
        )}
      </form>

    </PortalLayout>
  );
}
