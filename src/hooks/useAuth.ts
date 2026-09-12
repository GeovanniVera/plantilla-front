import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@lib/api/services/auth.service'

/**
 * Hook for auth-related server state.
 * For client-side auth state (login/logout/isAuthenticated), use src/auth/hooks.ts.
 */

export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await authService.me()
      if (!response.success || !response.data) {
        throw new Error(response.message || 'No autenticado')
      }
      return response.data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login(email, password),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.setQueryData(['auth', 'me'], response.data.user)
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      queryClient.clear()
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: { name: string; email: string; password: string }) =>
      authService.register(data),
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.forgotPassword(email),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authService.resetPassword(token, password),
  })
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authService.verifyEmail(token),
  })
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerification(email),
  })
}
