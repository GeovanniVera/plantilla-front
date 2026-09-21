# Layout (`src/components/layout/`)

Estructura de página: tarjetas, tarjetas de estadística y grillas de formulario.

## Barrel (`layout/index.ts`)

Exporta: `Card` (+ `CardVariant`), `StatCard`/`StatCardGroup` (+ tipos) y `FormLayout` (+ `FormLayoutProps` re-exportado desde `../forms/types` — single source of truth).

## Card

Tarjeta de contenido con 6 piezas compound.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `variant` | `'default' \| 'outlined' \| 'elevated' \| 'flat'` | `'default'` | Superficie |
| `onClick` | `() => void` | — | Con `onClick` la card se vuelve clicable |
| `children` / `className` | — | — | Contenido |

Piezas: `Card.Image`, `Card.Header`, `Card.Title`, `Card.Description`, `Card.Body`, `Card.Footer`.

- **Clickable**: con `onClick` aplica `role="button"`, `tabIndex={0}` y activación por Enter/Space (además del hover/focus elevado).
- `Card.Image` es wrapper `aspect-video` con `overflow-hidden`.

```tsx
<Card variant="elevated" onClick={open}>
  <Card.Image src={cover} alt="Portada" />
  <Card.Header>
    <Card.Title>Proyecto</Card.Title>
    <Card.Description>Descripción breve</Card.Description>
  </Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>
    <Button size="sm">Ver más</Button>
  </Card.Footer>
</Card>
```

## StatCard

Tarjeta de estadística estilo dashboard corporativo.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `value` | `number` | — | Valor numérico destacado |
| `label` | `string` | — | Label (se muestra en mayúsculas vía CSS) |
| `accent` | `string` | `'#94a3b8'` | Color de acento (borde superior + ícono) |
| `icon` | `IconType` | — | Componente de react-icons |

- ⚠️ **Prop-driven, NO tokens**: los colores se aplican como **CSS vars inline** `--accent-color` y `--icon-bg` (`${accent}12`, tint al 12%). Son valores por instancia, no design tokens.
- El ícono se renderiza en una caja `bg-(--icon-bg) text-(--accent-color)`.

```tsx
<StatCard value={25} label="Total" icon={LuCalendar} accent="#64748b" />
```

### StatCardGroup

Contenedor responsivo: `grid` con `repeat(auto-fit, minmax(200px, 1fr))` — 4 columnas desktop, 2 tablet, 1 móvil.

```tsx
<StatCardGroup>
  <StatCard value={5} label="Disponibles" icon={LuCheck} accent="#10b981" />
  <StatCard value={2} label="Pendientes" icon={LuClock} accent="#f59e0b" />
</StatCardGroup>
```

## FormLayout

Grilla de formulario.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `columns` | `1 \| 2 \| 3 \| 4` | `1` | Columnas en desktop |
| `gap` | `string` | `'20px'` | Separación (style inline) |
| `children` / `className` | — | — | Contenido |

Breakpoint `max-[640px]`: colapsa a `grid-cols-1`.

```tsx
<FormLayout columns={2}>
  <FormField label="Nombre" name="name">...</FormField>
  <FormField label="Email" name="email">...</FormField>
</FormLayout>
```

## Gotchas

- `StatCard` usa CSS vars inline prop-driven (`--accent-color`, `--icon-bg`), no tokens del theme — al overridear con `accent` se espera un color CSS válido.
- `FormLayoutProps` se declara en `forms/types.ts` y se re-exporta aquí (no hay declaraciones duplicadas).