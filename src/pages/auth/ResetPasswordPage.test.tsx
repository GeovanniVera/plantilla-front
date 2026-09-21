import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ResetPasswordPage from './ResetPasswordPage';
import { ForgotPasswordProvider } from '../../auth/ForgotPasswordContext';
import { useForgotPassword } from '../../auth/ForgotPasswordContext';
import { useEffect, useState } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/mocks/server';
import '../../lib/i18n/config';

const navigateMock = vi.fn();
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => navigateMock,
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
});

// Wrapper that sets token in context
function ResetPasswordPageWithToken() {
  const { email, token, otpVerified, setEmail, verifyOtp } = useForgotPassword();
  const [prepared, setPrepared] = useState(false);

  useEffect(() => {
    if (!email && !prepared) {
      setEmail('test@test.com');
    } else if (!token && !prepared) {
      void verifyOtp('123456').then((result) => {
        if (result.success) setPrepared(true);
      });
    }
  }, [email, token, prepared, setEmail, verifyOtp]);

  if (!token && !prepared) return <div>Preparing reset</div>;
  return (
    <>
      <output aria-label="reset email">{email || 'empty'}</output>
      <output aria-label="reset token">{token || 'empty'}</output>
      <output aria-label="OTP verified">{String(otpVerified)}</output>
      <ResetPasswordPage />
    </>
  );
}

function renderResetPasswordPage(withToken = false) {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/reset-password']}>
        <ForgotPasswordProvider>
          {withToken ? <ResetPasswordPageWithToken /> : <ResetPasswordPage />}
        </ForgotPasswordProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  it('redirects to forgot-password when no token', () => {
    renderResetPasswordPage();
    expect(navigateMock).toHaveBeenCalledWith('/forgot-password');
  });

  it('renders the form when token exists', async () => {
    renderResetPasswordPage(true);
    expect(await screen.findByRole('heading', { name: /nueva contraseña/i })).toBeInTheDocument();
  });

  it('shows password fields', async () => {
    renderResetPasswordPage(true);
    expect(await screen.findAllByPlaceholderText('••••••')).toHaveLength(2);
  });

  it('validates password minimum length', async () => {
    renderResetPasswordPage(true);
    const [passwordInput, confirmPasswordInput] = await screen.findAllByPlaceholderText('••••••');
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });
    fireEvent.submit(screen.getByRole('button', { name: /cambiar contraseña/i }).closest('form')!);
    await waitFor(() => {
      expect(
        screen.getByText(
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo',
        ),
      ).toBeInTheDocument();
    });
  });

  it('validates password confirmation mismatch', async () => {
    renderResetPasswordPage(true);
    const [passwordInput, confirmPasswordInput] = await screen.findAllByPlaceholderText('••••••');
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });
    fireEvent.submit(screen.getByRole('button', { name: /cambiar contraseña/i }).closest('form')!);
    await waitFor(() => {
      expect(screen.getByText(/no coinciden/i)).toBeInTheDocument();
    });
  });

  it('navigates back to verify-otp', async () => {
    renderResetPasswordPage(true);
    fireEvent.click(await screen.findByRole('button', { name: /volver/i }));
    expect(navigateMock).toHaveBeenCalledWith('/verify-otp');
  });

  it('shows the API message when reset fails', async () => {
    server.use(
      http.post('*/auth/reset-password', () =>
        HttpResponse.json(
          { success: false, message: 'El enlace de recuperación expiró', code: 'EXPIRED' },
          { status: 400 },
        ),
      ),
    );
    renderResetPasswordPage(true);
    const [passwordInput, confirmPasswordInput] = await screen.findAllByPlaceholderText('••••••');
    fireEvent.change(passwordInput, {
      target: { value: 'Password123!' },
    });
    fireEvent.change(confirmPasswordInput, {
      target: { value: 'Password123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    expect(await screen.findByText('El enlace de recuperación expiró')).toBeInTheDocument();
  });

  it('shows success, clears reset state, and navigates to login after the delay', async () => {
    renderResetPasswordPage(true);
    const [passwordInput, confirmPasswordInput] = await screen.findAllByPlaceholderText('••••••');
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(screen.getByRole('button', { name: /cambiar contraseña/i }));

    expect(
      await screen.findByRole('heading', { name: /contraseña actualizada/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/redirigiendo al login/i)).toBeInTheDocument();
    expect(screen.getByLabelText('reset email')).toHaveTextContent('empty');
    expect(screen.getByLabelText('reset token')).toHaveTextContent('empty');
    expect(screen.getByLabelText('OTP verified')).toHaveTextContent('false');
    expect(navigateMock).not.toHaveBeenCalled();

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/login'), { timeout: 4000 });
  });
});
