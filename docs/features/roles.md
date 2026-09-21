# Feature: Roles (`src/features/roles/`)

CRUD de roles, catálogo de permisos y asignación de roles a usuarios. Es la feature más dependida: **users** consume sus hooks y tipos.

## Estructura

```
src/features/roles/
├── components/RoleDrawer.tsx        # Crear / editar / ver rol
├── components/RoleTable.tsx         # Tabla de roles con acciones
├── hooks/useRoles.ts                # Queries y mutaciones
└── services/role.service.ts         # Tipos + cliente HTTP
```

## Servicios (`services/role.service.ts`)

| Endpoint | Método | Propósito |
|---|---|---|
| `GET /admin/roles` | `roleService.list()` | Lista de roles. |
| `GET /admin/roles/:id` | `roleService.get(id)` | Rol por ID. |
| `POST /admin/roles` | `roleService.create(data: CreateRoleData)` | Crear rol (`name`, `description?`, `permissionIds?`). |
| `PUT /admin/roles/:id` | `roleService.update(id, data: UpdateRoleData)` | Actualizar rol. |
| `DELETE /admin/roles/:id` | `roleService.delete(id)` | Eliminar rol. |
| `GET /admin/permissions` | `roleService.listPermissions()` | Catálogo de permisos del sistema. |
| `POST /admin/users/:userId/roles` | `roleService.assignRolesToUser(userId, roleIds)` | Asignar roles a un usuario (body `{ roleIds }`). |
| `DELETE /admin/users/:userId/roles/:roleId` | `roleService.removeRoleFromUser(userId, roleId)` | Remover un rol de un usuario. |

### Tipos

- `Permission` — `id`, `name`, `description`.
- `Role` — `id`, `name`, `description`, `permissions: Permission[]`.
- `CreateRoleData` — `name`, `description?`, `permissionIds?`.
- `UpdateRoleData` — `name?`, `description?`, `permissionIds?`.

## Hooks (`hooks/useRoles.ts`)

| Hook | Tipo | Query key / invalidación | Notas |
|---|---|---|---|
| `useRoles({ enabled })` | Query | `['admin', 'roles']` | Gateable por `enabled` (default `true`). |
| `usePermissions({ enabled })` | Query | `['admin', 'permissions']` | Catálogo de permisos; gateable por `enabled`. |
| `useCreateRole()` | Mutation | Invalida `['admin', 'roles']` | |
| `useUpdateRole()` | Mutation | Invalida `['admin', 'roles']` | Recibe `{ id, data }`. |
| `useDeleteRole()` | Mutation | Invalida `['admin', 'roles']` | |
| `useAssignRolesToUser()` | Mutation | Invalida `['admin', 'users']` | Recibe `{ userId, roleIds }`. |
| `useRemoveRoleFromUser()` | Mutation | Invalida `['admin', 'users']` | Recibe `{ userId, roleId }`. **Sin consumidor en la UI.** |

> `UseAdminQueryOptions` se define localmente en este archivo: permite gatear el fetch según el privilegio del usuario (la plantilla no tiene el `useProducts.ts` de la app original donde vivía ese tipo).

## Componentes

### `RoleDrawer`

Drawer para crear, editar o ver un rol. Detalles clave:

- **Gate del fetch de permisos**: `usePermissions({ enabled: canReadPermissions && isOpen })` — solo pide el catálogo si el usuario tiene `permissions.read` **y** el drawer está abierto.
- **Fallback read-only**: sin `roles.write`, el drawer muestra el rol en solo lectura (no ofrece formulario de edición).
- Sincroniza estado local (`name`, `description`, `selectedPerms`) con el rol al abrir; si `role` es `null` resetea el formulario (modo crear).

### `RoleTable`

Tabla de roles con acciones. La acción de eliminar se renderiza solo bajo `roles.write`.

## Permisos

| Permiso | Uso |
|---|---|
| `roles.read` | Ver roles (gate de ruta `/admin/roles`). |
| `roles.write` | Crear/editar (RoleDrawer) y eliminar (RoleTable). |
| `permissions.read` | Cargar catálogo de permisos en RoleDrawer. |
| `roles.assign` | Asignar roles a usuarios (consumido en `users/`). |

## Consumidores

- `RolesPage` (`/admin/roles`) → `useRoles`, `RoleDrawer`, `RoleTable`.
- `PermissionsPage` (`/admin/permisos`) → `usePermissions`.
- `UsersPage` (`/admin/usuarios`) → `UserRolesDrawer` usa `useRoles` + `useAssignRolesToUser` de esta feature.

## Deudas conocidas

- `useRemoveRoleFromUser` y `roleService.removeRoleFromUser` **no tienen consumidor en la UI**: el drawer de roles de usuario solo asigna (reemplaza el set completo); no hay flujo para remover un rol individual.
- `roleService.get` tampoco se usa desde ninguna página (el hook `useUser` de users sí usa `userService.get`, también sin consumidor).