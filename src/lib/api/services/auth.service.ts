import { client } from '../client'
import type { ApiResponse, AuthResponse, User } from '../types/api-response'

export const authService = {
  login: (email: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    client.post<AuthResponse>('/auth/login', { email, password }),

  logout: (): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/logout'),

  me: (): Promise<ApiResponse<User>> =>
    client.get<User>('/auth/me'),

  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthResponse>> =>
    client.post<AuthResponse>('/auth/refresh', { refreshToken }),

  register: (data: { name: string; email: string; password: string }): Promise<ApiResponse<AuthResponse>> =>
    client.post<AuthResponse>('/auth/register', data),

  forgotPassword: (email: string): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/reset-password', { token, password }),

  verifyEmail: (token: string): Promise<ApiResponse<{ email: string }>> =>
    client.post<{ email: string }>('/auth/verify-email', { token }),

  resendVerification: (email: string): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/resend-verification', { email }),

  verifyOtp: (email: string, otp: string): Promise<ApiResponse<{ verified: boolean; token?: string }>> =>
    client.post<{ verified: boolean; token?: string }>('/auth/verify-otp', { email, otp }),
}
