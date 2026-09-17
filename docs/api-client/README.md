# API Client Module

Cliente HTTP centralizado para comunicación con el backend.

## Visión General

El módulo API Client provee:
- **Cliente HTTP** centralizado basado en Fetch API (sin axios)
- **Inyección automática de JWT** en cada request
- **Refresh token** automático con deduplicación de requests concurrentes
- **Manejo normalizado de errores** con códigos estandarizados
- **Timeout** configurable (default 15s)
- **Interceptores** request/response extensibles
- **Compatibilidad** con backends que usen `ApiResponse<T>` o JSON plano

## Estructura

```
src/lib/api/
├── index.ts                    # Barrel exports
├── client.ts                   # Cliente HTTP centralizado
├── types/
│   └── api-response.ts         # Contratos de respuesta
├── interceptors/
│   └── refresh.ts              # Refresh token con deduplicación
└── services/
    ├── auth.service.ts         # Servicio de autenticación
    └── _template.service.ts    # Template para nuevos servicios
```

## Quick Start

```typescript
import { client, isApiSuccess, isApiError } from '@lib/api';
import type { User, ApiResponse } from '@lib/api';

// GET simple
const response = await client.get<User>('/users/1');
if (isApiSuccess(response)) {
  console.log(response.data.name);
}

// POST con body
const response = await client.post<AuthResponse>('/auth/login', {
  email: 'user@test.com',
  password: '123'
});

// Manejo de errores
if (isApiError(response)) {
  console.error(response.message, response.code);
}
```

## Documentación

- [Arquitectura](./architecture.md) - Diseño del cliente, pipeline de requests, interceptores
- [Types](./types.md) - Contratos TypeScript (ApiResponse, User, AuthResponse, etc.)
- [Interceptors](./interceptors.md) - Refresh token, deduplicación, anti-bucle

## Configuración

### Variables de Entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_BASE` | `/api` | Base URL del backend |
| `VITE_REQUEST_TIMEOUT` | `15000` | Timeout en milisegundos |
| `VITE_AUTH_REFRESH_PATH` | `/auth/refresh` | Path del endpoint de refresh |

### Configuración en Runtime

```typescript
import { configureClient } from '@lib/api';

configureClient({
  baseUrl: 'https://api.miapp.com',
  onUnauthorized: () => { /* custom handler */ },
  onForbidden: () => { /* custom handler */ },
});
```

## Dependencias Externas

| Paquete | Uso |
|---------|-----|
| Ninguna | Fetch API nativa del browser |

## Dependencias Internas

| Módulo | Uso |
|--------|-----|
| `src/config/env.ts` | Variables de entorno validadas |
| `src/lib/auth/token-store.ts` | Persistencia de tokens |
| `src/lib/i18n/errors.ts` | Mensajes de error traducidos |

## Testing

```bash
# Tests del cliente
npm run test -- src/lib/api/client.test.ts
```

## Patrones Clave

1. **Dual token storage**: Memoria (requests) + localStorage/sessionStorage (persistencia)
2. **Refresh deduplicado**: Si múltiples requests fallan con 401, solo se hace UN refresh
3. **Anti-bucle**: Flag `_retry` previene retry infinito (máximo 2 intentos)
4. **Event-driven logout**: Usa `CustomEvent('auth:logout')` para desacoplar de UI
5. **Compatibilidad dual**: Maneja backends con `ApiResponse<T>` o JSON plano
