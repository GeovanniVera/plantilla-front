import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VerifyEmailPage from './VerifyEmailPage';
import { AuthContext } from '../../auth/context';
import type { AuthContextValue, User } from '../../auth/types';
import { server } from '../../test/mocks/server';
import { http, HttpResponse, delay } from 'msw';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
  // Sin `state.email`: la página debe preferir el email del usuario autenticado.
  useLocation: () => ({
    state: {},
    pathname: '/verify-email',
    search: '',
    hash: '',
    key: 'default',
  }),
}));

const unverifiedUser: User = {
  id: '2',
  email: 'test@test.com',
  name: 'Unverified User',
  roles: ['viewer'],
  permissions: [],
  isVerified: false,
};

function authValue(): AuthContextValue {
  return {
    user: unverifiedUser,
    token: 'token',
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    hasPrivilege: () => false,
    hasAnyPrivilege: () => false,
    hasRole: () => false,
    isVerified: () => false,
  };
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

function renderVerifyEmailPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={authValue()}>
        <MemoryRouter initialEntries={['/verify-email']}>
          <VerifyEmailPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('renders without crashing', () => {
    const { container } = renderVerifyEmailPage();
    expect(container).toBeDefined();
  });

  it('shows the email address from the authenticated user', () => {
    renderVerifyEmailPage();
    expect(screen.getByText('test@test.com')).toBeInTheDocument();
  });

  it('shows resend button', () => {
    renderVerifyEmailPage();
    expect(screen.getByRole('button', { name: /reenviar/i })).toBeInTheDocument();
  });

  it('shows logout button', () => {
    renderVerifyEmailPage();
    expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
  });

  it('sends resend verification email successfully', async () => {
    renderVerifyEmailPage();
    fireEvent.click(screen.getByRole('button', { name: /reenviar/i }));
    await waitFor(() => {
      expect(screen.getByText(/email reenviado exitosamente/i)).toBeInTheDocument();
    });
  });

  it('shows error on resend failure', async () => {
    server.use(
      http.post('*/auth/resend-verification', () => {
        return new Response(null, { status: 500, statusText: 'Internal Server Error' });
      }),
    );
    renderVerifyEmailPage();
    fireEvent.click(screen.getByRole('button', { name: /reenviar/i }));
    await waitFor(() => {
      expect(screen.getByText(/error al reenviar/i)).toBeInTheDocument();
    });
  });

  it('navigates to login on logout', async () => {
    renderVerifyEmailPage();
    fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('shows the verification link expiry from the fetched password policy', async () => {
    // Valor no-default: si la UI hardcodeara 24, esta aserción falla.
    server.use(
      http.get('*/auth/password-policy', () =>
        HttpResponse.json({
          success: true,
          message: 'Política de contraseñas',
          data: {
            otpExpiresInMinutes: 15,
            resetTokenExpiresInMinutes: 30,
            verificationExpiresInHours: 5,
            passwordPolicy: {
              minLength: 8,
              maxLength: 128,
              requiresUppercase: true,
              requiresLowercase: true,
              requiresSymbol: true,
            },
          },
        }),
      ),
    );

    renderVerifyEmailPage();
    expect(await screen.findByText('El enlace expira en 5 horas')).toBeInTheDocument();
  });

  it('shows a generic expiry text without a number while the policy is loading', () => {
    server.use(
      http.get('*/auth/password-policy', async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );

    renderVerifyEmailPage();
    expect(screen.getByText('El enlace expira en unas horas')).toBeInTheDocument();
  });
});
