# API Client — Contrato de tipos

## Propósito

`src/lib/api/types/api-response.ts` es **la fuente de verdad** de la estructura de respuesta que el backend DEBE cumplir. El frontend define las reglas: cualquier backend que quiera conectarse debe responder con esta estructura exacta.

## Contrato `ApiResponse<T>`

```ts
type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
```

### Éxito — `ApiSuccess<T>`

```ts
interface ApiSuccess<T = unknown> {
  success: true;
  message: string;        // mensaje legible para humanos
  data?: T;               // opcional en operaciones como DELETE
}
```

### Error — `ApiError`

```ts
interface ApiError {
  success: false;
  message: string;
  code: ApiErrorCode;
  fields?: Record<string, string[]>;  // solo cuando code === 'VALIDATION_ERROR'
  timestamp?: string;                 // ISO 8601, útil para logs
  traceId?: string;                   // correlación con logs del backend
}
```

Ejemplo real de error:

```json
{
  "success": false,
  "message": "El email ya está registrado",
  "code": "CONFLICT",
  "fields": { "email": ["Este email ya está en uso"] },
  "timestamp": "2026-09-11T20:00:00Z",
  "traceId": "abc-123-def-456"
}
```

## Códigos de error (`ApiErrorCode`)

| Código | Significado |
|---|---|
| `VALIDATION_ERROR` | 400 — errores de validación por campo (`fields`) |
| `UNAUTHORIZED` | 401 — credenciales inválidas o sesión expirada |
| `FORBIDDEN` | 403 — sin permisos |
| `ACCOUNT_SUSPENDED` | 403 — cuenta suspendida (limpia sesión y redirige a `/login?error=...`) |
| `NOT_FOUND` | 404 |
| `CONFLICT` | 409 — p. ej., email ya registrado |
| `RATE_LIMITED` | 429 |
| `INTERNAL_ERROR` | 500 |
| `NETWORK_ERROR` | 0 — error de red |
| `TIMEOUT` | — abort por timeout del cliente |
| `UNKNOWN` | cualquier otro caso |

> El union se amplía a medida que el backend agregue casos.

## Tipos de autenticación

### `User`

```ts
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];   // permisos efectivos (unión de permisos de todos sus roles)
  isVerified: boolean;
  photoUrl?: string;
}
```

**Importante**: el backend retorna `permissions`, NO `privileges`. Los guards y la navegación (`Can`, `RequirePrivilege`) comparan permisos con notación de punto (`users.read`).

### `AuthResponse`

```ts
interface AuthResponse {
  user: User;
  accessToken: string;     // JWT de vida corta
  expiresIn?: number;      // vida del access token en segundos
}
```

**El refresh token NO viene en el body**: se maneja vía HttpOnly cookie (ver [interceptors.md](interceptors.md)).

### `RefreshResponse`

```ts
interface RefreshResponse {
  user: User;
  accessToken: string;
  expiresIn?: number;
}
```

### `PasswordPolicyResponse`

Respuesta de `GET /auth/password-policy`: política de contraseñas y tiempos de expiración del flujo de recuperación. El backend es la fuente única de verdad.

```ts
interface PasswordPolicy {
  minLength: number;          // 8
  maxLength: number;          // 128
  requiresUppercase: boolean;
  requiresLowercase: boolean;
  requiresSymbol: boolean;
}

interface PasswordPolicyResponse {
  otpExpiresInMinutes: number;         // vigencia del OTP de recuperación
  resetTokenExpiresInMinutes: number;  // vigencia del token emitido tras verificar el OTP
  passwordPolicy: PasswordPolicy;
}
```

## Tipos de paginación

```ts
interface PaginationParams {
  page?: number;            // comienza en 1
  limit?: number;           // default: 20
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}
```

## Tipos de tema

```ts
interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  'text-h': string;
  border: string;
}

interface ThemeResponse {
  id: string;
  name: string;
  tokens: ThemeTokens;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

## Guards y helpers

```ts
isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T>   // response.success === true
isApiError<T>(response: ApiResponse<T>): response is ApiError          // response.success === false

type ApiResponseData<T> = T extends ApiSuccess<infer D> ? D : undefined;
```

Ejemplo:

```ts
const response = await client.get<User>('/users/1');
if (isApiSuccess(response)) {
  console.log(response.data?.name);
}
```

## Uso con el cliente

```ts
const response: ApiResponse<AuthResponse> = await client.post('/auth/login', { email, password });

if (response.success) {
  console.log(response.data.user);
} else {
  console.error(response.code, response.message);
}
```

## Deudas conocidas

- Los mocks de MSW (`src/test/mocks/handlers/auth.ts`) **no respetan este contrato en su totalidad**: devuelven `refreshToken` en los bodies y `verify-otp` responde `{ verified, token }` cuando el servicio espera `{ resetToken }`. Ver [../support/test.md](../support/test.md#deudas-conocidas).