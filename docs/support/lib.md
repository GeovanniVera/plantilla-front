# Librerías (`src/lib/`)

## Propósito

Resumen de los módulos de librería de la aplicación: el API client (`src/lib/api/`), el token store (`src/lib/auth/token-store.ts`) y los servicios (`src/lib/api/services/`). Para la documentación detallada del cliente HTTP, ver [../api-client/README.md](../api-client/README.md).

## API Client (`src/lib/api/`)

Cliente HTTP centralizado por el que pasan todas las peticiones a la API. Documentación completa en [../api-client/README.md](../api-client/README.md), [architecture.md](../api-client/architecture.md), [types.md](../api-client/types.md) e [interceptors.md](../api-client/interceptors.md).

Resumen de la API pública:

```ts
client.get/post/put/patch/delete<T>(path, body?, options?): Promise<ApiResponse<T>>
tokenManager.get(): string | null      // token en memoria
tokenManager.set(token: string): void
tokenManager.clear(): void
class ApiError extends Error            // status, statusText, data?
configureClient(config: Partial<ClientConfig>): void
addRequestInterceptor / addResponseInterceptor
shouldRedirectToForbidden(pathname?): boolean
```

### Servicios (`src/lib/api/services/`)

```ts
authService.login(email, password)                  → ApiResponse<AuthResponse>
authService.logout()                                → ApiResponse<void>
authService.me()                                    → ApiResponse<User>
authService.register({ name, email, password, acceptedTerms }) → ApiResponse<void>
authService.forgotPassword(email)                   → ApiResponse<void>
authService.resetPassword(token, password)          → ApiResponse<void>
authService.verifyEmail(token)                      → ApiResponse<{ email: string }>
authService.resendVerification(email)               → ApiResponse<void>
authService.verifyOtp(email, otp)                   → ApiResponse<{ resetToken: string }>
```

Endpoints correspondientes:

| Servicio | Endpoint |
|---|---|
| login / logout / me | `POST /auth/login`, `POST /auth/logout`, `GET /auth/me` |
| register | `POST /auth/register` (retorna solo mensaje opaco, no user ni token) |
| forgot / reset password | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| verify / resend email | `POST /auth/verify-email`, `POST /auth/resend-verification` |
| verify OTP | `POST /auth/verify-otp` — contrato documentado: `{ resetToken }`, NO `{ verified, token }` |

> `_template.service.ts` es una plantilla CRUD genérico (`templateService` con `/resource`) que NO se usa en runtime; sirve de modelo para crear servicios nuevos.

## Token store (`src/lib/auth/token-store.ts`)

Persistencia de tokens en `localStorage` (recordar sesión) y `sessionStorage` (sesión de pestaña).

```ts
authStorage.getToken(remember = true): string | null
authStorage.setToken(token, expiresIn?, remember = true): void
authStorage.getExpiresAt(remember = true): number | null
authStorage.setExpiresAt(timestamp, remember = true): void
authStorage.getActiveSession(): { token, remember } | null
authStorage.isExpired(remember?): boolean
authStorage.clear(remember = true): void
authStorage.clearAll(): void
```

### Comportamiento clave

- **`getActiveSession()`**: revisa `sessionStorage` PRIMERO y `localStorage` después — una sesión tab-scoped nunca debe ser secuestrada por un token profile-wide. Devuelve `null` si no hay sesión en ningún storage.
- **`isExpired()`**: sin `remember`, resuelve el storage desde la sesión activa. **Sin sesión → `false`** (no refresca ni limpia por un token inexistente).
- **Claves**: `auth_token`, `auth_expires_at`, `auth_refresh_token`.
  - `auth_refresh_token` es **LEGACY**: el refresh token ahora vive en una HttpOnly cookie del backend; nadie lo escribe en el frontend. La clave se conserva solo para **borrarla** en `clear()`/`clearAll()` — los usuarios de releases anteriores aún la tienen y el logout debe eliminarla.
- **try/catch silenciosos**: todo acceso a storage está protegido; si el storage no está disponible (tests, modo privado), los métodos devuelven valores neutros (`null`/`false`) sin lanzar.

### Relación con el refresh

`interceptors/refresh.ts` renueva la sesión en el MISMO storage donde fue creada (`getActiveSession()` → `remember`), nunca promueve implícitamente a `localStorage`, y en caso de fallo invalida solo ese storage (o ambos si no hay sesión identificable). Detalle en [../api-client/interceptors.md](../api-client/interceptors.md).

## Deudas conocidas

- Configuración duplicada entre `client.ts` y `env.ts` — ver [config.md](config.md#deudas-conocidas).
- Contratos de servicios vs mocks MSW desincronizados (p. ej. `verifyOtp` espera `{ resetToken }` pero el mock responde `{ verified, token }`) — ver [test.md](test.md#deudas-conocidas).