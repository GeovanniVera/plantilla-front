# Configuración de entorno (`src/config/env.ts`)

## Propósito

`env.ts` valida y exporta las variables de entorno tipadas de la aplicación. **Todas las variables tienen default** y ninguna es estrictamente requerida en producción; solo en desarrollo se valida `VITE_API_BASE` (si falta, lanza un error).

```ts
export const env = validateEnv();
```

## Variables

| Variable | Tipo | Default | `.env.example` |
|---|---|---|---|
| `VITE_API_BASE` | string | `/api` | `http://localhost:8080/api` |
| `VITE_AUTH_LOGIN_PATH` | string | `/auth/login` | `/auth/login` |
| `VITE_AUTH_REFRESH_PATH` | string | `/auth/refresh` | `/auth/refresh` |
| `VITE_AUTH_LOGOUT_PATH` | string | `/auth/logout` | `/auth/logout` |
| `VITE_AUTH_ME_PATH` | string | `/auth/me` | `/auth/me` |
| `VITE_REQUEST_TIMEOUT` | number | `15000` | `15000` |
| `VITE_APP_NAME` | string | `SemillaTecnologica` | `SemillaTecnologica` |

## Comportamiento de validación

- `getEnvVar(key, required)` — si la variable falta y es requerida, lanza `Error` (en DEV además loguea `[ENV ERROR]` por consola).
- `getEnvNumber(key, defaultValue)` — parsea a número; si el valor no es numérico, loguea `[ENV WARNING]` y usa el default.
- `validateEnv()` — en `import.meta.env.DEV` exige `VITE_API_BASE`; en producción todas caen a su default si faltan.

## Uso

```ts
import { env } from '@config/env';

const response = await fetch(`${env.VITE_API_BASE}/users`);
```

## Deudas conocidas

- **`client.ts` NO usa `env` para base ni timeout**: `src/lib/api/client.ts` define `API_BASE = import.meta.env.VITE_API_BASE ?? '/api'` y `REQUEST_TIMEOUT = Number(import.meta.env.VITE_REQUEST_TIMEOUT) || 15000` leyendo `import.meta.env` directamente. El **único** consumidor real de `env` es `src/lib/api/interceptors/refresh.ts` (usa `env.VITE_API_BASE` y `env.VITE_AUTH_REFRESH_PATH`). Existen dos fuentes de verdad para la misma configuración: un cambio en `.env` requiere actualizar ambos consumidores por separado, y los defaults pueden divergir silenciosamente.