import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from './RegisterPage';
import { AuthProvider } from '../../auth';
import { authStorage } from '../../lib/auth/token-store';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import type { User } from '../../lib/api/types/api-response';
import '../../lib/i18n/config';

vi.mock('../../auth/guards', () => ({
  GuestOnly: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

const unverifiedUser: User = {
  id: '9',
  email: 'new@test.com',
  name: 'Nuevo Usuario',
  roles: ['viewer'],
  permissions: [],
  isVerified: false,
};

function renderRegisterPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
    authStorage.clearAll();
  });

  afterEach(() => {
    authStorage.clearAll();
    server.resetHandlers();
  });

  it('renders register form', () => {
    renderRegisterPage();
    expect(screen.getByRole('heading', { name: 'Registrarse' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
  });

  it('shows error when terms not accepted', async () => {
    renderRegisterPage();
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'test@test.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123!' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Registrarse' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('Debés aceptar los términos y condiciones')).toBeInTheDocument();
    });
  });

  it('registers successfully, auto-logs in, and redirects to verify-email', async () => {
    // El backend deja iniciar sesión a cuentas sin verificar: el registro debe
    // auto-loguear y llevar a /verify-email (que ahora exige sesión).
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({
          success: true,
          message: 'Login exitoso',
          data: { user: unverifiedUser, accessToken: 'token', expiresIn: 3600 },
        }),
      ),
    );

    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Nuevo Usuario' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'new@test.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/verify-email', {
        state: { email: 'new@test.com' },
      });
    });
  });

  it('shows error on duplicate email', async () => {
    server.use(
      http.post('*/auth/register', () => {
        return HttpResponse.json(
          { success: false, message: 'El email ya está registrado', code: 'CONFLICT' },
          { status: 409 },
        );
      }),
    );

    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Nuevo Usuario' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'admin@test.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'Password123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
    });
  });
});
