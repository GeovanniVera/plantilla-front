import { useTranslation } from 'react-i18next';
import { LuBell } from 'react-icons/lu';
import { useUnreadCount } from '../hooks/useNotifications';

const BELL_BUTTON_CLASSES =
  'relative flex items-center justify-center size-9 rounded-md border-none bg-transparent text-foreground cursor-pointer transition-colors duration-150 hover:bg-accent-subtle hover:text-accent';

const BADGE_CLASSES =
  'absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-strong px-1 text-[10px] font-semibold leading-none text-white tabular-nums';

/** Caps the visible badge so the layout never breaks on large counts. */
function formatUnreadCount(count: number): string {
  return count > 99 ? '99+' : String(count);
}

interface NotificationBellProps {
  onClick: () => void;
}

/** Icon button with the unread badge; opens the notifications panel. */
export function NotificationBell({ onClick }: NotificationBellProps) {
  const { t } = useTranslation();
  const { data: count = 0 } = useUnreadCount();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t('notifications.bellLabel', { count })}
      className={BELL_BUTTON_CLASSES}
    >
      <LuBell size={20} />
      {count > 0 && (
        <span className={BADGE_CLASSES} aria-hidden="true">
          {formatUnreadCount(count)}
        </span>
      )}
    </button>
  );
}
