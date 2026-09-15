# Configuración

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_BASE` | `/api` | URL base para peticiones API |
| `VITE_AUTH_LOGIN_PATH` | `/auth/login` | Endpoint de login |
| `VITE_AUTH_REFRESH_PATH` | `/auth/refresh` | Endpoint de refresh token |
| `VITE_AUTH_LOGOUT_PATH` | `/auth/logout` | Endpoint de logout |
| `VITE_AUTH_ME_PATH` | `/auth/me` | Endpoint de perfil de usuario |
| `VITE_REQUEST_TIMEOUT` | `15000` | Timeout en ms para requests |

### Archivos de entorno

```
.env.example    # Template (commiteado)
.env            # Local (en .gitignore)
```

### Tipado

Las variables están tipadas en `src/config/env.ts` con `import.meta.env.VITE_*`.

## Configuración de app

### Router (`src/App.tsx`)

Las rutas se organizan en 3 grupos:

1. **Auth routes** — `AuthLayout` (login, register)
2. **Forgot password flow** — `AuthLayout` + `ForgotPasswordProvider` + `GuestOnly`
3. **Protected routes** — `ProtectedRoute` + `MainLayout`

### Tema (`src/theme/`)

- Tokens de color en `tokens.ts`
- Colores semánticos en `semantic.ts`
- Persistencia en localStorage via `persistence.ts`
- Provider en `ThemeProvider.tsx`

### i18n (`src/lib/i18n/`)

- Idioma por defecto: español (`es.json`)
- Segundo idioma: inglés (`en.json`)
- Lazy loading de namespaces
- Error mapping en `errors.ts`

## Ejemplos por backend

### Laravel

```env
VITE_API_BASE=http://localhost:8000/api
```

### NestJS

```env
VITE_API_BASE=http://localhost:3000/api
```

### Express

```env
VITE_API_BASE=http://localhost:4000/api
```
