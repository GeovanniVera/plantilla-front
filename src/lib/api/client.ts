/**
 * Cliente HTTP centralizado con interceptores de autenticación.
 *
 * Todas las peticiones a la API deben pasar por este cliente.
 * Maneja: inyección de JWT, redirecciones en 401/403,
 * interceptores de request/response y normalización de errores.
 *
 * IMPORTANTE: Este cliente espera que el backend responda con la estructura
 * definida en src/api/types.ts (ApiResponse<T>).
 */

import type { ApiResponse, ApiError as ApiErrorResponse, ApiErrorCode } from './types/api-response';
import { tryRefreshToken } from './interceptors/refresh';
import { getErrorMessage } from '../i18n/errors';
import { authStorage } from '../auth/token-store';

const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 15000;

// ─── Gestión de token ──────────────────────────────────────
/** Token de acceso actual (en memoria, no persistido) */
let accessToken: string | null = null;
/** Expiración del token en memoria (epoch ms); null si se desconoce */
let accessTokenExpiresAt: number | null = null;

/**
 * Administra el token de acceso en memoria (memory-only).
 *
 * El access token jamás toca localStorage/sessionStorage (vector XSS): en
 * storage solo persiste un indicador de sesión vía authStorage. Si el token
 * expira, el cliente lo refresca proactivamente vía `POST /auth/refresh`
 * (refresh token en cookie HttpOnly) antes de reenviar la petición.
 */
export const tokenManager = {
  /** @returns Token actual o null si no hay sesión */
  get: () => accessToken,
  /**
   * Guarda el token en memoria con su expiración.
   * @param token - Access token
   * @param expiresIn - Segundos de vida del token; opcional
   */
  set: (token: string, expiresIn?: number) => {
    accessToken = token;
    accessTokenExpiresAt = expiresIn ? Date.now() + expiresIn * 1000 : null;
  },
  /** Limpia el token de memoria */
  clear: () => {
    accessToken = null;
    accessTokenExpiresAt = null;
  },
  /** Indica si el token en memoria existe y ya expiró (refresco proactivo) */
  isExpired: () =>
    Boolean(accessToken) && accessTokenExpiresAt !== null && Date.now() >= accessTokenExpiresAt,
};

// ─── Clase de error personalizada ──────────────────────────
/**
 * Error lanzado cuando una petición HTTP falla.
 *
 * @param status - Código de estado HTTP (0 si es error de red)
 * @param statusText - Texto descriptivo del error
 * @param data - Datos adicionales del error (respuesta del servidor)
 */
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: unknown;

  constructor(status: number, statusText: string, data?: unknown) {
    super(`API Error ${status}: ${statusText}`);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// ─── Tipos de interceptores ────────────────────────────────
/**
 * Interceptor de peticiones.
 * Se ejecuta antes de cada petición para modificarla o validarla.
 */
export interface RequestInterceptor {
  /** Transforma la configuración de la petición antes de enviarla */
  onFulfilled: (config: RequestInit & { url: string }) => RequestInit & { url: string };
  /** Maneja errores del interceptor */
  onRejected?: (error: unknown) => unknown;
}

/**
 * Interceptores de respuestas.
 * Se ejecuta después de cada petición para procesar la respuesta.
 */
export interface ResponseInterceptor {
  /** Transforma la respuesta antes de retornarla */
  onFulfilled: (response: Response) => Response;
  /** Maneja errores del interceptor */
  onRejected?: (error: unknown) => unknown;
}

// ─── Configuración del cliente ─────────────────────────────
/**
 * Configuración del cliente HTTP.
 * Todos los campos son opcionales, se usan valores por defecto si no se proveen.
 */
interface ClientConfig {
  /** URL base para todas las peticiones (default: '/api') */
  baseUrl?: string;
  /** Interceptores que se ejecutan antes de cada petición */
  requestInterceptors?: RequestInterceptor[];
  /** Interceptores que se ejecutan después de cada petición */
  responseInterceptors?: ResponseInterceptor[];
  /** Callback cuando el servidor retorna 401 (default: redirige a /login) */
  onUnauthorized?: () => void;
  /** Callback cuando el servidor retorna 403 (default: redirige a /403) */
  onForbidden?: () => void;
}

/**
 * Decide si un 403 debe navegar a /403.
 *
 * Excluye /login (un 403 ahí significa "cuenta no verificada") y /403 mismo:
 * si ya estamos en /403, la navegación dura recargaba el documento en cada
 * 403 y convertía un desajuste de permisos en un loop de recargas.
 *
 * @param pathname - Ruta actual; por defecto, la del navegador
 */
export function shouldRedirectToForbidden(pathname: string = window.location.pathname): boolean {
  return !pathname.includes('/login') && pathname !== '/403';
}

/** Configuración por defecto del cliente */
const defaultConfig: ClientConfig = {
  baseUrl: API_BASE,
  onUnauthorized: () => {
    window.location.href = '/login';
  },
  onForbidden: () => {
    if (shouldRedirectToForbidden()) {
      window.location.href = '/403';
    }
  },
};

let config = { ...defaultConfig };

// ─── Helper: sesión activa ─────────────────────────────────
/**
 * Indica si la petición podía llevar sesión (token en memoria o indicador
 * de sesión persistido en storage).
 *
 * Un 401 solo es "sesión expirada" cuando la request enviaba un token.
 * En endpoints públicos (login, register), un 401 es credenciales
 * inválidas y NO debe disparar refresh ni logout (que recargan la página).
 *
 * La procedencia de la sesión se resuelve a través del indicador activo
 * (sessionStorage primero): si hay token en memoria o indicador en cualquier
 * storage, la request podía llevar sesión. El resultado es el mismo que
 * consultar ambos storages.
 */
function hasSessionToken(): boolean {
  return Boolean(accessToken) || authStorage.getActiveSession() !== null;
}

// ─── Helper: headers autenticados ──────────────────────────
/**
 * Construye los headers de una petición autenticada, inyectando el access
 * token de memoria y refrescándolo proactivamente si ya expiró.
 *
 * Centraliza la lógica que comparten las peticiones JSON (`request`) y las
 * binarias (`getBlob`), para no duplicar el manejo del token ni del refresh.
 *
 * @param baseHeaders - Headers base de la petición
 * @returns Headers con `Authorization`, o `null` si había sesión pero el
 *          refresh falló (el llamador debe cortar y desloguear).
 */
async function buildAuthenticatedHeaders(
  baseHeaders: Record<string, string>,
): Promise<Record<string, string> | null> {
  if (!accessToken) {
    return baseHeaders;
  }

  // Proactive refresh: si el token en memoria expiró, renovarlo antes de enviar.
  if (tokenManager.isExpired()) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      tokenManager.clear();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return null;
    }
  }

  return { ...baseHeaders, Authorization: `Bearer ${accessToken}` };
}

// ─── Helper: fetch binario autenticado ─────────────────────
/**
 * Ejecuta un GET binario con el mismo manejo de auth/refresh que `request`.
 *
 * No parsea JSON ni normaliza errores: devuelve la `Response` cruda (o `null`).
 * Reutiliza el refresh del cliente (no un `fetch` naive) para que una descarga
 * autenticada no se rompa cuando el access token expira.
 *
 * @param path - Ruta relativa a la URL base (ej: '/files/abc.png')
 * @returns Response autenticada, o `null` si no hay sesión o la petición falla
 */
async function requestRaw(path: string): Promise<Response | null> {
  const url = `${config.baseUrl}${path}`;
  const baseHeaders = { 'X-Requested-With': 'XMLHttpRequest' };

  const headers = await buildAuthenticatedHeaders(baseHeaders);
  if (headers === null) {
    return null;
  }

  let response: Response;
  try {
    response = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  } catch {
    return null;
  }

  // 401 con sesión: refrescar y reintentar una vez (misma política que `request`).
  if (response.status === 401 && hasSessionToken()) {
    const refreshed = await tryRefreshToken();
    if (!refreshed) {
      tokenManager.clear();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      return null;
    }
    const retryHeaders = await buildAuthenticatedHeaders(baseHeaders);
    if (retryHeaders === null) {
      return null;
    }
    try {
      response = await fetch(url, { method: 'GET', headers: retryHeaders, credentials: 'include' });
    } catch {
      return null;
    }
  }

  return response.ok ? response : null;
}

// ─── Helper: Mapear status HTTP a ApiErrorCode ─────────────
function mapStatusToErrorCode(status: number): ApiErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 429:
      return 'RATE_LIMITED';
    case 500:
      return 'INTERNAL_ERROR';
    case 0:
      return 'NETWORK_ERROR';
    default:
      return 'UNKNOWN';
  }
}

// ─── Función interna de peticiones ─────────────────────────
/**
 * Ejecuta una petición HTTP con todos los interceptores y manejo de errores.
 *
 * @param method - Método HTTP (GET, POST, PUT, PATCH, DELETE)
 * @param path - Ruta relativa a la URL base (ej: '/users')
 * @param body - Cuerpo de la petición (se serializa a JSON, ignorado en GET)
 * @param options - Opciones adicionales de fetch (headers, signal, etc.)
 * @returns Promise con la respuesta tipada (ApiResponse<T>)
 * @throws ApiError si hay error de red o el servidor no responde con JSON válido
 */
async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  const url = `${config.baseUrl}${path}`;

  const isFormData = body instanceof FormData;

  // Construir configuración de la petición
  let requestConfig: RequestInit & { url: string } = {
    url,
    method,
    headers: {
      // FormData: no forzar Content-Type (fetch setea el boundary automáticamente)
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      // Anti-CSRF: el backend exige X-Requested-With en /auth/refresh (cookie HttpOnly);
      // se envía en todas las peticiones y options?.headers puede sobrescribirlo.
      'X-Requested-With': 'XMLHttpRequest',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  };

  // Inyectar token de autorización si existe (mismo helper que las descargas binarias)
  const authenticatedHeaders = await buildAuthenticatedHeaders(
    requestConfig.headers as Record<string, string>,
  );
  if (authenticatedHeaders === null) {
    return {
      success: false,
      message: getErrorMessage('UNAUTHORIZED'),
      code: 'UNAUTHORIZED',
    };
  }
  requestConfig.headers = authenticatedHeaders;

  // Serializar cuerpo para peticiones que lo requieran
  if (body && method !== 'GET') {
    // FormData se envía directo; el resto se serializa a JSON
    requestConfig.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  // Ejecutar interceptores de petición (pueden modificar la config)
  for (const interceptor of config.requestInterceptors ?? []) {
    requestConfig = await interceptor.onFulfilled(requestConfig);
  }

  // Ejecutar la petición HTTP
  // Timeout con AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(requestConfig.url, {
      ...requestConfig,
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    // Timeout o error de red
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        message: getErrorMessage('TIMEOUT'),
        code: 'TIMEOUT',
      };
    }
    return {
      success: false,
      message: getErrorMessage('NETWORK_ERROR'),
      code: 'NETWORK_ERROR',
    };
  }
  clearTimeout(timeoutId);

  // Ejecutar interceptores de respuesta (pueden procesar la response)
  for (const interceptor of config.responseInterceptors ?? []) {
    response = await interceptor.onFulfilled(response);
  }

  // Respuestas vacías (204 No Content o body vacío)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {
      success: true,
      message: 'Operación exitosa',
    };
  }

  // Parsear la respuesta JSON
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    // La respuesta no es JSON válido
    return {
      success: false,
      message: getErrorMessage(mapStatusToErrorCode(response.status)),
      code: mapStatusToErrorCode(response.status),
    };
  }

  // Si la respuesta ya tiene la estructura ApiResponse, retornarla directamente
  if (data && typeof data === 'object' && 'success' in data) {
    const apiResponse = data as ApiResponse<T>;

    // Manejar códigos de error HTTP específicos
    if (!response.ok) {
      // 401: Sesión expirada → intentar refresh y reintentar.
      // Solo si la petición tenía sesión: en endpoints públicos un 401
      // es credenciales inválidas y no debe desloguear/recargar.
      if (response.status === 401 && hasSessionToken()) {
        const isRetry = options?.headers && '_retry' in options.headers;

        if (!isRetry) {
          const refreshed = await tryRefreshToken();

          if (refreshed) {
            const retryOptions: RequestInit = {
              ...options,
              headers: {
                ...(options?.headers as Record<string, string>),
                _retry: 'true',
              },
            };
            return request<T>(method, path, body, retryOptions);
          }
        }

        tokenManager.clear();
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      // 403: Distinguir suspensión de cuenta vs sin permisos
      if (response.status === 403) {
        const isSuspended =
          apiResponse &&
          'code' in apiResponse &&
          (apiResponse as ApiErrorResponse).code === 'ACCOUNT_SUSPENDED';
        if (isSuspended) {
          // Cuenta suspendida: limpiar sesión y redirigir a login con mensaje
          tokenManager.clear();
          window.dispatchEvent(new CustomEvent('auth:logout'));
          const message = (apiResponse as ApiErrorResponse).message || 'Tu cuenta fue suspendida';
          window.location.href = `/login?error=${encodeURIComponent(message)}`;
          return apiResponse;
        }
        config.onForbidden?.();
      }
    }

    return apiResponse;
  }

  // Si la respuesta NO tiene la estructura ApiResponse, adaptarla
  // Esto es para compatibilidad con backends que no siguen el contrato
  if (!response.ok) {
    // 401: Sesión expirada → intentar refresh y reintentar.
    // Solo si la petición tenía sesión (ver hasSessionToken).
    if (response.status === 401 && hasSessionToken()) {
      const isRetry = options?.headers && '_retry' in options.headers;

      if (!isRetry) {
        const refreshed = await tryRefreshToken();

        if (refreshed) {
          const retryOptions: RequestInit = {
            ...options,
            headers: {
              ...(options?.headers as Record<string, string>),
              _retry: 'true',
            },
          };
          return request<T>(method, path, body, retryOptions);
        }
      }

      tokenManager.clear();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }

    // 403: Sin permisos → redirigir a página de acceso denegado
    if (response.status === 403) {
      config.onForbidden?.();
    }

    return {
      success: false,
      message:
        (data as { message?: string }).message ||
        getErrorMessage(mapStatusToErrorCode(response.status)),
      code: mapStatusToErrorCode(response.status),
    };
  }

  // Respuesta exitosa sin estructura ApiResponse → adaptar
  return {
    success: true,
    message: 'Operación exitosa',
    data: data as T,
  };
}

// ─── API pública del cliente ───────────────────────────────
/**
 * Cliente HTTP para realizar peticiones a la API.
 * Todas las peticiones pasan por los interceptores y manejo de errores.
 *
 * @example
 * ```ts
 * import { client } from './lib/api'
 * import type { ApiResponse, User } from './lib/api/types/api-response'
 *
 * const response = await client.get<User>('/users/1')
 *
 * if (response.success) {
 *   console.log(response.data.name)
 * } else {
 *   console.error(response.code, response.message)
 * }
 * ```
 */
export const client = {
  /**
   * Realiza una petición GET.
   * @param path - Ruta relativa (ej: '/users')
   * @param options - Opciones adicionales de fetch
   * @returns Promise con ApiResponse<T>
   */
  get: <T>(path: string, options?: RequestInit) => request<T>('GET', path, undefined, options),

  /**
   * Descarga un recurso binario (p. ej. una foto de perfil protegida).
   *
   * Reutiliza el manejo de autenticación y refresh del cliente, de modo que el
   * header `Authorization` se adjunta y una expiración de token no rompe la
   * descarga. No parsea JSON: devuelve el `Blob` listo para `createObjectURL`.
   *
   * @param path - Ruta relativa (ej: '/files/abc.png')
   * @returns Blob, o null si no hay sesión o la petición falla
   */
  getBlob: async (path: string): Promise<Blob | null> => {
    const response = await requestRaw(path);
    if (!response) {
      return null;
    }
    try {
      return await response.blob();
    } catch {
      return null;
    }
  },

  /**
   * Realiza una petición POST.
   * @param path - Ruta relativa (ej: '/users')
   * @param body - Datos a enviar (se serializa a JSON)
   * @param options - Opciones adicionales de fetch
   * @returns Promise con ApiResponse<T>
   */
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>('POST', path, body, options),

  /**
   * Realiza una petición PUT (reemplazo completo del recurso).
   * @param path - Ruta relativa (ej: '/users/1')
   * @param body - Datos completos del recurso
   * @param options - Opciones adicionales de fetch
   * @returns Promise con ApiResponse<T>
   */
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>('PUT', path, body, options),

  /**
   * Realiza una petición PATCH (actualización parcial).
   * @param path - Ruta relativa (ej: '/users/1')
   * @param body - Campos a actualizar
   * @param options - Opciones adicionales de fetch
   * @returns Promise con ApiResponse<T>
   */
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>('PATCH', path, body, options),

  /**
   * Realiza una petición DELETE.
   * @param path - Ruta relativa (ej: '/users/1')
   * @param options - Opciones adicionales de fetch
   * @returns Promise con ApiResponse<T>
   */
  delete: <T>(path: string, options?: RequestInit) =>
    request<T>('DELETE', path, undefined, options),
};

// ─── Configuración del cliente ─────────────────────────────
/**
 * Actualiza la configuración del cliente.
 * Útil para cambiar la URL base o los callbacks de error.
 *
 * @param newConfig - Configuración parcial a aplicar (se mergea con la existente)
 */
export function configureClient(newConfig: Partial<ClientConfig>) {
  config = { ...config, ...newConfig };
}

// ─── Interceptores (atalajos) ──────────────────────────────
/**
 * Agrega un interceptor de peticiones.
 * Se ejecuta en orden de adición antes de cada petición.
 *
 * @param interceptor - Interceptor a agregar con callbacks onFulfilled/onRejected
 */
export function addRequestInterceptor(interceptor: RequestInterceptor) {
  config.requestInterceptors = [...(config.requestInterceptors ?? []), interceptor];
}

/**
 * Agrega un interceptor de respuestas.
 * Se ejecuta en orden de adición después de cada petición.
 *
 * @param interceptor - Interceptor a agregar con callbacks onFulfilled/onRejected
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  config.responseInterceptors = [...(config.responseInterceptors ?? []), interceptor];
}
