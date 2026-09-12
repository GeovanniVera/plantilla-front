/**
 * Tipos del dominio de autenticación.
 *
 * Estos tipos representan el estado de auth en el frontend.
 * Están desacoplados de la forma de la respuesta de la API.
 */

import type { User } from '../lib/api/types/api-response';

export type { User };

/**
 * Estado de autenticación de la aplicación.
 */
export interface AuthState {
  /** Usuario actual o null si no hay sesión */
  user: User | null;
  /** JWT de acceso o null si no hay sesión */
  token: string | null;
  /** true si el usuario está autenticado */
  isAuthenticated: boolean;
  /** true mientras se restaura la sesión al iniciar la app */
  isLoading: boolean;
}

/**
 * Métodos y estado del contexto de autenticación.
 * Se accede mediante el hook useAuth().
 */
export interface AuthContextValue extends AuthState {
  /**
   * Inicia sesión con credenciales.
   * @param email - Email del usuario
   * @param password - Contraseña del usuario
   */
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  /** Cierra la sesión y limpia el token */
  logout: () => Promise<void>;
  /**
   * Verifica si el usuario tiene un privilegio específico.
   * @param privilege - Privilegio a verificar (ej: 'users:read')
   * @returns true si el usuario tiene el privilegio
   */
  hasPrivilege: (privilege: string) => boolean;
  /**
   * Verifica si el usuario tiene al menos uno de los privilegios indicados.
   * @param privileges - Lista de privilegios a verificar
   * @returns true si tiene al menos uno
   */
  hasAnyPrivilege: (privileges: string[]) => boolean;
  /**
   * Verifica si el usuario tiene un rol específico.
   * @param role - Rol a verificar (ej: 'admin')
   * @returns true si el usuario tiene el rol
   */
  hasRole: (role: string) => boolean;
  /**
   * Verifica si el usuario tiene el email verificado.
   * @returns true si el email está verificado
   */
  isVerified: () => boolean;
}
