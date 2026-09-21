# Design system (`src/components/`)

Design system de la plantilla, sincronizado con el código real en `src/components/`. Cubre primitives, forms, overlays, feedback, navigation, layout y data-display (tablas + calendario).

## Cómo consumir el design system

No existe un `index.ts` raíz de la librería. El consumo se hace por **barrels de familia** (un `index.ts` por familia) y, cuando un componente no está en su barrel, por **deep import** directo al archivo.

| Familia | Barrel | Ruta de importación |
|---|---|---|
| Primitives | `primitives/index.ts` | `@components/primitives` |
| Forms | `forms/index.ts` | `@components/forms` |
| Overlays | `overlays/index.ts` | `@components/overlays` |
| Feedback | `feedback/index.ts` | `@components/feedback` |
| Navigation | `navigation/index.ts` | `@components/navigation` |
| Layout | `layout/index.ts` | `@components/layout` |
| Data display | `data-display/table/index.ts` y `data-display/calendar/index.ts` | `@components/data-display/table`, `@components/data-display/calendar` |

Los barrels solo importan módulos hoja (nunca otro barrel de familia), lo que mantiene el grafo de dependencias acíclico.

### Lo que NO se exporta por barrel (deep import obligatorio)

| Componente | Ruta de deep import | Razón |
|---|---|---|
| `ErrorBoundary` | `@components/ErrorBoundary` | Componente de clase único, fuera de cualquier familia |
| Componentes de `sidebar/` (`Sidebar`, `NavItem`, `NavGroup`, `SidebarLogo`, `UserAvatar`, `UserClock`) | `@components/navigation/sidebar/...` | Acoplados a la app (react-router, auth) |
| `CheckboxSearchList` | `@components/forms/CheckboxSearchList` | Utility específica, no parte del contrato público de forms |
| `Toast` (item interno) | `@components/feedback/Toast` | Detalle de implementación de `ToastProvider` |
| `ResponsiveTable` | `@components/data-display/table/ResponsiveTable` | Variante responsiva, no parte del contrato de tabla |
| Hooks y partes internas de tabla (`useTableFilters`, `useTablePagination`, `useFilterableColumns`, `FilterHeader`, `FilterDropdown`, `CellEditors`, etc.) | deep import | Detalles de composición interna |

## Inventario por familia

| Guía | Contenido |
|---|---|
| [Primitives](primitives.md) | `Button`, `Input` (dual API), `Select`, `Textarea`, `Checkbox`, `Radio`, `Badge`, `StatusDot`, puente `Form.module.css` |
| [Forms](forms.md) | `useForm`, `Form`, `FormField`, `PasswordRequirements`, `FormContext`/`useFormContext`, `CheckboxSearchList`, contratos de props en `forms/types.ts` |
| [Overlays](overlays.md) | `Modal`, `Drawer`, `DrawerStack`, `ConfirmDialog`, `ModalContext`/`useModalClose` |
| [Feedback](feedback.md) | `ToastProvider`/`useToast`, `Spinner`, `Skeleton` + presets |
| [Navigation](navigation.md) | `Breadcrumb`, `Tabs`, sidebar completo (`Sidebar`, `NavItem`, `NavGroup`, `SidebarLogo`, `UserAvatar`, `UserClock`) |
| [Layout](layout.md) | `Card`, `StatCard`/`StatCardGroup`, `FormLayout` |
| [Data display](data-display.md) | Tablas (`BaseTable`, `DataTable`, `ExcelTable`, `ResponsiveTable`, hooks y parts) y calendario (`Calendar`, `DatePicker`, `CalendarView`, helpers) |
| [Patrones](patterns.md) | Los 10 patrones de diseño reales del sistema, con ejemplos de dónde se usan |

## Convenciones transversales

- **Styling**: Tailwind v4 con tokens CSS vars (ver `src/styles/tailwind.css`). Quedan 5 CSS Modules residuales: `Form.module.css`, `Sidebar.module.css`, `BaseTable.module.css`, `ExcelTable.module.css` y `Calendar.module.css`.
- **Iconografía**: `react-icons/lu` (Lucide). El tipo `IconType` de `react-icons` aparece en los contratos de `sidebar/types.ts` y `StatCard`.
- **Textos de UI**: hardcodeados en español (labels "Cerrar", "Volver", "Colapsar", "Expandir", "Sin datos", aria-label "Cargando", errores de contexto "debe usarse dentro de..."). Hay excepciones puntuales en inglés documentadas en cada guía (aria-labels del password toggle, "Week N"/"Add event" del calendario, aria-labels de `SearchHighlight`).
- **Regla de cascada 6D/6F**: cada estado visual se resuelve a un único conjunto efectivo de clases (nunca se concatenan utilities que compiten por la misma propiedad).

## Deudas conocidas

| Deuda | Detalle | Referencia |
|---|---|---|
| `BaseTableProps.loading` declarado pero nunca consumido | El prop existe en el contrato, pero ninguna implementación lo procesa | [data-display.md](data-display.md) |
| `FormField variant="floating"` roto por diseño | El label flota estático sobre el control; el float-up nunca funcionó. Bug conocido, deliberadamente no rediseñado | [forms.md](forms.md) |
| `Modal`/`Drawer` sin focus trap | El foco no se confina dentro del diálogo al abrirlo | [overlays.md](overlays.md) |
| `Tabs` sin navegación por flechas | Solo Enter/Space activan pestañas | [navigation.md](navigation.md) |
| `useToast` silencioso sin provider | Sin `ToastProvider` solo emite `console.warn`, no falla | [feedback.md](feedback.md) |
| Sin exportación Excel real | `ExcelTable` es solo la grilla editable; no hay xlsx/csv ni SheetJS en `package.json` | [data-display.md](data-display.md) |
| Semántica de filtros contraintuitiva | Set vacío almacenado = filtro activo que matchea 0 filas (Excel-style) | [data-display.md](data-display.md) |
| `ConfirmDialog` no usa el primitivo `Button` | Los botones de confirmación son custom, con estilos propios | [overlays.md](overlays.md) |
| `Spinner` inyecta `<style>` en cada render | Único CSS-in-JS crudo del sistema, con keyframes por tamaño | [feedback.md](feedback.md) |
| `Sidebar` acoplado a la app | Depende de react-router, `useAuth` y rutas hardcodeadas (`/dashboard`, `/ajustes`, `/login`) | [navigation.md](navigation.md) |

## Guías relacionadas

- [Theme](../theme/README.md) — tokens y colores semánticos que consumen los componentes.
- [Hooks](../hooks/README.md) — `useMediaQuery`/`useIsMobile`, usados por Sidebar, CalendarView y ResponsiveTable.
- [Auth](../auth/README.md) — `useAuth`, usado por el Sidebar para logout.