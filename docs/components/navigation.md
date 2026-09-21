# Navigation (`src/components/navigation/`)

Navegación: breadcrumbs, tabs y el sidebar completo. El barrel solo exporta `Tabs` y `Breadcrumb`; los componentes de `sidebar/` se consumen por deep import.

## Barrel (`navigation/index.ts`)

Exporta: `Tabs`, `Breadcrumb` + tipos (`TabsProps`, `TabsListProps`, `TabsTriggerProps`, `TabsPanelProps`, `TabsVariant`, `BreadcrumbItem`, `BreadcrumbProps`).

**No exporta** los componentes de `sidebar/` (deep import: `@components/navigation/sidebar/...`).

## Breadcrumb

| Prop | Tipo | Descripción |
|---|---|---|
| `items` | `{ label: string; href?: string; icon?: ReactNode }[]` | Items; sin `href` se renderizan como texto |
| `separator` | `'/' \| '>' \| '›' \| ReactNode` | Separador; default `LuChevronRight` |
| `className` | `string` | Clase adicional |

Comportamiento:

- Con **más de 3 items**, colapsa los del medio en un botón `…` (`LuEllipsis`) sin `onClick` funcional (el título muestra los labels colapsados).
- El **último item siempre es texto** (nunca link) y lleva `aria-current="page"`.
- `aria-label="Breadcrumb"` en el `<nav>`.

```tsx
<Breadcrumb
  items={[
    { label: 'Inicio', href: '/' },
    { label: 'Usuarios', href: '/users' },
    { label: 'Detalle' },
  ]}
/>
```

## Tabs

Pestañas controlled/uncontrolled con tres variantes.

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `string` | Modo controlado |
| `defaultValue` | `string` | Modo no controlado |
| `onChange` | `(value: string) => void` | Callback de cambio |
| `variant` | `'underline' \| 'pills' \| 'enclosed'` | Estilo |
| `children` / `className` | — | Contenido |

Piezas compound: `Tabs.List`, `Tabs.Trigger`, `Tabs.Panel`.

| `Tabs.Trigger` | Tipo | Descripción |
|---|---|---|
| `value` | `string` | Identificador |
| `children` / `icon?` / `disabled?` | — | Contenido |
| | | |

| `Tabs.Panel` | Tipo | Descripción |
|---|---|---|
| `value` | `string` | Debe coincidir con un trigger |
| `children` / `className` | — | Contenido (solo el activo se monta) |

Comportamiento:

- **Controlled/uncontrolled dual**: con `value` definido es controlado; sin él, estado interno con `defaultValue`.
- **Teclado básico**: Enter/Space activan la pestaña enfocada.
- ⚠️ **Flechas no implementadas**: no hay navegación con ArrowLeft/ArrowRight entre triggers.
- ARIA: `role="tablist"`/`role="tab"`/`role="tabpanel"`, `aria-selected`, `aria-controls`/`aria-labelledby`, `tabIndex={active ? 0 : -1}`.

```tsx
<Tabs defaultValue="info" variant="pills">
  <Tabs.List>
    <Tabs.Trigger value="info">Información</Tabs.Trigger>
    <Tabs.Trigger value="history">Historial</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="info">...</Tabs.Panel>
  <Tabs.Panel value="history">...</Tabs.Panel>
</Tabs>
```

## Sidebar (`sidebar/` — deep import)

Sidebar acoplado a la aplicación: usa `useLocation`/`useNavigate` de react-router, `useAuth` de `../../../auth` (logout navega a `/login`) y `useMediaQuery`. Su estilo vive en `Sidebar.module.css`.

```tsx
import Sidebar from '@components/navigation/sidebar/Sidebar';
```

### Sidebar (default export) + compound

| Pieza | Rol |
|---|---|
| `Sidebar` (root) | Provee `SidebarContext` (`expanded`/`toggleExpanded`); en mobile renderiza bottom bar + backdrop + scroll lock del body |
| `Sidebar.Header` | Encabezado |
| `Sidebar.Toggle` | Botón colapsar/expandir (labels "Colapsar"/"Expandir") |
| `Sidebar.Nav` | `<nav aria-label="Navegación principal">` |
| `Sidebar.Footer` | Pie |

- **Mobile** (`max-width: 768px`): bottom bar fija con menú + items (`/ajustes`, "Cerrar sesión" danger), backdrop y bloqueo de scroll del body cuando está abierto; se auto-cierra al navegar.
- **Rutas hardcodeadas**: el logo va a `/dashboard`; la bottom bar contiene `/ajustes` y logout → `/login`.
- **Textos en español hardcodeados**: "Colapsar", "Expandir", "Ajustes", "Cerrar sesión", "Abrir menú".

### NavItem

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `as` | `ElementType` | `Link` (react-router) | Componente renderizador |
| `to` | `string` | — | Se pasa al componente cuando existe |
| `icon` | `ElementType` | — | Ícono (react-icons); **hereda `currentColor`** |
| `label` | `string` | — | Texto |
| `active` | `boolean` | `false` | Estado activo |
| `danger` | `boolean` | `false` | Estilo de peligro; **gana sobre active/hover** |
| `className` / `onClick` | — | — | Extras; `onClick` se usa cuando `as="button"` |

### NavGroup

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `icon` | `ElementType` | — | Ícono del grupo |
| `label` | `string` | — | Label |
| `open` | `boolean` | `false` | Acordeón abierto |
| `active` | `boolean` | `false` | Algún hijo activo |
| `onToggle` | `() => void` | — | Click en el toggle |
| `children` | `ReactNode` | — | `NavItem` u otros |

Acordeón con la técnica **`grid-template-rows: 0fr → 1fr`** (sin adivinar max-height). El chevron solo es visible con sidebar expandido.

### SidebarLogo

| Prop | Tipo | Descripción |
|---|---|---|
| `src` | `string` | URL del logo |
| `name` | `string` | Nombre (alt + texto) |

Hardcodea `to="/dashboard"`.

### UserAvatar

| Prop | Tipo | Descripción |
|---|---|---|
| `name` | `string` | Nombre (obtiene la inicial) |
| `role` | `string` | Rol opcional |
| `photoUrl` | `string` | Foto opcional |

Fallback a la inicial sobre fondo accent si no hay `photoUrl` o la imagen falla (`onError`).

### UserClock

Reloj en vivo: `setInterval` de 1s, formato con locale `es-ES` (hora + fecha abreviada). Sin props.

### sidebar/types.ts

Modelo de datos (no usado por `NavItem.tsx`): `NavItem { to, icon: IconType, label, danger? }` y `GroupItem { id, icon: IconType, label, basePath, children: NavItem[] }`. El contrato de datos usa `IconType` de `react-icons`.

## Gotchas y deudas

- El barrel de navigation **no exporta** el sidebar: deep import obligatorio.
- `Sidebar` está **acoplado a la app**: react-router, `useAuth`, rutas hardcodeadas (`/dashboard`, `/ajustes`, `/login`) y textos en español.
- `Tabs` no tiene navegación por flechas (solo Enter/Space).
- El botón `…` del `Breadcrumb` colapsado no tiene `onClick` funcional.