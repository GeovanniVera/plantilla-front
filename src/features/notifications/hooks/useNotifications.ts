import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import { notificationService, type NotificationListParams } from '../services/notification.service';

/**
 * Query keys are nested under `notifications` so a single prefix invalidation
 * catches both the list and the unread count. The list key is kept separate
 * from the count key because they have different shapes and lifecycles.
 */
const NOTIFICATIONS_LIST_KEY = ['notifications', 'list'] as const;
const NOTIFICATIONS_UNREAD_COUNT_KEY = ['notifications', 'unread-count'] as const;

/**
 * Marks both the list and the unread count as stale after a mutation: reading,
 * deleting or marking all as read changes the badge AND the list contents.
 */
function invalidateNotifications(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_LIST_KEY });
  void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY });
}

/** Unread badge count. Returns the number directly, not the envelope. */
export function useUnreadCount() {
  return useQuery({
    queryKey: NOTIFICATIONS_UNREAD_COUNT_KEY,
    queryFn: async () => {
      const response = await notificationService.unreadCount();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al obtener el contador de notificaciones');
      }
      return response.data.count;
    },
  });
}

/**
 * Paginated notification list.
 *
 * `keepPreviousData` keeps the previous page visible while a filter change
 * resolves, avoiding the panel flickering to empty.
 */
export function useNotifications({
  page = 0,
  size = 20,
  sort,
  type,
  unreadOnly = false,
}: NotificationListParams = {}) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_LIST_KEY, { page, size, sort, type, unreadOnly }],
    queryFn: async () => {
      const response = await notificationService.list({ page, size, sort, type, unreadOnly });
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Error al listar notificaciones');
      }
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}
