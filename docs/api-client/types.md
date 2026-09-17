# API Client Types

## Contrato Base: ApiResponse

El frontend define la estructura; el backend debe cumplirla.

```typescript
type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
```

Es una **unión discriminada** por el campo `success`.

---

## ApiSuccess

```typescript
interface ApiSuccess<T = unknown> {
  success: true;
  message: string;      // legible para humanos
  data?: T;             // opcional en DELETE/operaciones vacías
}
```

### Ejemplo

```json
{
  "success": true,
  "message": "Usuario obtenido",
  "data": {
    "id": "123",
    "email": "user@test.com",
    "name": "Juan Pérez"
  }
}
```

---

## ApiError

```typescript
interface ApiError {
  success: false;
  message: string;            // legible para humanos
  code: ApiErrorCode;         // estandarizado
  fields?: Record<string, string[]>;  // solo VALIDATION_ERROR
  timestamp?: string;         // ISO 8601
  traceId?: string;           // correlación con backend
}
```

### Ejemplo

```json
{
  "success": false,
  "message": "El email ya está registrado",
  "code": "CONFLICT",
  "timestamp": "2026-09-16T05:00:00Z",
  "traceId": "abc-123"
}
```

---

## ApiErrorCode

```typescript
type ApiErrorCode =
  | 'VALIDATION_ERROR'    // 400 - Datos inválidos
  | 'UNAUTHORIZED'        // 401 - No autenticado
  | 'FORBIDDEN'           // 403 - Sin permisos
  | 'NOT_FOUND'           // 404 - No encontrado
  | 'CONFLICT'            // 409 - Conflicto (ej: email duplicado)
  | 'RATE_LIMITED'        // 429 - Demasiadas solicitudes
  | 'INTERNAL_ERROR'      // 500 - Error del servidor
  | 'NETWORK_ERROR'       // 0   - Error de conexión
  | 'TIMEOUT'             // -   - Timeout de la petición
  | 'UNKNOWN'             // Otro - Error desconocido
```

---

## Type Guards

```typescript
// Narrow a ApiSuccess<T>
function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T>

// Narrow a ApiError
function isApiError<T>(response: ApiResponse<T>): response is ApiError
```

### Uso

```typescript
import { client, isApiSuccess, isApiError } from '@lib/api';

const response = await client.get<User>('/users/1');

if (isApiSuccess(response)) {
  // TypeScript sabe que response.data es User
  console.log(response.data.name);
}

if (isApiError(response)) {
  // TypeScript sabe que response.code es ApiErrorCode
  console.error(response.code);
}
```

---

## Modelos de Dominio

### User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  privileges: string[];
  isVerified: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### AuthResponse

```typescript
interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;  // segundos
}
```

### RefreshResponse

```typescript
interface RefreshResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
}
```

---

## Paginación

### PaginationParams (Request)

```typescript
interface PaginationParams {
  page?: number;      // default: 1
  limit?: number;     // default: 10
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### PaginationMeta (Response)

```typescript
interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
```

---

## Tema

### ThemeTokens

```typescript
interface ThemeTokens {
  primary: string;
  secondary: string;
  accent: string;
  // ... otros tokens
}
```

### ThemeResponse

```typescript
interface ThemeResponse {
  tokens: ThemeTokens;
  mode: 'light' | 'dark';
}
```

---

## Utility Types

```typescript
// Extrae tipo D de ApiSuccess<D>
type ApiResponseData<T> = T extends ApiSuccess<infer D> ? D : never;
```

### Ejemplo

```typescript
type UserData = ApiResponseData<ApiSuccess<User>>;
// UserData = User
```

---

## ApiError (Clase)

Clase de error personalizada para casos donde se quiera throw.

```typescript
class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: unknown;

  constructor(status: number, statusText: string, data?: unknown);
}
```

**Nota**: El cliente HTTP **nunca lanza** esta clase. Retorna `ApiResponse<T>` con `success: false` siempre. `ApiError` existe para throw manual si el consumidor prefiere exceptions.

```typescript
import { ApiError } from '@lib/api';

if (isApiError(response)) {
  throw new ApiError(400, response.message, response);
}
```
