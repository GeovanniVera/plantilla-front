import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from '../../auth';
import { server } from '../../test/mocks/server';
import LoginPage from './LoginPage';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

function renderLoginPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

function submitCredentials(email: string, password: string) {
  fireEvent.change(screen.getByPlaceholderText('admin@test.com'), { target: { value: email } });
  fireEvent.change(screen.getByPlaceholderText('••••••'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('LoginPage', () => {
  beforeEach(() => navigateMock.mockReset());

  it('renders the login form and recovery links', async () => {
    renderLoginPage();
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /olvidaste tu contraseña/i })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
    expect(screen.getByRole('link', { name: /no tenés cuenta/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('submits valid credentials and navigates home', async () => {
    renderLoginPage();
    await screen.findByRole('heading', { name: 'Iniciar sesión' });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Recordarme' }));
    submitCredentials('admin@test.com', 'admin123');

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/dashboard', { replace: true }));
  });

  it('shows the server message after a failed login', async () => {
    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json(
          { success: false, message: 'Credenciales inválidas', code: 'VALIDATION_ERROR' },
          { status: 400 },
        ),
      ),
    );
    renderLoginPage();
    await screen.findByRole('heading', { name: 'Iniciar sesión' });
    submitCredentials('user@test.com', 'wrong-password');

    expect(await screen.findByText('Credenciales inválidas')).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
