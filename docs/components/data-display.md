# Data Display

Componentes para mostrar datos: BaseTable, DataTable, ExcelTable, Calendar.

## BaseTable

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `columns` | `Column<T>[]` | Definición de columnas |
| `data` | `T[]` | Datos |
| `keyExtractor` | `(row, index) => string \| number` | Key extractor |
| `emptyState` | `ReactNode` | Estado vacío custom |
| `emptyTitle` / `emptyDescription` | `string` | Textos del empty state |
| `onRowClick` / `onRowDoubleClick` | `(row, index) => void` | Eventos de fila |
| `rowClassName` / `rowStyle` | `(row, index) => ...` | Formato condicional |
| `rowHeight` | `string` | Altura de fila |
| `styles` | `BaseTableStyles` | Override CSS module |
| `leadingColumn` | `LeadingColumn` | Columna fija izquierda (números) |
| `composeHeader` | `(ctx) => ComposedHeader` | Composición por cabecera |
| `composeCell` | `(ctx) => ComposedCell` | Composición por celda |
| `wrapperProps` | `HTMLAttributes` | Props del wrapper div |
| `tableRef` | `Ref<HTMLTableElement>` | Ref al `<table>` |

### Column Interface

```typescript
{
  key: string;
  header: string;
  filterType?: 'text' | 'select' | 'boolean';
  filterOptions?: { value: string; label: string }[];
  booleanLabels?: { true: string; false: string };
  minWidth?: number;
  width?: number;
  align?: 'left' | 'center' | 'right';
  render?: (value, row, index) => ReactNode;
  renderHeader?: (props?: FilterHeaderProps) => ReactNode;
}
```

### Uso

```tsx
const columns: Column<User>[] = [
  { key: 'name', header: 'Nombre', minWidth: 200 },
  { key: 'email', header: 'Email' },
  {
    key: 'status',
    header: 'Estado',
    render: (value) => <Badge variant={value === 'active' ? 'success' : 'danger'}>{value}</Badge>,
  },
];

<BaseTable
  columns={columns}
  data={users}
  keyExtractor={(row) => row.id}
  onRowClick={(row) => navigate(`/users/${row.id}`)}
  emptyTitle="No hay usuarios"
  emptyDescription="Crea tu primer usuario"
/>
```

---

## DataTable

Extiende `BaseTableProps` con filtros y paginación.

### Props Adicionales

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `filters` | `boolean` | `false` | Habilitar filtros |
| `pagination` | `boolean` | `false` | Habilitar paginación |
| `pageSize` | `number` | `10` | Items por página |

### Uso

```tsx
<DataTable
  columns={columns}
  data={users}
  keyExtractor={(row) => row.id}
  filters
  pagination
  pageSize={20}
/>
```

### Composición Interna

```
FilterBar + BaseTable + Pagination
```

---

## ExcelTable

Tabla editable estilo spreadsheet.

### Props Adicionales

| Prop | Tipo | Descripción |
|------|------|-------------|
| `onDataChange` | `(rowIndex, colKey, value) => void` | Callback de edición |
| `readOnly` | `boolean` | Modo solo lectura |

### Comportamiento de Edición

- **Click**: selecciona celda
- **Doble-click**: edita celda
- **Editores**: text input, select editor, boolean editor
- **Navegación teclado**: Tab, arrows, Enter, Escape
- **Filtros**: resuelve `displayIndex` → `originalIndex` para edits correctos

### Uso

```tsx
<ExcelTable
  columns={columns}
  data={data}
  onDataChange={(rowIndex, colKey, value) => {
    const newData = [...data];
    newData[rowIndex][colKey] = value;
    setData(newData);
  }}
/>
```

---

## Parts (Composición Pública)

Componentes reutilizables para toolbars custom.

| Componente | Descripción |
|------------|-------------|
| `FilterBar` | Barra de filtros activos + clear all |
| `Pagination` | Controles de página + page size selector |
| `ColumnToggle` | Toggle de visibilidad de columnas |
| `DensitySelector` | Selector de densidad (compact/comfortable/relaxed) |
| `BulkActionsBar` | Barra de acciones masivas |
| `SearchHighlight` | Resaltado de búsqueda |

### Uso

```tsx
<DataTable
  columns={columns}
  data={data}
  filters
  pagination
  // Personalización con Parts
  renderToolbar={(props) => (
    <div className="flex gap-2">
      <SearchHighlight query={searchQuery} />
      <ColumnToggle columns={columns} />
      <DensitySelector />
    </div>
  )}
/>
```

---

## Calendar

### Componentes Exportados

| Componente | Descripción |
|------------|-------------|
| `Calendar` | DayPicker wrapper (`mode="single"`) |
| `CalendarRange` | DayPicker wrapper (`mode="range"`) |
| `DatePicker` | Input trigger + portaled popover con Calendar |
| `DateRangePicker` | Input trigger + portaled popover con CalendarRange |
| `CalendarView` | Vista completa interactiva |

### CalendarView Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `events` | `CalendarEvent[]` | Eventos `[{ id, title, start, end?, color?, meta? }]` |
| `onEventClick` | `(event) => void` | Click en evento |
| `onEventDrop` | `(event, newDate) => void` | Drag & drop |
| `onAddEvent` | `() => void` | Botón agregar |
| `onDayClick` | `(date, events) => void` | Click en celda |
| `onMoreClick` | `(events, date) => void` | Click en "+N más" |
| `selectedDate` / `onDateSelect` | — | Selección de fecha |

### Uso

```tsx
// Calendario simple
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
/>

// Date Picker
<DatePicker
  value={date}
  onChange={setDate}
  placeholder="Seleccionar fecha"
/>

// Vista completa con eventos
<CalendarView
  events={events}
  onEventClick={(e) => openEvent(e)}
  onAddEvent={() => openNewEvent()}
  onDayClick={(date, evts) => openDay(date, evts)}
/>
```

### DatePicker Interno

Usa hook `usePickerPopover` que maneja:
- Posicionamiento fixed
- Flip vertical
- Clamp horizontal
- Scroll/resize listeners
- Outside click
- Escape

### Dependencias

- `react-day-picker`
- `date-fns`
- `@hooks/useIsMobile`
