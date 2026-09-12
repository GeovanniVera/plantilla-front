# Configuración — Plantilla Front

## Variables de entorno

Todas las variables usan el prefijo `VITE_` y se inyectan en tiempo de build.

| Variable | Default | Descripción | Archivo |
|----------|---------|-------------|---------|
| `VITE_API_BASE` | `/api` | URL base para llamadas API | `src/config/env.ts` |
| `VITE_API_TIMEOUT` | `10000` | Timeout para requests (ms) | `src/config/env.ts` |
| `VITE_APP_NAME` | `Plantilla Front` | Nombre de la aplicación | `src/config/env.ts` |
| `VITE_AUTH_LOGIN_PATH` | `/auth/login` | Endpoint de login | `src/config/env.ts` |
| `VITE_AUTH_REGISTER_PATH` | `/auth/register` | Endpoint de registro | `src/config/env.ts` |
| `VITE_AUTH_LOGOUT_PATH` | `/auth/logout` | Endpoint de logout | `src/config/env.ts` |
| `VITE_AUTH_ME_PATH` | `/auth/me` | Endpoint de perfil | `src/config/env.ts` |
| `VITE_AUTH_REFRESH_PATH` | `/auth/refresh` | Endpoint de refresh token | `src/config/env.ts` |
| `VITE_AUTH_FORGOT_PASSWORD_PATH` | `/auth/forgot-password` | Endpoint de forgot password | `src/config/env.ts` |
| `VITE_AUTH_RESET_PASSWORD_PATH` | `/auth/reset-password` | Endpoint de reset password | `src/config/env.ts` |
| `VITE_AUTH_VERIFY_EMAIL_PATH` | `/auth/verify-email` | Endpoint de verificación | `src/config/env.ts` |

### Archivo `.env`

```bash
# Copiar el ejemplo
cp .env.example .env
```

Ver `src/config/env.ts` para la definición completa con tipos.

### Build time vs Runtime

⚠️ Las variables `VITE_*` se inyectan en tiempo de **build**, no de runtime. Para cambiar un valor debes reconstruir la aplicación.

## Configuración de la aplicación

### Path Aliases

Configurados en `vite.config.ts` y `tsconfig.app.json`:

| Alias | Ruta | Uso |
|-------|------|-----|
| `@components` | `src/components` | Componentes UI |
| `@hooks` | `src/hooks` | Custom hooks |
| `@theme` | `src/theme` | Sistema de theming |
| `@config` | `src/config` | Configuración |
| `@lib` | `src/lib` | Utilidades compartidas |

### Theme Configuration

Los tokens de tema se definen en `src/theme/tokens.ts` y se aplican como CSS variables.

Para cambiar los colores por defecto, editar `defaultTokens` en `src/theme/tokens.ts`:

```ts
export const defaultTokens: ThemeTokens = {
  primary: '#0d9488',    // Color principal
  secondary: '#6366f1',  // Color secundario
  accent: '#0d9488',     // Color de acento
  background: '#f6f5f1', // Fondo de página
  surface: '#edecea',    // Fondo de superficie
  text: '#5a5565',       // Texto principal
  'text-h': '#1a1525',   // Texto de headings
  border: '#e4e2dc',     // Bordes
}
```

### Auth Configuration

La configuración de auth está en `src/auth/provider.tsx`. Los endpoints se configuran via env vars.

Para cambiar el backend, actualizar las env vars `VITE_AUTH_*_PATH` y el servicio en `src/lib/api/services/auth.service.ts`.

### i18n Configuration

El idioma por defecto es español. Para cambiar:

```ts
import i18n from './lib/i18n/config'
i18n.changeLanguage('en') // Cambia a inglés
```

Los archivos de traducción están en:
- `src/lib/i18n/locales/es.json` — Español
- `src/lib/i18n/locales/en.json` — Inglés

## Configuración por backend

### Node.js / Express

```env
VITE_API_BASE=http://localhost:3000/api
VITE_AUTH_LOGIN_PATH=/auth/login
VITE_AUTH_ME_PATH=/auth/me
```

### Laravel

```env
VITE_API_BASE=http://localhost:8000/api
VITE_AUTH_LOGIN_PATH=/login
VITE_AUTH_ME_PATH=/user
```

### Django REST Framework

```env
VITE_API_BASE=http://localhost:8000/api/v1
VITE_AUTH_LOGIN_PATH=/token/
VITE_AUTH_ME_PATH=/users/me/
```

### Go / Fiber

```env
VITE_API_BASE=http://localhost:8080/api
VITE_AUTH_LOGIN_PATH=/auth/login
VITE_AUTH_ME_PATH=/auth/me
```
