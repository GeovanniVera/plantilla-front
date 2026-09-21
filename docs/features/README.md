# Features — Inventario

La aplicación organiza su lógica de negocio en **5 features** bajo `src/features/`. Cada feature agrupa servicios (capa de datos), hooks (estado del servidor con TanStack Query), componentes de UI y, cuando corresponde, utilidades.

| Feature | Carpeta | Área funcional | Permisos que consume |
|---|---|---|---|
| [Auditoría](./audit.md) | `src/features/audit/` | Registro de eventos de seguridad (global y propio) | `audit.read`, `audit.read-mine` |
| [Perfil](./profile.md) | `src/features/profile/` | Edición de nombre y foto del usuario autenticado | Ninguno específico (autenticado) |
| [Roles](./roles.md) | `src/features/roles/` | CRUD de roles, catálogo de permisos, asignación a usuarios | `roles.read`, `roles.write`, `permissions.read`, `roles.assign` |
| [Marca visual](./settings.md) | `src/features/settings/` | Personalización de colores de marca (cliente-solo) | `settings.brand` |
| [Usuarios](./users.md) | `src/features/users/` | Listado, suspensión y reactivación de usuarios | `users.read`, `users.write`, `roles.read`, `roles.assign` |

## Permisos usados en features

Los permisos se verifican con `hasPrivilege` (`src/auth/hooks.ts`), que hace **match exacto** (`user.permissions.includes(privilege)`) contra lo que envía el backend. Todos los permisos reales usan **dot notation** (`users.read`).

| Permiso | Feature | Uso |
|---|---|---|
| `audit.read` | audit | Auditoría global (`/admin/audit-logs`) |
| `audit.read-mine` | audit | Actividad propia (`/admin/audit-logs/mine`) |
| `roles.read` | roles, users | Ver roles; catálogo dentro del drawer de roles de usuario |
| `roles.write` | roles | Crear, editar y eliminar roles |
| `roles.assign` | roles, users | Asignar/remover roles de un usuario (botón de guardado del drawer) |
| `permissions.read` | roles | Cargar catálogo de permisos en el drawer de roles |
| `settings.brand` | settings | Página de colores de marca (`/ajustes/colores`) |
| `users.read` | users | Listar usuarios |
| `users.write` | users | Suspender/reactivar usuarios |

> **Nota de convención**: los JSDoc de `src/auth/guards.tsx`, `src/auth/Can.tsx`, `src/auth/hooks.ts` y `src/auth/types.ts` documentan permisos con **colon notation** (`users:read`), mientras que el código real usa dot notation. Ver [Deudas conocidas](../pages/README.md#deudas-conocidas).

## Mapa de dependencias entre features

```
settings  →  src/theme/   (ThemeProvider, tokens, persistence, contrast, semantic)
users     →  roles        (useRoles, useAssignRolesToUser, tipos Role/Permission)
roles     →  (independiente)
audit     →  (independiente)
profile   →  (independiente)
```

- **settings** no tiene servicios ni hooks propios: sus componentes (`BrandColorSettings`, `ThemePreview`, `ContrastChecker`) consumen directamente `useTheme()` de `src/theme/`. Persistencia solo en `localStorage` (clave `brand-theme-v1`) — no existe servicio de backend para tema.
- **users** importa de **roles**: `UserRolesDrawer` usa `useRoles`, `useAssignRolesToUser` y los tipos `Role`/`Permission`. A la inversa, **roles** no depende de **users**.

## Consumidores en páginas

| Feature | Páginas que la consumen |
|---|---|
| audit | `AuditLogsPage` (`/admin/auditoria`), `MiActividadPage` (`/ajustes/actividad`) |
| profile | `PerfilPage` (`/ajustes/perfil`) |
| roles | `RolesPage` (`/admin/roles`), `PermissionsPage` (`/admin/permisos`), `UsersPage` (`/admin/usuarios`) |
| settings | `AjustesIndex` → `/ajustes/colores` (ruta definida en `App.tsx`, renderiza `BrandColorSettings`) |
| users | `UsersPage` (`/admin/usuarios`) |

## Reglas transversales

- Todos los servicios retornan `Promise<ApiResponse<T>>` (contrato de `src/lib/api/types/api-response.ts`).
- Todos los hooks de query invalidan las claves correctas tras mutaciones (`['admin', 'roles']`, `['admin', 'users']`, `['auth', 'me']`).
- Las queries sensibles se gatean por privilegio y por estado de UI (p. ej. drawer abierto) para no disparar peticiones innecesarias.