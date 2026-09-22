# Páginas de administración (`src/pages/admin/`)

5 páginas de administración bajo el prefijo `/admin`. Todas viven dentro de `ProtectedRoute` + `MainLayout` y se gatean por permisos con `RequirePrivilege`.

## Inventario

| Página | Ruta | Propósito | Permisos | Lazy |
|---|---|---|---|---|
| [AdminIndexPage](#adminindexpage) | `/admin` | Hub con 4 cards gateadas | `users.read` (cards: `roles.read`, `permissions.read`, `audit.read`) | Sí |
| [UsersPage](#userspage) | `/admin/usuarios` | Listar usuarios; suspender/reactivar con `ConfirmDialog`; drawer de roles | `users.read` (acciones `users.write`, asignación `roles.assign`) | Sí |
| [RolesPage](#rolespage) | `/admin/roles` | CRUD de roles; crear/editar (drawer), eliminar (confirm) | `roles.read` (escritura `roles.write`, catálogo `permissions.read`) | Sí |
| [PermissionsPage](#permissionspage) | `/admin/permisos` | Catálogo de permisos, solo lectura | `permissions.read` | Sí |
| [AuditLogsPage](#auditlogspage) | `/admin/auditoria` | Tabla de eventos global (read-only) | `audit.read` | Sí |

## AdminIndexPage

Hub de administración con **4 cards** (Usuarios, Roles, Permisos, Auditoría), cada una gateada individualmente con `Can privilege="…"`. La ruta en sí exige `users.read`. Un usuario con, por ejemplo, solo `audit.read` ve únicamente la card de Auditoría.

## UsersPage

Listado de usuarios con **paginación, filtros y orden resueltos en el servidor** (`useUsers`). Comportamiento clave:

- **Paginación server-side**: la página maneja `page`/`size` con el componente compartido `Pagination`; `UserTable` ya **no** pagina en cliente, así que no hay doble paginación. Cualquier cambio de página, tamaño, filtro u orden vuelve a la página 0.
- **Filtros**: selector de estado (`ACTIVE` / `SUSPENDED` / `UNVERIFIED`, derivado igual que el badge) y búsqueda por email o nombre. La búsqueda se debouncea con `useDebouncedValue` (300 ms) para no disparar una request por tecla.
- **Orden**: selector de campo (`createdAt` default, `name`, `email`) + botón que invierte la dirección; viaja como `sort=field,dir`.
- Deriva el estado por fila: `suspended ? 'Suspendido' : isVerified ? 'Activo' : 'Sin verificar'`.
- **Suspender/reactivar con confirmación**: `ConfirmDialog` con mensaje específico por acción y variantes (`warning` para suspender, `default` para reactivar); toast de éxito/error.
- **Drawer de roles**: `UserRolesDrawer` (feature users, que consume roles) — ver [docs/features/users.md](../features/users.md#userrolesdrawer).

Consume: `useUsers`, `useSuspendUser`, `useReactivateUser`, `UserTable`, `UserRolesDrawer`, `ConfirmDialog`, `Pagination`, `useDebouncedValue`.

## RolesPage

CRUD de roles:

- **Crear/editar**: `RoleDrawer` (feature roles) — el fetch del catálogo de permisos se gatea por `permissions.read` + drawer abierto; sin `roles.write` el drawer queda en solo lectura. Ver [docs/features/roles.md](../features/roles.md#roledrawer).
- **Eliminar**: confirmación antes de borrar (delete bajo `roles.write`).

Consume: `useRoles`, `useCreateRole`, `useUpdateRole`, `useDeleteRole`, `RoleDrawer`, `RoleTable`.

## PermissionsPage

Catálogo de permisos **solo lectura**: `ResponsiveTable` con columnas `name` y `description`, filtros y paginación cliente. Consume `usePermissions`.

## AuditLogsPage

Tabla de eventos de auditoría global (read-only) con `ResponsiveTable`: columnas Acción (badge con variante danger para `FAILED`/`DENIED`), Actor (fallback `system`), Entidad, ID Entidad, IP y Fecha (`dd/MM/yyyy HH:mm`, locale español). Consume `useAuditLogs(0, 10)`.

## Notas transversales

- Sin `users.write`/`roles.write`, el backend responde 403 al intentar escribir y el client HTTP redirige a `/403` (no se ocultan solo las acciones — ver comportamiento en [errors.md](./errors.md#comportamiento-del-cliente-http)).
- No hay handlers MSW para admin en `src/test/mocks/handlers/` (solo `auth.ts`).
- `RolesPage.test.tsx` y `UsersPage.test.tsx` cubren los flujos principales.