import type { IconType } from 'react-icons';
import {
  LuLogIn,
  LuLogOut,
  LuCircleAlert,
  LuShieldOff,
  LuShieldCheck,
  LuKeyRound,
  LuUserX,
  LuInfo,
} from 'react-icons/lu';

export interface AuditLabel {
  text: string;
  icon: IconType;
  tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

const ACTION_LABELS: Record<string, AuditLabel> = {
  LOGIN_SUCCEEDED: { text: 'Iniciaste sesión', icon: LuLogIn, tone: 'success' },
  LOGIN_FAILED: {
    text: 'Intento de inicio de sesión fallido',
    icon: LuCircleAlert,
    tone: 'danger',
  },
  LOGOUT: { text: 'Cerraste sesión', icon: LuLogOut, tone: 'neutral' },
  ACCOUNT_SUSPENDED: { text: 'Tu cuenta fue suspendida', icon: LuShieldOff, tone: 'danger' },
  ACCOUNT_REACTIVATED: { text: 'Tu cuenta fue reactivada', icon: LuShieldCheck, tone: 'success' },
  PASSWORD_CHANGED: { text: 'Cambiaste tu contraseña', icon: LuKeyRound, tone: 'warning' },
  ROLE_CHANGED: { text: 'Se modificaron tus roles', icon: LuUserX, tone: 'warning' },
};

const DEFAULT_LABEL: AuditLabel = { text: 'Evento de seguridad', icon: LuInfo, tone: 'neutral' };

/** Devuelve el label legible para una acción. */
export function getActionLabel(action: string): AuditLabel {
  return ACTION_LABELS[action] ?? DEFAULT_LABEL;
}

/** Opciones para el filtro de tipo de evento (fuente única: ACTION_LABELS). */
export function getActionFilterOptions(): { value: string; label: string }[] {
  return Object.entries(ACTION_LABELS).map(([value, label]) => ({
    value,
    label: label.text,
  }));
}

/** Describe la entidad afectada en lenguaje legible. */
export function describeEntity(entityType?: string, entityId?: string): string {
  if (!entityType) return '';
  const typeMap: Record<string, string> = {
    USER: 'usuario',
    ROLE: 'rol',
    PERMISSION: 'permiso',
    PAYMENT: 'pago',
    FILE: 'archivo',
  };
  const type = typeMap[entityType] ?? entityType.toLowerCase();
  return entityId ? `${type} (${entityId.slice(0, 8)}…)` : type;
}
