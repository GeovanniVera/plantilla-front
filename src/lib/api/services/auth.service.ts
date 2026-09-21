import { client } from '../client';
import type {
  ApiResponse,
  AuthResponse,
  PasswordPolicyResponse,
  User,
} from '../types/api-response';

export const authService = {
  login: (email: string, password: string): Promise<ApiResponse<AuthResponse>> =>
    client.post<AuthResponse>('/auth/login', { email, password }),

  logout: (): Promise<ApiResponse<void>> => client.post<void>('/auth/logout'),

  me: (): Promise<ApiResponse<User>> => client.get<User>('/auth/me'),

  /**
   * Register retorna solo mensaje opaco, no user ni token.
   */
  register: (data: {
    name: string;
    email: string;
    password: string;
    acceptedTerms: boolean;
  }): Promise<ApiResponse<void>> => client.post<void>('/auth/register', data),

  forgotPassword: (email: string): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/reset-password', { token, password }),

  verifyEmail: (token: string): Promise<ApiResponse<{ email: string }>> =>
    client.post<{ email: string }>('/auth/verify-email', { token }),

  resendVerification: (email: string): Promise<ApiResponse<void>> =>
    client.post<void>('/auth/resend-verification', { email }),

  /**
   * Verify OTP retorna { resetToken } (no { verified, token }).
   */
  verifyOtp: (email: string, otp: string): Promise<ApiResponse<{ resetToken: string }>> =>
    client.post<{ resetToken: string }>('/auth/verify-otp', { email, otp }),

  /**
   * Política pública de contraseñas y tiempos de expiración.
   *
   * El backend es la fuente única de verdad: el frontend lee de acá valores
   * como la expiración del OTP en lugar de hardcodearlos.
   */
  getPasswordPolicy: (): Promise<ApiResponse<PasswordPolicyResponse>> =>
    client.get<PasswordPolicyResponse>('/auth/password-policy'),
};
