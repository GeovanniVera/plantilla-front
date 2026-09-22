/**
 * Context para el flujo de recuperación de contraseña.
 *
 * Maneja el estado entre las 3 rutas:
 * - /forgot-password (email)
 * - /verify-otp (OTP + token)
 * - /reset-password (nueva contraseña)
 *
 * El backend real reemplazará las funciones mock.
 */
import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { authService } from '../lib/api/services/auth.service';

interface ForgotPasswordState {
  email: string;
  token: string | null;
  otpVerified: boolean;
}

interface ForgotPasswordContextValue extends ForgotPasswordState {
  setEmail: (email: string) => void;
  verifyOtp: (otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}

const ForgotPasswordContext = createContext<ForgotPasswordContextValue | null>(null);

export function ForgotPasswordProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ForgotPasswordState>({
    email: '',
    token: null,
    otpVerified: false,
  });

  const setEmail = useCallback((email: string) => {
    setState((prev) => ({ ...prev, email }));
  }, []);

  const verifyOtp = useCallback(
    async (otp: string) => {
      const response = await authService.verifyOtp(state.email, otp);

      if (!response.success || !response.data) {
        return { success: false, error: response.message || 'Código inválido o expirado' };
      }

      // Backend retorna { resetToken: "..." }
      setState((prev) => ({ ...prev, token: response.data!.resetToken, otpVerified: true }));
      return { success: true };
    },
    [state.email],
  );

  const resetPassword = useCallback(
    async (password: string) => {
      if (!state.token) {
        return { success: false, error: 'Token no disponible' };
      }

      const response = await authService.resetPassword(state.token, password);
      if (!response.success) {
        return { success: false, error: response.message || 'Error al cambiar la contraseña' };
      }

      return { success: true };
    },
    [state.token],
  );

  const reset = useCallback(() => {
    setState({ email: '', token: null, otpVerified: false });
  }, []);

  // All members are either primitive state fields or stable callbacks, so the
  // value only changes when the state does.
  const value = useMemo(
    () => ({
      ...state,
      setEmail,
      verifyOtp,
      resetPassword,
      reset,
    }),
    [state, setEmail, verifyOtp, resetPassword, reset],
  );

  return <ForgotPasswordContext.Provider value={value}>{children}</ForgotPasswordContext.Provider>;
}

export function useForgotPassword() {
  const context = useContext(ForgotPasswordContext);
  if (!context) {
    throw new Error('useForgotPassword must be used within ForgotPasswordProvider');
  }
  return context;
}
