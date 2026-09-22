import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Drawer } from '@components/overlays/Drawer';
import Button from '@components/primitives/Button';
import { Skeleton } from '@components/feedback';
import { useMarkAllAsRead, useNotifications, useUnreadCount } from '../hooks/useNotifications';
import { NotificationItem } from './NotificationItem';

const DEFAULT_PAGE_SIZE = 20;

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Right-side notifications panel. The list is mounted only while the drawer is
 * open (Drawer returns null when closed), so the query doesn't run in the
 * background and the "Todas / No leídas" filter resets on every open.
 */
export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { t } = useTranslation();

  return (
    <Drawer isOpen={isOpen} onClose={onClose}>
      {/* Header stays a direct child so Drawer can name the dialog from its title. */}
      <Drawer.Header title={t('notifications.title')} />
      <NotificationPanelContent />
    </Drawer>
  );
}

function NotificationPanelContent() {
  const { t } = useTranslation();
  const [unreadOnly, setUnreadOnly] = useState(false);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data, isLoading, isError, refetch } = useNotifications({
    page: 0,
    size: DEFAULT_PAGE_SIZE,
    unreadOnly,
  });
  const markAll = useMarkAllAsRead();

  const notifications = data?.content ?? [];

  return (
    <Drawer.Body>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-fg-muted text-sm">
            {t('notifications.unreadCount', { count: unreadCount })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={unreadCount === 0 || markAll.isPending}
          >
            {t('notifications.markAll')}
          </Button>
        </div>

        <div className="flex gap-1" role="group" aria-label={t('notifications.filterLabel')}>
          <FilterButton active={!unreadOnly} onClick={() => setUnreadOnly(false)}>
            {t('notifications.filter.all')}
          </FilterButton>
          <FilterButton active={unreadOnly} onClick={() => setUnreadOnly(true)}>
            {t('notifications.filter.unread')}
          </FilterButton>
        </div>

        {isLoading ? (
          <NotificationListSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-fg-muted text-sm">{t('notifications.error')}</p>
            <Button variant="secondary" size="sm" onClick={() => void refetch()}>
              {t('notifications.retry')}
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <p className="text-fg-muted py-10 text-center text-sm">
            {t(unreadOnly ? 'notifications.empty.unread' : 'notifications.empty.all')}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem notification={notification} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Drawer.Body>
  );
}

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

function FilterButton({ active, onClick, children }: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`cursor-pointer rounded-md border-none px-3 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
        active ? 'bg-accent-subtle text-accent' : 'text-fg-muted hover:text-fg bg-transparent'
      }`}
    >
      {children}
    </button>
  );
}

function NotificationListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="border-border-base flex items-start gap-3 rounded-lg border p-3"
        >
          <Skeleton variant="circular" width={36} height={36} />
          <div className="flex-1 space-y-2">
            <Skeleton width="60%" height={14} />
            <Skeleton width="90%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
}
