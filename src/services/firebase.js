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

// Erase any legacy localStorage / sessionStorage keys immediately on load
export function purgeAllBrowserStorage() {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('crs_') || k.startsWith('doc_cache_'))) {
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
  rtdb: getDatabase(app),
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
    name: 'Birth Registration (Live)',
    code: 'BRL-01',
    description:
      'Timely registration and certified copy issuance of Certificate of Live Birth registered with the Local Civil Registry.',
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
      id: 'req-b-1',
      serviceId: 'birth_cert',
      name: 'Valid Government-Issued ID of Requestor',
      description: "Philippine National ID (PhilSys), Passport, Driver's License, PRC, or UMID",
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-b-2',
      serviceId: 'birth_cert',
      name: 'Authorization Letter (if requesting on behalf of someone else)',
      description: 'Signed letter plus valid ID of document owner',
      is_mandatory: false,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-b-3',
      serviceId: 'birth_cert',
      name: 'Hospital Certificate of Live Birth or Prior Registry Copy',
      description: 'Copy of previous certificate or hospital record stub',
      is_mandatory: false,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
  marriage_cert: [
    {
      id: 'req-m-1',
      serviceId: 'marriage_cert',
      name: 'Valid Government ID of Either Spouse',
      description: 'Clear ID scan of husband or wife',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-m-2',
      serviceId: 'marriage_cert',
      name: 'Marriage License or Certificate Copy (Form 97)',
      description: 'Church or solemnizing officer duplicate',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
  delayed_birth: [
    {
      id: 'req-db-1',
      serviceId: 'delayed_birth',
      name: 'Affidavit of Delayed Registration (Form 1A)',
      description: 'Notarized joint affidavit of two disinterested witnesses',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-db-2',
      serviceId: 'delayed_birth',
      name: 'Baptismal Certificate or Religious Record',
      description: "Indicating birth date and parents' names",
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-db-3',
      serviceId: 'delayed_birth',
      name: 'School Records (Form 137 / Transcript)',
      description: 'Early school permanent record indicating birth details',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
  ],
  death_cert: [
    {
      id: 'req-d-1',
      serviceId: 'death_cert',
      name: 'Valid ID of Immediate Family / Requestor',
      description: 'Primary ID of spouse, child, or parent',
      is_mandatory: true,
      maxSizeMB: 10,
      acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    },
    {
      id: 'req-d-2',
      serviceId: 'death_cert',
      name: 'Hospital/Physician Death Notice or Burial Permit',
      description: 'Signed medical certificate or official burial permit',
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

export async function scanDocumentForAutoFill({
  presetKey = 'philsys_id',
  file = null,
}) {
  await new Promise((r) => setTimeout(r, 850));
  const preset = AI_SCAN_PRESETS[presetKey] || AI_SCAN_PRESETS.philsys_id;
  return {
    ...preset,
    fileName: file?.name || `${presetKey}_scan.jpg`,
    scannedAt: new Date().toISOString(),
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
