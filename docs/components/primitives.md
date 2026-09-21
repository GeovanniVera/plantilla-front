# Primitives (`src/components/primitives/`)

Controles y piezas visuales de base del design system. Cada módulo exporta su componente (compound cuando corresponde) y el barrel `primitives/index.ts` re-exporta todo el contrato público.

## Barrel (`primitives/index.ts`)

Re-exporta los componentes hoja y sus tipos. Nota: los contratos de props de los controles de formulario (`InputProps`, `TextareaProps`, `SelectProps`, `CheckboxProps`, `RadioProps`, ...) se declaran en `../forms/types.ts` (single source of truth) y se re-exportan desde el barrel para que sean importables junto a cada componente. También re-exporta los contratos de las piezas compound definidas localmente (`InputRootProps`, `SelectBaseProps`, etc.).

## Button

`Button` es el botón primitivo. Es una **función plana**: no usa `forwardRef`.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `shape` | `'default' \| 'rounded' \| 'square'` | `'default'` | Forma; `default` aplica el radio del tamaño |
| `animation` | `'none' \| 'pulse' \| 'bounce' \| 'shake'` | `'none'` | Animación al hover (`hover:animate-*`) |
| `color` | `string` | — | Override inline del color de texto/ícono |
| `colorBg` | `string` | — | Override inline del color de fondo |
| `children` | `ReactNode` | — | Contenido |

Además extiende `ButtonHTMLAttributes<HTMLButtonElement>` (className, disabled, style, onClick, etc.).

```tsx
<Button variant="primary" size="md" onClick={save}>Guardar</Button>
<Button variant="danger" animation="shake">Eliminar</Button>
<Button color="#fff" colorBg="#10b981">Custom</Button>
```

## Input — dual API

`Input` es el control de texto con **doble API**:

- **Shorthand**: `Input` con `value: string; onChange: (v: string) => void` y props de estructura opcionales.
- **Compound**: `Input.Root`, `Input.Control`, `Input.StartAddon`, `Input.EndAdornment`, `Input.EndAction` (+ `InputBase` como pieza intermedia).

### Contrato del shorthand (`InputProps`, en `forms/types.ts`)

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `string` | — | Valor controlado |
| `onChange` | `(value: string) => void` | — | Recibe el valor como string (no el evento) |
| `type` | `InputType` (`'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' \| 'search'`) | `'text'` | Tipo nativo |
| `appearance` (alias `variant`) | `'default' \| 'filled' \| 'outlined'` | `'default'` | Superficie del control |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado visual de validación |
| `startAdornment` | `ReactNode` | — | Contenido decorativo inicial (no interactivo) |
| `startAdornmentVariant` | `'plain' \| 'subtle' \| 'accent' \| 'dark'` | `'plain'` | Superficie del addon inicial |
| `endAdornment` | `ReactNode` | — | Contenido decorativo final (no interactivo) |
| `endAction` | `ReactNode` | — | Contenido interactivo final; el consumidor es dueño de su nombre accesible |
| `showPasswordToggle` | `boolean` | `false` | Toggle mostrar/ocultar para `type="password"` |

Notas de comportamiento:

- **`showPasswordToggle` gana sobre `endAction`**: cuando está activo con `type="password"`, reemplaza el `endAction`. El toggle usa `aria-label` en inglés ("Show password"/"Hide password").
- El shorthand con estructura (adornos, toggle) **delega al compound** (`Input.Root` + piezas); sin estructura renderiza un `<input>` plano.
- `forwardRef` sí en el shorthand, `InputBase`, `Input.Root` y `Input.Control`.

### Compound

| Pieza | Rol |
|---|---|
| `Input.Root` | Caja contenedora; provee `InputContext` con `size`/`validationState`/`disabled`/`readOnly`. Emite `data-variant` y `data-validation` |
| `Input.Control` | `<input>` sin chrome; lee estado del contexto. Emite `data-input-control`, `data-input-disabled`, `data-input-readonly` |
| `Input.StartAddon` | Contenido decorativo inicial; requiere estar dentro de `Input.Root` (lanza error si no) |
| `Input.EndAdornment` | Contenido decorativo final (`decorative?: boolean` controla `aria-hidden`) |
| `Input.EndAction` | Contenido interactivo final |
| `InputBase` | `<input>` standalone con las mismas axes visuales (size/validationState) |

```tsx
<Input.Root appearance="filled" validationState="invalid">
  <Input.StartAddon variant="accent"><LuSearch /></Input.StartAddon>
  <Input.Control value={q} onChange={(e) => setQ(e.target.value)} />
  <Input.EndAction>
    <button onClick={clear}>Limpiar</button>
  </Input.EndAction>
</Input.Root>
```

## Select

`Select` sobre el `<select>` nativo, con la misma dual API (shorthand + `Select.Root`/`Select.Control`/`Select.StartAddon` + `SelectBase`).

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `string` | — | Valor controlado |
| `onChange` | `(value: string) => void` | — | Recibe el valor como string |
| `options` | `SelectOption[]` (`{ value, label, disabled? }`) | — | Opciones |
| `placeholder` | `string` | — | Opción real `disabled` renderizada al inicio |
| `appearance` (alias `variant`) | `'default' \| 'filled' \| 'outlined'` | `'default'` | Superficie |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |
| `startAdornment` / `startAdornmentVariant` | `ReactNode` / `'plain' \| 'subtle' \| 'accent' \| 'dark'` | — / `'plain'` | Addon inicial |

Notas de diseño:

- **No existe `readOnly`**: `<select>` nativo no tiene readonly, y se omite a propósito del contrato.
- El **atributo nativo `size`** (cantidad de opciones visibles, que convierte el control en listbox) se omite a propósito: colisiona con el eje visual de tamaño de la familia.
- El placeholder se muestra atenuado vía `data-placeholder` (el selector de atributos gana a la herencia).
- El chevron (`LuChevronDown`) es chrome decorativo (`aria-hidden`), nunca un control.

## Textarea

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` / `onChange` | `string` / `(v: string) => void` | — | Valor controlado |
| `rows` | `number` | `4` | Filas visibles |
| `appearance` (alias `variant`) | `'default' \| 'filled' \| 'outlined'` | `'default'` | Superficie |
| `size` | `'sm' \| 'md'` | `'md'` | Densidad de texto y padding (la altura la gobierna `rows`) |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |

`Textarea` expone solo `Textarea.Base` como pieza compound. **No tiene partes compound ni `Root`**: el `<textarea>` es dueño total de su caja (contenido multilínea y resize no dejan espacio para chrome lateral; composiciones como contadores se resuelven en layout, fuera del control).

## Checkbox

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `checked` | `boolean` | — | Estado controlado |
| `onChange` | `(checked: boolean) => void` | — | Recibe el booleano |
| `label` | `string` | — | Texto junto al checkbox |
| `indeterminate` | `boolean` | `false` | Estado tri-estado |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |

- `indeterminate` no es un atributo HTML: la prop se aplica como **propiedad DOM** sobre el input real vía un ref merged (preserva el ref del consumidor) y pinta el guion (`LuMinus`).
- El chrome custom se conduce por CSS puro: el input nativo es `peer` y el box reacciona con `peer-checked:` — el CSS, no un ternario de React, refleja el estado del DOM.
- `Checkbox.Base` es el `<input type="checkbox">` cercano al metal (accent-color, semántica nativa).

```tsx
<Checkbox checked={all} onChange={setAll} indeterminate={some} label="Seleccionar todo" />
```

## Radio

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `checked` | `boolean` | — | Estado controlado |
| `onChange` | `() => void` | — | Sin argumentos |
| `label` | `string` | — | Texto |
| `variant` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Estilo; `outlined` cambia el borde 2px → 4px al chequear |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |
| `name` / `value` / `id` / `disabled` | — | — | Atributos nativos |

`Radio.Group` es el grupo de radios:

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `string` | Valor seleccionado |
| `onChange` | `(value: string) => void` | Recibe el valor de la opción |
| `options` | `SelectOption[]` | Opciones |
| `name` / `disabled` / `variant` / `className` | — | Se propagan a cada radio |

```tsx
<Radio.Group
  value={plan}
  onChange={setPlan}
  name="plan"
  options={[{ value: 'free', label: 'Gratis' }, { value: 'pro', label: 'Pro' }]}
/>
```

## Badge

`Badge` (con `Badge.Icon`) muestra una etiqueta de estado con tokens semánticos.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'default' \| 'success' \| 'warning' \| 'info' \| 'danger'` | `'default'` | Token semántico de color |
| `children` | `ReactNode` | — | Contenido |

```tsx
<Badge variant="success"><Badge.Icon><LuCheck /></Badge.Icon>Activo</Badge>
```

## StatusDot

Indicador de estado puntual, con o sin label.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `color` | `'green' \| 'yellow' \| 'red' \| 'blue' \| 'gray'` | — | Color (requerido) |
| `label` | `string` | — | Texto al lado del punto |
| `variant` | `'dot' \| 'badge' \| 'full'` | `'dot'` | `dot` = punto + texto opcional; `badge` = pill; `full` = bloque con fondo coloreado |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |

Los colores reutilizan los tokens semánticos (`success`, `warning`, `danger`, `info`); `gray` usa la escala neutral de Tailwind por no tener token semántico.

## Puente de error `Form.module.css`

`Form.module.css` define `.fieldError [data-variant='default'|'filled'|'outlined']`, el único caso del sistema donde un CSS Module **gana a `@layer utilities`**: pinta bordes rojos sobre controles arbitrarios envueltos por `FormField` con error. Los controles emiten `data-variant` (ver Input/Select/Textarea) y los overrides descendientes no se expresan seguramente como utilities de Tailwind. `FormField` lo consume directamente (ver [forms.md](forms.md)).

## Gotchas

- `Button` no acepta `ref` (sin `forwardRef`).
- `Input.showPasswordToggle` reemplaza `endAction` y usa aria-labels en inglés.
- `Select` y `Textarea` omiten el atributo nativo `size` (colisión con el eje visual).
- Los controles emiten `data-variant`/`data-validation`, atributos que el puente de `FormField` y el CSS module de error aprovechan — no removerlos al hacer overrides.