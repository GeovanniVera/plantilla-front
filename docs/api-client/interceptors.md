# API Client — Interceptores de refresh

## Propósito

`src/lib/api/interceptors/refresh.ts` implementa `tryRefreshToken()`, el mecanismo que renueva el access token cuando la sesión está (o parece) expirada. Se usa en tres momentos:

- **Proactivo**: antes de enviar una petición con token expirado (paso 2 de [architecture.md](architecture.md)).
- **Reactivo**: cuando un 401 llega del servidor y la petición llevaba sesión (paso 10 de [architecture.md](architecture.md)).
- **Restore**: al montar la app, cuando hay indicador de sesión en storage (ver [flows.md](../auth/flows.md#restauración-de-sesión-al-montar-la-app)); el refresh es ahora también el camino de restauración tras un reload.

## API

```ts
tryRefreshToken(): Promise<boolean>
```

- Devuelve `true` si el refresh fue exitoso (nuevo access token en memoria e indicador de sesión actualizado en storage).
- Devuelve `false` si el refresh falló; en ese caso la sesión queda invalidada.

## Flujo de refresh

1. **Deduplicación**: `tryRefreshToken()` comparte una `refreshPromise` a nivel de módulo. Si varias peticiones fallan o expiran al mismo tiempo, solo se dispara UNA request de refresh concurrente; el resto espera la misma promesa. La promesa se resetea a `null` en un `finally`.
2. **Storage destino**: se resuelve la sesión activa con `authStorage.getActiveSession()`. La sesión renovada actualiza el MISMO storage donde vivía el indicador (`remember`), con `authStorage.setActiveSession(remember, expiresIn)`. Nunca se promueve implícitamente una sesión a `localStorage`.
3. **Endpoint**: `POST {env.VITE_API_BASE}{env.VITE_AUTH_REFRESH_PATH}` (default `/auth/refresh`) con `credentials: 'include'` para enviar la HttpOnly cookie. **Sin body**: el refresh token NO viaja en el payload.
4. **Validación**: la respuesta debe ser `{ success: true, data: { accessToken, expiresIn } }`. Si no, se invalida.
5. **Éxito**: `tokenManager.set(accessToken, expiresIn)` + `authStorage.setActiveSession(remember, expiresIn)`. El access token vive solo en memoria; el refresh token no se persiste (vive en la cookie).
6. **Fallo** (status no-OK, body inválido o excepción de red): `invalidate(activeSession)`.

## Política de invalidación (`invalidate`)

```ts
function invalidate(activeSession: { remember: boolean } | null): false
```

- Si hay sesión activa identificable: `authStorage.clear(activeSession.remember)` — limpia SOLO el storage donde vive, para no dejar indicadores huérfanos en `sessionStorage`.
- Si no hay sesión identificable: `authStorage.clearAll()` — invalidación dura sobre ambos storages.
- En ambos casos: `tokenManager.clear()`.

## Evento `auth:logout`

Cuando el refresh falla dentro del pipeline del cliente, `client.ts` dispara:

```ts
window.dispatchEvent(new CustomEvent('auth:logout'));
```

El `AuthProvider` escucha este evento para limpiar el estado de sesión. Es el mecanismo de logout automático por sesión expirada.

## Interceptores genéricos (request/response)

Además del refresh, el cliente expone interceptores configurables (ver [architecture.md](architecture.md#interfaces-de-interceptor)):

```ts
addRequestInterceptor({ onFulfilled, onRejected? }): void
addResponseInterceptor({ onFulfilled, onRejected? }): void
```

Se ejecutan en orden de adición, antes del fetch (request) y después del fetch (response), respectivamente.

## Deudas conocidas

- **Dependencia de `env`**: este módulo es el ÚNICO consumidor real de `src/config/env.ts` (usa `env.VITE_API_BASE` y `env.VITE_AUTH_REFRESH_PATH`). El resto del cliente lee `import.meta.env` directamente — ver [architecture.md](architecture.md#deudas-conocidas).