import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VerifyEmailConfirmPage from './VerifyEmailConfirmPage';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderVerifyEmailConfirmPage(token: string | null = 'verify-token-abc123') {
  const entries = token ? [`/verify-email-confirm?token=${token}`] : ['/verify-email-confirm'];
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={entries}>
        <VerifyEmailConfirmPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('VerifyEmailConfirmPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('shows error when no token provided', async () => {
    renderVerifyEmailConfirmPage(null);
    await waitFor(() => {
      expect(screen.getByText(/token de verificación no proporcionado/i)).toBeInTheDocument();
    });
  });

  it('shows success state on valid token', async () => {
    renderVerifyEmailConfirmPage();
    await waitFor(() => {
      expect(screen.getByText(/email verificado/i)).toBeInTheDocument();
    });
  });

  it('shows error on invalid token', async () => {
    renderVerifyEmailConfirmPage('invalid-token');
    await waitFor(() => {
      expect(screen.getByText(/token inválido/i)).toBeInTheDocument();
    });
  });

  it('shows error on network failure', async () => {
    server.use(
      http.post('*/auth/verify-email', () => {
        return HttpResponse.error();
      }),
    );
    renderVerifyEmailConfirmPage();
    await waitFor(() => {
      expect(screen.getByText(/error de conexión/i)).toBeInTheDocument();
    });
  });

  it('has a button to go back to login on error', async () => {
    renderVerifyEmailConfirmPage(null);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /volver al login/i })).toBeInTheDocument();
    });
    screen.getByRole('button', { name: /volver al login/i }).click();
    expect(navigateMock).toHaveBeenCalledWith('/login');
  });

  it('shows success message after verification', async () => {
    renderVerifyEmailConfirmPage();
    await waitFor(() => {
      expect(screen.getByText(/redirigiendo al login/i)).toBeInTheDocument();
    });
  });
});
