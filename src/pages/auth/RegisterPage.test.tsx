import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterPage from './RegisterPage';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';
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

function renderRegisterPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RegisterPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
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
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    fireEvent.submit(screen.getByRole('button', { name: 'Registrarse' }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText('Debés aceptar los términos y condiciones')).toBeInTheDocument();
    });
  });

  it('registers successfully and redirects', async () => {
    renderRegisterPage();

    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
      target: { value: 'Nuevo Usuario' },
    });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), {
      target: { value: 'new@test.com' },
    });
    const passwordInputs = screen.getAllByPlaceholderText('••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
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
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }));

    await waitFor(() => {
      expect(screen.getByText('El email ya está registrado')).toBeInTheDocument();
    });
  });
});
