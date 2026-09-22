import type { IconType } from 'react-icons';
import { LuBell, LuShieldCheck, LuUser, LuWorkflow, LuSettings, LuUsers } from 'react-icons/lu';

export interface NotificationTypeMeta {
  /** Icon rendered for the type. */
  icon: IconType;
  /** i18n key with the human-readable label. */
  labelKey: string;
}

/**
 * Notification types are free-form strings on the backend (no enum contract),
 * so unknown values must fall back to a generic bell instead of crashing or
 * rendering nothing. `SECURITY` and `ACCOUNT` are the values emitted today;
 * `WORKFLOW`, `SYSTEM` and `SOCIAL` are part of the documented set.
 */
const NOTIFICATION_TYPE_META: Record<string, NotificationTypeMeta> = {
  SECURITY: { icon: LuShieldCheck, labelKey: 'notifications.types.SECURITY' },
  ACCOUNT: { icon: LuUser, labelKey: 'notifications.types.ACCOUNT' },
  WORKFLOW: { icon: LuWorkflow, labelKey: 'notifications.types.WORKFLOW' },
  SYSTEM: { icon: LuSettings, labelKey: 'notifications.types.SYSTEM' },
  SOCIAL: { icon: LuUsers, labelKey: 'notifications.types.SOCIAL' },
};

export const DEFAULT_NOTIFICATION_TYPE_META: NotificationTypeMeta = {
  icon: LuBell,
  labelKey: 'notifications.types.unknown',
};

/** Resolves the icon/label descriptor for a notification type, with fallback. */
export function getNotificationTypeMeta(type: string): NotificationTypeMeta {
  return NOTIFICATION_TYPE_META[type] ?? DEFAULT_NOTIFICATION_TYPE_META;
}
