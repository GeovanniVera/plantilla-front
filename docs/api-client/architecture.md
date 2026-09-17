# API Client Architecture

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     Consumidor (Service)                        │
│  authService.login(email, password)                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       client.ts                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    request<T>()                         │   │
│  │  1. Construir URL                                       │   │
│  │  2. Inyectar JWT + proactive refresh                    │   │
│  │  3. Serializar body                                     │   │
│  │  4. Ejecutar requestInterceptors                        │   │
│  │  5. fetch() con timeout                                 │   │
│  │  6. Ejecutar responseInterceptors                       │   │
│  │  7. Parsear JSON                                        │   │
│  │  8. Manejar 401/403                                     │   │
│  │  9. Retornar ApiResponse<T>                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │                  tokenManager                           │   │
│  │  get() → string | null    (memoria)                     │   │
│  │  set(token) → void                                     │   │
│  │  clear() → void                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  interceptors/refresh.ts                        │
│  tryRefreshToken()                                             │
│    ├─ ¿Ya hay refresh en curso? → Reutilizar Promise          │
│    └─ doRefresh()                                              │
│         ├─ authStorage.getRefreshToken()                       │
│         ├─ fetch(POST, /auth/refresh, { refreshToken })       │
│         ├─ tokenManager.set(newToken)                          │
│         └─ authStorage.setToken(newToken, expiresIn)          │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  auth/token-store.ts                           │
│  localStorage / sessionStorage                                │
│  ├─ auth_token                                                 │
│  ├─ auth_refresh_token                                         │
│  └─ auth_expires_at                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Pipeline de una Request

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Construir URL                                               │
│    url = config.baseUrl + path                                  │
│    Ejemplo: '/api' + '/users/1' = '/api/users/1'              │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Inyectar JWT + Proactive Refresh                            │
│    ├─ ¿Hay accessToken en memoria?                             │
│    │   ├─ NO → proceeding without auth                         │
│    │   └─ SÍ → ¿authStorage.isExpired()?                      │
│    │         ├─ NO → inject Bearer                             │
│    │         └─ SÍ → tryRefreshToken()                         │
│    │               ├─ OK → inject nuevo Bearer                 │
│    │               └─ FAIL → return UNAUTHORIZED               │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Serializar Body                                             │
│    JSON.stringify(body) en requests con body (POST, PUT, etc.) │
│    GET/DELETE → sin body                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Request Interceptors                                        │
│    Ejecutar en orden FIFO                                      │
│    Modifican headers, config, etc.                             │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Fetch con Timeout                                           │
│    fetch(url, { signal: AbortController.signal, ... })        │
│    setTimeout(() => abort(), REQUEST_TIMEOUT)                  │
│    ├─ Timeout → return TIMEOUT                                 │
│    ├─ Network error → return NETWORK_ERROR                     │
│    └─ Response → continuar                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. Response Interceptors                                       │
│    Ejecutar en orden FIFO                                      │
│    Pueden modificar response o lanzar errores                   │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. Parsear JSON                                                │
│    ├─ 204 No Content → return success                          │
│    ├─ Content-Length 0 → return success                         │
│    └─ response.json() → continuar                              │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. Manejo de Errores                                           │
│    ├─ ¿Tiene campo 'success'?                                  │
│    │   ├─ SÍ → ApiResponse del backend                         │
│    │   │   └─ ¿!response.ok?                                  │
│    │   │       ├─ 401 → refresh → retry (una vez)             │
│    │   │       └─ 403 → onForbidden()                          │
│    │   └─ NO → adaptar manualmente (legacy)                    │
│    └─ Mapear status a ApiErrorCode                             │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. Retornar ApiResponse<T>                                     │
│    { success: true, data: T }  o                               │
│    { success: false, message, code }                           │
└─────────────────────────────────────────────────────────────────┘
```

## Token Manager (Memoria)

```typescript
// src/lib/api/client.ts
let accessToken: string | null = null;

export const tokenManager = {
  get: () => accessToken,
  set: (token: string) => { accessToken = token },
  clear: () => { accessToken = null },
};
```

**Arquitectura dual**:
- `tokenManager` → memoria (request interceptor, rápido)
- `authStorage` → localStorage/sessionStorage (persistencia, refresh)

## Configuración

```typescript
interface ClientConfig {
  baseUrl: string;
  onUnauthorized: () => void;
  onForbidden: () => void;
}

// Defaults
const defaultConfig: ClientConfig = {
  baseUrl: '/api',
  onUnauthorized: () => { window.location.href = '/login' },
  onForbidden: () => { window.location.href = '/403' },
};

// Mutable
let config = { ...defaultConfig };

export function configureClient(newConfig: Partial<ClientConfig>): void {
  config = { ...config, ...newConfig };
}
```

## Timeout

- Default: 15000ms (15 segundos)
- Configurable via `VITE_REQUEST_TIMEOUT`
- Implementación: `AbortController` + `setTimeout`

```
fetch(url, { signal: abortController.signal })
  ↓
setTimeout(() => abortController.abort(), REQUEST_TIMEOUT)
  ↓
AbortError → { success: false, code: 'TIMEOUT' }
```

## Mapeo de Status a Error Codes

| HTTP Status | ApiErrorCode |
|-------------|--------------|
| 400 | `VALIDATION_ERROR` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL_ERROR` |
| 0 | `NETWORK_ERROR` |
| Otro | `UNKNOWN` |
