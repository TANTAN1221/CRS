// =====================================================================
// CIVIL REGISTRY PORTAL - FIREBASE v10 SDK & AI OCR AUTO-FILL SERVICE
// Pure Live Firebase Mode (`crss-cd118`) — Zero localStorage Data Caching
// =====================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  getIdTokenResult,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getDatabase,
  ref as rtdbRef,
  set as rtdbSet,
  get as rtdbGet,
  remove as rtdbRemove,
  update as rtdbUpdate,
  onValue as rtdbOnValue,
} from 'firebase/database';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  getFunctions,
  httpsCallable,
} from 'firebase/functions';
import Tesseract from 'tesseract.js';
import { createClient } from '@supabase/supabase-js';

// Live Supabase Storage Configuration for Document Uploads
export const SUPABASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://qekqquwdfnfhufavprew.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  'sb_publishable_AXpdSgUws9Ym8l14XvjKQA_eRsH3BNV';
export const SUPABASE_BUCKET =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_BUCKET) ||
  'civil-registry-documents';

// Reuse the client during Vite HMR so development reloads do not create
// multiple GoTrue clients with the same browser storage key.
export const supabase =
  globalThis.__CRS_SUPABASE__ ||
  (globalThis.__CRS_SUPABASE__ = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY));

// Erase any legacy localStorage / sessionStorage keys immediately on load
export function purgeAllBrowserStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (
        k &&
        ((k.startsWith('crs_') && !k.startsWith('crs_application_draft_')) ||
          k.startsWith('doc_cache_'))
      ) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch (e) {}
}
purgeAllBrowserStorage();

// Live Firebase configuration for project `crss-cd118`
export const firebaseConfig = {
  apiKey: 'AIzaSyAVabmZfgFu8MKRq9T37MIuqfWZEoCh7f8',
  authDomain: 'crss-cd118.firebaseapp.com',
  databaseURL: 'https://crss-cd118-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'crss-cd118',
  storageBucket: 'crss-cd118.firebasestorage.app',
  messagingSenderId: '440730926641',
  appId: '1:440730926641:web:780f19090d30709dcbdf10',
  measurementId: 'G-NGWHXE1PM4',
};

export const LIVE_FIREBASE_CONFIG = {
  enabled: true,
  ...firebaseConfig,
};

// Initialize Firebase eagerly on module load
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export let analytics = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported()
    .then((yes) => {
      if (yes) analytics = getAnalytics(app);
    })
    .catch(() => {});
}

const sdkInstance = {
  app,
  auth: getAuth(app),
  db: getFirestore(app),
  // Firestore is the active client database; avoid legacy RTDB permission errors.
  rtdb: null,
  storage: getStorage(app),
  functions: getFunctions(app),
};

// Secondary Firebase App instance so Admin can create new Auth accounts (with password)
// without logging out the currently active Admin session!
const secondaryApp =
  getApps().find((a) => a.name === 'AdminProvisionApp') ||
  initializeApp(firebaseConfig, 'AdminProvisionApp');
const secondaryAuth = getAuth(secondaryApp);

export function normalizeEmailKey(email) {
  return String(email || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');
}

export async function provisionFirebaseAuthAccount(
  email,
  password,
  displayName,
  role = 'personnel'
) {
  const cleanRole = String(role || 'personnel').trim().toLowerCase();
  const taggedDisplayName = `${(displayName || '').trim()}||ROLE:${cleanRole}`;
  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      password
    );
    await updateProfile(cred.user, { displayName: taggedDisplayName }).catch(
      () => {}
    );
    const uid = cred.user.uid;
    await signOut(secondaryAuth).catch(() => {});
    return uid;
  } catch (err) {
    // If the email already exists in Firebase Auth and the admin supplied its password,
    // sign in on the secondary instance to update the role tag and retrieve its real UID!
    if (err?.code === 'auth/email-already-in-use' && password) {
      try {
        const existingCred = await signInWithEmailAndPassword(
          secondaryAuth,
          email.trim(),
          password
        );
        await updateProfile(existingCred.user, {
          displayName: taggedDisplayName,
        }).catch(() => {});
        const existingUid = existingCred.user.uid;
        await signOut(secondaryAuth).catch(() => {});
        return existingUid;
      } catch (signInErr) {
        // Fall through if password didn't match existing Auth account
      }
    }
    throw err;
  }
}

export function extractRoleFromAuthUser(fbUser) {
  if (!fbUser?.displayName) return null;
  const match = String(fbUser.displayName).match(/\|\|ROLE:(admin|personnel|applicant)/i);
  return match ? match[1].toLowerCase() : null;
}

export function extractCleanNameFromAuthUser(fbUser) {
  if (!fbUser?.displayName) return '';
  return String(fbUser.displayName).split('||ROLE:')[0].trim();
}

export function getFirebaseSdk() {
  return sdkInstance;
}

// Primary Portal Administrator emails automatically granted `admin` role in Firebase
export const ADMIN_EMAILS = ['crsadmin@gmail.com'];

export function isDesignatedAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());
}

export const DEFAULT_SERVICES = [
  {
    id: 'birth_cert',
    name: 'Birth Registration (Timely)',
    code: 'BRL-01',
    description:
      'For parents registering the birth of their baby within the 30-day statutory registration period.',
    processing_days: 3,
    fee_amount: 155.0,
    feeNote: 'Informational statutory fee only — payable at Civil Registry Cashier Counter upon appointment (RA 3753 / LGC 1991).',
    icon_name: 'baby',
    is_active: true,
  },
  {
    id: 'marriage_cert',
    name: 'Marriage Certificate',
    code: 'COM-02',
    description:
      'Official registration or certified true copy issuance of Certificate of Marriage from the Local Civil Registry.',
    processing_days: 3,
    fee_amount: 155.0,
    feeNote: 'Informational statutory fee only — payable at Civil Registry Cashier Counter upon appointment (RA 3753 / LGC 1991).',
    icon_name: 'heart-handshake',
    is_active: true,
  },
  {
    id: 'delayed_birth',
    name: 'Birth Registration (Late)',
    code: 'BR-LATE-03',
    description:
      'Delayed registration of birth for vital events filed beyond the 30-day statutory registration period.',
    processing_days: 10,
    fee_amount: 350.0,
    feeNote: 'Informational statutory fee only — payable at Civil Registry Cashier Counter after 10-day statutory posting period.',
    icon_name: 'clock',
    is_active: true,
  },
  {
    id: 'death_cert',
    name: 'Death Certificate',
    code: 'COD-04',
    description:
      'Official registration and certified copy issuance of Certificate of Death for legal, burial, or claim requirements.',
    processing_days: 2,
    fee_amount: 150.0,
    feeNote: 'Informational statutory fee only — payable at Civil Registry Cashier Counter upon appointment (RA 3753 / LGC 1991).',
    icon_name: 'file-text',
    is_active: true,
  },
];

export const DEFAULT_REQUIREMENTS = {
  birth_cert: [
    {
      id: 'req-bt-1',
      serviceId: 'birth_cert',
      name: 'Parents’ Marriage Certificate',
      condition: 'Required if the parents are married.',
      conditionKey: 'parents_married',
      description:
        'Official PSA or Local Civil Registry copy of the parents’ marriage certificate.',
      is_mandatory: false,
      is_conditional: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bt-2',
      serviceId: 'birth_cert',
      name: 'Valid IDs of Parents',
      condition:
        'Mother’s Valid ID is always required. Father’s Valid ID is required if a father is listed/acknowledged on the birth record.',
      conditionKey: 'always',
      subSlots: [
        {
          slotKey: 'mother_id',
          label: 'Document 1: Mother’s Valid Government-Issued ID',
          required: true,
        },
        {
          slotKey: 'father_id',
          label: 'Document 2: Father’s Valid Government-Issued ID',
          required: true,
        },
      ],
      description:
        "Upload clear scans of the Mother's valid government ID, and the Father's valid government ID if a father is listed on the record.",
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bt-3',
      serviceId: 'birth_cert',
      name: 'Birth Data Sheet',
      condition: 'Provided by the hospital or birthing facility.',
      conditionKey: 'always',
      description:
        'Accomplished birth data sheet or Certificate of Live Birth (Municipal Form 102) issued by the hospital or lying-in clinic.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bt-4',
      serviceId: 'birth_cert',
      name: 'Affidavit to Use the Surname of the Father (AUSF) / Affidavit of Acknowledgment',
      condition:
        'Required if the parents are unmarried and the child will use the father’s surname.',
      conditionKey: 'parents_unmarried_father_surname',
      description:
        'Sworn AUSF and Affidavit of Acknowledgment/Admission of Paternity executed under RA 9255.',
      is_mandatory: false,
      is_conditional: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
  delayed_birth: [
    {
      id: 'req-bl-1',
      serviceId: 'delayed_birth',
      name: 'PSA Negative Certification of Birth Record',
      condition: 'Always required for late birth registration.',
      conditionKey: 'always',
      description:
        'Official PSA Certification of No Birth Record verifying that the birth has not been previously registered.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-2',
      serviceId: 'delayed_birth',
      name: 'Certificate of Live Birth',
      condition: 'Accomplished Municipal Form 102 (4 copies at counter).',
      conditionKey: 'always',
      description:
        'Duly accomplished Certificate of Live Birth showing complete birth and parental details.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-3',
      serviceId: 'delayed_birth',
      name: 'Affidavit for Delayed Registration',
      condition: 'Required declaration stating the facts of birth and reason for delay.',
      conditionKey: 'always',
      description:
        'Signed and notarized Affidavit for Delayed Registration (back of COLB or standalone affidavit).',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-4',
      serviceId: 'delayed_birth',
      name: 'Affidavit of Two Disinterested Persons',
      condition:
        'Must be executed by two people who are unrelated to the registrant and who witnessed or have personal knowledge of the birth.',
      conditionKey: 'always',
      description:
        'Notarized joint affidavit of two disinterested witnesses with copies of their valid IDs.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-5',
      serviceId: 'delayed_birth',
      name: 'Supporting Document #1 (At least two required from approved list)',
      condition:
        'Choose 1st document from: Baptismal certificate; Earliest school records (Form 137 / Transcript of Records); Medical or immunization records; Parent’s Income Tax Return (ITR) or insurance policy; or Government IDs/records (National ID, Voter’s Registration Record, SSS, PhilHealth, or Pag-IBIG ID).',
      conditionKey: 'supporting_doc_1',
      supportingOptions: [
        'Baptismal certificate',
        'Earliest school records (Form 137 or Transcript of Records)',
        'Medical or immunization records',
        'Parent’s Income Tax Return (ITR) or insurance policy',
        'Government IDs or records (National ID, Voter’s Registration Record, SSS, PhilHealth, or Pag-IBIG ID)',
      ],
      description:
        'First supporting document establishing date and place of birth and parentage.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-6',
      serviceId: 'delayed_birth',
      name: 'Supporting Document #2 (At least two required from approved list)',
      condition:
        'Choose 2nd document from: Baptismal certificate; Earliest school records (Form 137 / Transcript of Records); Medical or immunization records; Parent’s Income Tax Return (ITR) or insurance policy; or Government IDs/records (National ID, Voter’s Registration Record, SSS, PhilHealth, or Pag-IBIG ID).',
      conditionKey: 'supporting_doc_2',
      supportingOptions: [
        'Baptismal certificate',
        'Earliest school records (Form 137 or Transcript of Records)',
        'Medical or immunization records',
        'Parent’s Income Tax Return (ITR) or insurance policy',
        'Government IDs or records (National ID, Voter’s Registration Record, SSS, PhilHealth, or Pag-IBIG ID)',
      ],
      description:
        'Second supporting document from the approved list above.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-7',
      serviceId: 'delayed_birth',
      name: 'Barangay Certification',
      condition: 'Issued by the barangay where the registrant resides or was born.',
      conditionKey: 'always',
      description:
        'Official Barangay Certification confirming residency and identity of the registrant.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-bl-8',
      serviceId: 'delayed_birth',
      name: 'Parents’ Marriage Certificate or Affidavit to Use the Surname of the Father (AUSF)',
      condition:
        'Parents’ Marriage Certificate if applicable (parents are married), or an Affidavit to Use the Surname of the Father (AUSF) if the parents are unmarried and the child will use the father’s surname.',
      conditionKey: 'parents_marriage_or_ausf',
      description:
        'Upload Parents’ Marriage Certificate (if married) or notarized AUSF (if unmarried and using father’s surname).',
      is_mandatory: false,
      is_conditional: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
  death_cert: [
    {
      id: 'req-d-1',
      serviceId: 'death_cert',
      name: 'Accomplished Certificate of Death',
      condition: 'Signed by the attending physician, health officer, or coroner.',
      conditionKey: 'always',
      description:
        'Duly accomplished Municipal Form 103 (Certificate of Death) with medical cause of death.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-d-2',
      serviceId: 'death_cert',
      name: 'Valid ID of Informant / Nearest Kin (plus Valid ID of Deceased if available)',
      condition:
        'Valid ID of the informant or nearest kin is required; include a valid ID of the deceased in the second upload field if available.',
      conditionKey: 'always',
      subSlots: [
        {
          slotKey: 'informant_id',
          label: 'Document 1: Valid ID of Informant or Nearest Kin (Required)',
          required: true,
        },
        {
          slotKey: 'deceased_id',
          label: 'Document 2: Valid ID of the Deceased (If available / Optional)',
          required: false,
        },
      ],
      description:
        'Government-issued ID of the informant/nearest kin, plus a separate upload slot for the deceased’s valid ID if available.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-d-3',
      serviceId: 'death_cert',
      name: 'Medico-Legal Certificate or Police Report',
      condition:
        'Required if the death was sudden, unattended, or accidental, or if it involved suspected foul play or an autopsy.',
      conditionKey: 'death_medico_legal',
      description:
        'Official Medico-Legal report, autopsy findings, or police investigation report.',
      is_mandatory: false,
      is_conditional: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-d-4',
      serviceId: 'death_cert',
      name: 'Late Registration of Death (> 30 Days After Date of Death)',
      condition:
        'Applies when the death is registered more than 30 days after the date of death. Confirm the additional requirements with the Civil Registry Office before adding upload fields for late registration.',
      conditionKey: 'death_late_registration_confirm',
      isConfirmationGate: true,
      description:
        'Additional late registration affidavits and burial/cremation permits must be confirmed first before enabling upload fields.',
      is_mandatory: false,
      is_conditional: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
  marriage_cert: [
    {
      id: 'req-m-1',
      serviceId: 'marriage_cert',
      name: 'PSA Birth Certificate (or Baptismal Certificate / Supporting Records)',
      condition:
        'Accept a baptismal certificate or supporting records if the PSA Birth Certificate is unavailable.',
      conditionKey: 'always',
      description:
        'PSA Birth Certificate of contracting parties, or Baptismal Certificate / early supporting records if PSA copy is unavailable.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-m-2',
      serviceId: 'marriage_cert',
      name: 'PSA Certificate of No Marriage (CENOMAR) — Both Parties (2 Documents Required)',
      condition: 'Require one from each party (2 separate uploads).',
      conditionKey: 'always',
      subSlots: [
        {
          slotKey: 'party1_cenomar',
          label: 'Document 1: PSA CENOMAR of First Party / Groom',
          required: true,
        },
        {
          slotKey: 'party2_cenomar',
          label: 'Document 2: PSA CENOMAR of Second Party / Bride',
          required: true,
        },
      ],
      description:
        'Official PSA CENOMAR issued for each contracting party (upload one for each party).',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-m-3',
      serviceId: 'marriage_cert',
      name: 'Pre-Marriage Counseling or Family Planning Certificates',
      condition: 'Issued by the local government, DSWD, or health office.',
      conditionKey: 'always',
      description:
        'Certificate of Compliance / Attendance from the local government, DSWD, or City Health Office.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-m-4',
      serviceId: 'marriage_cert',
      name: 'Valid IDs',
      condition: 'Government-issued valid IDs showing age and residency.',
      conditionKey: 'always',
      description:
        "Clear scan of valid government IDs (PhilSys National ID, Passport, Driver's License, UMID, or Postal ID).",
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-m-5',
      serviceId: 'marriage_cert',
      name: '2×2 Photos',
      condition: 'Recent 2×2 ID photographs with white or plain background.',
      conditionKey: 'always',
      description:
        'Clear digital image or scan of recent 2×2 photos for the marriage application record.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-m-6',
      serviceId: 'marriage_cert',
      name: 'Community Tax Certificate (Cedula) or Barangay Proof of Residency',
      condition: 'Current year Cedula or Barangay Certificate of Residency.',
      conditionKey: 'always',
      description:
        'Community Tax Certificate (Cedula) or Barangay Certificate proving local residency.',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
};

export const TIME_SLOTS = [
  '08:30 AM - 09:00 AM',
  '09:00 AM - 09:30 AM',
  '09:30 AM - 10:00 AM',
  '10:00 AM - 10:30 AM',
  '10:30 AM - 11:00 AM',
  '11:00 AM - 11:30 AM',
  '01:00 PM - 01:30 PM',
  '01:30 PM - 02:00 PM',
  '02:00 PM - 02:30 PM',
  '02:30 PM - 03:00 PM',
  '03:00 PM - 03:30 PM',
  '03:30 PM - 04:00 PM',
  '04:00 PM - 04:30 PM',
];

export const DEFAULT_SCHEDULE_CONFIG = {
  defaultCapacity: 8,
  operatingWeekdays: [1, 2, 3, 4, 5], // Mon=1 .. Fri=5 (Sun=0, Sat=6)
  activeTimeSlots: TIME_SLOTS,
  closedDates: {}, // { '2026-11-30': 'Bonifacio Day Holiday' }
  openDates: {}, // { '2026-11-28': 'Saturday Special Counter' }
  dateOverrides: {}, // { '2026-11-25': { capacity: 10, activeTimeSlots: [...], slotCapacities: { '08:30 AM - 09:00 AM': 12 } } }
};

export const LIFECYCLE_STAGE_MAP = {
  submitted: {
    stage: 'Form Filled & Submitted',
    progress: 35,
    stepIndex: 1,
    formProgress: '100% Form Fields Completed',
    reviewStatus: 'Queued for Personnel Review',
  },
  pre_screened: {
    stage: 'Form & Attachments Pre-Checked',
    progress: 55,
    stepIndex: 2,
    formProgress: '100% Form & ID Scan Verified',
    reviewStatus: 'Assigned to Registry Officer for Review',
  },
  under_review: {
    stage: 'Under Personnel Review',
    progress: 75,
    stepIndex: 2,
    formProgress: '100% Form Fields Completed',
    reviewStatus: 'Currently Being Reviewed by Civil Registry Personnel',
  },
  ready_for_appointment: {
    stage: 'Reviewed & Approved by Personnel',
    progress: 100,
    stepIndex: 3,
    formProgress: '100% Form Fields Verified',
    reviewStatus: 'Approved by Civil Registry Personnel',
  },
  completed: {
    stage: 'Reviewed & Approved by Personnel',
    progress: 100,
    stepIndex: 3,
    formProgress: '100% Form Fields Verified',
    reviewStatus: 'Verified & Completed by Civil Registry Personnel',
  },
  returned: {
    stage: 'Returned by Personnel for Form Correction',
    progress: 45,
    stepIndex: 2,
    formProgress: 'Needs Form / Attachment Correction',
    reviewStatus: 'Reviewed by Personnel — Action Required',
  },
};

// =====================================================================
// AI DOCUMENT SCANNER & AUTOMATED FORM INPUT EXTRACTOR
// =====================================================================
export const AI_SCAN_PRESETS = {
  philsys_id: {
    label: 'PhilSys National ID (Maria Santos Dela Cruz)',
    documentType: 'Philippine National Identification (PhilSys)',
    overallScore: 97,
    summary:
      'PhilSys National ID scanned with 97% optical clarity. Bearer name, date of birth, place of birth, and CRN extracted for automatic form pre-fill.',
    fields: {
      fullName: { value: 'Maria Santos Dela Cruz', confidence: 0.99, label: 'Subject Full Name' },
      dateOfBirth: { value: '1995-04-12', confidence: 0.98, label: 'Date of Birth / Event' },
      placeOfBirth: {
        value: 'Manila City General Hospital, Metro Manila',
        confidence: 0.95,
        label: 'Place of Birth / Event',
      },
      motherMaidenName: {
        value: 'Corazon Reyes Santos',
        confidence: 0.92,
        label: "Mother's Maiden Name",
      },
      fatherName: {
        value: 'Juan Mendoza Dela Cruz',
        confidence: 0.94,
        label: "Father's Full Name",
      },
      idNumber: { value: 'CRN-4421-9812-0041-8931', confidence: 0.99, label: 'PhilSys CRN / ID No.' },
    },
  },
  live_birth_colb: {
    label: 'Certificate of Live Birth — Municipal Form 102',
    documentType: 'Certificate of Live Birth (Municipal Form 102)',
    overallScore: 94,
    summary:
      'Certificate of Live Birth (Form 102) scanned. Registry book number, child full name, parents, and hospital of birth extracted. Father middle name has moderate contrast (84% confidence) — please verify.',
    fields: {
      fullName: { value: 'Gabriel Lorenzo Mendoza', confidence: 0.97, label: 'Subject Full Name' },
      dateOfBirth: { value: '2001-08-24', confidence: 0.96, label: 'Date of Birth / Event' },
      placeOfBirth: {
        value: 'St. Luke Medical Center, Quezon City',
        confidence: 0.94,
        label: 'Place of Birth / Event',
      },
      motherMaidenName: {
        value: 'Elena Villanueva Lorenzo',
        confidence: 0.93,
        label: "Mother's Maiden Name",
      },
      fatherName: {
        value: 'Roberto Cruz Mendoza',
        confidence: 0.84,
        label: "Father's Full Name (Verify Middle Name)",
      },
      registryNumber: { value: '2001-LCR-08914', confidence: 0.96, label: 'Local Registry Book No.' },
    },
  },
  marriage_form97: {
    label: 'Certificate of Marriage — Municipal Form 97',
    documentType: 'Certificate of Marriage (Form 97)',
    overallScore: 96,
    summary:
      'Marriage Certificate (Form 97) scanned. Contracting spouses, date of marriage, place of solemnization, and parental details extracted.',
    fields: {
      fullName: {
        value: 'Maria Santos Dela Cruz & Gabriel Lorenzo Mendoza',
        confidence: 0.97,
        label: 'Contracting Parties / Subject Name',
      },
      dateOfBirth: { value: '2024-02-14', confidence: 0.98, label: 'Date of Marriage / Event' },
      placeOfBirth: {
        value: 'Minor Basilica & Metropolitan Cathedral, Manila',
        confidence: 0.95,
        label: 'Place of Marriage / Event',
      },
      motherMaidenName: {
        value: 'Corazon Reyes Santos',
        confidence: 0.91,
        label: "Bride Mother's Maiden Name",
      },
      fatherName: {
        value: 'Juan Mendoza Dela Cruz',
        confidence: 0.92,
        label: "Bride Father's Full Name",
      },
      registryNumber: { value: 'COM-2024-01422', confidence: 0.97, label: 'Marriage Registry No.' },
    },
  },
};

// =====================================================================
// REAL IN-BROWSER OCR TEXT EXTRACTION & DOCUMENT AUTHENTICITY VERIFIER
// Runs Tesseract.js OCR on uploaded images (and text extraction on PDFs),
// rejects dummy/non-document files, checks requirement keywords, and
// compares extracted names & dates against the applicant's Step 2 form.
// =====================================================================
const OFFICIAL_DOC_KEYWORDS = [
  'republic',
  'pilipinas',
  'philippines',
  'republika',
  'pambansang',
  'pagkakakilanlan',
  'identification',
  'certificate',
  'certification',
  'registry',
  'registrar',
  'civil',
  'municipal',
  'province',
  'birth',
  'live',
  'marriage',
  'death',
  'deceased',
  'cenomar',
  'affidavit',
  'sworn',
  'ausf',
  'surname',
  'father',
  'mother',
  'maiden',
  'parents',
  'hospital',
  'clinic',
  'physician',
  'attendant',
  'medico',
  'police',
  'barangay',
  'cedula',
  'baptismal',
  'parish',
  'school',
  'transcript',
  'voter',
  'immunization',
  'license',
  'passport',
  'umid',
  'sss',
  'gsis',
  'philhealth',
  'postal',
  'philsys',
  'crn',
  'name',
  'last',
  'first',
  'middle',
  'sex',
  'date',
  'place',
  'address',
  'signature',
];

async function extractRealTextFromUploadedFile(fileInput) {
  if (!fileInput) return null;

  const rawBlob =
    fileInput instanceof File || fileInput instanceof Blob
      ? fileInput
      : fileInput.rawFile instanceof File || fileInput.rawFile instanceof Blob
      ? fileInput.rawFile
      : null;

  const dataUrl =
    typeof fileInput === 'string'
      ? fileInput
      : fileInput.previewDataUrl || fileInput.downloadUrl || null;

  const mime = String(
    fileInput.type || fileInput.mimeType || rawBlob?.type || ''
  ).toLowerCase();
  const fName = String(fileInput.name || fileInput.fileName || '').toLowerCase();
  const isPdf =
    mime.includes('pdf') ||
    fName.endsWith('.pdf') ||
    (typeof dataUrl === 'string' && dataUrl.startsWith('data:application/pdf'));

  // 1. PDF Text Stream Extraction
  if (isPdf && rawBlob) {
    try {
      const buf = await rawBlob.arrayBuffer();
      const rawAscii = new TextDecoder('latin1').decode(new Uint8Array(buf));
      // Extract parenthesized literal strings in PDF content streams: (Text)
      const matches = rawAscii.match(/\(([^()\\]{2,120})\)/g) || [];
      const extractedText = matches
        .map((m) => m.slice(1, -1))
        .filter((s) => /[a-zA-Z]{2,}/.test(s))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = (extractedText.match(/[a-zA-Z]{3,}/g) || []).map((w) =>
        w.toLowerCase()
      );
      return {
        rawText: extractedText,
        confidence: words.length >= 6 ? 88 : 32,
        words,
        source: 'pdf_text_stream',
      };
    } catch {
      return { rawText: '', confidence: 25, words: [], source: 'pdf_error' };
    }
  }

  // 2. Real Image OCR via Tesseract.js
  const ocrTarget = dataUrl || rawBlob;
  if (!ocrTarget) return null;

  try {
    const res = await Tesseract.recognize(ocrTarget, 'eng');
    const rawText = String(res?.data?.text || '')
      .replace(/\s+/g, ' ')
      .trim();
    const confidence = Math.round(Number(res?.data?.confidence || 0));
    // Count real alphabetic words of at least 3 letters
    const words = (rawText.match(/[a-zA-Z]{3,}/g) || []).map((w) => w.toLowerCase());
    return {
      rawText,
      confidence,
      words,
      source: 'tesseract_ocr',
    };
  } catch {
    return null;
  }
}

function getExpectedKeywordsForRequirement(reqName = '') {
  const r = reqName.toLowerCase();
  if (r.includes('id') || r.includes('identification')) {
    return {
      category: 'Valid Government-Issued ID',
      keywords: [
        'republic',
        'pilipinas',
        'philippines',
        'republika',
        'identification',
        'pagkakakilanlan',
        'pambansang',
        'id',
        'license',
        'passport',
        'umid',
        'postal',
        'voter',
        'sss',
        'gsis',
        'philhealth',
        'barangay',
        'crn',
        'name',
        'date',
        'birth',
        'sex',
        'address',
        'signature',
      ],
    };
  }
  if (r.includes('live birth') || r.includes('102') || r.includes('birth cert')) {
    return {
      category: 'Certificate of Live Birth / Birth Record',
      keywords: [
        'birth',
        'live',
        'certificate',
        '102',
        'child',
        'mother',
        'father',
        'maiden',
        'sex',
        'hospital',
        'attendant',
        'registry',
        'municipal',
        'republic',
        'pilipinas',
      ],
    };
  }
  if (r.includes('marriage') || r.includes('97') || r.includes('90')) {
    return {
      category: 'Marriage Certificate / License',
      keywords: [
        'marriage',
        'certificate',
        'contracting',
        'husband',
        'wife',
        'spouse',
        'solemnizing',
        'license',
        '97',
        '90',
        'parents',
        'registry',
      ],
    };
  }
  if (r.includes('cenomar') || r.includes('no marriage')) {
    return {
      category: 'Certificate of No Marriage (CENOMAR)',
      keywords: ['marriage', 'no marriage', 'cenomar', 'single', 'record', 'psa', 'certificate'],
    };
  }
  if (r.includes('death') || r.includes('103') || r.includes('medico') || r.includes('burial')) {
    return {
      category: 'Death Certificate / Medico-Legal Record',
      keywords: [
        'death',
        'deceased',
        '103',
        'certificate',
        'cause',
        'physician',
        'medico',
        'police',
        'burial',
        'corpse',
        'attendant',
        'informant',
      ],
    };
  }
  if (r.includes('affidavit') || r.includes('ausf') || r.includes('surname')) {
    return {
      category: 'Sworn Affidavit / AUSF',
      keywords: [
        'affidavit',
        'sworn',
        'surname',
        'father',
        'delayed',
        'late',
        'registration',
        'subscrib',
        'notary',
        'birth',
      ],
    };
  }
  return {
    category: reqName || 'Civil Registry Supporting Document',
    keywords: OFFICIAL_DOC_KEYWORDS,
  };
}

export async function scanDocumentForAutoFill({
  presetKey = 'philsys_id',
  file = null,
  qualityHint = 'clear',
  requirementName = '',
  expectedDetails = null,
}) {
  const preset = AI_SCAN_PRESETS[presetKey] || AI_SCAN_PRESETS.philsys_id;
  const fName = file?.name || file?.fileName || `${presetKey}_scan.jpg`;
  const lowerName = fName.toLowerCase();
  const targetReqLabel = requirementName || preset.documentType;

  // Determine if we have an actual uploaded File/Blob/DataURL to run real OCR on
  const hasRealFileContent = Boolean(
    file &&
      (file instanceof File ||
        file instanceof Blob ||
        file.rawFile ||
        file.previewDataUrl ||
        file.downloadUrl)
  );

  // If no real file content was uploaded (e.g. user clicked a Sample ID Preset in the top modal),
  // return the sample preset directly.
  if (!hasRealFileContent) {
    await new Promise((r) => setTimeout(r, 450));
    return {
      ...preset,
      readabilityStatus: 'verified',
      fileName: fName,
      scannedAt: new Date().toISOString(),
    };
  }

  // Run REAL OCR on the uploaded image or PDF
  const ocrResult = await extractRealTextFromUploadedFile(file);
  const rawText = ocrResult?.rawText || '';
  const lowerText = rawText.toLowerCase();
  const words = ocrResult?.words || [];
  const rawOcrConf = ocrResult?.confidence || 0;

  // Match general official document keywords and requirement-specific keywords
  const matchedGeneralKeywords = OFFICIAL_DOC_KEYWORDS.filter((kw) =>
    lowerText.includes(kw)
  );
  const reqProfile = getExpectedKeywordsForRequirement(targetReqLabel);
  const matchedReqKeywords = reqProfile.keywords.filter((kw) =>
    lowerText.includes(kw)
  );

  // Expected Step 2 form details
  const expectedName = expectedDetails?.fullName?.trim() || '';
  const expectedDate = expectedDetails?.dateOfBirth?.trim() || '';
  const expectedMother = expectedDetails?.motherMaidenName?.trim() || '';
  const expectedFather = expectedDetails?.fatherName?.trim() || '';

  // Tokenize Step 2 name (tokens >= 3 chars) to check if the uploaded document actually contains the applicant's name
  const nameTokens = expectedName
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((t) => t.length >= 3);
  const matchedNameTokens = nameTokens.filter((t) => lowerText.includes(t));
  const nameMatchRatio =
    nameTokens.length > 0 ? matchedNameTokens.length / nameTokens.length : 0;

  // Check if event year or date appears in the document text
  const expectedYear = expectedDate ? expectedDate.split('-')[0] : '';
  const dateMatched = Boolean(
    expectedYear && expectedYear.length === 4 && lowerText.includes(expectedYear)
  );

  // Clean snippet of what OCR actually read from the file (shown to the user for transparency)
  const extractedSnippet = rawText
    ? rawText.slice(0, 180) + (rawText.length > 180 ? '…' : '')
    : 'No readable text found in uploaded file';

  // 1. STRICT DUMMY / NON-DOCUMENT / UNREADABLE FILE REJECTION
  const isNamedBlurry =
    qualityHint === 'blurry' ||
    lowerName.includes('blur') ||
    lowerName.includes('crop') ||
    lowerName.includes('dummy');

  const isDummyOrNonDocument =
    isNamedBlurry ||
    words.length < 5 ||
    (matchedGeneralKeywords.length === 0 && matchedNameTokens.length === 0) ||
    rawOcrConf < 28;

  if (isDummyOrNonDocument) {
    const lowScore = Math.min(
      42,
      Math.max(12, Math.round(rawOcrConf * 0.4 + matchedGeneralKeywords.length * 8))
    );
    return {
      ...preset,
      overallScore: lowScore,
      readabilityStatus: 'unreadable',
      fileName: fName,
      extractedTextSnippet: extractedSnippet,
      comparisonChecks: [
        {
          label: 'Problem Found',
          value: 'Words cannot be read or wrong photo attached',
          matched: false,
        },
        {
          label: 'What to Do',
          value: `Tap "Replace File" and upload a clear photo of your ${reqProfile.category}`,
          matched: false,
        },
      ],
      summary: `We could not read the words on this file, or it is not a "${targetReqLabel}". Please tap "Replace File" above and choose a clear photo of the actual document in good light.`,
      scannedAt: new Date().toISOString(),
    };
  }

  // 2. Try to parse fields from real OCR text (for Top "Scan ID to Auto-Fill" modal as well)
  const crnMatch = rawText.match(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/);
  const isoDateMatch =
    rawText.match(/\b(19|20)\d{2}[-/]\d{2}[-/]\d{2}\b/) ||
    rawText.match(
      /\b(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s+\d{1,2},?\s+(19|20)\d{2}\b/i
    );
  const extractedYear = isoDateMatch?.[0]?.match(/(19|20)\d{2}/)?.[0] || '';
  const isDateMismatch = Boolean(expectedYear && extractedYear && extractedYear !== expectedYear);

  const nameConfirmed = nameTokens.length > 0 && nameMatchRatio >= 0.75;
  const extractedFields = {
    fullName: {
      label: 'Extracted Name on Document',
      value:
        nameConfirmed
          ? expectedName
          : 'Name not confirmed from submitted document',
      confidence: nameConfirmed ? 0.96 : Math.min(0.74, nameMatchRatio),
    },
    dateOfBirth: {
      label: 'Extracted Date on Document',
      value: isoDateMatch ? isoDateMatch[0] : 'Date not confirmed from submitted document',
      confidence: dateMatched || isoDateMatch ? 0.94 : 0.2,
    },
    placeOfBirth: {
      label: 'Extracted Place / Address',
      value: 'Place not confirmed from submitted document',
      confidence: 0.2,
    },
    motherMaidenName: {
      label: "Mother's Maiden Name",
      value: 'Mother name not confirmed from submitted document',
      confidence: 0.2,
    },
    idNumber: {
      label: 'Extracted ID / Registry No.',
      value: crnMatch ? crnMatch[0] : 'ID or registry number not confirmed from submitted document',
      confidence: crnMatch ? 0.95 : 0.2,
    },
  };

  // 3. Evaluate how well the real document matches the Requirement Type AND Step 2 Form Details
  const reqTypeMatched = matchedReqKeywords.length >= 2;
  const hasStep2Name = nameTokens.length > 0;
  // A partial token hit is not a match. This prevents an unrelated document
  // containing one common name token from being reported as verified.
  const isNameMismatch = !hasStep2Name || nameMatchRatio < 0.75;

  // Calculate genuine score from real OCR confidence + keyword match + Step 2 name comparison
  const computedScore = Math.min(
    98,
    Math.max(
      66,
      Math.round(
        rawOcrConf * 0.45 +
          Math.min(25, matchedGeneralKeywords.length * 5) +
          (reqTypeMatched ? 15 : 0) +
          (!isNameMismatch ? 15 : 0)
      )
    )
  );

  // If the file is a real ID/document, but either doesn't match the specific requirement slot OR the name on the document doesn't match Step 2:
  if (!reqTypeMatched || isNameMismatch || isDateMismatch) {
    return {
      ...preset,
      fields: extractedFields,
      overallScore: Math.min(79, computedScore),
      readabilityStatus: 'flagged_for_staff',
      fileName: fName,
      extractedTextSnippet: extractedSnippet,
      comparisonChecks: [
        {
          label: 'Photo Clarity',
          value: 'Clear and attached',
          matched: true,
        },
        {
          label: 'Name & Document Check',
          value: isNameMismatch
            ? `Name "${expectedName}" was not clearly seen — Staff will verify`
            : `Name confirmed against the submitted document`,
          matched: !isNameMismatch,
        },
      ],
      summary: isNameMismatch
        ? `Your photo is readable, but the submitted document does not sufficiently confirm the name "${expectedName}". Staff must verify it before approval.`
        : `Your photo is attached. Our Civil Registry staff will check the details on this document for you.`,
      scannedAt: new Date().toISOString(),
    };
  }

  // 4. Genuine Document + Requirement Keywords Matched + Step 2 Name Matched
  return {
    ...preset,
    fields: extractedFields,
    overallScore: computedScore,
    readabilityStatus: 'verified',
    fileName: fName,
    extractedTextSnippet: extractedSnippet,
    comparisonChecks: [
      {
        label: 'Photo Clarity',
        value: 'Clear and easy to read',
        matched: true,
      },
      {
        label: 'Name & Document Check',
        value: hasStep2Name
          ? `Matches "${expectedName}"`
          : `Matches ${reqProfile.category}`,
        matched: true,
      },
    ],
    summary: `Your photo is clear and matches ${
      hasStep2Name ? `"${expectedName}"` : 'your form details'
    }.`,
    scannedAt: new Date().toISOString(),
  };
}

// =====================================================================
// AI-ASSISTED CHECKLIST & CONDITIONAL REQUIREMENT EVALUATOR
// Compares extracted document info & applicant circumstances against
// the approved checklist for the selected service in plain language.
// =====================================================================
export function evaluateChecklistWithAI({
  serviceId,
  reqs = [],
  circumstances = {},
  uploadedDocs = {},
  reqFindings = {},
  subject = {},
}) {
  const missingItems = [];
  const notApplicableItems = [];
  const unreadableItems = [];
  const flaggedForStaffItems = [];
  const verifiedItems = [];

  // Check core form details first
  if (!subject.fullName?.trim()) {
    missingItems.push({
      id: 'detail-fullname',
      name: 'Registrant / Subject Full Name',
      instruction:
        'Provide the complete name on the record in Step 2 (or scan an ID/certificate to auto-fill).',
    });
  }
  if (!subject.dateOfBirth?.trim()) {
    missingItems.push({
      id: 'detail-date',
      name: 'Date of Birth / Marriage / Death Event',
      instruction: 'Enter the exact date of the vital event in Step 2.',
    });
  }

  // Birth registration must identify the child being registered separately
  // from the signed-in requester before documents can be treated as comparable.
  if (serviceId === 'birth_cert' || serviceId === 'delayed_birth') {
    if (!subject.applicantRelationship?.trim()) {
      missingItems.push({
        id: 'detail-requester-relationship',
        name: 'Requester relationship to the registrant',
        instruction: 'Select whether you are the mother, father, legal guardian, or the person registering their own birth.',
      });
    }
    if (!subject.regFirstName?.trim() || !subject.regLastName?.trim()) {
      missingItems.push({
        id: 'detail-child-name',
        name: 'Child’s complete name',
        instruction: 'Enter the child’s first name and surname exactly as they should appear on the birth record.',
      });
    }
    if (!subject.regSex?.trim()) {
      missingItems.push({
        id: 'detail-child-sex',
        name: 'Child’s sex',
        instruction: 'Select the child’s sex from the birth record.',
      });
    }
    if (!subject.placeOfBirth?.trim()) {
      missingItems.push({
        id: 'detail-child-place',
        name: 'Child’s place of birth',
        instruction: 'Enter the hospital, municipality, or city where the child was born.',
      });
    }
    if (!subject.motherMaidenName?.trim()) {
      missingItems.push({
        id: 'detail-mother-maiden-name',
        name: 'Mother’s maiden name',
        instruction: 'Enter the mother’s complete name before marriage so parent information can be compared.',
      });
    }
  }

  reqs.forEach((req) => {
    const docFile = uploadedDocs[req.id];
    const finding = reqFindings[req.id];

    // Determine conditional applicability based on applicant's circumstances
    let applicability = 'required'; // 'required' | 'not_applicable' | 'flagged_uncertain' | 'confirmation_pending'
    let applicabilityReason = req.condition || 'Required under the approved service checklist.';

    const hasFatherListed = circumstances.hasFather !== 'no';

    if (serviceId === 'birth_cert') {
      if (req.conditionKey === 'parents_married') {
        if (!hasFatherListed) {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because you indicated there is no father listed/acknowledged on the birth record.';
        } else if (circumstances.parentsMaritalStatus === 'married') {
          applicability = 'required';
          applicabilityReason =
            'Applies because you indicated the parents are legally married.';
        } else if (circumstances.parentsMaritalStatus === 'unmarried') {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because you indicated the parents are unmarried.';
        } else {
          applicability = 'flagged_uncertain';
          applicabilityReason =
            'Parents’ marital status is not yet specified — flagged for staff review to confirm whether Parents’ Marriage Certificate applies.';
        }
      } else if (req.conditionKey === 'parents_unmarried_father_surname') {
        if (!hasFatherListed) {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because there is no father listed/acknowledged on the birth record (child uses mother’s surname).';
        } else if (
          circumstances.parentsMaritalStatus === 'unmarried' &&
          circumstances.childUsesFatherSurname === 'yes'
        ) {
          applicability = 'required';
          applicabilityReason =
            'Applies because the parents are unmarried and the child will use the father’s surname.';
        } else if (circumstances.parentsMaritalStatus === 'married') {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because the parents are married (covered by Parents’ Marriage Certificate).';
        } else if (
          circumstances.parentsMaritalStatus === 'unmarried' &&
          circumstances.childUsesFatherSurname === 'no'
        ) {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because the child will not be using the father’s surname.';
        } else {
          applicability = 'flagged_uncertain';
          applicabilityReason =
            'Cannot determine whether AUSF applies until parents’ marital status and child’s surname preference are confirmed — flagged for staff review.';
        }
      }
    } else if (serviceId === 'delayed_birth') {
      if (req.conditionKey === 'parents_marriage_or_ausf') {
        if (!hasFatherListed) {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because there is no father listed/acknowledged on the birth record.';
        } else if (circumstances.parentsMaritalStatus === 'married') {
          applicability = 'required';
          applicabilityReason =
            'Applies: Please provide the Parents’ Marriage Certificate because the parents are married.';
        } else if (
          circumstances.parentsMaritalStatus === 'unmarried' &&
          circumstances.childUsesFatherSurname === 'yes'
        ) {
          applicability = 'required';
          applicabilityReason =
            'Applies: Please provide the Affidavit to Use the Surname of the Father (AUSF) because the parents are unmarried and the registrant uses the father’s surname.';
        } else if (
          circumstances.parentsMaritalStatus === 'unmarried' &&
          circumstances.childUsesFatherSurname === 'no'
        ) {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because the parents are unmarried and the registrant is using the mother’s surname (neither Marriage Certificate nor AUSF is needed).';
        } else {
          applicability = 'flagged_uncertain';
          applicabilityReason =
            'Flagged for staff review to verify whether Parents’ Marriage Certificate or AUSF is required for this delayed birth record.';
        }
      }
    } else if (serviceId === 'death_cert') {
      if (req.conditionKey === 'death_medico_legal') {
        if (circumstances.deathCircumstance === 'medico_legal') {
          applicability = 'required';
          applicabilityReason =
            'Applies because the death was reported as sudden, unattended, accidental, or subject to autopsy/investigation.';
        } else if (circumstances.deathCircumstance === 'natural_attended') {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because the death was medically attended and due to natural causes.';
        } else {
          applicability = 'flagged_uncertain';
          applicabilityReason =
            'Cause/manner of death circumstance is not specified — flagged for staff review to determine if a Medico-Legal Certificate or Police Report is required.';
        }
      } else if (req.conditionKey === 'death_late_registration_confirm') {
        if (circumstances.deathFilingTiming === 'within_30_days') {
          applicability = 'not_applicable';
          applicabilityReason =
            'Does not apply because the death is being registered within 30 days from the date of death.';
        } else if (circumstances.deathFilingTiming === 'over_30_days') {
          if (!circumstances.confirmedLateDeathRequirements) {
            applicability = 'confirmation_pending';
            applicabilityReason =
              'Death occurred more than 30 days ago. Please confirm the additional late registration requirements first before the upload field is unlocked.';
          } else {
            applicability = 'required';
            applicabilityReason =
              'Applies because the death is registered more than 30 days after the date of death and additional late requirements were confirmed.';
          }
        } else {
          applicability = 'flagged_uncertain';
          applicabilityReason =
            'Filing timeframe (>30 days vs within 30 days) is not yet confirmed — flagged for staff review.';
        }
      }
    } else if (serviceId === 'marriage_cert') {
      if (req.id === 'req-m-1' && circumstances.psaBirthAvailable === 'substitute_baptismal') {
        applicability = 'required';
        applicabilityReason =
          'PSA Birth Certificate marked unavailable — AI will verify your Baptismal Certificate or early supporting records instead.';
      }
    }

    // Route item into plain-language review categories
    if (applicability === 'not_applicable') {
      notApplicableItems.push({
        id: req.id,
        name: req.name,
        reason: applicabilityReason,
      });
      return;
    }

    if (applicability === 'confirmation_pending') {
      flaggedForStaffItems.push({
        id: req.id,
        name: req.name,
        reason:
          'Late death registration (>30 days) requires applicant confirmation of additional requirements before uploading.',
      });
      return;
    }

    if (applicability === 'flagged_uncertain') {
      const hasAnyUpload = Array.isArray(req.subSlots)
        ? req.subSlots.some(
            (s) =>
              uploadedDocs[`${req.id}__${s.slotKey}`] ||
              reqFindings[`${req.id}__${s.slotKey}`]
          )
        : Boolean(docFile || finding);

      if (!hasAnyUpload) {
        flaggedForStaffItems.push({
          id: req.id,
          name: req.name,
          reason: applicabilityReason,
        });
        return;
      }
    }

    // Multi-Document Sub-Slot Evaluation (e.g. Valid IDs of Parents = Mother + Father if listed)
    if (Array.isArray(req.subSlots) && req.subSlots.length > 0) {
      req.subSlots.forEach((slot) => {
        const slotId = `${req.id}__${slot.slotKey}`;
        const slotDoc = uploadedDocs[slotId];
        const slotFinding = reqFindings[slotId];
        const slotDisplayName = `${req.name} — ${slot.label}`;

        // If Father is not listed on the birth record, Father's Valid ID does not apply
        if (slot.slotKey === 'father_id' && !hasFatherListed) {
          notApplicableItems.push({
            id: slotId,
            name: slotDisplayName,
            reason:
              'Does not apply because you indicated there is no father listed/acknowledged on the birth record (only Mother’s Valid ID is required).',
          });
          return;
        }

        if (!slotDoc && !slotFinding) {
          if (slot.required !== false) {
            missingItems.push({
              id: slotId,
              name: slotDisplayName,
              instruction: `Please upload ${slot.label} under "${req.name}".`,
            });
          }
          return;
        }

        if (
          slotFinding?.readabilityStatus === 'unreadable' ||
          (slotFinding?.completenessScore && slotFinding.completenessScore < 65)
        ) {
          unreadableItems.push({
            id: slotId,
            name: slotDisplayName,
            fileName: slotDoc?.fileName || slotFinding?.fileName || 'Uploaded file',
            instruction:
              slotFinding?.summary ||
              `The uploaded file for "${slotDisplayName}" is too blurry or cropped to read clearly. Please re-upload a clear page.`,
          });
          return;
        }

        if (
          slotFinding?.readabilityStatus === 'flagged_for_staff' ||
          applicability === 'flagged_uncertain' ||
          (slotFinding?.completenessScore &&
            slotFinding.completenessScore >= 65 &&
            slotFinding.completenessScore < 82)
        ) {
          flaggedForStaffItems.push({
            id: slotId,
            name: slotDisplayName,
            fileName: slotDoc?.fileName || slotFinding?.fileName,
            reason:
              slotFinding?.summary ||
              `AI flagged "${slotDisplayName}" for Civil Registry staff review.`,
          });
          return;
        }

        verifiedItems.push({
          id: slotId,
          name: slotDisplayName,
          fileName: slotDoc?.fileName || slotFinding?.fileName || 'Verified scan',
          score: slotFinding?.completenessScore || 96,
          note:
            slotFinding?.summary ||
            `Extracted details match the approved checklist for ${slotDisplayName}.`,
        });
      });
      return;
    }

    // Check if uploaded / screened (Single-slot requirement)
    if (!docFile && !finding) {
      missingItems.push({
        id: req.id,
        name: req.name,
        instruction:
          req.conditionKey === 'supporting_doc_1' || req.conditionKey === 'supporting_doc_2'
            ? `Please upload ${req.name} (${circumstances[req.id + '_type'] || 'select one from the 5 approved supporting document types'}).`
            : `Please upload a clear scan or photo of: ${req.name}. (${applicabilityReason})`,
      });
      return;
    }

    // Check readability / clarity of uploaded file
    if (
      finding?.readabilityStatus === 'unreadable' ||
      (finding?.completenessScore && finding.completenessScore < 65)
    ) {
      unreadableItems.push({
        id: req.id,
        name: req.name,
        fileName: docFile?.fileName || finding?.fileName || 'Uploaded file',
        instruction:
          finding?.summary ||
          `The uploaded file for "${req.name}" is too blurry, cropped, or dark to read clearly. Please re-upload all pages in sharp focus.`,
      });
      return;
    }

    // Check if AI flagged the upload for staff review
    if (
      finding?.readabilityStatus === 'flagged_for_staff' ||
      applicability === 'flagged_uncertain' ||
      (finding?.completenessScore &&
        finding.completenessScore >= 65 &&
        finding.completenessScore < 82)
    ) {
      flaggedForStaffItems.push({
        id: req.id,
        name: req.name,
        fileName: docFile?.fileName || finding?.fileName,
        reason:
          finding?.summary ||
          `AI extracted text from "${req.name}", but flagged it for Civil Registry staff review to confirm conditional details or seal authenticity.`,
      });
      return;
    }

    verifiedItems.push({
      id: req.id,
      name: req.name,
      fileName: docFile?.fileName || finding?.fileName || 'Verified scan',
      score: finding?.completenessScore || 96,
      note:
        finding?.summary ||
        `Extracted details match the approved checklist for ${req.name}.`,
    });
  });

  const isReady =
    missingItems.length === 0 && unreadableItems.length === 0;

  return {
    isReady,
    missingItems,
    notApplicableItems,
    unreadableItems,
    flaggedForStaffItems,
    verifiedItems,
  };
}

export {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  getIdTokenResult,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  rtdbRef,
  rtdbSet,
  rtdbGet,
  rtdbRemove,
  rtdbUpdate,
  rtdbOnValue,
  storageRef,
  uploadBytes,
  getDownloadURL,
  httpsCallable,
};
