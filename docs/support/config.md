# Config

Variables de entorno tipadas del proyecto plantilla-front.

## Archivo

`src/config/env.ts`

## Interface

```typescript
interface Env {
  VITE_API_BASE: string;
  VITE_AUTH_API_PATH: string;
  VITE_AUTH_LOGIN_PATH: string;
  VITE_AUTH_LOGOUT_PATH: string;
  VITE_AUTH_ME_PATH: string;
  VITE_AUTH_REFRESH_PATH: string;
  VITE_REQUEST_TIMEOUT: number;
  VITE_APP_NAME: string;
}
```

## Funciones

### `getEnvVar(key, required?)`

Lee de `import.meta.env`. Si `required=true` y falta, lanza `Error`.

### `getEnvNumber(key, defaultValue)`

Parsea a número con fallback seguro.

### `validateEnv()`

En DEV valida que `VITE_API_BASE` exista. Aplica defaults razonables para todo.

## Export

```typescript
export const env: Env;
```

## Defaults

| Variable | Default |
|----------|---------|
| `VITE_API_BASE` | `'/api'` |
| `VITE_REQUEST_TIMEOUT` | `15000` |
| `VITE_APP_NAME` | `'Plantilla Front'` |

## Patrones

### Fail-fast en DEV

Explota temprano si falta una variable requerida:

```typescript
if (required && !value) {
  console.error(`[ENV ERROR] Missing required env var: ${key}`);
  throw new Error(`Missing required env var: ${key}`);
}
```

### Graceful degradation en producción

Defaults razonables para todo.

### Single source of truth

Nunca se accede a `import.meta.env` directamente desde otros módulos.

## Uso

```typescript
import { env } from '@config/env';

// ✅ Correcto
const apiUrl = env.VITE_API_BASE;

// ❌ Incorrecto
const apiUrl = import.meta.env.VITE_API_BASE;
```
