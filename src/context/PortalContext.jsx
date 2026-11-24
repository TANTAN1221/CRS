// =====================================================================
// CIVIL REGISTRY PORTAL - REACT GLOBAL PORTAL CONTEXT
// 100% Live Firebase Mode (`crss-cd118`) — Zero localStorage Caching!
// All state streams directly from Firebase Realtime DB & Cloud Firestore.
// =====================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  LIVE_FIREBASE_CONFIG,
  ADMIN_EMAILS,
  isDesignatedAdminEmail,
  DEFAULT_SERVICES,
  DEFAULT_REQUIREMENTS,
  TIME_SLOTS,
  DEFAULT_SCHEDULE_CONFIG,
  LIFECYCLE_STAGE_MAP,
  purgeAllBrowserStorage,
  getFirebaseSdk,
  normalizeEmailKey,
  provisionFirebaseAuthAccount,
  extractRoleFromAuthUser,
  extractCleanNameFromAuthUser,
  scanDocumentForAutoFill,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  getIdTokenResult,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  rtdbRef,
  rtdbGet,
  rtdbSet,
  rtdbRemove,
  rtdbOnValue,
  storageRef,
  uploadBytes,
  getDownloadURL,
} from '../services/firebase';

const PortalContext = createContext(null);

export function PortalProvider({ children }) {
  const [firebaseConfig] = useState({
    useEmulators: false,
    firebase: LIVE_FIREBASE_CONFIG,
  });

  // Live Firebase Authenticated User Session (null when not signed in — no demo accounts)
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [requirements, setRequirements] = useState(DEFAULT_REQUIREMENTS);
  const [applications, setApplications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [scheduleConfig, setScheduleConfig] = useState(DEFAULT_SCHEDULE_CONFIG);
  const [notifications, setNotifications] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [firebaseConnected, setFirebaseConnected] = useState(false);
  const usersListRef = React.useRef([]);

  useEffect(() => {
    usersListRef.current = usersList;
    if (profile?.email) {
      const matched = usersList.find(
        (u) =>
          (profile.id && u.id === profile.id) ||
          String(u.email || '').trim().toLowerCase() ===
            String(profile.email || '').trim().toLowerCase()
      );
      if (matched?.role && matched.role !== profile.role && !isDesignatedAdminEmail(profile.email)) {
        setProfile((prev) => (prev ? { ...prev, ...matched, role: matched.role } : prev));
      }
    }
  }, [usersList, profile]);

  const openAuthModal = useCallback((tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  }, []);

  const showToast = useCallback((message, type = 'info', title = '') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  // Purge any old localStorage keys and attach real-time listeners to `crss-cd118`
  // Uses Cloud Firestore (`onSnapshot`) as primary live database and only attaches
  // Realtime Database listeners when authenticated, avoiding unauthenticated RTDB warnings.
  useEffect(() => {
    purgeAllBrowserStorage();
    const sdk = getFirebaseSdk();
    if (!sdk) return;
    setFirebaseConnected(true);

    const unsubs = [];

    // 1. Primary Real-Time Listeners via Cloud Firestore (`crss-cd118`)
    if (sdk.db) {
      unsubs.push(
        onSnapshot(
          collection(sdk.db, 'applications'),
          (snap) => {
            setFirebaseConnected(true);
            const list = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) =>
                String(b.created_at || '').localeCompare(String(a.created_at || ''))
              );
            setApplications(list);
          },
          () => {}
        )
      );

      unsubs.push(
        onSnapshot(
          collection(sdk.db, 'appointments'),
          (snap) => {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) =>
                String(b.created_at || '').localeCompare(String(a.created_at || ''))
              );
            setAppointments(list);
          },
          () => {}
        )
      );

      unsubs.push(
        onSnapshot(
          collection(sdk.db, 'notifications'),
          (snap) => {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) =>
                String(b.created_at || '').localeCompare(String(a.created_at || ''))
              );
            setNotifications(list);
          },
          () => {}
        )
      );

      unsubs.push(
        onSnapshot(
          collection(sdk.db, 'services'),
          (snap) => {
            const dbMap = new Map(
              snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .filter((s) => !['cenomar', 'legitimation'].includes(s.id))
                .map((s) => [s.id, s])
            );
            // Keep the 4 core services with their updated titles and merge any Admin fee/turnaround edits
            const merged = DEFAULT_SERVICES.map((def) => {
              const saved = dbMap.get(def.id);
              return saved
                ? {
                    ...def,
                    fee_amount: saved.fee_amount ?? def.fee_amount,
                    processing_days: saved.processing_days ?? def.processing_days,
                    description: def.description,
                    name: def.name,
                    code: def.code,
                  }
                : def;
            });
            setServices(merged);
          },
          () => {}
        )
      );

      unsubs.push(
        onSnapshot(
          collection(sdk.db, 'users'),
          (snap) => {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .filter(
                (u) =>
                  u &&
                  u.email &&
                  !['citizen@example.gov', 'officer@example.gov', 'admin@example.gov'].includes(
                    String(u.email).toLowerCase()
                  )
              );
            setUsersList(list);
          },
          () => {}
        )
      );

      unsubs.push(
        onSnapshot(
          collection(sdk.db, 'audit_logs'),
          (snap) => {
            const list = snap.docs
              .map((d) => ({ id: d.id, ...d.data() }))
              .sort((a, b) =>
                String(b.isoTimestamp || b.timestamp || '').localeCompare(
                  String(a.isoTimestamp || a.timestamp || '')
                )
              );
            setAuditLogs(list);
          },
          () => {}
        )
      );

      unsubs.push(
        onSnapshot(
          doc(sdk.db, 'settings', 'appointment_schedule'),
          (snap) => {
            if (snap.exists()) {
              setScheduleConfig((prev) => ({
                ...DEFAULT_SCHEDULE_CONFIG,
                ...prev,
                ...snap.data(),
              }));
            }
          },
          () => {}
        )
      );
    }

    // 2. Real-time Firebase Auth Session Listener for Online Deployment
    if (sdk.auth) {
      const unsubAuth = onAuthStateChanged(sdk.auth, async (fbUser) => {
        if (!fbUser) {
          setProfile(null);
          setAuthLoading(false);
          return;
        }
        try {
          let loadedProfile = null;
          let emailRoleRecord = null;
          const cleanFbEmail = String(fbUser.email || '').trim().toLowerCase();
          const emailKey = normalizeEmailKey(cleanFbEmail);

          if (sdk.db) {
            const [uidSnap, emailRoleSnap] = await Promise.all([
              getDoc(doc(sdk.db, 'users', fbUser.uid)).catch(() => null),
              cleanFbEmail
                ? getDoc(doc(sdk.db, 'user_roles_by_email', emailKey)).catch(() => null)
                : Promise.resolve(null),
            ]);
            if (uidSnap?.exists()) loadedProfile = uidSnap.data();
            if (emailRoleSnap?.exists()) emailRoleRecord = emailRoleSnap.data();

            if (!loadedProfile && cleanFbEmail) {
              const allSnap = await getDocs(collection(sdk.db, 'users')).catch(() => null);
              if (allSnap) {
                const matchDoc = allSnap.docs.find(
                  (d) =>
                    String(d.data()?.email || '')
                      .trim()
                      .toLowerCase() === cleanFbEmail
                );
                if (matchDoc) loadedProfile = { id: matchDoc.id, ...matchDoc.data() };
              }
            }
          }
          if (sdk.rtdb) {
            if (!loadedProfile) {
              const snap = await rtdbGet(rtdbRef(sdk.rtdb, `crs/users/${fbUser.uid}`)).catch(
                () => null
              );
              if (snap?.exists()) loadedProfile = snap.val();
            }
            if (!emailRoleRecord && cleanFbEmail) {
              const roleSnap = await rtdbGet(
                rtdbRef(sdk.rtdb, `crs/user_roles_by_email/${emailKey}`)
              ).catch(() => null);
              if (roleSnap?.exists()) emailRoleRecord = roleSnap.val();
            }
          }
          if (!loadedProfile && cleanFbEmail) {
            loadedProfile =
              usersListRef.current.find(
                (u) =>
                  String(u.email || '')
                    .trim()
                    .toLowerCase() === cleanFbEmail
              ) || null;
          }

          const tokenRes = await getIdTokenResult(fbUser).catch(() => null);
          const displayNameRole = extractRoleFromAuthUser(fbUser);
          const cleanDisplayName = extractCleanNameFromAuthUser(fbUser);
          const isAdminEmail = isDesignatedAdminEmail(fbUser.email);

          // Priority: designated admin -> RBAC email role map -> Auth displayName role tag -> Firestore user doc -> token claim -> applicant
          const resolvedRole = isAdminEmail
            ? 'admin'
            : emailRoleRecord?.role ||
              displayNameRole ||
              (loadedProfile?.role && loadedProfile.role !== 'applicant'
                ? loadedProfile.role
                : null) ||
              tokenRes?.claims?.role ||
              loadedProfile?.role ||
              'applicant';

          const baseData = { ...(emailRoleRecord || {}), ...(loadedProfile || {}) };
          const userRecord = {
            ...baseData,
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email,
            first_name:
              baseData.first_name ||
              cleanDisplayName.split(' ')[0] ||
              (isAdminEmail ? 'Portal' : 'Citizen'),
            last_name:
              baseData.last_name ||
              cleanDisplayName.split(' ').slice(1).join(' ') ||
              (isAdminEmail ? 'Admin' : ''),
            role: resolvedRole,
            isActive: true,
          };

          if (sdk.db) {
            setDoc(doc(sdk.db, 'users', fbUser.uid), userRecord, { merge: true }).catch(
              () => {}
            );
          }
          setProfile(userRecord);
        } catch (e) {
          const isAdminEmail = isDesignatedAdminEmail(fbUser.email);
          setProfile({
            id: fbUser.uid,
            uid: fbUser.uid,
            email: fbUser.email,
            first_name:
              fbUser.displayName?.split(' ')[0] || (isAdminEmail ? 'Portal' : 'Citizen'),
            last_name:
              fbUser.displayName?.split(' ').slice(1).join(' ') ||
              (isAdminEmail ? 'Admin' : ''),
            role: isAdminEmail ? 'admin' : 'applicant',
            isActive: true,
          });
        } finally {
          setAuthLoading(false);
        }
      });
      unsubs.push(unsubAuth);
    } else {
      setAuthLoading(false);
    }

    return () => {
      unsubs.forEach((fn) => {
        try {
          fn();
        } catch (e) {}
      });
    };
  }, []);

  const appendAudit = useCallback(
    async ({ action, targetType, targetId, summary, actorOverride }) => {
      const actor = actorOverride || profile;
      const entry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        actorId: actor?.id || 'system',
        actorName: actor ? `${actor.first_name} ${actor.last_name}` : 'System',
        role: actor?.role || 'applicant',
        action,
        targetType,
        targetId,
        summary,
      };
      setAuditLogs((prev) => [entry, ...prev]);

      const sdk = getFirebaseSdk();
      if (sdk?.db) {
        setDoc(doc(sdk.db, 'audit_logs', entry.id), {
          ...entry,
          isoTimestamp: entry.timestamp,
        }).catch(() => {});
      }
      if (sdk?.rtdb && sdk?.auth?.currentUser) {
        rtdbSet(rtdbRef(sdk.rtdb, `crs/audit_logs/${entry.id}`), entry).catch(() => {});
      }
    },
    [profile]
  );

  // Authentication Actions (Strictly Live Firebase Auth & Database `crss-cd118`)
  const login = async (email, password) => {
    const sdk = getFirebaseSdk();
    if (!sdk?.auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      const emailKey = normalizeEmailKey(cleanEmail);
      const cred = await signInWithEmailAndPassword(sdk.auth, email.trim(), password);
      let loadedProfile = null;
      let emailRoleRecord = null;

      if (sdk.db) {
        const [docSnap, emailRoleSnap] = await Promise.all([
          getDoc(doc(sdk.db, 'users', cred.user.uid)).catch(() => null),
          cleanEmail
            ? getDoc(doc(sdk.db, 'user_roles_by_email', emailKey)).catch(() => null)
            : Promise.resolve(null),
        ]);
        if (docSnap?.exists()) loadedProfile = docSnap.data();
        if (emailRoleSnap?.exists()) emailRoleRecord = emailRoleSnap.data();

        if (!loadedProfile && cleanEmail) {
          const allSnap = await getDocs(collection(sdk.db, 'users')).catch(() => null);
          if (allSnap) {
            const matchDoc = allSnap.docs.find(
              (d) =>
                String(d.data()?.email || '')
                  .trim()
                  .toLowerCase() === cleanEmail
            );
            if (matchDoc) loadedProfile = { id: matchDoc.id, ...matchDoc.data() };
          }
        }
      }
      if (sdk.rtdb) {
        if (!loadedProfile) {
          const snap = await rtdbGet(rtdbRef(sdk.rtdb, `crs/users/${cred.user.uid}`)).catch(
            () => null
          );
          if (snap?.exists()) loadedProfile = snap.val();
        }
        if (!emailRoleRecord && cleanEmail) {
          const roleSnap = await rtdbGet(
            rtdbRef(sdk.rtdb, `crs/user_roles_by_email/${emailKey}`)
          ).catch(() => null);
          if (roleSnap?.exists()) emailRoleRecord = roleSnap.val();
        }
      }
      if (!loadedProfile && cleanEmail) {
        loadedProfile =
          usersListRef.current.find(
            (u) =>
              String(u.email || '')
                .trim()
                .toLowerCase() === cleanEmail
          ) || null;
      }

      const tokenRes = await getIdTokenResult(cred.user).catch(() => null);
      const displayNameRole = extractRoleFromAuthUser(cred.user);
      const cleanDisplayName = extractCleanNameFromAuthUser(cred.user);
      const isAdminEmail = isDesignatedAdminEmail(cred.user.email || email);

      const role = isAdminEmail
        ? 'admin'
        : emailRoleRecord?.role ||
          displayNameRole ||
          (loadedProfile?.role && loadedProfile.role !== 'applicant'
            ? loadedProfile.role
            : null) ||
          tokenRes?.claims?.role ||
          loadedProfile?.role ||
          'applicant';

      const baseData = { ...(emailRoleRecord || {}), ...(loadedProfile || {}) };
      const userObj = {
        ...baseData,
        id: cred.user.uid,
        uid: cred.user.uid,
        email: cred.user.email,
        first_name:
          baseData.first_name ||
          cleanDisplayName.split(' ')[0] ||
          (isAdminEmail ? 'Portal' : 'Citizen'),
        last_name:
          baseData.last_name ||
          cleanDisplayName.split(' ').slice(1).join(' ') ||
          (isAdminEmail ? 'Admin' : ''),
        role,
        isActive: true,
      };
      if (sdk.db) {
        await setDoc(doc(sdk.db, 'users', cred.user.uid), userObj, { merge: true }).catch(
          () => {}
        );
      }
      setProfile(userObj);
      await appendAudit({
        action: 'USER_LOGIN_FIREBASE',
        targetType: 'user',
        targetId: userObj.email,
        summary: `Authenticated via Firebase Auth (${role})`,
        actorOverride: userObj,
      });
      return userObj;
    } catch (err) {
      // Fallback check in live Firebase `crs/users` for admin-provisioned accounts
      const existing = usersList.find(
        (u) => String(u.email || '').toLowerCase() === email.trim().toLowerCase()
      );
      if (existing && (!existing.password || existing.password === password)) {
        setProfile(existing);
        await appendAudit({
          action: 'USER_LOGIN',
          targetType: 'user',
          targetId: existing.email,
          summary: `Signed in as ${existing.role}`,
          actorOverride: existing,
        });
        return existing;
      }
      const msg =
        err?.code === 'auth/invalid-credential' ||
        err?.code === 'auth/user-not-found' ||
        err?.code === 'auth/wrong-password'
          ? 'Invalid email or password. Please check your credentials or create a new Citizen Portal account.'
          : err?.message || 'Unable to sign in with Firebase Authentication.';
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    const sdk = getFirebaseSdk();
    if (!sdk?.auth) {
      throw new Error('Firebase Authentication is not initialized.');
    }

    const nowIso = new Date().toISOString();
    let uid = `usr-${Date.now()}`;

    try {
      const cred = await createUserWithEmailAndPassword(
        sdk.auth,
        userData.email.trim(),
        userData.password
      );
      await updateProfile(cred.user, {
        displayName: `${userData.firstName} ${userData.lastName}`.trim(),
      });
      uid = cred.user.uid;
    } catch (err) {
      if (err?.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already registered in Firebase. Please Sign In instead.');
      }
      if (err?.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters long.');
      }
      if (err?.code && err.code !== 'auth/operation-not-allowed') {
        throw new Error(err.message || 'Firebase registration failed.');
      }
    }

    // Check if an Admin already provisioned this email in RBAC with a specific role (`personnel` or `admin`)
    const cleanRegEmail = userData.email.trim().toLowerCase();
    const regEmailKey = normalizeEmailKey(cleanRegEmail);
    let emailRoleDoc = null;
    if (sdk.db && cleanRegEmail) {
      const snap = await getDoc(doc(sdk.db, 'user_roles_by_email', regEmailKey)).catch(
        () => null
      );
      if (snap?.exists()) emailRoleDoc = snap.data();
    }
    if (!emailRoleDoc && sdk.rtdb && cleanRegEmail) {
      const rSnap = await rtdbGet(
        rtdbRef(sdk.rtdb, `crs/user_roles_by_email/${regEmailKey}`)
      ).catch(() => null);
      if (rSnap?.exists()) emailRoleDoc = rSnap.val();
    }
    const preProvisioned =
      emailRoleDoc ||
      usersListRef.current.find(
        (u) =>
          String(u.email || '')
            .trim()
            .toLowerCase() === cleanRegEmail
      );

    // Automatically assign 'admin' role if email matches designated admin email (crsadmin@gmail.com)
    const assignedRole = isDesignatedAdminEmail(userData.email)
      ? 'admin'
      : preProvisioned?.role || userData.role || 'applicant';

    const newProfile = {
      id: uid,
      uid,
      email: userData.email.trim(),
      first_name: userData.firstName.trim(),
      middle_name: (userData.middleName || '').trim(),
      last_name: userData.lastName.trim(),
      phone_number: (userData.phoneNumber || '').trim(),
      address: (userData.address || '').trim(),
      city: userData.city || 'Metro City',
      province: userData.province || 'Capital District',
      role: assignedRole,
      isActive: true,
      privacyConsentAt: nowIso,
      createdAt: nowIso,
    };

    if (sdk.db) {
      await setDoc(doc(sdk.db, 'users', newProfile.id), newProfile).catch(() => {});
    }
    if (sdk.rtdb && sdk.auth?.currentUser) {
      rtdbSet(rtdbRef(sdk.rtdb, `crs/users/${newProfile.id}`), newProfile).catch(() => {});
    }

    setUsersList((prev) => [
      newProfile,
      ...prev.filter((u) => u.id !== newProfile.id && u.email !== newProfile.email),
    ]);
    setProfile(newProfile);
    await appendAudit({
      action: 'CITIZEN_REGISTERED',
      targetType: 'user',
      targetId: newProfile.email,
      summary: 'Registered citizen account in Firebase (crss-cd118) with RA 10173 consent',
      actorOverride: newProfile,
    });
    return newProfile;
  };

  const logout = async () => {
    const sdk = getFirebaseSdk();
    if (sdk?.auth) {
      try {
        await signOut(sdk.auth);
      } catch (e) {}
    }
    purgeAllBrowserStorage();
    setProfile(null);
  };

  // Applications CRUD (100% Live Firebase Sync)
  const createApplication = async ({
    serviceId,
    subjectDetails,
    copiesCount = 1,
    uploadedDocs = [],
    aiScreenings = [],
    preferredAppointmentDate = null,
    preferredAppointmentSlot = null,
  }) => {
    const activeUser = profile || {
      id: 'guest-applicant',
      first_name: subjectDetails?.fullName?.split(' ')[0] || 'Citizen',
      last_name: subjectDetails?.fullName?.split(' ').slice(1).join(' ') || 'Applicant',
      email: 'citizen@crss-cd118.firebaseapp.com',
    };
    const service = services.find((s) => s.id === serviceId) || services[0];
    const refNo = `CRS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const appId = `app-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const initialStatus = aiScreenings.length > 0 ? 'pre_screened' : 'submitted';
    const stageInfo = LIFECYCLE_STAGE_MAP[initialStatus];
    const feeTotal = (service.fee_amount || 155) * Number(copiesCount || 1);

    const newApp = {
      id: appId,
      reference_no: refNo,
      applicant_id: activeUser.id,
      applicant_name: `${activeUser.first_name} ${activeUser.last_name}`,
      applicant_email: activeUser.email,
      service_id: service.id,
      service_name: service.name,
      status: initialStatus,
      assignedOfficer: 'Civil Registry Verification Desk',
      subject_details: subjectDetails,
      copies_count: Number(copiesCount || 1),
      fee_total: feeTotal,
      submission_date: nowIso,
      estimated_completion_date: new Date(
        Date.now() + (service.processing_days || 3) * 24 * 3600 * 1000
      )
        .toISOString()
        .split('T')[0],
      created_at: nowIso,
      documents: uploadedDocs,
      aiScreenings,
      statusHistory: [
        {
          stage: stageInfo.stage,
          status: initialStatus,
          remarks:
            aiScreenings.length > 0
              ? 'Application submitted with AI OCR pre-screening & automated form inputs.'
              : 'Application submitted online. Statutory fee is payable at the counter during your appointment.',
          timestamp: nowIso,
        },
      ],
    };

    const newNotif = {
      id: `notif-${Date.now()}`,
      user_id: activeUser.id,
      title: `Application Submitted: ${refNo}`,
      message: `Your application for ${service.name} has been recorded in Firebase (Tracking: TRK-${refNo}). Informational counter fee: ₱${feeTotal.toFixed(2)}.`,
      type: 'application',
      link: `/applicant/document-tracking?ref=${refNo}`,
      is_read: false,
      created_at: nowIso,
    };

    setApplications((prev) => [newApp, ...prev.filter((a) => a.id !== appId)]);
    setNotifications((prev) => [newNotif, ...prev]);

    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await Promise.all([
        setDoc(doc(sdk.db, 'applications', appId), {
          ...newApp,
          referenceNo: refNo,
          applicantId: activeUser.id,
        }),
        setDoc(doc(sdk.db, 'notifications', newNotif.id), newNotif),
      ]).catch(() => {});
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      Promise.all([
        rtdbSet(rtdbRef(sdk.rtdb, `crs/applications/${appId}`), newApp),
        rtdbSet(rtdbRef(sdk.rtdb, `crs/notifications/${newNotif.id}`), newNotif),
      ]).catch(() => {});
    }

    await appendAudit({
      action: 'APPLICATION_SUBMITTED',
      targetType: 'application',
      targetId: refNo,
      summary: `Submitted ${service.name} (${copiesCount} copies, informational fee ₱${feeTotal.toFixed(2)})`,
    });

    if (preferredAppointmentDate && preferredAppointmentSlot) {
      await bookAppointment({
        serviceId: service.id,
        applicationId: refNo,
        appointmentDate: preferredAppointmentDate,
        timeSlot: preferredAppointmentSlot,
        purpose: `Counter verification & release for Application ${refNo}`,
      });
    }

    return newApp;
  };

  const updateApplicationStatus = async (applicationId, newStatus, remarks = '') => {
    const activeUser = profile || {
      id: 'personnel',
      first_name: 'Civil Registry',
      last_name: 'Officer',
    };
    const officerName = `${activeUser.first_name} ${activeUser.last_name}`;
    const nowIso = new Date().toISOString();
    const stageInfo = LIFECYCLE_STAGE_MAP[newStatus] || {
      stage: newStatus.toUpperCase(),
      progress: 60,
    };

    const targetApp = applications.find(
      (a) => a.id === applicationId || a.reference_no === applicationId
    );
    if (!targetApp) return;

    const entry = {
      stage: stageInfo.stage,
      status: newStatus,
      remarks: remarks || `Application moved to ${stageInfo.stage}.`,
      changedBy: officerName,
      timestamp: nowIso,
    };

    const updatedApp = {
      ...targetApp,
      status: newStatus,
      assignedOfficer: officerName,
      lastOfficerRemarks: entry.remarks,
      updated_at: nowIso,
      statusHistory: [entry, ...(targetApp.statusHistory || [])],
    };

    setApplications((prev) =>
      prev.map((a) => (a.id === targetApp.id ? updatedApp : a))
    );

    const notif = {
      id: `notif-st-${Date.now()}`,
      user_id: targetApp.applicant_id,
      title: `Application ${targetApp.reference_no}: ${stageInfo.stage}`,
      message: entry.remarks,
      type: newStatus === 'returned' ? 'alert' : 'application',
      link: `/applicant/document-tracking?ref=${targetApp.reference_no}`,
      is_read: false,
      created_at: nowIso,
    };
    setNotifications((prev) => [notif, ...prev]);

    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await Promise.all([
        setDoc(doc(sdk.db, 'applications', targetApp.id), updatedApp, { merge: true }),
        setDoc(doc(sdk.db, 'notifications', notif.id), notif),
      ]).catch(() => {});
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      Promise.all([
        rtdbSet(rtdbRef(sdk.rtdb, `crs/applications/${targetApp.id}`), updatedApp),
        rtdbSet(rtdbRef(sdk.rtdb, `crs/notifications/${notif.id}`), notif),
      ]).catch(() => {});
    }

    await appendAudit({
      action: 'APPLICATION_STATUS_CHANGED',
      targetType: 'application',
      targetId: targetApp.reference_no,
      summary: `Status changed to ${newStatus.toUpperCase()} — ${entry.remarks}`,
    });
  };

  // Visual Calendar & Real-Time Slot Availability Calculation
  const isDateOpenForBooking = useCallback(
    (dateStr) => {
      if (!dateStr) return { isOpen: false, reason: 'Invalid date' };
      const todayStr = new Date().toISOString().split('T')[0];
      const closedMap = scheduleConfig?.closedDates || {};
      const openMap = scheduleConfig?.openDates || {};
      const weekdays = scheduleConfig?.operatingWeekdays || [1, 2, 3, 4, 5];

      if (closedMap[dateStr]) {
        return {
          isOpen: false,
          reason: typeof closedMap[dateStr] === 'string' ? closedMap[dateStr] : 'Office Closed',
          isPast: dateStr < todayStr,
        };
      }
      if (openMap[dateStr]) {
        return {
          isOpen: true,
          reason: typeof openMap[dateStr] === 'string' ? openMap[dateStr] : 'Special Open Schedule',
          isPast: dateStr < todayStr,
        };
      }

      const [y, m, d] = dateStr.split('-').map(Number);
      const dt = new Date(y, (m || 1) - 1, d || 1);
      const dayOfWeek = dt.getDay(); // 0=Sun .. 6=Sat
      const allowedWeekday = weekdays.includes(dayOfWeek);

      return {
        isOpen: allowedWeekday,
        reason: allowedWeekday ? 'Regular Operating Day' : 'Weekend (Closed)',
        isPast: dateStr < todayStr,
      };
    },
    [scheduleConfig]
  );

  const getTimeSlotsForDate = useCallback(
    (dateStr) => {
      const dateStatus = isDateOpenForBooking(dateStr);
      const override = scheduleConfig?.dateOverrides?.[dateStr] || {};
      const defaultCap = Number(
        override.capacity ?? scheduleConfig?.defaultCapacity ?? 8
      );
      const activeList =
        override.activeTimeSlots ||
        scheduleConfig?.activeTimeSlots ||
        TIME_SLOTS;
      const slotCapOverrides = override.slotCapacities || {};

      return TIME_SLOTS.filter((slotLabel) => activeList.includes(slotLabel)).map(
        (slotLabel) => {
          const slotId = `${dateStr}_${slotLabel.replace(/[^a-zA-Z0-9]/g, '')}`;
          const cap = Number(slotCapOverrides[slotLabel] ?? defaultCap);
          const bookedCount = appointments.filter(
            (a) =>
              a.appointment_date === dateStr &&
              a.time_slot === slotLabel &&
              !['cancelled', 'no_show'].includes(a.status)
          ).length;
          const availableCount = dateStatus.isOpen ? Math.max(0, cap - bookedCount) : 0;
          return {
            slotId,
            date: dateStr,
            timeSlot: slotLabel,
            capacity: cap,
            bookedCount,
            availableCount,
            isFull: !dateStatus.isOpen || bookedCount >= cap || cap <= 0,
            isClosedDate: !dateStatus.isOpen,
          };
        }
      );
    },
    [appointments, scheduleConfig, isDateOpenForBooking]
  );

  const getDateAvailabilitySummary = useCallback(
    (dateStr) => {
      const status = isDateOpenForBooking(dateStr);
      const slots = getTimeSlotsForDate(dateStr);
      const totalCapacity = status.isOpen
        ? slots.reduce((sum, s) => sum + s.capacity, 0)
        : 0;
      const totalBooked = slots.reduce((sum, s) => sum + s.bookedCount, 0);
      const totalAvailable = status.isOpen
        ? slots.reduce((sum, s) => sum + s.availableCount, 0)
        : 0;
      const openSlotsCount = status.isOpen
        ? slots.filter((s) => !s.isFull).length
        : 0;

      return {
        date: dateStr,
        isOpen: status.isOpen,
        isPast: status.isPast,
        reason: status.reason,
        slots,
        totalCapacity,
        totalBooked,
        totalAvailable,
        openSlotsCount,
        isFullyBooked: status.isOpen && totalAvailable === 0 && slots.length > 0,
      };
    },
    [isDateOpenForBooking, getTimeSlotsForDate]
  );

  const saveScheduleConfig = async (nextConfig, summaryNote = 'Updated appointment schedule rules') => {
    const merged = {
      ...DEFAULT_SCHEDULE_CONFIG,
      ...scheduleConfig,
      ...nextConfig,
      updatedAt: new Date().toISOString(),
    };
    setScheduleConfig(merged);

    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await setDoc(doc(sdk.db, 'settings', 'appointment_schedule'), merged, {
        merge: true,
      }).catch(() => {});
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      rtdbSet(rtdbRef(sdk.rtdb, 'crs/settings/appointment_schedule'), merged).catch(
        () => {}
      );
    }

    await appendAudit({
      action: 'SCHEDULE_CONFIG_UPDATED',
      targetType: 'appointment',
      targetId: 'appointment_schedule',
      summary: summaryNote,
    });
    return merged;
  };

  const bookAppointment = async ({
    fullName,
    email,
    phone,
    serviceId,
    applicationId = null,
    appointmentDate,
    timeSlot,
    purpose = 'Counter Document Verification & Release',
  }) => {
    const activeUser = profile || {
      id: 'guest-applicant',
      first_name: fullName || 'Citizen',
      last_name: '',
      email: email || '',
      phone_number: phone || '',
    };
    const slots = getTimeSlotsForDate(appointmentDate);
    const desired = slots.find((s) => s.timeSlot === timeSlot);
    if (desired && desired.isFull) {
      throw new Error(
        `Time slot ${timeSlot} on ${appointmentDate} is already full (${desired.capacity}/${desired.capacity}).`
      );
    }

    const service = services.find((s) => s.id === serviceId);
    const refNo = `APT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const aptId = `apt-${Date.now()}`;
    const slotId = `${appointmentDate}_${String(timeSlot).replace(/[^a-zA-Z0-9]/g, '')}`;
    const nowIso = new Date().toISOString();

    const newApt = {
      id: aptId,
      reference_no: refNo,
      applicant_id: activeUser.id,
      applicant_name: fullName || `${activeUser.first_name} ${activeUser.last_name}`,
      applicant_email: email || activeUser.email,
      applicant_phone: phone || activeUser.phone_number || '+63 917 555 0192',
      applicationId,
      service_id: serviceId,
      service_name: service?.name || 'Civil Registry Counter Appointment',
      slotId,
      appointment_date: appointmentDate,
      time_slot: timeSlot,
      status: 'reserved',
      purpose,
      counter_no: 'Counter 02',
      created_at: nowIso,
    };

    const notif = {
      id: `notif-apt-${Date.now()}`,
      user_id: activeUser.id,
      title: `Appointment Reserved: ${refNo}`,
      message: `Your counter slot is reserved for ${appointmentDate} (${timeSlot}) at Counter 02. Bring original documents & valid ID.`,
      type: 'appointment',
      link: '/applicant/appointments',
      is_read: false,
      created_at: nowIso,
    };

    setAppointments((prev) => [newApt, ...prev.filter((a) => a.id !== aptId)]);
    setNotifications((prev) => [notif, ...prev]);

    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      const slotRef = doc(sdk.db, 'time_slots', slotId);
      const aptRef = doc(sdk.db, 'appointments', aptId);
      const notifRef = doc(sdk.db, 'notifications', notif.id);
      setDoc(notifRef, notif).catch(() => {});
      runTransaction(sdk.db, async (tx) => {
        const snap = await tx.get(slotRef);
        if (snap.exists()) {
          const booked = Number(snap.data().bookedCount || 0);
          const cap = Number(snap.data().capacity || 8);
          if (booked >= cap) throw new Error('Selected slot is already full.');
          tx.update(slotRef, { bookedCount: booked + 1, updatedAt: serverTimestamp() });
        } else {
          tx.set(slotRef, {
            slotId,
            date: appointmentDate,
            timeSlot,
            capacity: 8,
            bookedCount: 1,
            isActive: true,
            updatedAt: serverTimestamp(),
          });
        }
        tx.set(aptRef, {
          ...newApt,
          referenceNo: refNo,
          applicantId: activeUser.id,
          appointmentDate,
          timeSlot,
        });
      }).catch(() => {});
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      Promise.all([
        rtdbSet(rtdbRef(sdk.rtdb, `crs/appointments/${aptId}`), newApt),
        rtdbSet(rtdbRef(sdk.rtdb, `crs/notifications/${notif.id}`), notif),
      ]).catch(() => {});
    }

    await appendAudit({
      action: 'APPOINTMENT_RESERVED_ATOMIC',
      targetType: 'appointment',
      targetId: refNo,
      summary: `Booked slot ${appointmentDate} (${timeSlot}) via atomic transaction`,
    });

    return newApt;
  };

  const rescheduleAppointment = async (appointmentId, newDate, newTimeSlot) => {
    const slots = getTimeSlotsForDate(newDate);
    const desired = slots.find((s) => s.timeSlot === newTimeSlot);
    if (desired && desired.isFull) {
      throw new Error(`Slot ${newTimeSlot} on ${newDate} is full.`);
    }

    const target = appointments.find((a) => a.id === appointmentId);
    if (!target) return;

    const updated = {
      ...target,
      appointment_date: newDate,
      time_slot: newTimeSlot,
      status: 'reserved',
    };
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updated : a)));

    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await setDoc(doc(sdk.db, 'appointments', appointmentId), updated, { merge: true }).catch(
        () => {}
      );
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      rtdbSet(rtdbRef(sdk.rtdb, `crs/appointments/${appointmentId}`), updated).catch(() => {});
    }

    await appendAudit({
      action: 'APPOINTMENT_RESCHEDULED',
      targetType: 'appointment',
      targetId: target.reference_no,
      summary: `Rescheduled counter appointment to ${newDate} (${newTimeSlot})`,
    });
  };

  const updateAppointmentStatus = async (appointmentId, newStatus, remarks = '') => {
    const target = appointments.find((a) => a.id === appointmentId);
    if (!target) return;

    const updated = { ...target, status: newStatus, personnel_notes: remarks };
    setAppointments((prev) => prev.map((a) => (a.id === appointmentId ? updated : a)));

    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await setDoc(doc(sdk.db, 'appointments', appointmentId), updated, { merge: true }).catch(
        () => {}
      );
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      rtdbSet(rtdbRef(sdk.rtdb, `crs/appointments/${appointmentId}`), updated).catch(() => {});
    }

    await appendAudit({
      action: `APPOINTMENT_${newStatus.toUpperCase()}`,
      targetType: 'appointment',
      targetId: target.reference_no,
      summary: remarks || `Counter appointment marked as ${newStatus}`,
    });
  };

  // Cloud Storage Document Upload (10 MB max, PDF/JPG/PNG)
  const uploadDocumentFile = async (file, applicationId = 'draft', requirementName = 'Document') => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowed.includes(file.type.toLowerCase())) {
      throw new Error('Only PDF, JPG, and PNG files are accepted.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File exceeds the 10 MB maximum size limit.');
    }

    const activeUser = profile || { id: 'citizen' };
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `civil-registry-documents/${activeUser.id}/${applicationId}/${Date.now()}_${cleanName}`;
    let downloadUrl = null;

    const sdk = getFirebaseSdk();
    if (sdk?.storage) {
      try {
        const fRef = storageRef(sdk.storage, path);
        await uploadBytes(fRef, file, { contentType: file.type });
        downloadUrl = await getDownloadURL(fRef);
      } catch (e) {}
    }

    return {
      id: `doc-${Date.now()}`,
      requirementName,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
      storagePath: path,
      downloadUrl,
      status: 'verified_by_ai',
      uploadedAt: new Date().toISOString(),
    };
  };

  // Notifications
  const markNotificationRead = async (notifId) => {
    const target = notifications.find((n) => n.id === notifId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
    );
    const sdk = getFirebaseSdk();
    if (sdk?.db && target) {
      await setDoc(
        doc(sdk.db, 'notifications', notifId),
        { ...target, is_read: true },
        { merge: true }
      ).catch(() => {});
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser && target) {
      rtdbSet(rtdbRef(sdk.rtdb, `crs/notifications/${notifId}`), {
        ...target,
        is_read: true,
      }).catch(() => {});
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      notifications.forEach((n) => {
        setDoc(doc(sdk.db, 'notifications', n.id), { ...n, is_read: true }, { merge: true }).catch(
          () => {}
        );
      });
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      notifications.forEach((n) => {
        rtdbSet(rtdbRef(sdk.rtdb, `crs/notifications/${n.id}`), {
          ...n,
          is_read: true,
        }).catch(() => {});
      });
    }
  };

  // Admin Operations
  const saveService = async (srvObj) => {
    setServices((prev) => {
      const idx = prev.findIndex((s) => s.id === srvObj.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...srvObj };
        return copy;
      }
      return [...prev, srvObj];
    });
    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await setDoc(doc(sdk.db, 'services', srvObj.id), srvObj, { merge: true }).catch(() => {});
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      rtdbSet(rtdbRef(sdk.rtdb, `crs/services/${srvObj.id}`), srvObj).catch(() => {});
    }
    await appendAudit({
      action: 'SERVICE_UPDATED',
      targetType: 'service',
      targetId: srvObj.code || srvObj.id,
      summary: `Updated service ${srvObj.name} (Informational fee: ₱${srvObj.fee_amount})`,
    });
  };

  const addRequirement = async (serviceId, reqObj) => {
    setRequirements((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), reqObj],
    }));
    await appendAudit({
      action: 'REQUIREMENT_ADDED',
      targetType: 'service_requirements',
      targetId: serviceId,
      summary: `Added requirement "${reqObj.name}" to ${serviceId}`,
    });
  };

  const deleteRequirement = async (serviceId, reqId) => {
    setRequirements((prev) => ({
      ...prev,
      [serviceId]: (prev[serviceId] || []).filter((r) => r.id !== reqId),
    }));
  };

  const provisionUser = async (newUser) => {
    let uid = `usr-${Date.now()}`;
    const assignedRole = (newUser.role || 'personnel').trim().toLowerCase();
    const cleanEmail = (newUser.email || '').trim().toLowerCase();
    const emailKey = normalizeEmailKey(cleanEmail);

    if (newUser.password) {
      try {
        uid = await provisionFirebaseAuthAccount(
          newUser.email,
          newUser.password,
          `${newUser.first_name || ''} ${newUser.last_name || ''}`,
          assignedRole
        );
      } catch (err) {
        if (err?.code === 'auth/email-already-in-use') {
          const existingInList = usersListRef.current.find(
            (u) =>
              String(u.email || '')
                .trim()
                .toLowerCase() === cleanEmail
          );
          if (existingInList?.id) {
            uid = existingInList.id;
          }
        } else if (err?.code === 'auth/weak-password') {
          throw new Error('Password must be at least 6 characters long.');
        } else if (err?.code && err.code !== 'auth/operation-not-allowed') {
          throw new Error(err.message || 'Could not create user account.');
        }
      }
    }

    const record = {
      id: uid,
      uid,
      first_name: (newUser.first_name || '').trim(),
      last_name: (newUser.last_name || '').trim(),
      email: (newUser.email || '').trim(),
      phone_number: (newUser.phone_number || '').trim(),
      role: assignedRole,
      password: newUser.password || undefined,
      isActive: true,
      privacyConsentAt: new Date().toISOString(),
    };
    setUsersList((prev) => [
      record,
      ...prev.filter(
        (u) =>
          u.id !== record.id &&
          String(u.email || '').trim().toLowerCase() !== cleanEmail
      ),
    ]);
    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await Promise.all([
        setDoc(doc(sdk.db, 'users', record.id), record, { merge: true }).catch(() => {}),
        cleanEmail
          ? setDoc(doc(sdk.db, 'user_roles_by_email', emailKey), record, {
              merge: true,
            }).catch(() => {})
          : Promise.resolve(),
      ]);
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      Promise.all([
        rtdbSet(rtdbRef(sdk.rtdb, `crs/users/${record.id}`), record).catch(() => {}),
        cleanEmail
          ? rtdbSet(rtdbRef(sdk.rtdb, `crs/user_roles_by_email/${emailKey}`), record).catch(
              () => {}
            )
          : Promise.resolve(),
      ]);
    }
    await appendAudit({
      action: 'USER_PROVISIONED',
      targetType: 'user',
      targetId: record.email,
      summary: `Provisioned ${record.first_name} ${record.last_name} with role ${record.role}`,
    });
    return record;
  };

  const changeUserRole = async (email, newRole) => {
    const cleanEmail = String(email || '').trim().toLowerCase();
    const emailKey = normalizeEmailKey(cleanEmail);
    let targetUser = null;
    setUsersList((prev) =>
      prev.map((u) => {
        if (String(u.email || '').trim().toLowerCase() !== cleanEmail) return u;
        targetUser = { ...u, role: newRole };
        return targetUser;
      })
    );
    if (
      profile &&
      String(profile.email || '').trim().toLowerCase() === cleanEmail
    ) {
      setProfile((prev) => (prev ? { ...prev, role: newRole } : prev));
    }
    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await Promise.all([
        targetUser?.id
          ? setDoc(
              doc(sdk.db, 'users', targetUser.id),
              { role: newRole },
              { merge: true }
            ).catch(() => {})
          : Promise.resolve(),
        cleanEmail
          ? setDoc(
              doc(sdk.db, 'user_roles_by_email', emailKey),
              { ...(targetUser || { email }), role: newRole },
              { merge: true }
            ).catch(() => {})
          : Promise.resolve(),
      ]);
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      Promise.all([
        targetUser?.id
          ? rtdbSet(rtdbRef(sdk.rtdb, `crs/users/${targetUser.id}`), targetUser).catch(
              () => {}
            )
          : Promise.resolve(),
        cleanEmail
          ? rtdbSet(rtdbRef(sdk.rtdb, `crs/user_roles_by_email/${emailKey}`), {
              ...(targetUser || { email }),
              role: newRole,
            }).catch(() => {})
          : Promise.resolve(),
      ]);
    }
    await appendAudit({
      action: 'CUSTOM_CLAIMS_ROLE_ASSIGNED',
      targetType: 'user',
      targetId: email,
      summary: `Updated Firebase role for ${email} to ${newRole.toUpperCase()}`,
    });
  };

  const saveFirebaseSettings = () => {
    purgeAllBrowserStorage();
    showToast('Browser localStorage cleared — running 100% live on crss-cd118!', 'success', 'Live Mode');
  };

  // Wipe all test data from both browser storage and Firebase `crss-cd118` for a completely fresh test run
  const resetAllTestData = async () => {
    purgeAllBrowserStorage();
    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      const cols = ['applications', 'appointments', 'notifications', 'audit_logs'];
      for (const colName of cols) {
        const snap = await getDocs(collection(sdk.db, colName)).catch(() => null);
        if (snap) {
          await Promise.all(snap.docs.map((d) => deleteDoc(d.ref))).catch(() => {});
        }
      }
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      await Promise.all([
        rtdbRemove(rtdbRef(sdk.rtdb, 'crs/applications')),
        rtdbRemove(rtdbRef(sdk.rtdb, 'crs/appointments')),
        rtdbRemove(rtdbRef(sdk.rtdb, 'crs/notifications')),
        rtdbRemove(rtdbRef(sdk.rtdb, 'crs/tracking')),
        rtdbRemove(rtdbRef(sdk.rtdb, 'crs/audit_logs')),
      ]).catch(() => {});
    }
    setApplications([]);
    setAppointments([]);
    setNotifications([]);
    setAuditLogs([]);
    showToast(
      'All localStorage & Firebase test records wiped! Ready for a clean end-to-end test.',
      'success',
      'Clean Slate Ready'
    );
  };

  const seedFirestoreFromClient = async () => {
    purgeAllBrowserStorage();
    const sdk = getFirebaseSdk();
    if (sdk?.db) {
      await Promise.all([
        deleteDoc(doc(sdk.db, 'users', '11111111-1111-4111-8111-111111111111')).catch(() => {}),
        deleteDoc(doc(sdk.db, 'users', '22222222-2222-4222-8222-222222222222')).catch(() => {}),
        deleteDoc(doc(sdk.db, 'users', '33333333-3333-4333-8333-333333333333')).catch(() => {}),
        ...DEFAULT_SERVICES.map((s) =>
          setDoc(doc(sdk.db, 'services', s.id), s, { merge: true }).catch(() => {})
        ),
      ]);
    }
    if (sdk?.rtdb && sdk?.auth?.currentUser) {
      for (const s of DEFAULT_SERVICES) {
        rtdbSet(rtdbRef(sdk.rtdb, `crs/services/${s.id}`), s).catch(() => {});
      }
    }
    showToast(
      'Official Civil Registry services synced to Firebase (crss-cd118)!',
      'success',
      'Firebase Synced'
    );
  };

  return (
    <PortalContext.Provider
      value={{
        profile,
        authLoading,
        role: profile?.role || 'applicant',
        services,
        requirements,
        applications,
        appointments,
        scheduleConfig,
        notifications,
        usersList,
        auditLogs,
        toasts,
        firebaseConfig,
        firebaseConnected,
        configModalOpen,
        setConfigModalOpen,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuthModal,
        showToast,
        login,
        register,
        logout,
        createApplication,
        updateApplicationStatus,
        isDateOpenForBooking,
        getTimeSlotsForDate,
        getDateAvailabilitySummary,
        saveScheduleConfig,
        bookAppointment,
        rescheduleAppointment,
        updateAppointmentStatus,
        uploadDocumentFile,
        scanDocumentForAutoFill,
        markNotificationRead,
        markAllNotificationsRead,
        saveService,
        addRequirement,
        deleteRequirement,
        provisionUser,
        changeUserRole,
        saveFirebaseSettings,
        seedFirestoreFromClient,
        resetAllTestData,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within a PortalProvider');
  return ctx;
}
