# Auth Architecture

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        App Root                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    AuthProvider                           │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              AuthContext                            │  │  │
│  │  │  state: { user, token, isAuthenticated, isLoading } │  │  │
│  │  │  methods: { login, logout, hasPrivilege, ... }      │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                         │                                 │  │
│  │  ┌──────────────────────▼──────────────────────────────┐  │  │
│  │  │              ForgotPasswordProvider                  │  │  │
│  │  │  state: { email, token, otpVerified }               │  │  │
│  │  │  methods: { setEmail, verifyOtp, resetPassword }    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│  ┌───────────────────────────▼───────────────────────────────┐  │
│  │                    Router                                 │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │  │
│  │  │ GuestOnly   │  │ProtectedRoute│  │RequirePrivilege│  │  │
│  │  │ (login,     │  │ (dashboard)  │  │ (settings)     │  │  │
│  │  │  register)  │  │              │  │                │  │  │
│  │  └─────────────┘  └──────────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Contratos TypeScript

### User

```typescript
// src/lib/api/types/api-response.ts
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

### AuthState

```typescript
// src/auth/types.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### AuthContextValue

```typescript
// src/auth/types.ts
interface AuthContextValue extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPrivilege: (privilege: string) => boolean;
  hasAnyPrivilege: (privileges: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isVerified: () => boolean;
}
```

### ForgotPasswordState

```typescript
// src/auth/ForgotPasswordContext.tsx
interface ForgotPasswordState {
  email: string;
  token: string | null;
  otpVerified: boolean;
}

interface ForgotPasswordContextValue extends ForgotPasswordState {
  setEmail: (email: string) => void;
  verifyOtp: (otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}
```

## Persistencia de Tokens

### Token Store (`src/lib/auth/token-store.ts`)

| Key | Storage | Descripción |
|-----|---------|-------------|
| `auth_token` | localStorage / sessionStorage | JWT de acceso |
| `auth_refresh_token` | localStorage / sessionStorage | Token de refresco |
| `auth_expires_at` | localStorage / sessionStorage | Timestamp de expiración |

### Comportamiento

| Acción | `remember=true` | `remember=false` |
|--------|-----------------|------------------|
| Guardar token | `localStorage` | `sessionStorage` |
| Guardar refresh | `localStorage` | `sessionStorage` |
| Limpiar | `clearAll()` limpia ambos | `clearAll()` limpia ambos |

### Funciones

```typescript
authStorage.setToken(token, expiresIn, remember)
authStorage.setRefreshToken(refreshToken, remember)
authStorage.getToken(remember) → string | null
authStorage.getRefreshToken(remember) → string | null
authStorage.isExpired() → boolean
authStorage.clear(remember)
authStorage.clearAll()
```

## Token Manager (Memoria)

```typescript
// src/lib/api/client.ts
tokenManager.set(token)    // Guarda en memoria (closure)
tokenManager.get()         // Obtiene de memoria
tokenManager.clear()       // Limpia memoria
```

El token en memoria se inyecta automáticamente en cada request HTTP via el header `Authorization: Bearer {token}`.

## Eventos Custom

### `auth:logout`

Evento disparado cuando el refresh token falla. El `AuthProvider` lo escucha para limpiar el estado y redirigir al login.

```typescript
// Disparar logout forzado
window.dispatchEvent(new CustomEvent('auth:logout'));

// Escuchar (en AuthProvider)
window.addEventListener('auth:logout', handleLogout);
```

**Importante**: Usa `window.location.href = '/login'` (hard redirect) para limpiar completamente el estado de React.

## Flujo de Refresh Token

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Request HTTP con token expirado                              │
│    ↓                                                            │
│ 2. client.ts detecta 401                                        │
│    ↓                                                            │
│ 3. tryRefreshToken()                                            │
│    ├─ ¿Ya hay un refresh en curso? → Reutilizar Promise        │
│    └─ No → Crear nuevo refresh                                  │
│         ↓                                                       │
│ 4. POST /auth/refresh { refreshToken }                         │
│    ↓                                                            │
│ 5. ¿Éxito?                                                      │
│    ├─ Sí → Actualizar tokens, reintentar request original      │
│    └─ No → Limpiar tokens, despachar 'auth:logout'             │
└─────────────────────────────────────────────────────────────────┘
```

**Deduplicación**: Si múltiples requests fallan simultáneamente con 401, solo se hace UN refresh. Las demás reutilizan la misma Promise.
