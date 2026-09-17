/**
 * Componente de control de acceso basado en permisos.
 *
 * A diferencia de RequirePrivilege (que redirige),
 * Can simplemente no renderiza si no tiene permisos.
 *
 * @example
 * ```tsx
 * // Ocultar botón si no tiene permiso
 * <Can privilege="users:write">
 *   <button>Editar usuario</button>
 * </Can>
 *
 * // Ocultar si no tiene ninguno de estos permisos
 * <Can anyOf={["users:write", "admin:all"]}>
 *   <button>Acción administrativa</button>
 * </Can>
 *
 * // Renderizar alternativa si no tiene permiso
 * <Can privilege="users:write" fallback={<span>Sin permisos</span>}>
 *   <button>Editar</button>
 * </Can>
 * ```
 */
import { type ReactNode } from 'react';
import { useAuth } from './hooks';

interface CanProps {
  /** Permiso requerido */
  privilege?: string;
  /** Cualquiera de estos permisos */
  anyOf?: string[];
  /** Componente a renderizar si tiene permiso */
  children: ReactNode;
  /** Componente a renderizar si NO tiene permiso */
  fallback?: ReactNode;
}

export function Can({ privilege, anyOf, children, fallback = null }: CanProps) {
  const { hasPrivilege, hasAnyPrivilege } = useAuth();

  const hasAccess = anyOf ? hasAnyPrivilege(anyOf) : privilege ? hasPrivilege(privilege) : true;

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
