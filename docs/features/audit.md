# Feature: Auditoría (`src/features/audit/`)

Registro de eventos de seguridad y de negocio, con dos vistas: **auditoría global** (todos los actores, requiere `audit.read`) y **actividad propia** (solo el usuario autenticado, requiere `audit.read-mine`).

## Estructura

```
src/features/audit/
├── components/AuditActivityItem.tsx   # Fila de actividad expandible
├── hooks/useAudit.ts                  # Queries de auditoría
├── services/audit.service.ts          # Tipos + cliente HTTP
└── utils/audit-labels.ts              # Labels legibles para acciones y entidades
```

## Servicios (`services/audit.service.ts`)

| Endpoint | Método | Propósito |
|---|---|---|
| `GET /admin/audit-logs?page&size&action&actorId&entityType&entityId&from&to` | `auditService.list(page, size, filters)` | Auditoría global de todos los actores. Requiere `audit.read`. |
| `GET /admin/audit-logs/mine` (mismos filtros **sin** `actorId`) | `auditService.listMine(page, size, filters)` | Actividad del usuario autenticado. Requiere `audit.read-mine`. |

**Anti-IDOR**: en `listMine` el cliente no envía `actorId` deliberadamente; el backend fija el actor al usuario de la sesión aunque el cliente lo intente.

### Tipos

- `AuditLog` — `id`, `requestId?`, `actorId?`, `action`, `entityType?`, `entityId?`, `before?` (`Record<string, unknown>`), `after?`, `ipAddress?`, `userAgent?`, `createdAt`.
- `PaginatedAuditLogs` — `content: AuditLog[]`, `totalElements`, `totalPages`, `number`, `size`.
- `AuditFilters` — `action?`, `actorId?`, `entityType?`, `entityId?`, `from?`, `to?`.

## Hooks (`hooks/useAudit.ts`)

| Hook | Query key | Notas |
|---|---|---|
| `useAuditLogs(page, size, filters)` | `['admin', 'audit', page, size, filters]` | Auditoría global. |
| `useMyAuditLogs(page, size, filters)` | `['audit', 'mine', page, size, filters]` | Actividad propia. |

Ambos lanzan error si `response.success` es falso y devuelven `response.data` en caso de éxito.

## Componentes

### `AuditActivityItem`

Fila expandible de actividad. Colapsada muestra ícono + acción + fecha (formateada en español con `date-fns`). Al expandir despliega detalles del evento: entidad (via `describeEntity`), IP, `requestId`, actor y el diff **before → after** de los campos modificados. Los tonos de color dependen de la acción (success/danger/warning/info/neutral).

## Utils (`utils/audit-labels.ts`)

| Función | Propósito |
|---|---|
| `getActionLabel(action)` | Devuelve `AuditLabel` (claves i18n `titleKey`/`titleOtherKey`?/`filterKey`, ícono, tono) para una acción. |
| `getActionTitle(log, t)` | Resuelve el título visible **según la relación actor/entidad** y traduce con `t`. |
| `getActionFilterOptions()` | Opciones del filtro de tipo de evento (fuente única: `ACTION_LABELS`); devuelve `{ value, filterKey }` para que el llamador traduzca. |
| `describeEntity(entityType?, entityId?)` | Describe la entidad afectada en lenguaje legible (p. ej. `usuario (abc12345…)`). |

Los textos ya no están hardcodeados en el código: son claves i18n (`audit.actions.<ACTION>.title`, `.titleOther`, `.filter` y `audit.actions.unknown` en `src/lib/i18n/locales/{es,en}.json`).

**Títulos actor/entidad-aware**: el título se elige según `log.actorId` vs `log.entityId`. Para las acciones dependientes de la relación (`ACCOUNT_SUSPENDED`, `ACCOUNT_REACTIVATED`, `ROLE_CHANGED`) se usa `.titleOther` cuando el actor actuó sobre otra entidad y `.title` (perspectiva propia) en caso contrario. Si falta cualquiera de los dos ids se considera "no es otra entidad" de forma explícita (cubre `LOGIN_FAILED` de email desconocido, con ambos ids `null`). Como `/admin/audit-logs/mine` filtra por `actorId = usuario autenticado`, en esa vista todos los eventos son acciones que el usuario hizo sobre terceros; el wording `title` propio solo aplica a acciones sobre la propia cuenta (`LOGIN_*`, `LOGOUT`, `PASSWORD_CHANGED`) y a las relaciones actor==entidad.

**Filtros neutros**: `getActionFilterOptions()` expone la clave neutra `.filter` (p. ej. "Suspensión de cuenta"), separada del título en perspectiva del actor (p. ej. "Suspendiste una cuenta"). `AuditActivityItem` usa `getActionTitle`, mientras que el dropdown de `MiActividadPage` usa `filterKey`.

Acciones mapeadas: `LOGIN_SUCCEEDED`, `LOGIN_FAILED`, `LOGOUT`, `ACCOUNT_SUSPENDED`, `ACCOUNT_REACTIVATED`, `PASSWORD_CHANGED`, `ROLE_CHANGED`. Acciones desconocidas caen en el label genérico (`audit.actions.unknown` = "Evento de seguridad", tono neutral).

## Permisos

| Permiso | Alcance |
|---|---|
| `audit.read` | `list()` — auditoría global |
| `audit.read-mine` | `listMine()` — actividad propia |

`MiActividadPage` (`/ajustes/actividad`) se gatea con `anyOf: ['audit.read', 'audit.read-mine']` en `App.tsx`.

## Consumidores

- `AuditLogsPage` (`/admin/auditoria`) → `useAuditLogs(0, 10)` en una `ResponsiveTable` de solo lectura.
- `MiActividadPage` (`/ajustes/actividad`) → `useMyAuditLogs` con `PAGE_SIZE = 5`, filtro por acción y paginación.

## Deudas conocidas

- No hay handlers MSW para auditoría en `src/test/mocks/handlers/` (solo existe `auth.ts`).
- `AuditLogsPage` no expone filtros de rango de fechas ni de actor desde la UI (el servicio los soporta).