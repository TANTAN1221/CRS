// =====================================================================
// CIVIL REGISTRY PORTAL - REACT ROUTER APPLICATION
// Supports clean SPA routes AND `.html` suffixed paths seamlessly
// =====================================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PortalProvider } from './context/PortalContext';
import { LandingPage, LoginPage, RegisterPage } from './pages/public/PublicPages';
import ApplicationWizardPage from './pages/applicant/ApplicationWizard';
import {
  ApplicantDashboardPage,
  ApplicantServicesPage,
  ApplicantAppointmentsPage,
  DocumentTrackingPage,
  NotificationsPage,
} from './pages/applicant/ApplicantPages';
import {
  PersonnelDashboardPage,
  PersonnelApplicationsPage,
  DocumentVerificationPage,
  PersonnelAppointmentsPage,
  PersonnelTrackingPage,
} from './pages/personnel/PersonnelPages';
import {
  AdminDashboardPage,
  AdminUsersPage,
  AdminRolesPage,
  AdminServicesPage,
  AdminRequirementsPage,
  AdminAppointmentsPage,
  AdminReportsPage,
} from './pages/admin/AdminPages';

export default function App() {
  return (
    <PortalProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/index.html" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login.html" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register.html" element={<RegisterPage />} />

          {/* Citizen Applicant Routes (Unified "Services" + "My Progress" with integrated Office Visit) */}
          <Route path="/applicant/dashboard" element={<Navigate to="/applicant/services" replace />} />
          <Route path="/applicant/dashboard.html" element={<Navigate to="/applicant/services" replace />} />
          <Route path="/applicant/services" element={<ApplicationWizardPage />} />
          <Route path="/applicant/services.html" element={<ApplicationWizardPage />} />
          <Route path="/applicant/application" element={<ApplicationWizardPage />} />
          <Route path="/applicant/application.html" element={<ApplicationWizardPage />} />
          <Route path="/applicant/appointments" element={<Navigate to="/applicant/document-tracking" replace />} />
          <Route path="/applicant/appointments.html" element={<Navigate to="/applicant/document-tracking" replace />} />
          <Route path="/applicant/document-tracking" element={<DocumentTrackingPage />} />
          <Route path="/applicant/document-tracking.html" element={<DocumentTrackingPage />} />
          <Route path="/applicant/notifications" element={<NotificationsPage />} />
          <Route path="/applicant/notifications.html" element={<NotificationsPage />} />

          {/* Civil Registry Officer Routes */}
          <Route path="/personnel/dashboard" element={<PersonnelDashboardPage />} />
          <Route path="/personnel/dashboard.html" element={<PersonnelDashboardPage />} />
          <Route path="/personnel/applications" element={<PersonnelApplicationsPage />} />
          <Route path="/personnel/applications.html" element={<PersonnelApplicationsPage />} />
          <Route path="/personnel/document-verification" element={<DocumentVerificationPage />} />
          <Route path="/personnel/document-verification.html" element={<DocumentVerificationPage />} />
          <Route path="/personnel/appointments" element={<PersonnelAppointmentsPage />} />
          <Route path="/personnel/appointments.html" element={<PersonnelAppointmentsPage />} />
          <Route path="/personnel/tracking" element={<PersonnelTrackingPage />} />
          <Route path="/personnel/tracking.html" element={<PersonnelTrackingPage />} />

          {/* Portal Administrator Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard.html" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users.html" element={<AdminUsersPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/roles.html" element={<AdminRolesPage />} />
          <Route path="/admin/services" element={<AdminServicesPage />} />
          <Route path="/admin/services.html" element={<AdminServicesPage />} />
          <Route path="/admin/requirements" element={<AdminRequirementsPage />} />
          <Route path="/admin/requirements.html" element={<AdminRequirementsPage />} />
          <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
          <Route path="/admin/appointments.html" element={<AdminAppointmentsPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/reports.html" element={<AdminReportsPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </PortalProvider>
  );
}
