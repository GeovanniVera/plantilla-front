import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../../../lib/i18n/config';
import { NotificationPanel } from './NotificationPanel';
import {
  getRecordedNotificationRequests,
  resetNotificationMocks,
  setMockNotifications,
} from '../../../test/mocks/handlers/notifications';
import type { InAppNotification } from '../services/notification.service';

function makeNotification(overrides: Partial<InAppNotification> = {}): InAppNotification {
  return {
    id: 'n1',
    type: 'SECURITY',
    title: 'Inicio de sesión detectado',
    body: 'Se detectó un inicio de sesión desde un dispositivo nuevo.',
    read: false,
    createdAt: '2026-09-22T10:00:00Z',
    ...overrides,
  };
}

function renderPanel() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <NotificationPanel isOpen onClose={vi.fn()} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  resetNotificationMocks();
});

describe('NotificationPanel — listado y estados', () => {
  it('renderiza las notificaciones devueltas por la API', async () => {
    setMockNotifications([
      makeNotification({ id: 'n1', title: 'Primera' }),
      makeNotification({ id: 'n2', title: 'Segunda', type: 'ACCOUNT' }),
    ]);

    renderPanel();

    expect(await screen.findByText('Primera')).toBeInTheDocument();
    expect(screen.getByText('Segunda')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay notificaciones', async () => {
    setMockNotifications([]);

    renderPanel();

    expect(await screen.findByText('No tenés notificaciones')).toBeInTheDocument();
  });

  it('marca una notificación como leída al hacer clic', async () => {
    setMockNotifications([makeNotification({ id: 'n1', title: 'Marcar leída' })]);

    renderPanel();

    fireEvent.click(await screen.findByText('Marcar leída'));

    await waitFor(() => {
      expect(
        getRecordedNotificationRequests().some(
          (request) => request.method === 'PATCH' && request.url.includes('/notifications/n1/read'),
        ),
      ).toBe(true);
    });
  });

  it('marca todas como leídas desde la acción del encabezado', async () => {
    setMockNotifications([
      makeNotification({ id: 'n1', title: 'Primera' }),
      makeNotification({ id: 'n2', title: 'Segunda' }),
    ]);

    renderPanel();

    expect(await screen.findByText('2 sin leer')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Marcar todas como leídas' }));

    await waitFor(() => {
      expect(
        getRecordedNotificationRequests().some(
          (request) =>
            request.method === 'PATCH' && request.url.includes('/notifications/read-all'),
        ),
      ).toBe(true);
    });
    expect(await screen.findByText('0 sin leer')).toBeInTheDocument();
  });

  it('elimina una notificación al presionar el botón de borrar', async () => {
    setMockNotifications([makeNotification({ id: 'n1', title: 'Eliminar esta' })]);

    renderPanel();

    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar notificación' }));

    await waitFor(() => {
      expect(
        getRecordedNotificationRequests().some(
          (request) => request.method === 'DELETE' && request.url.includes('/notifications/n1'),
        ),
      ).toBe(true);
    });
    await waitFor(() => {
      expect(screen.queryByText('Eliminar esta')).not.toBeInTheDocument();
    });
  });

  it('filtra las notificaciones sin leer con el filtro "No leídas"', async () => {
    setMockNotifications([
      makeNotification({ id: 'n1', title: 'Sin leer' }),
      makeNotification({ id: 'n2', title: 'Ya leída', read: true }),
    ]);

    renderPanel();

    expect(await screen.findByText('Sin leer')).toBeInTheDocument();
    expect(screen.getByText('Ya leída')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'No leídas' }));

    await waitFor(() => {
      expect(screen.queryByText('Ya leída')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Sin leer')).toBeInTheDocument();
  });
});
