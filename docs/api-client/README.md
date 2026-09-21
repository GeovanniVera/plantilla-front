# API Client — Documentación del módulo

## Propósito

El módulo `src/lib/api/` es el cliente HTTP centralizado de la aplicación. **Todas** las peticiones a la API deben pasar por él: inyecta el JWT, maneja expiración y refresh de token, normaliza errores según el contrato `ApiResponse` y ejecuta interceptores de request/response.

Esta carpeta documenta su arquitectura, su contrato de tipos y el mecanismo de refresh.

## Quick path

1. Lee `architecture.md` para entender el pipeline de una petición de principio a fin.
2. Lee `types.md` para conocer el contrato `ApiResponse<T>` que el backend DEBE cumplir.
3. Lee `interceptors.md` para el flujo de refresh de token y las políticas de storage.

## Vista rápida del módulo

| Archivo | Responsabilidad |
|---|---|
| `src/lib/api/client.ts` | Cliente HTTP (`client`), `tokenManager`, `ApiError`, `configureClient`, interceptores, pipeline `request<T>()` |
| `src/lib/api/index.ts` | Re-exporta la API pública: `client`, `tokenManager`, `ApiError`, `configureClient`, `addRequestInterceptor`, `addResponseInterceptor`, tipos y guards |
| `src/lib/api/interceptors/refresh.ts` | `tryRefreshToken()`: refresh proactivo y reactivo con deduplicación |
| `src/lib/api/services/auth.service.ts` | Servicio de autenticación (`authService`) |
| `src/lib/api/services/_template.service.ts` | Plantilla CRUD genérico (no usado en runtime) |
| `src/lib/api/services/index.ts` | Re-exporta `authService` |
| `src/lib/api/types/api-response.ts` | **Fuente de verdad** del contrato de respuesta (`ApiResponse<T>` y compañía) |

## API pública (resumen)

```ts
// Cliente HTTP
client.get<T>(path, options?): Promise<ApiResponse<T>>
client.post<T>(path, body?, options?): Promise<ApiResponse<T>>
client.put<T>(path, body?, options?): Promise<ApiResponse<T>>
client.patch<T>(path, body?, options?): Promise<ApiResponse<T>>
client.delete<T>(path, options?): Promise<ApiResponse<T>>

// Token en memoria
tokenManager.get(): string | null
tokenManager.set(token: string): void
tokenManager.clear(): void

// Error tipado
class ApiError extends Error { status: number; statusText: string; data?: unknown }

// Configuración
configureClient(config: Partial<ClientConfig>): void
addRequestInterceptor(interceptor: RequestInterceptor): void
addResponseInterceptor(interceptor: ResponseInterceptor): void
shouldRedirectToForbidden(pathname?: string): boolean
```

## Documentos relacionados

- [architecture.md](architecture.md) — pipeline de una petición, manejo de 401/403, timeout y configuración.
- [types.md](types.md) — contrato `ApiResponse`, códigos de error, tipos de autenticación, paginación y tema.
- [interceptors.md](interceptors.md) — refresh de token, deduplicación y políticas de storage.
- [../support/lib.md](../support/lib.md) — resumen de `src/lib/` completo (API client + token store + servicios).

## Deudas conocidas

- **Dos fuentes de verdad para la configuración**: `client.ts` lee `import.meta.env.VITE_API_BASE` y `VITE_REQUEST_TIMEOUT` directamente, mientras que `interceptors/refresh.ts` usa `env` de `src/config/env.ts`. Ver [architecture.md](architecture.md#deudas-conocidas).