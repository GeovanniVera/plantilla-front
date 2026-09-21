# Plantilla Frontend Admin — React + TypeScript

Plantilla de frontend para aplicaciones admin, conectada a un backend **Spring Boot** (`backend-spring`).

## Quick Start

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env

# 3. Levantar el dev server
npm run dev
```

> Requiere el backend corriendo en `http://localhost:8080`.

## Stack

| Tecnología | Versión | Propósito |
|---|---|---|
| React / react-dom | ^19.2.8 | UI |
| react-router | ^8.3.0 | Enrutamiento declarativo (`Routes`/`Route`, sin `react-router-dom`) |
| @tanstack/react-query | ^5.102.8 | Server state (+ devtools) |
| i18next + react-i18next | ^26.4.2 / ^17.0.13 | Internacionalización |
| date-fns | ^4.4.0 | Fechas |
| react-day-picker | ^10.0.1 | Calendarios |
| react-icons | ^5.7.0 | Iconos |
| react-loading-skeleton | ^3.5.0 | Skeletons |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite + @vitejs/plugin-react | ^8.2.0 / ^6.0.4 | Build tool y dev server |
| Tailwind CSS + @tailwindcss/vite | ^4.3.3 | Utility-first CSS |
| Vitest + jsdom | latest / ^30.0.1 | Testing unitario |
| MSW | ^2.15.0 | Mocks de API |
| Storybook | ^10.5.10 | Documentación de componentes (addons a11y/docs/mcp/vitest, react-vite, chromatic) |
| @testing-library/react / jest-dom / user-event | ^16.3.3 / ^7.0.1 / ^14.6.7 | Testing de UI |
| oxlint | ^1.75.0 | Linting |
| Prettier + prettier-plugin-tailwindcss | ^3.4.2 / ^0.6.9 | Formateo |
| husky + lint-staged | ^9.1.7 / ^17.5.1 | Git hooks |
| Playwright + @vitest/browser-playwright | latest | Tests de Storybook |

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build de producción |
| `npm run preview` | Previsualizar el build |
| `npm run typecheck` | Type-check sin emitir |
| `npm run lint` | Linting (oxlint) |
| `npm run format` | Formatear todo el proyecto (Prettier) |
| `npm run format:check` | Verificar formato |
| `npm run test` | Ejecutar tests (Vitest) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con cobertura |
| `npm run storybook` | Storybook dev server (puerto 6006) |
| `npm run build-storybook` | Build estático de Storybook |

## Módulos implementados

| Módulo | Ruta | Permiso |
|---|---|---|
| Dashboard | `/dashboard` | auth |
| Admin | `/admin` | `users.read` |
| Usuarios | `/admin/usuarios` | `users.read` |
| Roles | `/admin/roles` | `roles.read` |
| Permisos | `/admin/permisos` | `permissions.read` |
| Auditoría | `/admin/auditoria` | `audit.read` |
| Ajustes | `/ajustes` | auth |
| Mi perfil | `/ajustes/perfil` | auth |
| Mi actividad | `/ajustes/actividad` | `audit.read` \| `audit.read-mine` |
| Colores de marca | `/ajustes/colores` | `settings.brand` |

Rutas de autenticación: `/login`, `/register`, `/forgot-password`, `/verify-otp`, `/reset-password`, `/verify-email`, `/verify-email/confirm`.
Rutas públicas: `/terms`, `/403`, `/500`. Cualquier otra ruta cae en el 404 (`*`).

## Autorización por permisos

- **Rutas**: `RequirePrivilege` protege la ruta y redirige a `/403` si el usuario no tiene el permiso.
- **Componentes**: `Can` oculta elementos de UI sin redirigir.
- Los permisos provienen del backend en `user.permissions`, con notación de punto (`users.read`).

```tsx
import { Can } from './auth';

<Can privilege="users.write">
  <button>Suspender</button>
</Can>
```

## Documentación

- Índice de documentación por módulo: [`docs/README.md`](./docs/README.md)
- Tracker de pendientes: [`PENDIENTES.md`](./PENDIENTES.md)