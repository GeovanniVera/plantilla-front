import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from './hooks';

// ─── Indicador de carga ────────────────────────────────────
/**
 * Componente mostrado mientras se verifica la sesión.
 * Se muestra durante la restauración de sesión al iniciar la app.
 */
function AuthLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: 'var(--text)',
      }}
    >
      Verificando sesión...
    </div>
  );
}

// ─── ProtectedRoute ────────────────────────────────────────
/**
 * Props de ProtectedRoute.
 */
interface ProtectedRouteProps {
  /** Componentes hijos a renderizar si está autenticado */
  children: ReactNode;
  /** Ruta de redirección si no está autenticado (default: '/login') */
  redirectTo?: string;
  /** Si es true, también verifica que el email esté verificado */
  requireVerification?: boolean;
}

/**
 * Guard que requiere autenticación.
 * Si el usuario no está autenticado, redirige a /login.
 * Si requireVerification es true y el email no está verificado, redirige a /verify-email.
 *
 * @example
 * ```tsx
 * <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 * ```
 */
export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireVerification = true,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isVerified } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  if (requireVerification && !isVerified()) return <Navigate to="/verify-email" replace />;

  return <>{children}</>;
}

// ─── RequirePrivilege ──────────────────────────────────────
/**
 * Props de RequirePrivilege.
 */
interface RequirePrivilegeProps {
  /** Privilegio requerido para acceder */
  privilege: string;
  /** Lista alternativa: requiere cualquiera de estos privilegios */
  anyOf?: string[];
  /** Componentes hijos a renderizar si tiene el privilegio */
  children: ReactNode;
  /** Ruta de redirección si no tiene permisos (default: '/403') */
  redirectTo?: string;
}

/**
 * Guard que requiere un privilegio específico (o cualquiera de varios).
 *
 * - Si no está autenticado → redirige a /login
 * - Si está autenticado pero no tiene permisos → redirige a /403
 *
 * @example
 * ```tsx
 * // Requiere privilegio específico
 * <RequirePrivilege privilege="settings:manage">
 *   <BrandColorSettings />
 * </RequirePrivilege>
 *
 * // Requiere cualquiera de los privilegios
 * <RequirePrivilege anyOf={["users:read", "admin:all"]}>
 *   <UsersList />
 * </RequirePrivilege>
 * ```
 */
export function RequirePrivilege({
  privilege,
  anyOf,
  children,
  redirectTo = '/403',
}: RequirePrivilegeProps) {
  const { isAuthenticated, isLoading, hasPrivilege, hasAnyPrivilege } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Verificar permisos: anyOf usa OR, de lo contrario requiere el privilegio exacto
  const privilegesToCheck = anyOf ?? [privilege];
  const hasAccess = anyOf ? hasAnyPrivilege(privilegesToCheck) : hasPrivilege(privilege);

  if (!hasAccess) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}

// ─── RequireRole ───────────────────────────────────────────
/**
 * Props de RequireRole.
 */
interface RequireRoleProps {
  /** Rol requerido para acceder */
  role: string;
  /** Componentes hijos a renderizar si tiene el rol */
  children: ReactNode;
  /** Ruta de redirección si no tiene el rol (default: '/403') */
  redirectTo?: string;
}

/**
 * Guard que requiere un rol específico.
 *
 * Nota: Se recomienda usar RequirePrivilege en su lugar,
 * ya que los privilegios son más granulares que los roles.
 *
 * @example
 * ```tsx
 * <RequireRole role="admin">
 *   <AdminPanel />
 * </RequireRole>
 * ```
 */
export function RequireRole({ role, children, redirectTo = '/403' }: RequireRoleProps) {
  const { isAuthenticated, isLoading, hasRole } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!hasRole(role)) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}

// ─── GuestOnly ─────────────────────────────────────────────
/**
 * Props de GuestOnly.
 */
interface GuestOnlyProps {
  /** Componentes hijos a renderizar si NO está autenticado */
  children: ReactNode;
  /** Ruta de redirección si ya está autenticado (default: '/') */
  redirectTo?: string;
}

/**
 * Guard para rutas públicas (login, registro).
 * Si el usuario ya está autenticado, redirige al home.
 *
 * @example
 * ```tsx
 * <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
 * ```
 */
export function GuestOnly({ children, redirectTo = '/' }: GuestOnlyProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}

// ─── RequireVerification ──────────────────────────────────
/**
 * Props de RequireVerification.
 */
interface RequireVerificationProps {
  /** Componentes hijos a renderizar si el email está verificado */
  children: ReactNode;
}

/**
 * Guard que requiere email verificado.
 * Si el usuario no tiene el email verificado, muestra la pantalla de verificación.
 *
 * @example
 * ```tsx
 * <Route element={<RequireVerification><SomePage /></RequireVerification>} />
 * ```
 */
export function RequireVerification({ children }: RequireVerificationProps) {
  const { isAuthenticated, isLoading, isVerified } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isVerified()) return <Navigate to="/verify-email" replace />;

  return <>{children}</>;
}
