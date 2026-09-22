import type { IconType } from 'react-icons';
import type { TFunction } from 'i18next';
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
import type { AuditLog } from '../services/audit.service';

export interface AuditLabel {
  /** Title key from the actor's perspective. */
  titleKey: string;
  /**
   * Alternate title key used when the actor performed the action on a
   * DIFFERENT entity. Only present for relation-dependent actions
   * (`ACCOUNT_SUSPENDED`, `ACCOUNT_REACTIVATED`, `ROLE_CHANGED`).
   */
  titleOtherKey?: string;
  /** Neutral event-type label key, used by the filter dropdown. */
  filterKey: string;
  icon: IconType;
  tone: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
}

const ACTION_LABELS: Record<string, AuditLabel> = {
  LOGIN_SUCCEEDED: {
    titleKey: 'audit.actions.LOGIN_SUCCEEDED.title',
    filterKey: 'audit.actions.LOGIN_SUCCEEDED.filter',
    icon: LuLogIn,
    tone: 'success',
  },
  LOGIN_FAILED: {
    titleKey: 'audit.actions.LOGIN_FAILED.title',
    filterKey: 'audit.actions.LOGIN_FAILED.filter',
    icon: LuCircleAlert,
    tone: 'danger',
  },
  LOGOUT: {
    titleKey: 'audit.actions.LOGOUT.title',
    filterKey: 'audit.actions.LOGOUT.filter',
    icon: LuLogOut,
    tone: 'neutral',
  },
  ACCOUNT_SUSPENDED: {
    titleKey: 'audit.actions.ACCOUNT_SUSPENDED.title',
    titleOtherKey: 'audit.actions.ACCOUNT_SUSPENDED.titleOther',
    filterKey: 'audit.actions.ACCOUNT_SUSPENDED.filter',
    icon: LuShieldOff,
    tone: 'danger',
  },
  ACCOUNT_REACTIVATED: {
    titleKey: 'audit.actions.ACCOUNT_REACTIVATED.title',
    titleOtherKey: 'audit.actions.ACCOUNT_REACTIVATED.titleOther',
    filterKey: 'audit.actions.ACCOUNT_REACTIVATED.filter',
    icon: LuShieldCheck,
    tone: 'success',
  },
  PASSWORD_CHANGED: {
    // Self-only today. An admin changing another user's password would need
    // the same title/titleOther split as the account actions above.
    titleKey: 'audit.actions.PASSWORD_CHANGED.title',
    filterKey: 'audit.actions.PASSWORD_CHANGED.filter',
    icon: LuKeyRound,
    tone: 'warning',
  },
  ROLE_CHANGED: {
    titleKey: 'audit.actions.ROLE_CHANGED.title',
    titleOtherKey: 'audit.actions.ROLE_CHANGED.titleOther',
    filterKey: 'audit.actions.ROLE_CHANGED.filter',
    icon: LuUserX,
    tone: 'warning',
  },
};

const DEFAULT_LABEL: AuditLabel = {
  titleKey: 'audit.actions.unknown',
  filterKey: 'audit.actions.unknown',
  icon: LuInfo,
  tone: 'neutral',
};

/** Devuelve el descriptor (claves i18n, ícono y tono) para una acción. */
export function getActionLabel(action: string): AuditLabel {
  return ACTION_LABELS[action] ?? DEFAULT_LABEL;
}

/**
 * True when the authenticated actor performed the action on ANOTHER entity.
 *
 * Ids may be absent: `LOGIN_FAILED` for an unknown email has both `actorId`
 * and `entityId` null (AuthServiceImpl.java:151). Any missing id is treated
 * as "not acting on another entity", explicitly guarding against the
 * `null === null` coercion that would otherwise evaluate to true.
 */
function isActingOnOtherEntity(log: AuditLog): boolean {
  const { actorId, entityId } = log;
  if (actorId == null || entityId == null) return false;
  return actorId !== entityId;
}

/**
 * Resuelve el título visible de un evento de auditoría desde la perspectiva
 * del actor. Para las acciones dependientes de la relación actor/entidad
 * devuelve `titleOtherKey` cuando el actor actuó sobre otra entidad.
 */
export function getActionTitle(log: AuditLog, t: TFunction): string {
  const label = getActionLabel(log.action);
  const key =
    label.titleOtherKey && isActingOnOtherEntity(log) ? label.titleOtherKey : label.titleKey;
  return t(key);
}

/**
 * Opciones para el filtro de tipo de evento (fuente única: ACTION_LABELS).
 * Devuelve la clave i18n neutra; el llamador la traduce con `t()`.
 */
export function getActionFilterOptions(): { value: string; filterKey: string }[] {
  return Object.entries(ACTION_LABELS).map(([value, label]) => ({
    value,
    filterKey: label.filterKey,
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
