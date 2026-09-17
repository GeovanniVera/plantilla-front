# Primitives

Componentes hoja del design system. Sin lógica de negocio, solo UI.

## Button

Componente puro con variantes visuales.

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño |
| `shape` | `'default' \| 'rounded' \| 'square'` | `'default'` | Radio de borde |
| `animation` | `'none' \| 'pulse' \| 'bounce' \| 'shake'` | `'none'` | Animación hover |
| `color` | `string` | — | Override color de texto/icono |
| `colorBg` | `string` | — | Override color de fondo |
| `children` | `ReactNode` | required | Contenido |
| `disabled` | `boolean` | — | Deshabilitado |

### Uso

```tsx
<Button variant="danger" size="sm" onClick={handleDelete}>
  Eliminar
</Button>

<Button variant="secondary" animation="pulse">
  Actualizar
</Button>
```

**Dependencias**: Ninguna (Tailwind utilities).

---

## Input (Compound Pattern)

Dual API: shorthand para casos simples, compound para adornos/acciones.

### Props (Shorthand)

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | required | Valor controlado |
| `onChange` | `(value: string) => void` | required | Callback (recibe string, no event) |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url' \| 'search'` | `'text'` | Tipo nativo |
| `appearance` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Variante visual |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |
| `startAdornment` | `ReactNode` | — | Contenido decorativo izquierdo |
| `startAdornmentVariant` | `'plain' \| 'subtle' \| 'accent' \| 'dark'` | `'plain'` | Estilo del addon |
| `endAdornment` | `ReactNode` | — | Contenido decorativo derecho |
| `endAction` | `ReactNode` | — | Contenido interactivo derecho |
| `showPasswordToggle` | `boolean` | `false` | Toggle ojos para `type='password'` |
| `disabled` / `readOnly` | `boolean` | `false` | Estados nativos |

### Uso Shorthand

```tsx
<Input value={name} onChange={setName} placeholder="Nombre" />
<Input value={email} onChange={setEmail} type="email" appearance="outlined" />
<Input value={password} onChange={setPassword} type="password" showPasswordToggle />
```

### Uso Compound

```tsx
<Input.Root appearance="outlined" size="md" validationState="invalid">
  <Input.StartAddon variant="accent">$</Input.StartAddon>
  <Input.Control placeholder="Monto" />
  <Input.EndAdornment>USD</Input.EndAdornment>
</Input.Root>
```

### Sub-componentes

| Componente | Descripción |
|------------|-------------|
| `Input.Root` | Wrapper con contexto |
| `Input.Control` | Input nativo con tokens |
| `Input.StartAddon` | Addon decorativo izquierdo |
| `Input.EndAdornment` | Addon decorativo derecho |
| `Input.EndAction` | Contenido interactivo derecho |

**Dependencias**: `react-icons/lu`, `@lib/utils`, `InputContext`.

---

## Select (Compound Pattern)

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | required | Valor controlado |
| `onChange` | `(value: string) => void` | required | Callback |
| `options` | `SelectOption[]` | required | `[{ value, label, disabled? }]` |
| `placeholder` | `string` | — | Opción placeholder (disabled) |
| `appearance` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Variante visual |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |
| `startAdornment` | `ReactNode` | — | Addon decorativo izquierdo |
| `startAdornmentVariant` | `'plain' \| 'subtle' \| 'accent' \| 'dark'` | `'plain'` | Estilo del addon |

### Uso

```tsx
<Select
  value={country}
  onChange={setCountry}
  options={countries}
  placeholder="País"
/>

<Select
  value={status}
  onChange={setStatus}
  options={[
    { value: 'active', label: 'Activo' },
    { value: 'inactive', label: 'Inactivo' },
  ]}
  appearance="outlined"
/>
```

### Uso Compound

```tsx
<Select.Root appearance="filled">
  <Input.StartAddon variant="subtle">🏷️</Input.StartAddon>
  <Select.Control options={options} />
</Select.Root>
```

**Dependencias**: `react-icons/lu`, `@lib/utils`, `SelectContext`.

---

## Textarea

Mismo contrato que Input pero sin compound pattern.

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | required | Valor controlado |
| `onChange` | `(value: string) => void` | required | Callback |
| `appearance` | `'default' \| 'filled' \| 'outlined'` | `'default'` | Variante visual |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado de validación |

### Uso

```tsx
<Textarea value={bio} onChange={setBio} rows={4} placeholder="Biografía" />
<Textarea value={notes} onChange={setNotes} appearance="outlined" />
```

**Exportado como**: `Textarea` (shorthand) y `TextareaBase` (nativo con tokens).

---

## Checkbox (Compound Pattern)

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `checked` | `boolean` | required | Estado checked |
| `onChange` | `(checked: boolean) => void` | required | Callback |
| `label` | `string` | — | Texto del label |
| `indeterminate` | `boolean` | `false` | Estado indeterminado |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño del box |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | `'none'` | Estado visual |
| `disabled` / `required` | `boolean` | — | Nativos |

### Uso

```tsx
<Checkbox checked={agree} onChange={setAgree} label="Acepto términos" />
<Checkbox checked={indeterminate} onChange={setIndeterminate} indeterminate />
```

### Nota Técnica

El `ref` callback mergea el ref del consumidor con la lógica de `node.indeterminate = indeterminate` en cada render. El estado visual del box se resuelve con CSS `peer-checked:` + data attributes, no con ternarios de React.

**Exportado como**: `Checkbox` (shorthand con label) y `CheckboxBase` (input nativo puro).

---

## Radio (Compound Pattern)

### Props (Radio)

| Prop | Tipo | Descripción |
|------|------|-------------|
| `checked` | `boolean` | Estado seleccionado |
| `onChange` | `() => void` | Callback (sin argumento) |
| `label` | `string` | Texto del label |
| `variant` | `'default' \| 'filled' \| 'outlined'` | Variante visual |
| `validationState` | `'none' \| 'invalid' \| 'valid'` | Estado visual |
| `name` / `value` | `string` | Para formularios |

### Uso

```tsx
<Radio checked={selected === 'free'} onChange={() => setSelected('free')} label="Free" />
<Radio checked={selected === 'pro'} onChange={() => setSelected('pro')} label="Pro" />
```

### RadioGroup

```tsx
<RadioGroup
  value={selected}
  onChange={setSelected}
  name="plan"
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
  ]}
/>
```

**Exportado como**: `Radio` (shorthand) y `Radio.Group` (group).

---

## Badge

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'success' \| 'warning' \| 'info' \| 'danger'` | `'default'` | Variante de color |
| `children` | `ReactNode` | required | Contenido |

### Sub-componente

`Badge.Icon` — contenedor de ícono con margen derecho.

### Uso

```tsx
<Badge variant="success">
  <Badge.Icon>✓</Badge.Icon>
  Active
</Badge>

<Badge variant="danger">Error</Badge>
```

---

## StatusDot

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `color` | `'green' \| 'yellow' \| 'red' \| 'blue' \| 'gray'` | required | Color semántico |
| `label` | `string` | — | Texto al lado del punto |
| `variant` | `'dot' \| 'badge' \| 'full'` | `'dot'` | Modo de visualización |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño |

### Variantes

- `dot` — solo punto + label
- `badge` — fondo coloreado + punto + label
- `full` — solo fondo coloreado + label

### Uso

```tsx
<StatusDot color="green" label="Online" variant="badge" />
<StatusDot color="red" label="Offline" variant="dot" />
```
