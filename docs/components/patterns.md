# Patrones de diseño (`src/components/`)

Los 10 patrones reales que estructuran el design system, con ejemplos verificados del código. Sirven de guía para entender por qué los componentes están organizados como están y para no romper las convenciones al extenderlos.

## 1. Compound components con `Object.assign`

El patrón dominante: un componente root que lleva subcomponentes estáticos asignados con `Object.assign`, sin crear archivos separados.

| Root | Partes |
|---|---|
| `Input` | `.Root` `.Control` `.StartAddon` `.EndAdornment` `.EndAction` |
| `Select` | `.Root` `.Control` `.StartAddon` |
| `Textarea` | `.Base` |
| `Checkbox` | `.Base` |
| `Radio` | `.Group` |
| `Badge` | `.Icon` |
| `Card` | `.Image` `.Header` `.Title` `.Description` `.Body` `.Footer` |
| `Modal` | `.Header` `.Body` `.Footer` |
| `Drawer` | `.Header` `.Body` `.Footer` |
| `Tabs` | `.List` `.Trigger` `.Panel` |
| `Sidebar` | `.Header` `.Toggle` `.Nav` `.Footer` |

Ejemplo real (`primitives/Input.tsx`):

```tsx
const Input = Object.assign(InputShorthand, {
  Root: InputRoot,
  Control: InputControl,
  StartAddon: InputStartAddon,
  EndAdornment: InputEndAdornment,
  EndAction: InputEndAction,
});
export default Input;
```

Regla: cada parte comparte el módulo del root; el contrato de props puede declararse en un `types.ts` central (caso de `ModalHeaderProps`/`BodyProps`/`FooterProps`, compartidos por Modal y Drawer).

## 2. Dual API (shorthand + compound)

Los controles de formulario ofrecen dos superficies:

- **Shorthand**: `value: string; onChange: (v: string) => void` con props de estructura opcionales — el 90% de los casos.
- **Compound**: piezas explícitas (`Input.Root`/`Input.Control`/...) con contexto propio — para composiciones custom (toolbars, adornos interactivos).

| Control | Shorthand | Compound | Contexto |
|---|---|---|---|
| `Input` | `Input` | `InputBase` + `InputRoot` + `InputControl` (+ addons) | `InputContext` con `size`/`validationState`/`disabled`/`readOnly`; **lanza error** fuera del `Root` |
| `Select` | `Select` | `SelectBase` + `SelectRoot` + `SelectControl` (+ addon) | `SelectContext` (estado estructural; value/options no viajan por contexto) |
| `Checkbox` | `Checkbox` | `CheckboxBase` | — |

Regla interna (`Input`): el shorthand **con estructura** (adornos, `showPasswordToggle`) delega al compound; **sin estructura** renderiza un `<input>` plano. En `Select`, el shorthand con `startAdornment` delega a `SelectRoot`+`SelectControl`; sin él usa `SelectBase`.

```tsx
// Shorthand
<Input value={q} onChange={setQ} startAdornment={<LuSearch />} startAdornmentVariant="accent" />

// Compound
<Input.Root appearance="filled">
  <Input.StartAddon variant="subtle"><LuSearch /></Input.StartAddon>
  <Input.Control value={q} onChange={(e) => setQ(e.target.value)} />
  <Input.EndAction><button onClick={clear}>Limpiar</button></Input.EndAction>
</Input.Root>
```

## 3. Context-driven

Los contextos orquestan estado entre root y partes, siempre con error explícito si se usan fuera del proveedor ("debe usarse dentro de...").

| Contexto | Proveedor | Consumidores | Error fuera del provider |
|---|---|---|---|
| `FormContext` (`forms/FormContext.ts`) | `Form` | `FormField` (error/touched por `name`) | `useFormContext` lanza |
| `ModalContext` (`overlays/context.ts`) | `Modal`, `Drawer`, `DrawerStack` | `Modal/Drawer.Header/.Body/.Footer` | `useModalClose` lanza |
| `TabsContext` (`navigation/Tabs.tsx`) | `Tabs` | `Tabs.Trigger` / `Tabs.Panel` | `useTabsContext` lanza |
| `SidebarContext` (`navigation/sidebar/context.ts`) | `Sidebar` | `Sidebar.Toggle`, `NavItem`, `NavGroup`, `SidebarLogo`, `UserAvatar`, `UserClock` | default silencioso (no lanza) |
| `InputContext` / `SelectContext` | `Input.Root` / `Select.Root` | piezas compound | lanzan |

Nota: `ModalContext` es **compartido** — el mismo contexto sirve a Modal y Drawer, por eso los headers/bodies/footers son intercambiables entre ambos.

## 4. Portal

Todo lo que debe "salir" de su contenedor renderiza por `createPortal(..., document.body)`:

- `Modal`, `Drawer`, `DrawerStack` (overlays completos, `z-[1000]`).
- `ToastProvider` (contenedor de toasts, `z-[2000]`).
- `FilterDropdown` (popover de filtro de tabla, posicionado con `usePopoverPosition`).
- `DatePicker` / `DateRangePicker` (popover del calendario con `position: fixed` — fix 7B: ya no es recortado por `Card` con `overflow-hidden`).

Motivación verificable: el fix 7B en `Calendar.tsx` documenta que el popover portal con `position: fixed` resolvió el clipping por `overflow-hidden` de las cards.

## 5. Singleton global imperativo

`useToast` (feedback) no usa context: el `ToastProvider` registra una API en un **module-level `toastFn`** y el hook llama directamente.

```ts
// useToast.ts
let toastFn: ToastAPI | null = null;
export function registerToast(fn: ToastAPI) { toastFn = fn; }
// ...
if (!toastFn) { console.warn('[Toast] No ToastProvider found in the tree.'); return; }
```

Tradeoff: cualquier componente puede llamar `toast.success(...)` sin envolturas; a cambio, **sin provider el fallo es silencioso** (solo `console.warn`). Solo un provider puede estar registrado a la vez.

## 6. CSS-module bridge con data-attributes

`FormField` + `Form.module.css` es el único caso donde un CSS Module **gana a `@layer utilities`**:

- Los controles emiten `data-variant` (`'default' | 'filled' | 'outlined'`) y `data-validation`.
- `.fieldError [data-variant]` pinta bordes rojos sobre controles arbitrarios envueltos por `FormField` con error.
- No es expresable como utility: los overrides descendientes (`[data-variant]`) no se resuelven seguramente en Tailwind.

Este patrón se complementa con los data-attributes de estado de `InputControl`/`SelectControl` (`data-input-disabled`, `data-input-readonly`, `data-select-disabled`) que el Root consume con `has-data-[...]`.

## 7. Composition slots sobre core

`BaseTable` es el core de render **sin lógica**; las variantes inyectan su propio CSS module y comportamiento vía slots:

| Slot | Propósito |
|---|---|
| `styles?: BaseTableStyles` | Contrato estructural de clases; `DataTable`/`ExcelTable` inyectan su módulo (`ExcelTable.module.css`) |
| `composeHeader` | Overrides de header por columna (clases/estilos) |
| `composeCell` | Overrides de celda: clases, estilos, `content` (reemplaza el render) y `props` (eventos, ARIA) |
| `leadingColumn` | Columna fija inicial (ej. números de fila) |
| `rowClassName` | Formato condicional: token (`rowDanger`...) mapeado al CSS module, o clase cruda |

`ExcelTable` es el caso extremo: inyecta `styles`, `leadingColumn`, `composeCell` con selección/edición y `wrapperProps` con `role="grid"` y navegación de teclado — todo sobre el mismo core `BaseTable`.

## 8. Slots de render prop

Render props como extensión declarativa:

- `Column.render(value, row, index)` — celda custom (usado por DataTable/ExcelTable/ResponsiveTable).
- `Column.renderHeader(props?: FilterHeaderProps)` — cabecera custom; `useFilterableColumns` lo inyecta con `FilterHeader`.
- `LeadingColumn.cell(rowIndex)` — contenido de la columna inicial.
- `BaseTable.emptyState` — reemplazo del empty state por defecto.
- `Badge.Icon`/`Card.*` son la variante estructural de este patrón: slots de layout para composición.

## 9. Hook de estado puro derivado

`useTablePagination` nunca muta estado durante el render: la página efectiva es **derivada** (`min(max(1, stored), totalPages)`), no un `setState` en render.

```ts
const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
const effectivePage = Math.min(Math.max(1, storedPage), totalPages); // puro
```

Por qué importa (hotfix 7D): cuando los filtros encogen el dataset, la página almacenada puede quedar fuera de rango; derivarla mantiene la UI consistente sin re-renders extra. Bonus: datasets vacíos → `totalPages = 1`, un estado válido.

## 10. Controlled/uncontrolled dual

`Tabs` soporta ambos modos con el mismo componente:

```tsx
// Uncontrolled
<Tabs defaultValue="info">...</Tabs>
// Controlled
<Tabs value={tab} onChange={setTab}>...</Tabs>
```

El mecanismo: `isControlled = value !== undefined`; sin `value` usa estado interno (`internalValue`) inicializado con `defaultValue`; `setActiveTab` actualiza interno solo si no es controlado y siempre llama `onChange`.

## Cómo usar estos patrones

- **Para consumir**: usa los barrels de familia; deep import solo para lo que no está exportado (ver [README](README.md)).
- **Para extender**: respeta la regla de cascada (un conjunto efectivo de clases por estado), los errores de contexto ("debe usarse dentro de...") y no muevas contratos de props entre familias (single source of truth en `forms/types.ts` y `table/types.ts`).
- **Para decidir**: si un componente nuevo necesita chrome lateral → dual API con compound; si necesita "salir" del layout → portal; si expone slots de composición → patrón 7/8.