/**
 * Módulo de autenticación.
 *
 * Uso básico:
 * ```tsx
 * // Envolver la app
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 *
 * // En componentes
 * const { user, isAuthenticated, login, logout } = useAuth()
 *
 * // Proteger rutas
 * <ProtectedRoute>
 *   <MiPagina />
 * </ProtectedRoute>
 *
 * // Requerir privilegio
 * <RequirePrivilege privilege="settings:manage">
 *   <Configuracion />
 * </RequirePrivilege>
 * ```
 */

// Proveedor
export { AuthProvider } from './provider';

// Hooks
export { useAuth, useHasPrivilege, useHasAnyPrivilege, useHasRole } from './hooks';

// Guards (componentes de protección de rutas)
export { ProtectedRoute, RequirePrivilege, RequireRole, GuestOnly, RequireVerification } from './guards';

// Tipos
export type { User, AuthState, AuthContextValue } from './types';
