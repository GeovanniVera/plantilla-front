# Frontend — Plantilla Admin (React + TypeScript)

Plantilla de frontend para aplicaciones admin, conectada al **backend Spring Boot** (`backend-spring`).

## Stack

| Tecnología | Versión | Propósito |
|---|---|---|
| React | ^19.2.8 | Framework UI |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite | ^8.2.0 | Build tool y dev server |
| Tailwind CSS | ^4.3.3 | Utility-first CSS |
| React Router | ^8.3.0 | Enrutamiento SPA |
| i18next | ^26.4.2 | Internacionalización |
| React Query | ^5.102.8 | Server state management |
| Storybook | ^10.5.10 | Documentación de componentes |
| Vitest + MSW | — | Testing |

## Quick Start

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
#    VITE_API_BASE=http://localhost:8080/api   ← apunta al backend

# 3. Dev server
npm run dev
```

> Requiere el backend corriendo en `http://localhost:8080`
> (ver README de `backend-spring` para levantar infraestructura).

## Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Type-check + build producción |
| `npm run test` | Ejecutar tests |
| `npm run test:coverage` | Tests con cobertura |
| `npm run lint` | Linting (oxlint) |
| `npm run format` | Formatear código (prettier) |
| `npm run typecheck` | Type-check sin emitir |
| `npm run storybook` | Storybook dev server |

## Módulos implementados (v1)

| Módulo | Ruta | Permisos |
|---|---|---|
| Dashboard | `/dashboard` | auth |
| Usuarios | `/admin/usuarios` | `users.read` / `users.write` |
| Roles | `/admin/roles` | `roles.read` / `roles.write` |
| Permisos | `/admin/permisos` | `permissions.read` |
| Auditoría (admin) | `/admin/auditoria` | `audit.read` / `audit.read-mine` |
| Mi perfil | `/ajustes/perfil` | auth |
| Mi actividad | `/ajustes/actividad` | `audit.read` / `audit.read-mine` |
| Colores de marca | `/ajustes/colores` | `settings.brand` |

## Autorización por permisos

- **Rutas**: `RequirePrivilege` redirige a `/403` si no tiene el permiso
- **Componentes**: `Can` oculta sin redirigir
- Los permisos vienen del backend en `user.permissions`

```tsx
import { Can } from './auth'

<Can privilege="users.write">
  <button>Suspender</button>
</Can>
```

## Documentación

La documentación detallada del template está en [`docs/`](./docs/README.md).

Pendientes de la v1: [PENDIENTES.md](./PENDIENTES.md)

## Licencia

Privado — Uso interno.