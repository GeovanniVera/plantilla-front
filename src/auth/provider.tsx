import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { AuthContext } from './context';
import { authService } from '../lib/api/services/auth.service';
import { tokenManager } from '../lib/api/client';
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
      // Try localStorage first, then sessionStorage
      let token = authStorage.getToken(true); // localStorage
      let remember = true;
      if (!token) {
        token = authStorage.getToken(false); // sessionStorage
        remember = false;
      }

      if (!token) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        tokenManager.set(token);
        const meResponse = await authService.me();
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
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        // Token inválido o expirado → limpiar sesión
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

    const { user, token: newToken, refreshToken, expiresIn } = response.data;

    // Persistir tokens
    authStorage.setToken(newToken, expiresIn, remember);
    if (refreshToken) {
      authStorage.setRefreshToken(refreshToken, remember);
    }
    tokenManager.set(newToken);

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
    (privilege: string) => state.user?.privileges.includes(privilege) ?? false,
    [state.user],
  );

  /**
   * Verifica si el usuario tiene al menos uno de los privilegios indicados.
   *
   * @param privileges - Lista de privilegios a verificar
   * @returns true si tiene al menos uno, false si no hay usuario
   */
  const hasAnyPrivilege = useCallback(
    (privileges: string[]) => privileges.some((p) => state.user?.privileges.includes(p)) ?? false,
    [state.user],
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
  const value = {
    ...state,
    login,
    logout,
    hasPrivilege,
    hasAnyPrivilege,
    hasRole,
    isVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
