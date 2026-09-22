# Data display (`src/components/data-display/`)

Tablas (familia `table/`) y calendario (familia `calendar/`). Dos barrels independientes: `data-display/table/index.ts` y `data-display/calendar/index.ts`.

---

## Tablas (`src/components/data-display/table/`)

Arquitectura de capas: **`BaseTable`** (core de render sin lógica) → **`DataTable`** (lectura: filtros + paginación) y **`ExcelTable`** (grilla editable tipo spreadsheet). Los hooks y partes de composición son consumibles públicos excepto donde se indica.

### Barrel (`table/index.ts`)

Exporta:

- Componentes: `BaseTable`, `DataTable`, `ExcelTable`.
- Tipos: `BaseTableProps`, `Column`, `FilterType`, `ExcelTableProps`, `CellPosition`.
- Partes de composición: `FilterBar`, `Pagination`, `ColumnToggle`, `DensitySelector`, `BulkActionsBar`, `SearchHighlight` (+ tipos asociados).

**No exporta**: `ResponsiveTable`, hooks internos (`useTableFilters`, `useTablePagination`, `useFilterableColumns`) ni piezas internas (`FilterHeader`, `FilterDropdown`, `TextFilterContent`, `NumberFilterContent`, `BooleanFilterContent`, `CellEditors`, `usePopoverPosition`). Deep import para esos casos.

### Contrato de columnas (`Column<T>`)

| Prop | Tipo | Descripción |
|---|---|---|
| `key` | `string` | Clave del objeto a mostrar |
| `header` | `string` | Título de cabecera |
| `filterType` | `'text' \| 'number' \| 'boolean' \| 'select'` | Tipo de filtro (default: `'text'`; `select` infiere opciones de los datos si no se proveen) |
| `filterOptions` | `string[]` | Opciones válidas para `filterType: 'select'` |
| `booleanLabels` | `{ true?: string; false?: string }` | Labels para `boolean` |
| `minWidth` / `width` | `string` | Dimensiones de la columna |
| `align` | `'left' \| 'center' \| 'right'` | Alineación |
| `render` | `(value, row, index) => ReactNode` | Render custom de celda |
| `renderHeader` | `(props?: FilterHeaderProps) => ReactNode` | Render custom de cabecera (para inyectar filtros) |

### BaseTable

Core de render compartido: estructura, loop de headers, render de filas/celdas con slots de composición, eventos de fila genéricos, formato condicional y empty state. **No posee lógica de edición, selección, filtros ni paginación.**

```ts
BaseTable<T>({
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyState?: ReactNode;
  emptyTitle?: string;          // default 'Sin datos'
  emptyDescription?: string;    // default 'No hay registros para mostrar.'
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  loading?: boolean;            // ⚠️ declarado pero NUNCA consumido
  rowClassName?: (row: T, index: number) => string | undefined;
  rowStyle?: (row: T, index: number) => CSSProperties | undefined;
  rowHeight?: string;
  styles?: BaseTableStyles;
  leadingColumn?: LeadingColumn;
  composeHeader?: (ctx: TableHeaderContext<T>) => ComposedHeader | undefined;
  composeCell?: (ctx: TableCellContext<T>) => ComposedCell | undefined;
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
  tableRef?: Ref<HTMLTableElement>;
})
```

Slots de composición:

- **`composeHeader`** / **`composeCell`**: reciben contexto (`column`, `columnIndex`, `row`, `rowIndex`, `value`) y devuelven overrides (`className`, `style`, y para celdas `content` — reemplaza el contenido — y `props` — atributos extras al `<td>`).
- **`leadingColumn`**: columna fija inicial (ej. números de fila), suma +1 al `colSpan` del empty state.
- **`rowClassName`**: retorna un token condicional (`rowDanger`, `rowWarning`, `rowSuccess`, `rowInfo`) mapeado al CSS module de la variante, o una clase cruda como fallback.
- **`emptyState`**: reemplaza el empty state por defecto (`∅` + `emptyTitle` + `emptyDescription`).
- **`BaseTableStyles`**: contrato estructural de clases (wrapper, table, th, tr, clickable, td, empty, emptyIcon, emptyTitle, emptyDesc, rowDanger, rowWarning, rowSuccess, rowInfo) — todos opcionales; las variantes inyectan su propio CSS module (`BaseTable.module.css` por defecto).

Filas clicables (`onRowClick`): `role="button"`, `tabIndex={0}`, Enter/Space.

> ⚠️ **Deuda conocida**: `loading` está declarado en el contrato pero **ninguna implementación lo consume** (documentado en `DataTable.stories.tsx`).

### DataTable

Tabla orientada a lectura: compone `useTableFilters` + `useTablePagination` + `FilterBar` + `Pagination`, e inyecta filtros en las cabeceras vía `useFilterableColumns`.

| Prop extra | Tipo | Default | Descripción |
|---|---|---|---|
| `filters` | `boolean` | `false` | Habilita filtros en cabeceras |
| `pagination` | `boolean` | `false` | Habilita paginación |
| `pageSize` | `number` | `10` | Items por página |

El resto de props delegan en `BaseTableProps`.

```tsx
<DataTable
  columns={columns}
  data={users}
  keyExtractor={(u) => u.id}
  filters
  pagination
  pageSize={20}
  onRowClick={(user) => navigate(`/users/${user.id}`)}
/>
```

### ExcelTable

Grilla editable estilo spreadsheet sobre `BaseTable`.

| Prop | Tipo | Descripción |
|---|---|---|
| `columns` / `data` / `keyExtractor` / `rowClassName` / `rowStyle` | (de `BaseTableProps`) | Contrato base |
| `onDataChange` | `(rowIndex: number, columnKey: string, value: string) => void` | Edición committeada |
| `readOnly` | `boolean` | Deshabilita edición |
| `filters` / `pagination` / `pageSize` | — | Igual que DataTable |

Comportamiento:

- **Selección por click**, **edición por doble click o Enter** (autofocus + select del valor).
- **Navegación por teclado**: Tab (con wrap al final de fila/columna), flechas (up/down hacen commit y mueven), Escape cancela.
- **Editores según la columna**: `InputBase` (texto/número), `SelectEditor` (para `filterType: 'select'` con `filterOptions`), `BooleanEditor` (toggle Sí/No).
- Leading column con número de fila display (`rowIndex + 1`); wrapper con `role="grid"`, celdas `role="gridcell"` + `aria-selected`.
- Inyecta su propio CSS module (`ExcelTable.module.css`) vía `styles`.

> ⚠️ **Deuda conocida — índice original**: `onDataChange` recibe el **índice ORIGINAL de `props.data`** (resuelto internamente matcheando la identidad de fila vía `keyExtractor`), NO el índice de la página display. Con filtros + paginación activos, el índice visual no es válido para parchear estado. Además, las ediciones sobre filas cuya key no puede resolverse (claves duplicadas o faltantes) **se descartan silenciosamente** (resuelve a `-1` y no llama al callback).

> ⚠️ **Deuda conocida — sin exportación real**: `ExcelTable` es solo la grilla editable. **No existe exportación a Excel (xlsx/csv)**: no hay SheetJS en `package.json`. El nombre refiere al comportamiento de grilla, no a la capacidad de exportar archivos.

### ResponsiveTable (deep import)

`ResponsiveTable` adapta la tabla al viewport:

- **Desktop (>768px)**: delega en `DataTable` completo.
- **Mobile (≤768px)**: cards verticales, reutilizando columnas, filtros y paginación; cada card muestra label + valor (con `render` si existe), y la **columna de acciones** (header vacío) se separa al final de la card.

Usa `useMediaQuery('(max-width: 768px)')`. **No está exportada por el barrel** — deep import.

### Hooks internos (`table/hooks/` — no exportados por barrel)

#### useTableFilters

```ts
useTableFilters(columns, data, onFilterChange?) => {
  filteredData, filterHeaderProps, setFilter, setNumericFilter,
  clearFilter, clearAllFilters, hasActiveFilters
}
```

- **Semántica Excel-style** (hotfix 6I): key **ausente** del mapa = sin filtro, todas las filas visibles; key **presente con Set vacío** = filtro activo que matchea **0 filas**; key con valores = solo filas cuyo valor está en el set. Solo el clear explícito (`clearFilter`/`clearAllFilters`) elimina claves.
- **Autodetección de tipo por columna**: `filterType` explícito, si no: todos numéricos → `number`, todos booleanos → `boolean`, si no `text`.
- **Aplanado de arrays**: valores array (ej. roles) se matchean si CUALQUIER elemento está seleccionado.
- `filterHeaderProps`: mapa de props por columna listo para `renderHeader`.

#### useTablePagination

```ts
useTablePagination(totalItems, initialPageSize = 10) => {
  currentPage, totalPages, pageSize, goToPage, nextPage, prevPage,
  setPageSize, totalItems, startIndex, endIndex
}
```

- `currentPage` es **1-indexed y derivada** (`min(max(1, stored), totalPages)`) — la página almacenada puede quedar fuera de rango cuando los datos/filtros encogen el dataset, y la página efectiva se calcula como **computación pura, sin `setState` durante el render** (hotfix 7D).
- **Datasets vacíos → `totalPages = 1`** (válido).
- `setPageSize` resetea a página 1.

#### useFilterableColumns

```ts
useFilterableColumns(columns, enabled, filterHeaderProps) => Column<T>[]
```

Inyecta `FilterHeader` en `column.renderHeader` cuando `enabled`; devuelve las columnas intactas si no. Compartido por DataTable y ExcelTable.

### Partes de composición públicas (`table/parts/`)

#### FilterBar

Barra de "filtros activos" con botón limpiar. `{ hasActiveFilters, onClearAll, label?, clearLabel? }` — labels default "Filtros activos"/"Limpiar todos". Se oculta si no hay filtros.

#### Pagination

```ts
Pagination({ currentPage, totalPages, onPageChange, totalItems?, pageSize?, onPageSizeChange? })
```

- Máximo **5 páginas visibles** con `…` en los extremos; info "N registros · Página X de Y" cuando hay `totalItems` y `pageSize`.
- Selector de tamaño con opciones **[5, 10, 20, 50]**.
- Reglas de visibilidad: sin navegación si `totalPages <= 1`; el selector de tamaño solo aparece si hay `onPageSizeChange` y (`totalItems` indefinido o `> 5` — con datasets pequeños todo tamaño renderiza igual, hotfix 7D). Con `totalPages <= 1` y sin `onPageSizeChange` el componente retorna `null`.
- Textos en español hardcodeados ("registros", "Página", aria-labels "Página anterior"/"Página siguiente"/"Registros por página").
- **Reutilizable fuera de la tabla**: se exporta por el barrel (`@components/data-display/table`) y puede manejarse con estado externo para paginación **server-side** (`currentPage` 1-indexed; `onPageSizeChange` debe resetear la página). Referencias: `MiActividadPage` (auditoría) y `UsersPage` (usuarios, con filtros y orden server-side).

#### ColumnToggle

Selector de columnas visibles: `{ columns: { key, header, visible }[], onToggle, onShowAll }`. Popover con click-outside; badge con la cantidad de ocultas; "Mostrar todo".

#### DensitySelector

`{ value: Density, onChange }` con `Density = 'compact' | 'comfortable' | 'relaxed'` — tres botones con íconos y tooltip con altura en px (40/48/56).

#### BulkActionsBar

`{ selectedCount, totalCount, onSelectAll, onClearSelection, actions?: BulkAction[] }`. `BulkAction { label, icon, onClick, variant?: 'default' | 'danger' }`. Se oculta con `selectedCount === 0`; textos "X de Y seleccionados", "Seleccionar todo (N)", "Limpiar".

#### SearchHighlight

Input de búsqueda con resaltado: `{ value, onChange, placeholder?, resultCount? }`. Usa `Input.Root` compound (StartAddon con `LuSearch`, EndAdornment con contador, EndAction limpiar) y **atajo global ⌘K/Ctrl+K** (focus al input). El contador usa `aria-label` en inglés.

### Piezas internas (no exportadas)

- **`FilterHeader`**: label de columna + `FilterDropdown`.
- **`FilterDropdown`**: trigger con `LuFilter` + popover **portal a `document.body`** posicionado con `usePopoverPosition` (flip vertical/horizontal + scroll/resize). ⚠️ **Abrir el dropdown NO activa el filtro** (solo muta la UI); el filtro se activa al checkear valores.
- **`TextFilterContent`**: búsqueda + lista de checkboxes + "Seleccionar todo" (con indeterminado). ⚠️ Nota: escribir en la búsqueda SÍ modifica la selección (`onChange` al set de coincidencias; vaciar la búsqueda selecciona todos).
- **`NumberFilterContent`**: rango mayor/menor que ("Mayor que"/"Menor que", "Deja vacío para no aplicar límite").
- **`BooleanFilterContent`**: checkboxes "Sí / Verdadero" y "No / Falso" + "Seleccionar todo".
- **`CellEditors`**: `SelectEditor` (select con data-URI de chevron) y `BooleanEditor` (toggle con commit en Enter/Space/click).
- **`usePopoverPosition`**: posiciona el popover del filtro (fixed, flip, scroll/resize).

---

## Calendario (`src/components/data-display/calendar/`)

Wrappers de `react-day-picker` (v10), pickers con popover portal, y un calendario de eventos completo con drag & drop.

### Barrel (`calendar/index.ts`)

Exporta: `Calendar`, `CalendarRange`, `DatePicker`, `DateRangePicker` (desde `Calendar.tsx`), `CalendarView` + tipos (`CalendarViewProps`, `CalendarEvent`, `EventColor`).

### Calendar / CalendarRange

Wrappers de `react-day-picker` con locale `es`, `showOutsideDays`, `fixedWeeks` y chevrons de Lucide.

| `Calendar` | Tipo | Descripción |
|---|---|---|
| `selected` | `Date` | Fecha seleccionada |
| `onSelect` | `(date: Date \| undefined) => void` | Cambio |
| `minDate` / `maxDate` | `Date` | Rango habilitado (via `disabled`) |

| `CalendarRange` | Tipo | Descripción |
|---|---|---|
| `from` / `to` | `Date` | Rango |
| `onSelect` | `(range: { from: Date \| undefined; to: Date \| undefined }) => void` | Cambio (mode `"range"`) |
| `minDate` / `maxDate` | `Date` | Rango habilitado |

El wrapper conserva la clase `styles.calendar` de `Calendar.module.css`: scope de las variables `--rdp-*` y overrides internos de react-day-picker (contrato de terceros, deliberadamente no migrado a Tailwind).

### DatePicker / DateRangePicker

Pickers con popover.

| `DatePicker` | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `Date` | — | Fecha seleccionada |
| `onChange` | `(date: Date \| undefined) => void` | — | Cambio (cierra el popover) |
| `placeholder` | `string` | `'Seleccionar fecha'` | Texto sin valor |
| `minDate` / `maxDate` | `Date` | — | Rango habilitado |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño del trigger |

`DateRangePicker`: `{ from?, to?, onChange(range), placeholder = 'Seleccionar rango', minDate?, maxDate? }` — label "dd/MM/yyyy — dd/MM/yyyy" (o "..."), cierra al completar el rango.

Mecánica del popover (`usePickerPopover`, interno):

- **Portal a `document.body`** con `position: fixed` — fix 7B: los `Card` con `overflow-hidden` ya no lo recortan.
- Posición anclada al trigger con **flip vertical** (arriba si no hay espacio abajo) y **clamp horizontal** al viewport, recalculada en scroll/resize; cierre por click fuera (ignorando el trigger) y Escape.

### CalendarView

Calendario de eventos completo con vista responsive y drag & drop.

| Prop | Tipo | Descripción |
|---|---|---|
| `events` | `CalendarEvent[]` | Eventos |
| `onEventClick` | `(event) => void` | Click en evento |
| `onEventDrop` | `(event, newDate: Date) => void` | Drop de evento en un día |
| `onAddEvent` | `() => void` | Botón "Add event" |
| `onDayClick` | `(date, events) => void` | Click en celda de día |
| `onMoreClick` | `(events, date) => void` | Click en "+N más" |
| `selectedDate` | `Date` | Fecha resaltada |
| `onDateSelect` | `(date) => void` | Selección de fecha |

- **Drag & drop nativo HTML5**: `dataTransfer` con `setData('text/plain', String(event.id))` + `effectAllowed/dropEffect: 'move'`.
- **Vista por viewport** (`useIsMobile`): desktop = `CalendarGrid`; mobile = `CalendarList`.

#### CalendarGrid (desktop)

Grilla de **7 columnas** (lunes a domingo, `weekStartsOn: 1`). Máximo **3 pills de eventos por día** + indicador "+N más" (`onMoreClick`). Precedencia de estados de celda resuelta en código: **dragOver > today > outside > normal**.

#### CalendarList (mobile)

Lista vertical: solo **días del mes actual con eventos + hoy**. Misma interacción de drag & drop.

#### CalendarHeader

Bloque de fecha (día + mes abreviado en `es`), título del mes con rango, badge de semana y navegación.

- ⚠️ El badge muestra el texto literal **"Week N"** en inglés (`getISOWeek`), y el botón de acción **"Add event"/"Add"** también en inglés — excepciones a la convención de textos en español, presentes tal cual en el código.
- Navegación: mes anterior/siguiente, "Hoy", y botón "Buscar" (sin comportamiento) en desktop.

### Contrato de eventos

```ts
CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: EventColor;
  meta?: Record<string, unknown>;
}
EventColor = 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray'
```

> ⚠️ **Decisión 6B**: los colores de las pills son **literales locales deliberados** (.12 tint + strong text, ej. `bg-[rgba(59,130,246,0.12)] text-[#2563eb]`), **NO design tokens**.

### Helpers (`calendarHelpers.ts`)

- `getCalendarDays(currentMonth)`: matriz de días para la grilla — semana empieza en **lunes** (`weekStartsOn: 1`), incluye días del mes anterior/siguiente.
- `groupEventsByDay(events)`: `Map<string /* yyyy-MM-dd */, CalendarEvent[]>` para acceso O(1) por día.

## Gotchas y deudas

- `BaseTableProps.loading` declarado pero **nunca consumido**.
- `ExcelTable.onDataChange` usa el **índice original** de `props.data` (vía keyExtractor); edits con claves duplicadas/faltantes se descartan silenciosamente.
- **No hay exportación Excel (xlsx/csv)** — sin SheetJS en `package.json`.
- `ResponsiveTable` no está en el barrel (deep import), igual que hooks y piezas internas de tabla.
- Semántica de filtros contraintuitiva: Set vacío almacenado = filtro activo que matchea 0 filas (Excel-style); abrir el `FilterDropdown` nunca activa filtro.
- El badge "Week N" y el botón "Add event" del calendario están en inglés literal.