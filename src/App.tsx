import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './auth';
import { ForgotPasswordProvider } from './auth/ForgotPasswordContext';
import { ProtectedRoute, RequirePrivilege, GuestOnly } from './auth/guards';
import { routes } from './routes';

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
            <Route element={<AuthLayout />}>
              <Route
                path="/forgot-password"
                element={
                  <GuestOnly>
                    <ForgotPasswordProvider>
                      <ForgotPasswordPage />
                    </ForgotPasswordProvider>
                  </GuestOnly>
                }
              />
              <Route
                path="/verify-otp"
                element={
                  <GuestOnly>
                    <ForgotPasswordProvider>
                      <VerifyOTPPage />
                    </ForgotPasswordProvider>
                  </GuestOnly>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <GuestOnly>
                    <ForgotPasswordProvider>
                      <ResetPasswordPage />
                    </ForgotPasswordProvider>
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
              {routes.map((route) => {
                if (route.path?.startsWith('/ajustes')) {
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <RequirePrivilege privilege="settings:manage">
                          {route.element}
                        </RequirePrivilege>
                      }
                    />
                  );
                }
                return <Route key={route.path} path={route.path} element={route.element} />;
              })}
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
