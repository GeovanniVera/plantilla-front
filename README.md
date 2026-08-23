# Semilla Tecnológica — React Design System

Plantilla personal reusable construida con **React + TypeScript**, orientada a la
composición y a la creación de componentes reutilizables. Incluye un design system
organizado por familias, sistema de theming de marca, sidebar configurable y
showcases interactivos para probar y demostrar los componentes.

---

## Stack

| Tecnología | Versión | Propósito |
|------------|---------------|--------------------------------------|
| React | ^19.2.8 | Framework UI |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite | ^8.2.0 | Build tool y dev server |
| React Router | ^8.3.0 | Enrutamiento SPA |
| react-icons | ^5.7.0 | Iconografía (Lucide) |
| date-fns | ^4.4.0 | Utilidades de fechas |
| react-day-picker | ^10.0.1 | Calendario / selección de rango |
| Storybook | ^10.5.10 | Documentación y desarrollo de componentes |
| Oxlint | ^1.75.0 | Linting |
| Vitest + Playwright | latest | Testing (configuración base vía Storybook addon) |

## Scripts

```bash
npm run dev              # Dev server (Vite)
npm run build            # tsc -b && vite build
npm run lint             # oxlint
npm run preview          # Sirve el build de producción
npm run storybook        # Storybook en http://localhost:6006
npm run build-storybook  # Build estático de Storybook
```

---

## Filosofía

- **Composition over configuration**: los componentes se arman combinando piezas
  más pequeñas en lugar de acumular props de configuración.
- **Reutilización**: cada pieza está pensada para salir de su página de origen y
  vivir como parte de una plantilla.
- **Separación de responsabilidades**: cada familia tiene un rol claro y las
  herramientas de demo viven separadas del código reusable.
- **Bajo acoplamiento**: los estilos son CSS Modules por componente; ninguna
  familia importa los estilos de otra.
- **TypeScript primero**: contratos explícitos (`Props`, tipos exportados) antes
  que inferencia silenciosa.

### Modelo conceptual

```
Primitive     pieza atómica sin opinión de negocio (Button, Badge, Input)
   ↓
Base          núcleo de renderizado compartido entre variantes
   ↓
Parts         piezas de comportamiento/toolbar reutilizables
   ↓
Variant       componente completo que agrega comportamiento (DataTable)
   ↓
Composition   páginas que combinan variantes y parts
```

No todos los componentes necesitan todas las capas: un `Badge` es solo primitive;
la familia de tablas usa las cinco.

---

## Arquitectura

```
src/
├── components/
│   ├── primitives/          # Átomos: Button, Badge, Input, Select, Checkbox,
│   │                        # Radio, Textarea, StatusDot
│   ├── layout/              # Estructura de contenido: Card, StatCard, FormLayout
│   ├── forms/               # Captura de datos: FormField + tipos compartidos
│   ├── data-display/        # Datos: calendar/, table/
│   │   ├── calendar/        # Calendar, CalendarView
│   │   └── table/           # BaseTable, DataTable, ExcelTable + hooks/ + parts/
│   ├── navigation/          # Tabs, Breadcrumb, sidebar/
│   ├── feedback/            # ToastProvider, Toast, useToast
│   └── overlays/            # Modal, Drawer, ConfirmDialog, DrawerStack
├── dev/                     # Herramientas de demo (NO forman parte de la librería)
│   ├── form-builder/        # Constructor de formularios del showcase
│   ├── showcase/            # CodeBlock / ExampleCard reutilizados por demos
│   └── theme-tools/         # BrandColorSettings, ContrastChecker, ThemePreview
├── theme/                   # Infraestructura de theming (reusable)
├── hooks/                   # useIsMobile, useMediaQuery
├── layouts/                 # MainLayout (sidebar + outlet)
├── pages/                   # Showcases, demos y app de auditoría
└── main.tsx                 # Providers: BrowserRouter → ThemeProvider → ToastProvider
```

Cada familia expone sus exports públicos mediante un barrel `index.ts`.

## Responsabilidad por familia

| Familia | Pregunta que responde | Contenido actual |
|---|---|---|
| `primitives` | ¿Es una pieza universal sin opinión de negocio? | Button, Badge, Input, Select, Checkbox, Radio/RadioGroup, Textarea, StatusDot |
| `layout` | ¿Estructura o agrupa contenido? | Card, StatCard, FormLayout |
| `forms` | ¿Captura datos del usuario? | FormField, tipos compartidos del dominio formulario |
| `data-display` | ¿Muestra datos? | `calendar/` y `table/` |
| `navigation` | ¿Ayuda a navegar? | Tabs, Breadcrumb, familia sidebar |
| `feedback` | ¿Comunica estado al usuario? | ToastProvider / Toast / useToast |
| `overlays` | ¿Aparece sobre el contenido? | Modal, Drawer, ConfirmDialog, DrawerStack |

## Composición de tablas

Caso real de base + variantes + parts:

```
BaseTable            núcleo de renderizado (named export)
├── DataTable        tabla de lectura: filtros y paginación
└── ExcelTable       grilla editable: editores de celda y columna líder
```

- `BaseTable` aporta el render compartido del `<table>` y expone slots de
  composición: `styles` (inyección del módulo CSS de la variante),
  `composeCell`, `composeHeader`, `leadingColumn`, `wrapperProps` y `tableRef`.
  No sabe nada de filtros, edición ni paginación.
- `DataTable` y `ExcelTable` componen ese núcleo y agregan su comportamiento:
  filtros y paginación (`useTableFilters`, `useTablePagination`) en ambas;
  edición con `CellEditors` y columna numérica (`leadingColumn`) en ExcelTable.
- Las piezas de toolbar (`FilterBar`, `Pagination`, `ColumnToggle`,
  `DensitySelector`, `BulkActionsBar`, `SearchHighlight`) viven en `parts/` y
  son parte de la API componible pública.

## Imports y exports

Política vigente:

- **Barrels por familia** (`primitives/index.ts`, `layout/index.ts`,
  `forms/index.ts`, etc.). El punto de entrada preferido de cada familia es su
  barrel.
- **Sin barrel raíz** de `components/`: no existe un `components/index.ts`.
- **Exports explícitos** en cada barrel (sin `export *`).
- **Aliases** configurados en `tsconfig.app.json` y `vite.config.ts`:
  `@components/*`, `@hooks/*`, `@theme/*`, `@dev/*`.
- **Imports relativos locales** dentro de una misma familia cuando son más
  claros (por ejemplo, dentro de `data-display/table/`).

```tsx
// Barrel de familia (preferido)
import { Input, Select, Checkbox } from '@components/primitives'
import { Card, StatCard } from '@components/layout'

// Deep import válido cuando hace falta precisión
import { type Column } from '@components/data-display/table/types'

// Fuera de components/
import { useTheme } from '@theme/useTheme'
import { CodeBlock } from '@dev/showcase/Showcase'
import { useMediaQuery } from '@hooks/useMediaQuery'
```

## Cómo crear un nuevo componente

1. Elegí familia según la pregunta clave:

| Si el componente… | Va a |
|---|---|
| es una pieza universal | `primitives` |
| estructura contenido | `layout` |
| captura datos | `forms` |
| muestra datos | `data-display` |
| navega | `navigation` |
| comunica estado | `feedback` |
| aparece sobre contenido | `overlays` |

2. Creamos el `.tsx` + `.module.css`, tipamos las Props y las exportamos desde
   el barrel de la familia con export explícito.
3. Si necesita lógica reutilizable, extraé hooks o parts antes de duplicar.
4. Agregá una story si la pieza es visualmente demostrable.

> En una plantilla reusable, "0 consumidores internos" **no** significa código
> muerto: puede ser contrato deliberado para consumidores futuros. Antes de
> eliminar un export, preguntate si es implementación interna o API pública.

## Storybook

Storybook sirve para desarrollar y documentar componentes de forma aislada.
Las stories viven junto a sus componentes (co-locadas):

- `src/components/primitives/*.stories.tsx` (Badge, Button)
- `src/components/navigation/sidebar/*.stories.tsx` (NavGroup, NavItem, SidebarLogo, UserAvatar, UserClock)
- `src/components/layout/Card.stories.tsx`
- `src/components/data-display/table/stories/` (DataTable, ExcelTable + dataset compartido)

```bash
npm run storybook   # http://localhost:6006
# Smoke test headless:
npx storybook dev --ci --smoke-test
```

La config vive en `.storybook/main.ts` (glob: `../src/**/*.stories.*`) e incluye
addons de docs, a11y y vitest.

## Instalación y ejecución

```bash
npm install
npm run dev          # App de demos en desarrollo
npm run storybook    # Documentación aislada de componentes
npm run lint         # Lint
npm run build        # Verificación de tipos + bundle de producción
npm run preview      # Servir el build
```

Requisito: Node.js con soporte para Vite 8.

## Theming

Infraestructura reusable en `src/theme/`:

- `tokens.ts` — tokens de diseño (colores, tipografía, espaciados).
- `ThemeProvider.tsx` + `theme-context.ts` — contexto de tema de marca.
- `persistence.ts` — persistencia del tema.
- `contrast.ts` — utilidades de contraste.
- `useTheme.ts` — hook público de consumo.

Las herramientas de demo viven aparte, en `src/dev/theme-tools/`
(`BrandColorSettings`, `ContrastChecker`, `ThemePreview`): consumen la
infraestructura pero no forman parte de la librería de componentes.

## Rutas / demos

| Ruta | Renderiza |
|---|---|
| `/`, `/componentes` | Índice de componentes |
| `/componentes/botones` | Showcase de botones |
| `/componentes/cards` | Showcase de cards |
| `/componentes/tablas` | TablesShowcase (DataTable / ExcelTable) |
| `/componentes/formularios` | FormShowcase (form builder dinámico) |
| `/componentes/modales` | Showcase de modales |
| `/componentes/notificaciones` | Showcase de toasts |
| `/componentes/navegacion` | Showcase de tabs/breadcrumbs/sidebar |
| `/componentes/calendario` | Showcase de calendario |
| `/calendario` | Demo de calendario docente |
| `/ajustes` | Índice de ajustes |
| `/ajustes/colores` | Editor de colores de marca (`@dev/theme-tools/BrandColorSettings`) |
| `/auditoria` | App de ejemplo con DataTable sobre logs de auditoría |

## Extensibilidad

La taxonomía está preparada para crecer sin reestructurar:

- **data-display**: KPIs, Charts, Progress, Status y otros visualizadores
  entrarían como nuevas familias/carpetas dentro de `data-display/`.
- **parts**: nuevas toolbars o piezas de composición junto a las existentes de
  `table/parts/`.
- **primitives/layout**: nuevos átomos y contenedores siguen el mismo patrón
  archivo + CSS Module + barrel.

Estas extensiones aún no existen; la estructura solo garantiza que tengan un
lugar natural.

## Deuda conocida relevante para consumidores

- El prop `loading` de `DataTable`/ExcelTable se acepta pero hoy no dispara
  ningún estado de carga visual.
- `ExcelTable` ignora `column.align` en los encabezados.

Deuda interna completa y roadmap en [PENDIENTES.md](./PENDIENTES.md).
