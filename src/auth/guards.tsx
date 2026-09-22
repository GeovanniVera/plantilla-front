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
 *
 * Exige exactamente una de las dos formas: `privilege` (con `anyOf` opcional
 * que, si se indica, tiene prioridad) o `anyOf` por sí solo.
 */
type RequirePrivilegeProps = {
  /** Componentes hijos a renderizar si tiene el privilegio */
  children: ReactNode;
  /** Ruta de redirección si no tiene permisos (default: '/403') */
  redirectTo?: string;
} & (
  | {
      /** Privilegio requerido para acceder */
      privilege: string;
      /** Lista alternativa: requiere cualquiera de estos privilegios */
      anyOf?: string[];
    }
  | {
      /** No aplica en esta variante */
      privilege?: never;
      /** Lista alternativa: requiere cualquiera de estos privilegios */
      anyOf: string[];
    }
);

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
export function RequirePrivilege(props: RequirePrivilegeProps) {
  const { children, redirectTo = '/403' } = props;
  const { isAuthenticated, isLoading, hasPrivilege, hasAnyPrivilege } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Verificar permisos: anyOf usa OR, de lo contrario requiere el privilegio exacto
  const hasAccess =
    props.anyOf !== undefined
      ? hasAnyPrivilege(props.anyOf)
      : props.privilege !== undefined && hasPrivilege(props.privilege);

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
export function GuestOnly({ children, redirectTo = '/dashboard' }: GuestOnlyProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}

// ─── RequireUnverified ─────────────────────────────────────
/**
 * Props de RequireUnverified.
 */
interface RequireUnverifiedProps {
  /** Componentes hijos a renderizar si el email no está verificado */
  children: ReactNode;
  /** Ruta de redirección si el email ya está verificado (default: '/dashboard') */
  redirectTo?: string;
}

/**
 * Guard para la ruta de verificación de email (`/verify-email`).
 *
 * El único estado legítimo para ver esta pantalla es "autenticado y sin
 * verificar". El backend emite una sesión restringida (autoridad UNVERIFIED)
 * para cuentas no verificadas, así que un usuario anónimo no tiene sesión con
 * la que reenviar el email y un usuario ya verificado no tiene nada que hacer
 * acá.
 *
 * - Anónimo → /login
 * - Autenticado y verificado → redirectTo (default: /dashboard)
 * - Autenticado y sin verificar → renderiza children
 *
 * @example
 * ```tsx
 * <Route
 *   path="/verify-email"
 *   element={
 *     <RequireUnverified>
 *       <VerifyEmailPage />
 *     </RequireUnverified>
 *   }
 * />
 * ```
 */
export function RequireUnverified({ children, redirectTo = '/dashboard' }: RequireUnverifiedProps) {
  const { isAuthenticated, isLoading, isVerified } = useAuth();

  if (isLoading) return <AuthLoading />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isVerified()) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}
