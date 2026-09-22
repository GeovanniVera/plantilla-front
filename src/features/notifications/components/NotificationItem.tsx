import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { LuTrash2 } from 'react-icons/lu';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getNotificationTypeMeta } from '../notificationTypeMeta';
import { useDeleteNotification, useMarkAsRead } from '../hooks/useNotifications';
import type { InAppNotification } from '../services/notification.service';

const ITEM_CLASSES =
  'group flex w-full cursor-pointer items-start gap-3 rounded-lg border p-3 pr-[52px] text-left transition-colors duration-150';

const READ_ITEM_CLASSES = 'bg-background border-border-base hover:bg-surface';
const UNREAD_ITEM_CLASSES = 'bg-surface border-accent-line hover:bg-accent-subtle';

const ICON_BOX_CLASSES =
  'flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-subtle text-accent';

const DELETE_BUTTON_CLASSES =
  'absolute top-3 right-3 flex size-7 shrink-0 items-center justify-center rounded-md border-none bg-transparent text-fg-muted transition-colors duration-150 hover:text-danger-strong';

function formatRelativeTime(value: string): string {
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: es });
  } catch {
    return value;
  }
}

interface NotificationItemProps {
  notification: InAppNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const meta = getNotificationTypeMeta(notification.type);
  const Icon = meta.icon;

  const handleOpen = () => {
    // Already-read items skip the redundant PATCH; the endpoint is idempotent
    // but there is no reason to spend a request on it.
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label={t('notifications.open', { title: notification.title })}
        className={`${ITEM_CLASSES} ${notification.read ? READ_ITEM_CLASSES : UNREAD_ITEM_CLASSES}`}
      >
        <span role="img" aria-label={t(meta.labelKey)} className={ICON_BOX_CLASSES}>
          <Icon size={16} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p
              className={`text-fg min-w-0 flex-1 text-sm ${notification.read ? 'font-medium' : 'font-semibold'}`}
            >
              {notification.title}
            </p>
            {!notification.read && (
              <span className="bg-accent mt-1 size-2 shrink-0 rounded-full" aria-hidden="true" />
            )}
          </div>
          <p className="text-fg-muted mt-0.5 line-clamp-2 text-xs">{notification.body}</p>
          <p className="text-fg-muted mt-1 text-[11px]">
            {formatRelativeTime(notification.createdAt)}
          </p>
        </div>
      </button>

      <button
        type="button"
        aria-label={t('notifications.delete')}
        onClick={() => deleteNotification.mutate(notification.id)}
        className={DELETE_BUTTON_CLASSES}
      >
        <LuTrash2 size={14} />
      </button>
    </div>
  );
}
