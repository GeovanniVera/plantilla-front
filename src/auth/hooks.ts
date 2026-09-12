import { useContext } from 'react';
import { AuthContext } from './context';

/**
 * Hook para acceder al estado y métodos de autenticación.
 *
 * Debe usarse dentro de <AuthProvider>.
 *
 * @returns Estado actual y métodos de auth (login, logout, hasPrivilege, etc.)
 * @throws Error si se usa fuera de AuthProvider
 *
 * @example
 * ```tsx
 * function MiComponente() {
 *   const { user, isAuthenticated, logout } = useAuth()
 *
 *   if (!isAuthenticated) return <Login />
 *   return <p>Hola {user.name}</p>
 * }
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}

/**
 * Hook para verificar si el usuario tiene un privilegio específico.
 *
 * @param privilege - Privilegio a verificar (ej: 'users:read')
 * @returns true si el usuario tiene el privilegio
 *
 * @example
 * ```tsx
 * function BotonAdmin() {
 *   const puedeEditar = useHasPrivilege('users:write')
 *   if (!puedeEditar) return null
 *   return <button>Editar usuario</button>
 * }
 * ```
 */
export function useHasPrivilege(privilege: string): boolean {
  const { hasPrivilege } = useAuth();
  return hasPrivilege(privilege);
}

/**
 * Hook para verificar si el usuario tiene al menos uno de varios privilegios.
 *
 * @param privileges - Lista de privilegios a verificar
 * @returns true si tiene al menos uno de los privilegios
 *
 * @example
 * ```tsx
 * function BotonExportar() {
 *   const puedeExportar = useHasAnyPrivilege(['reports:export', 'admin:all'])
 *   if (!puedeExportar) return null
 *   return <button>Exportar reporte</button>
 * }
 * ```
 */
export function useHasAnyPrivilege(privileges: string[]): boolean {
  const { hasAnyPrivilege } = useAuth();
  return hasAnyPrivilege(privileges);
}

/**
 * Hook para verificar si el usuario tiene un rol específico.
 *
 * @param role - Rol a verificar (ej: 'admin')
 * @returns true si el usuario tiene el rol
 *
 * @example
 * ```tsx
 * function PanelAdmin() {
 *   const esAdmin = useHasRole('admin')
 *   if (!esAdmin) return <AccesoDenegado />
 *   return <AdminDashboard />
 * }
 * ```
 */
export function useHasRole(role: string): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}
