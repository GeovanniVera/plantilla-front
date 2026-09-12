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
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
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

  const verifyOtp = useCallback(async (otp: string) => {
    const response = await authService.verifyOtp(state.email, otp);

    if (!response.success) {
      return { success: false, error: response.message || 'Código inválido o expirado' };
    }

    if (response.data?.verified) {
      setState((prev) => ({ ...prev, token: response.data?.token || `reset-token-${Date.now()}`, otpVerified: true }));
      return { success: true };
    }

    return { success: false, error: 'Código inválido o expirado' };
  }, [state.email]);

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

  return (
    <ForgotPasswordContext.Provider
      value={{
        ...state,
        setEmail,
        verifyOtp,
        resetPassword,
        reset,
      }}
    >
      {children}
    </ForgotPasswordContext.Provider>
  );
}

export function useForgotPassword() {
  const context = useContext(ForgotPasswordContext);
  if (!context) {
    throw new Error('useForgotPassword must be used within ForgotPasswordProvider');
  }
  return context;
}
