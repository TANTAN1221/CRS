# Civil Registry Online Services Portal — React + Firebase + Capacitor (Web & Mobile)

An official, production-ready web and mobile portal for municipal civil registry operations. Built with **React 18**, **Vite**, **Tailwind CSS**, **Lucide React**, **Capacitor**, and **Firebase** (**Firebase Authentication**, **Cloud Firestore**, **Cloud Storage for Firebase**, **Cloud Functions for Firebase**, and **Firebase Cloud Messaging**) with **AI Document Scan-to-Auto-Fill**.

![Civil Registry Online Services Portal](public/logo.png)

---

## 🏛️ Core Architecture & Key Features

1. **AI Document Scanning → Automated Form Pre-Fill:**
   - Citizens can open the **AI Document Scanner** ([src/components/AIDocumentScannerModal.jsx](file:///C:/Users/trist/Documents/CRS/src/components/AIDocumentScannerModal.jsx)) on Step 1 or Step 2 of the Application Wizard to scan a **PhilSys National ID**, **Certificate of Live Birth (Form 102)**, or **Certificate of Marriage (Form 97)** using their **Mobile/Web Camera**, **File Upload (PDF/JPG/PNG)**, or **Sample ID Presets**.
   - Calls the Firebase `aiDocumentChecker` Cloud Function (Gemini 1.5 Flash OCR) with a deterministic client OCR fallback and automatically populates React form state (`fullName`, `dateOfBirth`, `placeOfBirth`, `motherMaidenName`, `fatherName`) with **per-field confidence badges** (`99% Verified` in emerald vs. `< 88% Verify` in amber).
2. **No In-Built Online Payments:**
   - All online checkout flows and payment-status blockers have been removed.
   - Fee schedules are strictly **informational** and display counter payment instructions pursuant to **Republic Act No. 3753** and the **Local Government Code of 1991**.
3. **Appointment-First Workflow & Atomic Slot Locking:**
   - 5-stage application lifecycle: `submitted` → `pre_screened` → `under_review` → `ready_for_appointment` → `completed` (or `returned`).
   - Counter slot booking uses **Cloud Firestore Atomic Transactions (`runTransaction`)** on `time_slots/{slotId}` to enforce `bookedCount < capacity` and prevent double-booking.
4. **Single Codebase for Web + Mobile (Capacitor & PWA):**
   - Compiles to `dist/` for **Firebase Hosting (Web)** and **Capacitor (Android & iOS)**.
   - Includes an automatic mobile bottom navigation bar (`< 1024px`) and PWA Service Worker (`public/sw.js`).

---

## 📂 Clean React + Firebase Project Structure

```
CRS/
├── .firebaserc                              # Firebase project alias
├── firebase.json                            # Hosting (dist/), Firestore, Storage, Functions & Emulators
├── firestore.rules                          # Firestore RBAC, ownership & immutable audit_logs rules
├── firestore.indexes.json                   # Composite Firestore indexes
├── storage.rules                            # Private Storage rules (PDF/JPG/PNG <= 10 MB)
├── capacitor.config.json                    # Capacitor Android & iOS mobile configuration (webDir: "dist")
├── package.json                             # React 18, Vite, Firebase v10, React Router, Lucide React
├── vite.config.js                           # Vite bundler configuration
├── index.html                               # SPA root entry point
│
├── public/
│   ├── logo.png                             # Official Portal Logo
│   ├── manifest.json                        # PWA installable manifest
│   └── sw.js                                # Offline shell cache & FCM Web Push service worker
│
├── src/
│   ├── main.jsx                             # React DOM root mount
│   ├── App.jsx                              # React Router SPA routes (clean & .html routes)
│   ├── index.css                            # Government Navy theme (#0e2756) & scan-beam animation
│   ├── services/
│   │   └── firebase.js                      # Firebase v10 SDK + AI OCR Auto-Fill engine & presets
│   ├── context/
│   │   └── PortalContext.jsx                # Global React state, Auth, Firestore transactions & Audit
│   ├── components/
│   │   ├── PortalLayout.jsx                 # Topbar, Persona Switcher, Mobile Bottom Nav & Firebase Modal
│   │   └── AIDocumentScannerModal.jsx       # Live Camera / Upload / Preset AI Scanner & Auto-Fill Review
│   └── pages/
│       ├── public/
│       │   └── PublicPages.jsx              # LandingPage (Inspo 1 & 2), LoginPage, RegisterPage (RA 10173)
│       ├── applicant/
│       │   ├── ApplicationWizard.jsx        # 4-Step Wizard with AI Scan-to-Auto-Fill & Confidence Badges
│       │   └── ApplicantPages.jsx           # Dashboard, Services, Atomic Appointments, 5-Stage Tracker, Alerts
│       ├── personnel/
│       │   └── PersonnelPages.jsx           # Officer Dashboard, Master Queue, Verification Workstation, Check-In
│       └── admin/
│           └── AdminPages.jsx               # Executive Analytics, Users, RBAC Matrix, Services, Audit CSV
│
└── functions/                               # Cloud Functions for Firebase (TypeScript / Node.js 20)
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                         # aiDocumentChecker, appointmentReminders, audit/history triggers
        └── seed.ts                          # Admin SDK seed script for Auth Custom Claims & Firestore
```

---

## 🚀 Setup, Local Development & Deployment

### 1. Run Locally with Vite
```bash
npm install
npm run dev
```
Open `http://localhost:5000`. You can test all three portals and the **AI Document Scan-to-Auto-Fill** workflow immediately using the 1-Click Demo Persona buttons or the top persona switcher.

### 2. Connect Your Live Firebase Project
1. Click **Firebase Setup** in the top navigation bar.
2. Paste your Firebase Console web config snippet (`const firebaseConfig = { ... }`) and click **Auto-Fill Fields**.
3. Click **Seed Demo Data to Firestore** to populate `users`, `services`, and atomic `time_slots` directly from the browser, then click **Save Configuration**.

### 3. Build for Production & Deploy to Firebase
```bash
npm run build
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
```

### 4. Build Android & iOS Mobile Apps with Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
npm run build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
```

---

## 🔑 Pre-Seeded Demo Personas

| Role | Email | Password | Custom Claim & Persona |
|---|---|---|---|
| **Citizen Applicant** | `citizen@example.gov` | `Password123!` | `role: "applicant"` — Maria Santos Dela Cruz |
| **Registry Personnel** | `officer@example.gov` | `Password123!` | `role: "personnel"` — Rolando Navarro Bautista |
| **Portal Administrator** | `admin@example.gov` | `Password123!` | `role: "admin"` — Atty. Eleanor Vance Mercado |
