import { client } from '@lib/api/client';
import type { ApiResponse } from '@lib/api/types/api-response';

export interface InAppNotification {
  id: string;
  /** Free-form type set by the backend; no enum contract today. */
  type: string;
  title: string;
  body: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  read: boolean;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

export interface UnreadCount {
  count: number;
}

export interface MarkAllReadResult {
  markedCount: number;
}

/** Default Spring Data `Page` envelope returned by GET /notifications. */
export interface NotificationPage {
  content: InAppNotification[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface NotificationListParams {
  /** 0-based page index. Default: 0 */
  page?: number;
  /** Page size. Default: 20 */
  size?: number;
  /** Spring sort expression, e.g. `createdAt,desc`. */
  sort?: string;
  /** Exact match on the notification type. */
  type?: string;
  /** When true, only unread notifications are returned. Default: false */
  unreadOnly?: boolean;
}

export const notificationService = {
  list: (params?: NotificationListParams): Promise<ApiResponse<NotificationPage>> => {
    const query = new URLSearchParams({
      page: String(params?.page ?? 0),
      size: String(params?.size ?? 20),
    });

    if (params?.sort) query.set('sort', params.sort);
    if (params?.type) query.set('type', params.type);
    if (params?.unreadOnly) query.set('unreadOnly', 'true');

    return client.get<NotificationPage>(`/notifications?${query.toString()}`);
  },

  unreadCount: (): Promise<ApiResponse<UnreadCount>> =>
    client.get<UnreadCount>('/notifications/unread-count'),

  markAsRead: (id: string): Promise<ApiResponse<boolean>> =>
    client.patch<boolean>(`/notifications/${id}/read`),

  markAllAsRead: (): Promise<ApiResponse<MarkAllReadResult>> =>
    client.patch<MarkAllReadResult>('/notifications/read-all'),

  delete: (id: string): Promise<ApiResponse<boolean>> =>
    client.delete<boolean>(`/notifications/${id}`),
};
