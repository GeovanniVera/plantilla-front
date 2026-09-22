import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { AuthContext } from './context';
import { authService } from '../lib/api/services/auth.service';
import { tokenManager } from '../lib/api/client';
import { tryRefreshToken } from '../lib/api/interceptors/refresh';
import { authStorage } from '../lib/auth/token-store';
import type { AuthState } from './types';

/**
 * Props del AuthProvider.
 */
interface AuthProviderProps {
  /** Componentes hijos que tendrán acceso al contexto de auth */
  children: ReactNode;
}

/**
 * Proveedor de autenticación.
 *
 * Envuelve la app y provee el estado de autenticación a todos los componentes.
 * Al montarse, intenta restaurar la sesión desde localStorage.
 *
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true, // Inicia como true hasta restaurar la sesión
  });

  // ─── Restaurar sesión al montar ──────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      // El access token no se persiste (memory-only): el storage solo guarda
      // un INDICADOR de sesión. Tras un reload hay que refrescar el token vía
      // `POST /auth/refresh` (cookie HttpOnly) y recién después pedir /auth/me.
      // sessionStorage tiene prioridad: una sesión tab-scoped no debe ser
      // secuestrada por un indicador profile-wide que otro login dejó en
      // localStorage.
      const activeSession = authStorage.getActiveSession();
      const remember = activeSession?.remember ?? false;

      if (!activeSession) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        const refreshed = await tryRefreshToken();
        if (!refreshed) {
          authStorage.clear(remember);
          tokenManager.clear();
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
          return;
        }

        const meResponse = await authService.me();
        // Discriminar por `success` antes de leer `data`: la variante de error
        // del union no expone el campo, y accederlo sin narrow rompe el typecheck.
        if (!meResponse.success || !meResponse.data) {
          authStorage.clear(remember);
          tokenManager.clear();
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return;
        }

        setState({
          user: meResponse.data,
          token: tokenManager.get(),
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        // Error inesperado al restaurar sesión → limpiar sesión
        authStorage.clear(remember);
        tokenManager.clear();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    restoreSession();
  }, []);

  // ─── Listen for auth:logout events (from refresh token failure) ──
  useEffect(() => {
    const handleLogout = () => {
      authStorage.clearAll();
      tokenManager.clear();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      // Hard redirect intencional: limpia todo el estado de React
      // y fuerza re-inicialización del AuthProvider
      window.location.href = '/login';
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  // ─── Login ───────────────────────────────────────────────
  /**
   * Inicia sesión con credenciales.
   *
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   * @throws Error si las credenciales son inválidas
   */
  const login = useCallback(async (email: string, password: string, remember: boolean = true) => {
    const response = await authService.login(email, password);
    if (!response.success || !response.data) {
      throw new Error(response.message || 'Credenciales inválidas');
    }

    const { user, accessToken: newToken, expiresIn } = response.data;

    // Persistir solo el INDICADOR de sesión (refresh token viene en HttpOnly
    // cookie); el access token queda en memoria (memory-only).
    // Un login debe dejar exactamente un indicador en exactamente un storage:
    // limpiar ambos antes de escribir evita que un indicador viejo secuestre el restore.
    authStorage.clearAll();
    authStorage.setActiveSession(remember, expiresIn);
    tokenManager.set(newToken, expiresIn);

    // Actualizar estado
    setState({
      user,
      token: newToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  // ─── Logout ──────────────────────────────────────────────
  /**
   * Cierra la sesión y limpia todos los datos de auth.
   * Siempre limpia localmente aunque el backend falle.
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Siempre limpiar localmente, aunque la API falle
      authStorage.clearAll();
      tokenManager.clear();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  // ─── Verificaciones de permisos ──────────────────────────
  /**
   * Verifica si el usuario tiene un privilegio específico.
   *
   * @param privilege - Privilegio a verificar (ej: 'users:read')
   * @returns true si el usuario tiene el privilegio, false si no hay usuario
   */
  const hasPrivilege = useCallback(
    (privilege: string) => state.user?.permissions.includes(privilege) ?? false,
    [state.user],
  );

  // Set reutilizable para las consultas de privilegios: evita un `includes`
  // O(n) por cada privilegio consultado.
  const permissionSet = useMemo(() => new Set(state.user?.permissions ?? []), [state.user]);

  /**
   * Verifica si el usuario tiene al menos uno de los privilegios indicados.
   *
   * @param privileges - Lista de privilegios a verificar
   * @returns true si tiene al menos uno, false si no hay usuario
   */
  const hasAnyPrivilege = useCallback(
    (privileges: string[]) => privileges.some((p) => permissionSet.has(p)),
    [permissionSet],
  );

  /**
   * Verifica si el usuario tiene un rol específico.
   *
   * @param role - Rol a verificar (ej: 'admin')
   * @returns true si el usuario tiene el rol, false si no hay usuario
   */
  const hasRole = useCallback(
    (role: string) => state.user?.roles.includes(role) ?? false,
    [state.user],
  );

  /**
   * Verifica si el usuario tiene el email verificado.
   *
   * @returns true si el email está verificado, false si no hay usuario
   */
  const isVerified = useCallback(() => state.user?.isVerified ?? false, [state.user]);

  // ─── Valor del contexto ──────────────────────────────────
  // `state` cambia solo cuando cambia la sesión y todos los callbacks son
  // estables, así que el objeto solo se recrea cuando realmente cambia.
  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      hasPrivilege,
      hasAnyPrivilege,
      hasRole,
      isVerified,
    }),
    [state, login, logout, hasPrivilege, hasAnyPrivilege, hasRole, isVerified],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
