# Interceptors

Sistema de interceptores request/response y refresh token.

## Request Interceptors

Se ejecutan antes de cada request, en orden FIFO.

### Interfaz

```typescript
interface RequestInterceptor {
  onFulfilled: (config: RequestInit & { url: string }) => RequestInit & { url: string };
  onRejected?: (error: unknown) => unknown;
}
```

### Agregar Interceptor

```typescript
import { addRequestInterceptor } from '@lib/api';

addRequestInterceptor({
  onFulfilled: (config) => {
    // Agregar header custom
    config.headers = {
      ...config.headers,
      'X-Custom-Header': 'value',
    };
    return config;
  },
  onRejected: (error) => {
    console.error('Request interceptor error:', error);
    throw error;
  },
});
```

---

## Response Interceptors

Se ejecutan después de cada response, en orden FIFO.

### Interfaz

```typescript
interface ResponseInterceptor {
  onFulfilled: (response: Response) => Response;
  onRejected?: (error: unknown) => unknown;
}
```

### Agregar Interceptor

```typescript
import { addResponseInterceptor } from '@lib/api';

addResponseInterceptor({
  onFulfilled: (response) => {
    // Log de responses
    console.log(`Response: ${response.status} ${response.url}`);
    return response;
  },
  onRejected: (error) => {
    console.error('Response interceptor error:', error);
    throw error;
  },
});
```

---

## Refresh Token

### Mecánica

El refresh token se ejecuta automáticamente cuando:
1. **Proactive**: Antes de un request, si el token está expirado
2. **Reactive**: Después de un 401, si no se ha intentado refresh

### Flujo Proactive (antes del request)

```
┌─────────────────────────────────────────────────────────────────┐
│ request()                                                      │
│   │                                                            │
│   ├─ ¿Hay accessToken en memoria?                              │
│   │   ├─ NO → proceeding without auth                          │
│   │   └─ SÍ → ¿authStorage.isExpired()?                       │
│   │         ├─ NO → inject Bearer                              │
│   │         └─ SÍ → tryRefreshToken()                          │
│   │               ├─ OK → inject nuevo Bearer                  │
│   │               └─ FAIL → return UNAUTHORIZED                │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo Reactive (después del 401)

```
┌─────────────────────────────────────────────────────────────────┐
│ fetch() → 401 response                                         │
│   │                                                            │
│   ├─ ¿Ya se intentó retry? (flag _retry)                       │
│   │   ├─ SÍ → limpiar tokens, dispatch logout                  │
│   │   └─ NO → tryRefreshToken()                                │
│   │         ├─ OK → reintentar request con _retry flag         │
│   │         └─ FAIL → limpiar tokens, dispatch logout          │
└─────────────────────────────────────────────────────────────────┘
```

### Deduplicación

Si múltiples requests fallan con 401 simultáneamente, **solo se ejecuta UN refresh**.

```typescript
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  // Si ya hay un refresh en curso, reutilizar la misma Promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = doRefresh();
  
  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;  // Limpiar en finally
  }
}
```

**Escenario**:
```
Request A → 401 → tryRefreshToken() → refreshPromise = doRefresh()
Request B → 401 → tryRefreshToken() → return refreshPromise (misma)
Request C → 401 → tryRefreshToken() → return refreshPromise (misma)

doRefresh() completa:
  → refresca tokenManager.set(newToken)
  → refresca authStorage.setToken(newToken)
  → refreshPromise = null
  → A, B, C todos reciben true y reintentan
```

### Anti-Bucle

El flag `_retry` en headers previene retry infinito:

```typescript
// Primera request
fetch(url, { headers: { ... } })

// Si 401, refresh y reintentar con flag
fetch(url, { headers: { ... , _retry: 'true' } })

// Si 401 de nuevo (con flag), NO reintentar
if (headers._retry === 'true') {
  // Limpiar tokens, dispatch logout
  return { success: false, code: 'UNAUTHORIZED' };
}
```

**Máximo 2 intentos por petición**: original + 1 retry.

### doRefresh() — Implementación

```typescript
async function doRefresh(): Promise<boolean> {
  try {
    // 1. Obtener refresh token
    const refreshToken = authStorage.getRefreshToken();
    if (!refreshToken) return false;

    // 2. Llamar al backend (fetch directo, NO client)
    const response = await fetch(
      `${env.VITE_API_BASE}${env.VITE_AUTH_REFRESH_PATH}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }
    );

    // 3. Verificar respuesta
    if (!response.ok) {
      authStorage.clear();
      tokenManager.clear();
      return false;
    }

    // 4. Parsear
    const data = await response.json();
    if (!data.success || !data.data) {
      authStorage.clear();
      tokenManager.clear();
      return false;
    }

    // 5. Actualizar tokens
    const { token, refreshToken: newRefreshToken, expiresIn } = data.data;
    tokenManager.set(token);
    authStorage.setToken(token, expiresIn);
    if (newRefreshToken) {
      authStorage.setRefreshToken(newRefreshToken);
    }

    return true;
  } catch {
    authStorage.clear();
    tokenManager.clear();
    return false;
  }
}
```

**Importante**: `doRefresh()` usa `fetch()` directamente, NO el `client`. Esto evita un loop infinito porque el client es quien llama a `tryRefreshToken`.

---

## Eventos Custom

### `auth:logout`

Evento disparado cuando el refresh token falla.

```typescript
// Disparar (en client.ts o refresh.ts)
window.dispatchEvent(new CustomEvent('auth:logout'));

// Escuchar (en AuthProvider)
window.addEventListener('auth:logout', () => {
  authStorage.clearAll();
  tokenManager.clear();
  setState({ user: null, isAuthenticated: false });
  window.location.href = '/login';
});
```

**Uso**: Desacopla el cliente HTTP de la UI. El client no conoce React ni el AuthProvider.

---

## Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. consumer → client.get('/users/1')                           │
│    ↓                                                            │
│ 2. request() → ¿token expirado? → SÍ                           │
│    ↓                                                            │
│ 3. tryRefreshToken() → refreshPromise = doRefresh()             │
│    ↓                                                            │
│ 4. doRefresh() → POST /auth/refresh { refreshToken }           │
│    ↓                                                            │
│ 5. Éxito → tokenManager.set(newToken) + authStorage.setToken()  │
│    ↓                                                            │
│ 6. Continuar con Bearer nuevo                                   │
│    ↓                                                            │
│ 7. fetch('/api/users/1', { headers: { Authorization: Bearer } })│
│    ↓                                                            │
│ 8. Response interceptors                                        │
│    ↓                                                            │
│ 9. Parsear JSON                                                 │
│    ↓                                                            │
│ 10. ¿Tiene 'success'? → ApiResponse<T>                         │
│    ↓                                                            │
│ 11. Retornar al consumer                                        │
└─────────────────────────────────────────────────────────────────┘
```
