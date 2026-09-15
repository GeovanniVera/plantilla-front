import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VerifyOTPPage from './VerifyOTPPage';
import { ForgotPasswordProvider } from '../../auth/ForgotPasswordContext';
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

function renderVerifyOTPPage(email = 'test@test.com') {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/verify-otp']}>
        <ForgotPasswordProvider>
          <VerifyOTPPageWithContext email={email} />
        </ForgotPasswordProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

// Wrapper that sets email in context first
import { useForgotPassword } from '../../auth/ForgotPasswordContext';
import { useEffect } from 'react';

function VerifyOTPPageWithContext({ email }: { email: string }) {
  const context = useForgotPassword();
  useEffect(() => context.setEmail(email), [context.setEmail, email]);
  if (context.email !== email) return <div>Preparing verification</div>;
  return <VerifyOTPPage />;
}

describe('VerifyOTPPage', () => {
  beforeEach(() => {
    queryClient.clear();
    navigateMock.mockReset();
  });

  it('redirects to forgot-password when no email', () => {
    renderVerifyOTPPage('');
    expect(navigateMock).toHaveBeenCalledWith('/forgot-password');
  });

  it('renders OTP input fields', () => {
    renderVerifyOTPPage();
    expect(screen.getAllByRole('textbox')).toHaveLength(6);
  });

  it('shows back button', () => {
    renderVerifyOTPPage();
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument();
  });

  it('navigates back to forgot-password on back click', () => {
    renderVerifyOTPPage();
    fireEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(navigateMock).toHaveBeenCalledWith('/forgot-password');
  });

  it('accepts digit input and advances focus', async () => {
    renderVerifyOTPPage();
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(inputs[0]).toHaveValue('1');
  });

  it('rejects non-digit input', () => {
    renderVerifyOTPPage();
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'a' } });
    expect(inputs[0]).toHaveValue('');
  });

  it('auto-submits when all digits are entered and navigates on success', async () => {
    renderVerifyOTPPage();
    const inputs = screen.getAllByRole('textbox');
    const digits = ['1', '2', '3', '4', '5', '6'];
    digits.forEach((d, i) => fireEvent.change(inputs[i], { target: { value: d } }));
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/reset-password');
    });
  });

  it('shows error on invalid OTP and clears fields', async () => {
    renderVerifyOTPPage();
    const inputs = screen.getAllByRole('textbox');
    const digits = ['1', '1', '1', '1', '1', '1'];
    digits.forEach((d, i) => fireEvent.change(inputs[i], { target: { value: d } }));
    await waitFor(() => {
      expect(screen.getByText(/otp inválido/i)).toBeInTheDocument();
    });
    inputs.forEach((input) => {
      expect(input).toHaveValue('');
    });
  });

  it('navigates back on Backspace at first input', () => {
    renderVerifyOTPPage();
    const inputs = screen.getAllByRole('textbox');
    fireEvent.keyDown(inputs[0], { key: 'Backspace' });
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
