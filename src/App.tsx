import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './auth';
import { ForgotPasswordProvider } from './auth/ForgotPasswordContext';
import { ProtectedRoute, RequirePrivilege, GuestOnly } from './auth/guards';

// Auth pages (lazy)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const TermsPage = lazy(() => import('./pages/auth/TermsPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerifyOTPPage = lazy(() => import('./pages/auth/VerifyOTPPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const VerifyEmailConfirmPage = lazy(() => import('./pages/auth/VerifyEmailConfirmPage'));
const ForbiddenPage = lazy(() => import('./pages/auth/ForbiddenPage'));
const NotFoundPage = lazy(() => import('./pages/auth/NotFoundPage'));
const ServerErrorPage = lazy(() => import('./pages/auth/ServerErrorPage'));

// App pages (lazy)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AjustesIndex = lazy(() => import('./pages/ajustes/AjustesIndex'));
const BrandColorSettings = lazy(() => import('./features/settings/BrandColorSettings'));
const UsersPage = lazy(() => import('./pages/admin/UsersPage'));
const RolesPage = lazy(() => import('./pages/admin/RolesPage'));
const PermissionsPage = lazy(() => import('./pages/admin/PermissionsPage'));
const AdminIndexPage = lazy(() => import('./pages/admin/AdminIndexPage'));
const PerfilPage = lazy(() => import('./pages/ajustes/PerfilPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const MiActividadPage = lazy(() => import('./pages/ajustes/MiActividadPage'));

function App() {
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense
          fallback={
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text)' }}>
              Cargando...
            </div>
          }
        >
          <Routes>
            {/* Auth routes — AuthLayout (split + hero animado) */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Forgot password flow (con ForgotPasswordProvider) — GuestOnly */}
            <Route
              element={
                <ForgotPasswordProvider>
                  <AuthLayout />
                </ForgotPasswordProvider>
              }
            >
              <Route
                path="/forgot-password"
                element={
                  <GuestOnly>
                    <ForgotPasswordPage />
                  </GuestOnly>
                }
              />
              <Route
                path="/verify-otp"
                element={
                  <GuestOnly>
                    <VerifyOTPPage />
                  </GuestOnly>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <GuestOnly>
                    <ResetPasswordPage />
                  </GuestOnly>
                }
              />
            </Route>

            {/* Email verification flow */}
            <Route element={<AuthLayout />}>
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-email/confirm" element={<VerifyEmailConfirmPage />} />
            </Route>

            {/* Public routes (standalone) */}
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/403" element={<ForbiddenPage />} />
            <Route path="/500" element={<ServerErrorPage />} />

            {/* Protected routes — MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route
                path="/admin"
                element={
                  <RequirePrivilege privilege="users.read">
                    <AdminIndexPage />
                  </RequirePrivilege>
                }
              />
              <Route
                path="/admin/usuarios"
                element={
                  <RequirePrivilege privilege="users.read">
                    <UsersPage />
                  </RequirePrivilege>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <RequirePrivilege privilege="roles.read">
                    <RolesPage />
                  </RequirePrivilege>
                }
              />
              <Route
                path="/admin/permisos"
                element={
                  <RequirePrivilege privilege="permissions.read">
                    <PermissionsPage />
                  </RequirePrivilege>
                }
              />
              <Route
                path="/admin/auditoria"
                element={
                  <RequirePrivilege anyOf={['audit.read', 'audit.read-mine']}>
                    <AuditLogsPage />
                  </RequirePrivilege>
                }
              />
              <Route path="/ajustes" element={<AjustesIndex />} />
              <Route path="/ajustes/perfil" element={<PerfilPage />} />
              <Route
                path="/ajustes/actividad"
                element={
                  <RequirePrivilege anyOf={['audit.read', 'audit.read-mine']}>
                    <MiActividadPage />
                  </RequirePrivilege>
                }
              />
              <Route
                path="/ajustes/colores"
                element={
                  <RequirePrivilege privilege="settings.brand">
                    <div
                      style={{
                        padding: '32px 40px',
                        maxWidth: 1440,
                        width: '100%',
                        margin: '0 auto',
                      }}
                    >
                      <BrandColorSettings />
                    </div>
                  </RequirePrivilege>
                }
              />
            </Route>

            {/* 404 — Catch all */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default App;
