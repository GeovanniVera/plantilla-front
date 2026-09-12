# Checklist — Nuevo Proyecto

Cuando uses esta plantilla para un proyecto nuevo, solo necesitás editar estos archivos:

## Obligatorio (primera vez)

| # | Archivo | Qué editar | Por qué |
|---|---------|-----------|---------|
| 1 | `package.json` | `name`, `version` | Identificación del proyecto |
| 2 | `.env` | `VITE_API_BASE`, endpoints de auth | Conectar con tu backend |
| 3 | `src/config/env.ts` | Agregar env vars específicas | Tipado de variables |
| 4 | `src/theme/tokens.ts` | Colores por defecto | Branding del proyecto |
| 5 | `src/lib/i18n/locales/es.json` | Traducciones | Textos de la UI |
| 6 | `src/lib/i18n/locales/en.json` | Traducciones EN (opcional) | Soporte multi-idioma |
| 7 | `README.md` | Nombre, descripción | Documentación del proyecto |

## Segundo paso (configurar backend)

| # | Archivo | Qué editar |
|---|---------|-----------|
| 8 | `src/lib/api/services/auth.service.ts` | Endpoints reales de auth |
| 9 | `src/lib/api/types/api-response.ts` | Tipos de respuesta de tu API |
| 10 | `src/auth/provider.tsx` | Lógica de sesión (si difiere) |
| 11 | `src/auth/types.ts` | Tipo `User` según tu backend |

## Tercero (personalizar UI)

| # | Archivo | Qué editar |
|---|---------|-----------|
| 12 | `src/layouts/MainLayout.tsx` | Navegación, sidebar |
| 13 | `src/routes/index.ts` | Rutas de tu aplicación |
| 14 | `src/pages/` | Páginas específicas del proyecto |
| 15 | `public/logo.svg` | Logo del proyecto |
| 16 | `public/favicon.svg` | Favicon del proyecto |

## Lo que NO editar

| Archivo | Por qué |
|---------|---------|
| `src/lib/api/client.ts` | HTTP client genérico, funciona con cualquier backend |
| `src/lib/api/interceptors/refresh.ts` | Lógica de refresh token genérica |
| `src/lib/auth/token-store.ts` | Persistencia de tokens genérica |
| `src/components/` | Design system reutilizable |
| `src/lib/i18n/config.ts` | Configuración i18n genérica |
| `vite.config.ts` | Configuración de build genérica |
| `tsconfig.app.json` | Configuración de TypeScript genérica |

## Verificación

Después de editar, verificar:

```bash
npm run typecheck     # Sin errores de tipos
npm run lint          # Sin warnings de lint
npm run test          # Todos los tests pasan
npm run build         # Build exitoso
npm run storybook     # Storybook funciona
```

## Credenciales mock

Mientras conectás tu backend, podés usar las credenciales mock:

| Email | Password | Rol |
|-------|----------|-----|
| `admin@test.com` | `admin123` | admin |
| `editor@test.com` | `editor123` | editor |
| `viewer@test.com` | `viewer123` | viewer |

⚠️ Estas credenciales son solo para desarrollo. Eliminar `src/test/mocks/` en producción.
