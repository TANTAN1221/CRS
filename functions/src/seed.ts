// =====================================================================
// CIVIL REGISTRY ONLINE SERVICES PORTAL - FIRESTORE & AUTH SEED SCRIPT
// Populates Demo Personas (with Custom Claims), Services, Requirements,
// Appointment Schedules, Atomic Time Slots, Applications, and Tracking.
// Usage: cd functions && npm run seed
// =====================================================================

import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const auth = admin.auth();

const DEMO_USERS = [
  {
    uid: "11111111-1111-4111-8111-111111111111",
    email: "citizen@example.gov",
    password: "Password123!",
    firstName: "Maria",
    middleName: "Santos",
    lastName: "Dela Cruz",
    phoneNumber: "+63 917 555 0192",
    address: "742 Evergreen Terrace, Sector 4",
    city: "Metro City",
    province: "Capital District",
    role: "applicant" as const,
  },
  {
    uid: "22222222-2222-4222-8222-222222222222",
    email: "officer@example.gov",
    password: "Password123!",
    firstName: "Rolando",
    middleName: "Navarro",
    lastName: "Bautista",
    phoneNumber: "+63 918 555 0144",
    address: "Hall of Justice, Civil Registry Division",
    city: "Metro City",
    province: "Capital District",
    role: "personnel" as const,
  },
  {
    uid: "33333333-3333-4333-8333-333333333333",
    email: "admin@example.gov",
    password: "Password123!",
    firstName: "Atty. Eleanor",
    middleName: "Vance",
    lastName: "Mercado",
    phoneNumber: "+63 920 555 0100",
    address: "Executive Suite 501, City Government Hall",
    city: "Metro City",
    province: "Capital District",
    role: "admin" as const,
  },
];

const SERVICES = [
  {
    id: "birth_cert",
    name: "Certificate of Live Birth (Certified True Copy / Issuance)",
    code: "COLB-01",
    description:
      "Official copy or authenticated transcript of birth record registered with the Local Civil Registry.",
    processingDays: 3,
    informationalFee: 155.0,
    feeNote: "Payable at Civil Registry Counter Window upon appointment verification (RA 3753)",
    iconName: "baby",
    isActive: true,
  },
  {
    id: "marriage_cert",
    name: "Certificate of Marriage (Certified True Copy / Registration)",
    code: "COM-02",
    description:
      "Official copy of registered marriage certificate or registration of recent solemnization.",
    processingDays: 3,
    informationalFee: 155.0,
    feeNote: "Payable at Civil Registry Counter Window upon appointment verification (RA 3753)",
    iconName: "heart-handshake",
    isActive: true,
  },
  {
    id: "death_cert",
    name: "Certificate of Death (Certified True Copy / Registration)",
    code: "COD-03",
    description:
      "Official issuance of certified death certificate record for legal, estate, or insurance claims.",
    processingDays: 2,
    informationalFee: 150.0,
    feeNote: "Payable at Civil Registry Counter Window upon appointment verification (RA 3753)",
    iconName: "file-text",
    isActive: true,
  },
  {
    id: "cenomar",
    name: "Certificate of No Marriage Record (CENOMAR)",
    code: "CEN-04",
    description:
      "Official advisory on marriages certifying that a person has not contracted any marriage.",
    processingDays: 5,
    informationalFee: 210.0,
    feeNote: "Payable at Civil Registry Counter Window upon appointment verification (RA 3753)",
    iconName: "award",
    isActive: true,
  },
  {
    id: "delayed_birth",
    name: "Delayed Registration of Birth (Late Filing)",
    code: "DRB-05",
    description:
      "Formal late registration petition for births not reported within the 30-day statutory period.",
    processingDays: 10,
    informationalFee: 350.0,
    feeNote: "Payable at Civil Registry Counter Window after 10-day statutory posting period",
    iconName: "clock",
    isActive: true,
  },
  {
    id: "legitimation",
    name: "Legal Legitimation by Subsequent Marriage of Parents",
    code: "LEG-06",
    description:
      "Administrative processing and annotation of birth records to reflect the legitimation of a child.",
    processingDays: 7,
    informationalFee: 450.0,
    feeNote: "Payable at Civil Registry Counter Window upon legal annotation approval",
    iconName: "shield-check",
    isActive: true,
  },
];

async function seedAll() {
  console.log("Seeding Firebase Auth users & custom claims...");
  for (const u of DEMO_USERS) {
    try {
      await auth.getUser(u.uid);
      await auth.updateUser(u.uid, {
        email: u.email,
        password: u.password,
        displayName: `${u.firstName} ${u.lastName}`,
      });
    } catch {
      await auth.createUser({
        uid: u.uid,
        email: u.email,
        password: u.password,
        displayName: `${u.firstName} ${u.lastName}`,
        emailVerified: true,
      });
    }
    await auth.setCustomUserClaims(u.uid, { role: u.role });

    await db.collection("users").doc(u.uid).set({
      id: u.uid,
      email: u.email,
      first_name: u.firstName,
      middle_name: u.middleName,
      last_name: u.lastName,
      phone_number: u.phoneNumber,
      address: u.address,
      city: u.city,
      province: u.province,
      role: u.role,
      isActive: true,
      privacyConsentAt: admin.firestore.FieldValue.serverTimestamp(),
      privacyActReference: "Republic Act No. 10173 (Data Privacy Act of 2012)",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log("Seeding roles_permissions...");
  const roleMatrix = {
    applicant: [
      "applications.view_own",
      "applications.create",
      "appointments.book",
      "appointments.view_own",
      "documents.upload",
      "notifications.view",
    ],
    personnel: [
      "applications.view_all",
      "applications.verify",
      "applications.process",
      "appointments.manage",
      "appointments.check_in",
      "documents.review_ai",
      "tracking.update",
    ],
    admin: [
      "applications.view_all",
      "applications.verify",
      "applications.process",
      "applications.delete",
      "appointments.manage",
      "appointments.configure_slots",
      "system.users_manage",
      "system.roles_manage",
      "system.services_manage",
      "system.audit_view",
    ],
  };

  for (const [roleId, permissions] of Object.entries(roleMatrix)) {
    await db.collection("roles_permissions").doc(roleId).set({
      roleId,
      permissions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log("Seeding services & atomic time_slots...");
  for (const srv of SERVICES) {
    await db.collection("services").doc(srv.id).set({
      ...srv,
      processing_days: srv.processingDays,
      fee_amount: srv.informationalFee,
      icon_name: srv.iconName,
      is_active: srv.isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const slots = [
    "08:30 AM - 09:00 AM",
    "09:00 AM - 09:30 AM",
    "09:30 AM - 10:00 AM",
    "10:00 AM - 10:30 AM",
    "01:30 PM - 02:00 PM",
    "02:00 PM - 02:30 PM",
  ];
  for (const slot of slots) {
    const slotId = `${tomorrow}_${slot.replace(/[^a-zA-Z0-9]/g, "")}`;
    await db.collection("time_slots").doc(slotId).set({
      slotId,
      date: tomorrow,
      timeSlot: slot,
      startTime: slot.split(" - ")[0],
      capacity: 8,
      bookedCount: slot === "09:30 AM - 10:00 AM" ? 1 : 0,
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  console.log("Seeding system_settings...");
  await db.collection("system_settings").doc("portal_config").set({
    officeName: "Office of the City Civil Registrar",
    hotline: "(800) 555-0142",
    operatingHours: "Monday - Friday, 8:00 AM - 5:00 PM",
    paymentPolicy:
      "No online payments collected. All statutory fees are informational and paid directly at the Civil Registry Cashier Counter under RA 3753 and the Local Government Code of 1991.",
    aiPreScreeningEnabled: true,
    slotCapacityDefault: 8,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log("Firestore & Auth seed complete!");
}

seedAll().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
