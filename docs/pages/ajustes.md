# Páginas de ajustes (`src/pages/ajustes/`)

3 páginas bajo el prefijo `/ajustes`, dentro de `ProtectedRoute` + `MainLayout`. La ruta `/ajustes/colores` existe pero no es una página: renderiza `BrandColorSettings` (feature settings) directamente desde `App.tsx`.

## Inventario

| Página | Ruta | Propósito | Permisos | Lazy |
|---|---|---|---|---|
| [AjustesIndex](#ajustesindex) | `/ajustes` | Hub de ajustes: Mi perfil (siempre), Mi actividad (anyOf), Colores de marca | `audit.read`/`audit.read-mine`, `settings.brand` | Sí |
| [PerfilPage](#perfilpage) | `/ajustes/perfil` | Editar nombre + foto (multipart); email read-only; badge de verificación | Autenticado | Sí |
| [MiActividadPage](#miactividadpage) | `/ajustes/actividad` | Actividad propia, filtro por acción + paginación (`PAGE_SIZE` 5) | `audit.read` **o** `audit.read-mine` | Sí |

## AjustesIndex

Hub con 3 cards:

| Card | Ruta | Gate |
|---|---|---|
| Mi perfil | `/ajustes/perfil` | Siempre visible (solo autenticación) |
| Mi actividad | `/ajustes/actividad` | `Can anyOf: ['audit.read', 'audit.read-mine']` |
| Colores de marca | `/ajustes/colores` | `Can privilege: 'settings.brand'` |

## PerfilPage

Edición del perfil del usuario autenticado:

- **Nombre + foto** con envío multipart (`PUT /auth/me` vía `useUpdateProfile` de la feature profile). Ver [docs/features/profile.md](../features/profile.md).
- **Email en solo lectura**: el cambio de email no está habilitado en el backend, el frontend lo trata como no editable.
- **Badge de verificación**: muestra el estado del email.
- `onSuccess` de la mutación invalida `['auth', 'me']` para refrescar el usuario en contexto.

## MiActividadPage

Actividad del usuario autenticado (`useMyAuditLogs`):

- **`PAGE_SIZE = 5`** por página (constante local).
- **Filtro por acción**: `Select` con opciones de `getActionFilterOptions()` + opción "Todos los eventos" (valor `''` seleccionable de nuevo tras filtrar — el placeholder no permite re-seleccionar).
- Cambiar el filtro resetea la página a 0.
- Renderiza `AuditActivityItem` (filas expandibles) y `Pagination` (`currentPage = page + 1`, onPageChange convierte a base 0).
- Estados vacíos diferenciados: "Sin actividad registrada" (sin filtro) vs "Sin resultados para este filtro".

## Notas transversales

- El gate de `/ajustes/actividad` en `App.tsx` es `RequirePrivilege anyOf={['audit.read', 'audit.read-mine']}` — basta con cualquiera de los dos.
- El gate de `/ajustes/colores` es `RequirePrivilege privilege="settings.brand"`. Recuerda: `settings.brand` es cliente-solo (persistencia `localStorage`), ver [docs/features/settings.md](../features/settings.md#deudas-conocidas).
- El archivo muerto `src/routes/ajustes.tsx` duplica `/ajustes` y `/ajustes/colores` **sin guards** y no se importa (ver deudas en [README](./README.md#deudas-conocidas)).