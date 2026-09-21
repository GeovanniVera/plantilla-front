# API Client — Arquitectura

## Propósito

Documenta cómo `src/lib/api/client.ts` ejecuta cada petición HTTP: construcción de URL, inyección de token, refresh proactivo, interceptores, timeout, normalización de respuestas y manejo de 401/403. Es la referencia para entender qué le pasa a cualquier llamada a la API.

## Pipeline de una petición (`request<T>`)

El flujo interno de `request<T>(method, path, body?, options?)` es el siguiente:

1. **URL y headers**: `config.baseUrl + path`. Si el body es `FormData`, NO se fuerza `Content-Type` (fetch agrega el `boundary` automáticamente); en cualquier otro caso se envía `Content-Type: application/json`. Todas las peticiones (incluido el refresh) envían además `X-Requested-With: XMLHttpRequest` como mitigación CSRF del backend (que lo exige en `POST /auth/refresh`, endpoint autenticado por cookie `HttpOnly`); un caller puede sobrescribirlo vía `options.headers` (los defaults se aplican primero).
2. **Refresh proactivo**: si hay token en memoria y `tokenManager.isExpired()` es `true`, se llama a `tryRefreshToken()` **antes** de enviar la petición. Si el refresh falla: `tokenManager.clear()` + `CustomEvent('auth:logout')` y se devuelve un error `UNAUTHORIZED` sin llegar a la red.
3. **Autorización**: si existe token en memoria, se inyecta `Authorization: Bearer <token>`. El access token es memory-only: nunca se lee de storage.
4. **Interceptores de request**: se ejecutan en orden de adición; cada uno puede transformar la configuración (`RequestInit & { url }`).
5. **Fetch con timeout**: `AbortController` + `setTimeout` con `VITE_REQUEST_TIMEOUT` (default `15000` ms). Un abort devuelve `TIMEOUT`; cualquier otro error de red devuelve `NETWORK_ERROR`.
6. **Interceptores de response**: se ejecutan en orden de adición sobre la `Response` cruda.
7. **Respuesta vacía**: `204` o `content-length: 0` → `{ success: true, message: 'Operación exitosa' }`.
8. **JSON inválido**: si el body no es JSON parseable, se devuelve un error mapeado por status HTTP (ver tabla de abajo).
9. **Contrato `ApiResponse`**: si el body tiene la propiedad `success`, se respeta tal cual (el backend cumple el contrato). Si NO la tiene, la respuesta se **adapta**: error → `{ success: false, code: mapStatusToErrorCode(status), message }`; éxito → `{ success: true, data }`.
10. **401 con sesión**: si el status es `401` y la petición llevaba sesión (`hasSessionToken()`), se intenta refresh y **un único reintento** (el reintento se marca con el header `_retry: 'true'`, detectado con el operador `in`). Si el refresh falla o ya era un reintento: `tokenManager.clear()` + `CustomEvent('auth:logout')`. En endpoints públicos (login, register) un 401 es credenciales inválidas y NO dispara refresh/logout.
11. **403**: si el body trae `code === 'ACCOUNT_SUSPENDED'`, se limpia la sesión, se dispara `auth:logout` y se redirige a `/login?error=<mensaje>`. En cualquier otro caso se invoca `onForbidden()` (default: redirigir a `/403`, con guard anti-loop — ver abajo).

### Mapeo de status HTTP a `ApiErrorCode`

| Status | Código |
|---|---|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL_ERROR` |
| 0 (red) | `NETWORK_ERROR` |
| otro | `UNKNOWN` |

## Configuración del cliente

```ts
interface ClientConfig {
  baseUrl?: string;                      // default: import.meta.env.VITE_API_BASE ?? '/api'
  requestInterceptors?: RequestInterceptor[];
  responseInterceptors?: ResponseInterceptor[];
  onUnauthorized?: () => void;           // default: window.location.href = '/login'
  onForbidden?: () => void;              // default: redirige a /403 (con guard anti-loop)
}
```

- `configureClient(newConfig: Partial<ClientConfig>)` mergea la configuración sobre la existente.
- `addRequestInterceptor` / `addResponseInterceptor` agregan interceptores al final de la lista (se ejecutan en orden de adición).

### Interfaces de interceptor

```ts
interface RequestInterceptor {
  onFulfilled: (config: RequestInit & { url: string }) => RequestInit & { url: string };
  onRejected?: (error: unknown) => unknown;
}

interface ResponseInterceptor {
  onFulfilled: (response: Response) => Response;
  onRejected?: (error: unknown) => unknown;
}
```

### Guard anti-loop de 403

`shouldRedirectToForbidden(pathname?)` decide si un 403 debe navegar a `/403`:

- Excluye rutas que contengan `/login` (un 403 ahí significa "cuenta no verificada", no falta de permisos).
- Excluye `/403` mismo: si ya estás en `/403`, la navegación dura recargaba el documento en cada 403 y convertía un desajuste de permisos en un loop de recargas.

```ts
shouldRedirectToForbidden(pathname: string = window.location.pathname): boolean
```

## Ejemplo de uso

```ts
import { client } from './lib/api';
import type { ApiResponse, User } from './lib/api/types/api-response';

const response = await client.get<User>('/users/1');

if (response.success) {
  console.log(response.data?.name);
} else {
  console.error(response.code, response.message);
}
```

## Deudas conocidas

- **Dos fuentes de verdad para la configuración**: `client.ts` define `API_BASE` y `REQUEST_TIMEOUT` leyendo `import.meta.env` directamente (`import.meta.env.VITE_API_BASE ?? '/api'`), mientras que `interceptors/refresh.ts` usa `env` de `src/config/env.ts` (`env.VITE_API_BASE`, `env.VITE_AUTH_REFRESH_PATH`). Si una variable cambia en `.env`, ambos consumidores deben actualizarse por separado; el módulo `env` no es el único origen.
- El contrato de la documentación del cliente (comentario en `client.ts`) referencia `src/api/types.ts`, pero el archivo real vive en `src/lib/api/types/api-response.ts`.