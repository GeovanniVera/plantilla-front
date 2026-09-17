# Lib

API Client, Token Store, y servicios del proyecto plantilla-front.

## API Client

### Archivo

`src/lib/api/client.ts` (442 líneas)

### Arquitectura

```
tokenManager (en memoria)
    ↓
request<T>() — función interna
    ├── requestInterceptors[]
    ├── Proactive refresh (si token expirado)
    ├── Bearer header injection
    ├── AbortController timeout (REQUEST_TIMEOUT)
    ├── responseInterceptors[]
    ├── Parseo JSON
    ├── Manejo de ApiResponse pre-armado vs raw
    ├── 401 → tryRefreshToken → retry (una vez)
    └── 403 → onForbidden()
    ↓
client.get/post/put/patch/delete — API pública
```

### Componentes Clave

| Componente | Descripción |
|------------|-------------|
| `tokenManager` | Token en memoria (no persistido) |
| `ApiError` class | Extiende Error con `status`, `statusText`, `data` |
| `configureClient()` | Actualiza config parcial |
| `addRequestInterceptor()` | Extiende cadena de interceptores |
| `addResponseInterceptor()` | Extiende cadena de interceptores |
| `mapStatusToErrorCode()` | Mapea HTTP status → `ApiErrorCode` |

### Uso

```typescript
import { client, configureClient } from '@lib/api';

// Configurar
configureClient({
  baseUrl: env.VITE_API_BASE,
  onUnauthorized: () => navigate('/login'),
  onForbidden: () => navigate('/403'),
});

// GET
const { data } = await client.get<User[]>('/users');

// POST
const { data } = await client.post<AuthResponse>('/auth/login', {
  email,
  password,
});

// Con interceptores
client.addRequestInterceptor((config) => {
  config.headers['X-Custom'] = 'value';
  return config;
});
```

---

## Token Store

### Archivo

`src/lib/auth/token-store.ts`

### Funcionamiento

- `authStorage` object: 8 métodos
- `getStorage(remember)`: `remember=true → localStorage`, `false → sessionStorage`
- Tokens almacenados: `auth_token`, `auth_refresh_token`, `auth_expires_at`

### API

```typescript
export const authStorage = {
  getToken(): string | null;
  getRefreshToken(): string | null;
  getExpiresAt(): number | null;
  setToken(token: string, remember: boolean): void;
  setRefreshToken(token: string, remember: boolean): void;
  setExpiresAt(expiresAt: number, remember: boolean): void;
  isExpired(): boolean;
  clearAll(): void;
};
```

### Patrones

- **Adapter Pattern**: Abstrae localStorage/sessionStorage
- **Dual persistence**: Soporta "recordar sesión" vs "sesión temporal"
- **Defensive programming**: Todos los métodos tienen `try/catch`

---

## Refresh Token Interceptor

### Archivo

`src/lib/api/interceptors/refresh.ts`

### Funcionamiento

- `tryRefreshToken()`: Usa un **singleton promise** para evitar refreshes concurrentes
- Hace `fetch` directo (NO usa `client`) para evitar loop infinito
- Si falla: limpia `authStorage` + `tokenManager`
- Si éxito: actualiza ambos stores

### Patrón

**Singleton Promise**: Evita N refreshes concurrentes con una sola promise compartida:

```typescript
let refreshPromise: Promise<string> | null = null;

export async function tryRefreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  
  refreshPromise = (async () => {
    try {
      const response = await fetch(refreshUrl, { method: 'POST', ... });
      const data = await response.json();
      tokenManager.set(data.token);
      authStorage.setRefreshToken(data.refreshToken, true);
      return data.token;
    } catch (error) {
      tokenManager.clear();
      authStorage.clearAll();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}
```

---

## Services

### Archivos

| Archivo | Función |
|---------|---------|
| `src/lib/api/services/auth.service.ts` | 8 métodos de auth |
| `src/lib/api/services/_template.service.ts` | Template CRUD genérico |
| `src/lib/api/services/index.ts` | Re-exporta solo `authService` |

### AuthService

```typescript
export const authService = {
  login(data: LoginRequest): Promise<ApiResponse<AuthResponse>>;
  logout(): Promise<ApiResponse<void>>;
  me(): Promise<ApiResponse<User>>;
  refreshToken(token: string): Promise<ApiResponse<RefreshResponse>>;
  register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>>;
  forgotPassword(email: string): Promise<ApiResponse<void>>;
  resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>>;
  verifyEmail(token: string): Promise<ApiResponse<void>>;
  resendVerification(email: string): Promise<ApiResponse<void>>;
  verifyOtp(email: string, otp: string): Promise<ApiResponse<void>>;
};
```

### Template Service

```typescript
// _template.service.ts
export function createTemplateService<T>(endpoint: string) {
  return {
    getAll(params?: PaginationParams): Promise<ApiResponse<PaginatedResponse<T>>>;
    getById(id: string): Promise<ApiResponse<T>>;
    create(data: Partial<T>): Promise<ApiResponse<T>>;
    update(id: string, data: Partial<T>): Promise<ApiResponse<T>>;
    delete(id: string): Promise<ApiResponse<void>>;
  };
}
```

---

## Types

### Archivo

`src/lib/api/types/api-response.ts`

### Exportaciones

| Export | Tipo |
|--------|------|
| `ApiErrorCode` | Union type de 10 strings |
| `ApiError` | `{ success: false, message, code, fields?, timestamp?, traceId? }` |
| `ApiSuccess<T>` | `{ success: true, message, data? }` |
| `ApiResponse<T>` | `ApiSuccess<T> \| ApiError` |
| `PaginationParams` | `{ page?, limit?, sortBy?, sortOrder? }` |
| `PaginationMeta` | `{ page, limit, total, totalPages, hasNext, hasPrevious }` |
| `PaginatedResponse<T>` | Extiende respuesta con `pagination` |
| `User` | `{ id, email, name, roles, privileges, isVerified, avatar? }` |
| `AuthResponse` | `{ user, token, refreshToken?, expiresIn? }` |
| `isApiSuccess()` | Type guard |
| `isApiError()` | Type guard |
