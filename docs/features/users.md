# Feature: Usuarios (`src/features/users/`)

Administración de usuarios del sistema: listado paginado, suspensión, reactivación y gestión de roles desde un drawer.

## Estructura

```
src/features/users/
├── components/UserRolesDrawer.tsx   # Drawer de asignación de roles
├── components/UserStatusBadge.tsx   # Badge de estado (Suspendido / Sin verificar / Activo)
├── components/UserTable.tsx         # Tabla con acciones por fila
├── hooks/useUsers.ts                # Queries y mutaciones
└── services/user.service.ts         # Tipos + cliente HTTP
```

## Servicios (`services/user.service.ts`)

| Endpoint | Método | Propósito |
|---|---|---|
| `GET /admin/users?page&size&sort&status&search` | `userService.list(page, size, filters)` | Listado paginado, filtrado y ordenado **en servidor**. |
| `GET /admin/users/:id` | `userService.get(id)` | Usuario por ID. |
| `POST /admin/users/:id/suspend` | `userService.suspend(id)` | Suspender usuario. |
| `POST /admin/users/:id/reactivate` | `userService.reactivate(id)` | Reactivar usuario. |

### Tipos

- `AdminUser` — `id`, `email`, `name`, `roles: string[]`, `isVerified`, `suspended`, `createdAt`.
- `PaginatedUsers` — `content: AdminUser[]`, `totalElements`, `totalPages`, `number`, `size`.
- `UserListFilters` — `status?: 'SUSPENDED' | 'ACTIVE' | 'UNVERIFIED'`, `search?`, `sort?: 'name' | 'email' | 'createdAt'`, `direction?: 'asc' | 'desc'`.
- `UserStatusFilter`, `UserSortField`, `SortDirection` — alias de los literales anteriores.

## Hooks (`hooks/useUsers.ts`)

| Hook | Tipo | Query key / invalidación | Notas |
|---|---|---|---|
| `useUsers(params)` | Query | `['admin', 'users', { page, size, sort, direction, status, search }]` | Listado server-side; `placeholderData: keepPreviousData` para no parpadear al paginar/filtrar. |
| `useUser(id)` | Query | `['admin', 'users', id]` | `enabled: !!id`. **Sin consumidor en la UI.** |
| `useSuspendUser()` | Mutation | Invalida `['admin', 'users']` | |
| `useReactivateUser()` | Mutation | Invalida `['admin', 'users']` | |

## Componentes

### `UserTable`

Tabla de usuarios con acciones por fila. Las acciones **suspend / reactivate** se renderizan solo bajo `users.write` (`Can`). Recibe `users` (la página actual), `onSuspend`, `onReactivate` y `onRowClick`. La **paginación y los filtros internos de `ResponsiveTable` están desactivados**: el servidor ya entrega una página filtrada y ordenada, y activarlos re-cortaría en cliente lo recibido (doble paginación).

### `UserStatusBadge`

Badge de estado derivado de `suspended` / `isVerified`: **Suspendido**, **Sin verificar** o **Activo**.

### `UserRolesDrawer`

Drawer de roles para un usuario. Detalles de implementación relevantes:

- **Ref estable `EMPTY_ROLES`**: si el fetch está deshabilitado, `data` queda `undefined`; un `[]` inline cambiaría de identidad en cada render y realimentaría el `useEffect` que sincroniza `selectedRoles`.
- **Gate de catálogo**: `useRoles({ enabled: canReadRoles && isOpen })` — pide el catálogo solo con `roles.read` y drawer abierto.
- **Guard de catálogo cargado**: `handleSave` retorna temprano si `!user || !isCatalogLoaded` para que la UI **no envíe un set que no pudo mostrar** (si no hay catálogo, `selectedRoles` queda vacío). El backend igual rechazaría un `roleIds` vacío con 400; el guard es defensa extra, no control de borrado.
- **Vista read-only**: sin `roles.assign`, el drawer muestra los roles actuales sin picker ni botón de guardado.
- Los nombres de `user.roles` (fuente `users.read`) son la fuente de verdad de los roles del usuario; el catálogo solo aporta descripciones.

## Permisos

| Permiso | Uso |
|---|---|
| `users.read` | Ver listado (gate de ruta `/admin/usuarios`). |
| `users.write` | Acciones suspend/reactivate en `UserTable`. |
| `roles.read` | Cargar catálogo de roles en `UserRolesDrawer`. |
| `roles.assign` | Mostrar picker y guardar asignación en `UserRolesDrawer`. |

## Consumidores

- `UsersPage` (`/admin/usuarios`) → `useUsers`, `useSuspendUser`, `useReactivateUser`, `UserTable`, `UserRolesDrawer`; confirma suspend/reactivate con `ConfirmDialog` + toasts.

## Deudas conocidas

- `useUser(id)` y `userService.get(id)` **no tienen consumidor en la UI** (la página lista con `useUsers` y nunca abre detalle individual).
- No hay handlers MSW para admin/users en `src/test/mocks/handlers/` (solo existe `auth.ts`).