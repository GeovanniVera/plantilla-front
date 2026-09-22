import { http, HttpResponse } from 'msw';
import type { InAppNotification } from '../../../features/notifications/services/notification.service';

export interface RecordedNotificationRequest {
  method: string;
  url: string;
}

let notifications: InAppNotification[] = [];
let recordedRequests: RecordedNotificationRequest[] = [];

/** Replaces the in-memory dataset served by the notification handlers. */
export function setMockNotifications(items: InAppNotification[]): void {
  notifications = items.map((item) => ({ ...item }));
}

/** Clears the dataset and the recorded requests. Call it in `beforeEach`. */
export function resetNotificationMocks(): void {
  notifications = [];
  recordedRequests = [];
}

/** Requests observed by the notification handlers. */
export function getRecordedNotificationRequests(): RecordedNotificationRequest[] {
  return recordedRequests;
}

function record(method: string, url: string): void {
  recordedRequests.push({ method, url });
}

export const notificationHandlers = [
  // Registered before the list handler: the extra path segment means MSW
  // would not confuse `/notifications/unread-count` with `/notifications`.
  http.get('*/notifications/unread-count', ({ request }) => {
    record(request.method, request.url);
    const count = notifications.filter((notification) => !notification.read).length;
    return HttpResponse.json({ success: true, message: 'ok', data: { count } });
  }),

  http.get('*/notifications', ({ request }) => {
    record(request.method, request.url);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? '0');
    const size = Number(url.searchParams.get('size') ?? '20');
    const type = url.searchParams.get('type');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    // Server-side ordering: createdAt DESC.
    let filtered = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (type) filtered = filtered.filter((notification) => notification.type === type);
    if (unreadOnly) filtered = filtered.filter((notification) => !notification.read);

    const start = page * size;
    const content = filtered.slice(start, start + size);

    return HttpResponse.json({
      success: true,
      message: 'ok',
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / size)),
        number: page,
        size,
        first: page === 0,
        last: start + size >= filtered.length,
        empty: content.length === 0,
      },
    });
  }),

  http.patch('*/notifications/read-all', ({ request }) => {
    record(request.method, request.url);
    const markedCount = notifications.filter((notification) => !notification.read).length;
    notifications = notifications.map((notification) => ({ ...notification, read: true }));
    return HttpResponse.json({ success: true, message: 'ok', data: { markedCount } });
  }),

  http.patch('*/notifications/:id/read', ({ request, params }) => {
    record(request.method, request.url);
    const id = String(params.id);
    notifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    return HttpResponse.json({ success: true, message: 'ok', data: true });
  }),

  http.delete('*/notifications/:id', ({ request, params }) => {
    record(request.method, request.url);
    const id = String(params.id);
    notifications = notifications.filter((notification) => notification.id !== id);
    return HttpResponse.json({ success: true, message: 'ok', data: true });
  }),
];
