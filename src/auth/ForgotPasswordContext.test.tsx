import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './provider';
import { ForgotPasswordProvider, useForgotPassword } from './ForgotPasswordContext';
import { server } from '../test/mocks/server';
import { http, HttpResponse } from 'msw';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ForgotPasswordProvider>{children}</ForgotPasswordProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
}

function OtpConsumer() {
  const { setEmail, verifyOtp, token, otpVerified } = useForgotPassword();

  return (
    <div>
      <button onClick={() => setEmail('test@test.com')}>Set Email</button>
      <button onClick={() => verifyOtp('123456')}>Verify OTP OK</button>
      <button onClick={() => verifyOtp('999999')}>Verify OTP Invalid</button>
      <button onClick={() => verifyOtp('000000')}>Verify OTP Expired</button>
      <span data-testid="token">{token || 'none'}</span>
      <span data-testid="otpVerified">{String(otpVerified)}</span>
    </div>
  );
}

describe('ForgotPasswordContext', () => {
  it('sets email and verifies OTP successfully', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <OtpConsumer />
      </TestWrapper>,
    );

    await user.click(screen.getByText('Set Email'));
    await user.click(screen.getByText('Verify OTP OK'));

    await waitFor(() => {
      expect(screen.getByTestId('otpVerified')).toHaveTextContent('true');
    });
    expect(screen.getByTestId('token')).not.toHaveTextContent('none');
  });

  it('rejects invalid OTP', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <OtpConsumer />
      </TestWrapper>,
    );

    await user.click(screen.getByText('Set Email'));
    await user.click(screen.getByText('Verify OTP Invalid'));

    await waitFor(() => {
      expect(screen.getByTestId('otpVerified')).toHaveTextContent('false');
    });
    expect(screen.getByTestId('token')).toHaveTextContent('none');
  });

  it('rejects expired OTP', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <OtpConsumer />
      </TestWrapper>,
    );

    await user.click(screen.getByText('Set Email'));
    await user.click(screen.getByText('Verify OTP Expired'));

    await waitFor(() => {
      expect(screen.getByTestId('otpVerified')).toHaveTextContent('false');
    });
  });

  it('handles network error', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('*/auth/verify-otp', () => {
        return HttpResponse.error();
      }),
    );

    render(
      <TestWrapper>
        <OtpConsumer />
      </TestWrapper>,
    );

    await user.click(screen.getByText('Set Email'));
    await user.click(screen.getByText('Verify OTP OK'));

    await waitFor(() => {
      expect(screen.getByTestId('otpVerified')).toHaveTextContent('false');
    });
  });
});
