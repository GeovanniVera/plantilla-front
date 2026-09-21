/**
 * Contratos de respuesta de la API.
 *
 * ESTE ARCHIVO ES LA FUENTE DE VERDAD para la estructura de respuesta
 * que el backend DEBE cumplir. El frontend define las reglas.
 *
 * Cualquier backend que quiera conectarse a este frontend debe
 * responder con esta estructura exacta.
 */

// ─── Códigos de error ──────────────────────────────────────
/**
 * Códigos de error conocidos de la API.
 * Amplía este union a medida que el backend añada casos.
 */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'ACCOUNT_SUSPENDED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';

// ─── Respuesta de error ────────────────────────────────────
/**
 * Estructura de respuesta cuando la petición falla.
 *
 * @example
 * ```json
 * {
 *   "success": false,
 *   "message": "El email ya está registrado",
 *   "code": "CONFLICT",
 *   "fields": { "email": ["Este email ya está en uso"] },
 *   "timestamp": "2026-09-11T20:00:00Z",
 *   "traceId": "abc-123-def-456"
 * }
 * ```
 */
export interface ApiError {
  success: false;
  /** Mensaje legible para humanos */
  message: string;
  /** Código de error estandarizado */
  code: ApiErrorCode;
  /** Errores de validación por campo, solo cuando code === 'VALIDATION_ERROR' */
  fields?: Record<string, string[]>;
  /** Timestamp ISO 8601 opcional, útil para logs y soporte */
  timestamp?: string;
  /** Trace ID para correlacionar con logs del backend */
  traceId?: string;
}

// ─── Respuesta de éxito ────────────────────────────────────
/**
 * Estructura de respuesta cuando la petición es exitosa.
 *
 * @template T - Tipo de los datos retornados
 *
 * @example
 * ```json
 * {
 *   "success": true,
 *   "message": "Usuario creado exitosamente",
 *   "data": { "id": "1", "email": "user@test.com" }
 * }
 * ```
 */
export interface ApiSuccess<T = unknown> {
  success: true;
  /** Mensaje legible para humanos */
  message: string;
  /** Datos de la respuesta (opcional en operaciones como DELETE) */
  data?: T;
}

// ─── Respuesta unificada ───────────────────────────────────
/**
 * Tipo unificado para todas las respuestas de la API.
 * El frontend usa este tipo para tipar todas las llamadas.
 *
 * @template T - Tipo de los datos en caso de éxito
 *
 * @example
 * ```ts
 * // Login
 * const response: ApiResponse<AuthResponse> = await client.post('/auth/login', { email, password })
 *
 * if (response.success) {
 *   console.log(response.data.user)
 * } else {
 *   console.error(response.code, response.message)
 * }
 * ```
 */
export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Tipos de paginación ───────────────────────────────────
/**
 * Parámetros de paginación para peticiones listadas.
 */
export interface PaginationParams {
  /** Página actual (comienza en 1) */
  page?: number;
  /** Elementos por página (default: 20) */
  limit?: number;
  /** Campo para ordenar */
  sortBy?: string;
  /** Dirección del ordenamiento */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Metadatos de paginación en la respuesta.
 */
export interface PaginationMeta {
  /** Página actual */
  page: number;
  /** Elementos por página */
  limit: number;
  /** Total de elementos */
  total: number;
  /** Total de páginas */
  totalPages: number;
  /** Hay página siguiente */
  hasNext: boolean;
  /** Hay página anterior */
  hasPrevious: boolean;
}

/**
 * Respuesta paginada.
 *
 * @template T - Tipo de cada elemento
 */
export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

// ─── Tipos de autenticación ────────────────────────────────
/**
 * Usuario autenticado.
 *
 * Nota: El backend retorna `permissions` (no `privileges`).
 * Este tipo se alinea con el contrato del backend.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  /** Permisos efectivos del usuario (unión de permisos de todos sus roles) */
  permissions: string[];
  isVerified: boolean;
  /** URL de la foto de perfil (si tiene) */
  photoUrl?: string;
}

/**
 * Respuesta de login.
 *
 * El refresh token se maneja via HttpOnly cookie, no en el body.
 */
export interface AuthResponse {
  user: User;
  /** Access token JWT de vida corta */
  accessToken: string;
  /** Tiempo de vida del access token en segundos */
  expiresIn?: number;
}

/**
 * Respuesta de refresh token.
 *
 * El refresh token viene en HttpOnly cookie, no en el body.
 */
export interface RefreshResponse {
  user: User;
  accessToken: string;
  expiresIn?: number;
}

/**
 * Reglas de composición de la contraseña.
 */
export interface PasswordPolicy {
  minLength: number;
  maxLength: number;
  requiresUppercase: boolean;
  requiresLowercase: boolean;
  requiresSymbol: boolean;
}

/**
 * Política de contraseñas y tiempos de expiración del flujo de recuperación.
 *
 * El backend es la fuente única de verdad: el frontend consume estos valores
 * para no duplicar literales (por ejemplo, el tiempo de expiración del OTP).
 */
export interface PasswordPolicyResponse {
  /** Minutos de vigencia del OTP de recuperación. */
  otpExpiresInMinutes: number;
  /** Minutos de vigencia del token de recuperación emitido tras verificar el OTP. */
  resetTokenExpiresInMinutes: number;
  /** Reglas de composición de la contraseña. */
  passwordPolicy: PasswordPolicy;
}

// ─── Tipos de tema ─────────────────────────────────────────
/**
 * Tokens de tema del sistema.
 */
export interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  'text-h': string;
  border: string;
}

/**
 * Respuesta de configuración de tema.
 */
export interface ThemeResponse {
  id: string;
  name: string;
  tokens: ThemeTokens;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Helper types ──────────────────────────────────────────
/**
 * Extrae el tipo de datos de una ApiResponse.
 *
 * @example
 * ```ts
 * type UserData = ApiResponseData<ApiResponse<User>>
 * // UserData = User | undefined
 * ```
 */
export type ApiResponseData<T> = T extends ApiSuccess<infer D> ? D : undefined;

/**
 * Verifica si una respuesta es exitosa.
 *
 * @example
 * ```ts
 * const response = await client.get<User>('/users/1')
 * if (isApiSuccess(response)) {
 *   console.log(response.data.name)
 * }
 * ```
 */
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

/**
 * Verifica si una respuesta es un error.
 *
 * @example
 * ```ts
 * const response = await client.get<User>('/users/1')
 * if (isApiError(response)) {
 *   console.error(response.code, response.message)
 * }
 * ```
 */
export function isApiError<T>(response: ApiResponse<T>): response is ApiError {
  return response.success === false;
}
