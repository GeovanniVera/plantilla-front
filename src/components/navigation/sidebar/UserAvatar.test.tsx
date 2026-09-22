import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import UserAvatar from './UserAvatar';
import { tokenManager } from '../../../lib/api/client';
import { env } from '../../../config/env';
import { server } from '../../../test/mocks/server';

const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);

const createObjectURL = vi.fn(() => 'blob:mock-photo');
const revokeObjectURL = vi.fn();

beforeEach(() => {
  tokenManager.clear();
  createObjectURL.mockClear();
  revokeObjectURL.mockClear();
  // jsdom no implementa createObjectURL/revokeObjectURL.
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revokeObjectURL,
  });
});

afterEach(() => {
  tokenManager.clear();
});

describe('UserAvatar — foto autenticada', () => {
  it('muestra la inicial cuando no hay photoUrl', () => {
    render(<UserAvatar name="Ana" />);

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('descarga la foto con Authorization y la renderiza como object URL', async () => {
    let authHeader: string | null = null;

    server.use(
      http.get('*/files/*', ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return new HttpResponse(PNG_BYTES, {
          headers: { 'Content-Type': 'image/png' },
        });
      }),
    );

    tokenManager.set('test-token');

    render(<UserAvatar name="Ana" photoUrl={`${env.VITE_API_BASE}/files/foto.png`} />);

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:mock-photo');
    });

    // La request de la imagen viaja a través del cliente autenticado.
    expect(authHeader).toBe('Bearer test-token');
    expect(createObjectURL).toHaveBeenCalledTimes(1);
  });

  it('vuelve a la inicial si la descarga de la foto falla', async () => {
    server.use(http.get('*/files/*', () => new HttpResponse(null, { status: 404 })));

    tokenManager.set('test-token');

    render(<UserAvatar name="Ana" photoUrl={`${env.VITE_API_BASE}/files/perdida.png`} />);

    await waitFor(() => {
      expect(screen.getByText('A')).toBeInTheDocument();
    });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('revoca el object URL al desmontar', async () => {
    server.use(
      http.get(
        '*/files/*',
        () => new HttpResponse(PNG_BYTES, { headers: { 'Content-Type': 'image/png' } }),
      ),
    );

    tokenManager.set('test-token');

    const { unmount } = render(
      <UserAvatar name="Ana" photoUrl={`${env.VITE_API_BASE}/files/foto.png`} />,
    );

    await waitFor(() => {
      expect(screen.getByRole('img')).toHaveAttribute('src', 'blob:mock-photo');
    });

    unmount();

    await waitFor(() => {
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock-photo');
    });
  });

  it('usa las URLs externas tal cual, sin fetch autenticado', () => {
    const externalUrl = 'https://res.cloudinary.com/demo/image/upload/foto.jpg';

    render(<UserAvatar name="Ana" photoUrl={externalUrl} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', externalUrl);
  });
});
