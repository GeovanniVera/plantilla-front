import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../../lib/i18n/config';
import { NotificationBell } from './NotificationBell';
import {
  resetNotificationMocks,
  setMockNotifications,
} from '../../../test/mocks/handlers/notifications';
import type { InAppNotification } from '../services/notification.service';

function makeNotification(overrides: Partial<InAppNotification> = {}): InAppNotification {
  return {
    id: 'n1',
    type: 'SECURITY',
    title: 'Nueva notificación',
    body: 'Cuerpo de la notificación',
    read: false,
    createdAt: '2026-09-22T10:00:00Z',
    ...overrides,
  };
}

function renderBell(onClick = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <NotificationBell onClick={onClick} />
    </QueryClientProvider>,
  );

  return { onClick };
}

beforeEach(() => {
  resetNotificationMocks();
});

describe('NotificationBell — badge de no leídas', () => {
  it('muestra el contador en el badge y en el aria-label', async () => {
    setMockNotifications([
      makeNotification({ id: 'n1' }),
      makeNotification({ id: 'n2' }),
      makeNotification({ id: 'n3' }),
    ]);

    renderBell();

    expect(await screen.findByText('3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Notificaciones, 3 sin leer' })).toBeInTheDocument();
  });

  it('no muestra badge cuando no hay notificaciones sin leer', async () => {
    setMockNotifications([makeNotification({ id: 'n1', read: true })]);

    renderBell();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Notificaciones, 0 sin leer' }),
      ).toBeInTheDocument();
    });
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('limita el badge a 99+', async () => {
    setMockNotifications(
      Array.from({ length: 120 }, (_, index) => makeNotification({ id: `n${index}` })),
    );

    renderBell();

    expect(await screen.findByText('99+')).toBeInTheDocument();
  });

  it('abre el panel al presionar el botón', async () => {
    setMockNotifications([makeNotification()]);
    const { onClick } = renderBell();

    fireEvent.click(await screen.findByRole('button', { name: /notificaciones/i }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
