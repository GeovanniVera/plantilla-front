# Testing (`vite.config.ts` + `src/test/`)

## Propósito

Infraestructura de testing basada en Vitest con **dos proyectos** (`unit` y `storybook`) y cobertura v8. Los mocks HTTP corren con MSW.

## Proyectos Vitest

| Proyecto | Alcance | Entorno |
|---|---|---|
| `unit` | `src/**/*.test.{ts,tsx}` | jsdom, `setupFiles: src/test/setup.ts`, `globals: true` |
| `storybook` | historias de Storybook (plugin `storybookTest`, `configDir: .storybook`) | browser mode — Playwright `chromium` headless |

### Cobertura (v8)

- `include`: `src/**/*.tsx`, `src/**/*.ts`
- `exclude`: `src/**/*.test.{ts,tsx}`, `src/**/*.stories.{ts,tsx}`, `src/test/**`, `src/vite-env.d.ts`

### Aliases de path (compartidos con `tsconfig.app.json`)

| Alias | Ruta |
|---|---|
| `@components` | `src/components` |
| `@hooks` | `src/hooks` |
| `@theme` | `src/theme` |
| `@config` | `src/config` |
| `@lib` | `src/lib` |

> Storybook's Vite builder lee `vite.config.ts` automáticamente, no requiere `viteFinal`.

## Setup (`src/test/setup.ts`)

```ts
import '@testing-library/jest-dom/vitest'
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

- Agrega los matchers de `@testing-library/jest-dom`.
- Levanta el servidor MSW con `onUnhandledRequest: 'bypass'` (las requests no mockeadas pasan a la red).
- Reinicia handlers entre tests y cierra el servidor al final.

## Mocks MSW (`src/test/mocks/`)

`mocks/server.ts` exporta `setupServer(...authHandlers)`; los handlers viven en `mocks/handlers/auth.ts` y mockean `*/auth/*`:

| Endpoint | Comportamiento |
|---|---|
| `POST /auth/login` | Valida email/contraseña; 401 si no coincide |
| `POST /auth/logout` | `success: true` |
| `GET /auth/me` | Valida `Authorization: Bearer` (token = `btoa({ sub, exp })`) |
| `POST /auth/refresh` | Devuelve nuevo access token |
| `POST /auth/register` | Crea usuario `viewer` |
| `POST /auth/forgot-password`, `reset-password` | `success: true` |
| `POST /auth/verify-email` | Token mágico `verify-token-abc123` → éxito; otro → 400 `VALIDATION_ERROR` |
| `POST /auth/resend-verification` | `success: true` |
| `POST /auth/verify-otp` | OTP mágico `123456` → éxito; `000000` → expirado; otro → inválido |

### Usuarios de prueba

| Email | Contraseña | Rol | Permisos |
|---|---|---|---|
| `admin@test.com` | `admin123` | `admin` | `users:read`, `users:write`, `users:delete`, `reports:view`, `reports:export`, `settings:manage` |
| `editor@test.com` | `editor123` | `editor` | `users:read`, `reports:view` |

## Tests existentes (inventario)

| Área | Tests |
|---|---|
| Auth | `provider`, `guards`, `ForgotPasswordContext`, `index`, `token-store` |
| API | `client`, `client.forbidden`, `refresh` |
| i18n | `config` |
| Theme | 4 tests |
| Feedback | `toast` |
| Pages auth | 11 tests |
| Admin | `UsersPage`, `RolesPage` |
| Ajustes | `PerfilPage` |
| App | `password-reset-flow`, `verify-email-guard` |

## Deudas conocidas

- **Permisos con separador distinto**: los mocks declaran permisos con DOS PUNTOS (`users:read`), pero los guards y rutas reales usan PUNTO (`users.read`). Un test que dependa de los permisos del mock no refleja el contrato real de la app.
- **Contrato viejo en los mocks**: los mocks devuelven `refreshToken`/`token` en los bodies (el contrato actual maneja el refresh token vía HttpOnly cookie) y `verify-otp` responde `{ verified, token }` mientras el servicio espera `{ resetToken }`. Los mocks están desincronizados con `src/lib/api/types/api-response.ts` y `auth.service.ts`.
- `setup.ts` usa `bypass` para requests no mockeadas: los tests pueden golpear la red real si un handler queda mal escrito (considerar `'error'` para detectar handlers faltantes).