import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '@lib/api/services/auth.service';
import { useAuth } from '../auth/hooks';

/**
 * Hooks de React Query integrados con AuthContext.
 *
 * Estos hooks combinan:
 * - Persistencia de tokens (via AuthContext)
 * - Cache de server state (via React Query)
 * - Estado de autenticación (via AuthContext)
 */

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authService.me();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'No autenticado');
      }
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Política pública de contraseñas y tiempos de expiración.
 *
 * El backend es la fuente única de verdad: el frontend la consume para no
 * duplicar literales (por ejemplo, la expiración del OTP).
 */
export function usePasswordPolicy() {
  return useQuery({
    queryKey: ['auth', 'password-policy'],
    queryFn: async () => {
      const response = await authService.getPasswordPolicy();
      if (!response.success || !response.data) {
        throw new Error(response.message || 'No se pudo obtener la política de contraseñas');
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { login } = useAuth();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      remember = true,
    }: {
      email: string;
      password: string;
      remember?: boolean;
    }) => {
      // login() del AuthContext maneja persistencia de tokens y estado
      await login(email, password, remember);
      // Retornamos el usuario del cache para React Query
      const user = queryClient.getQueryData(['auth', 'me']);
      return { success: true, data: { user } };
    },
    onSuccess: () => {
      // Invalidar para refrescar datos del usuario
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: async () => {
      // logout() del AuthContext maneja limpieza de tokens y estado
      await logout();
    },
    onSettled: () => {
      queryClient.clear();
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string; acceptedTerms: boolean }) =>
      authService.register(data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  });
}
