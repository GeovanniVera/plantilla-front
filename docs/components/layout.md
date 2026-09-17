# Layout

Componentes de estructura: Card, StatCard, FormLayout.

## Card (Compound Pattern)

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outlined' \| 'elevated' \| 'flat'` | `'default'` | Variante visual |
| `onClick` | `() => void` | — | Hace la card clickable |

### Sub-componentes

| Componente | Descripción |
|------------|-------------|
| `Card.Image` | `<img>` con wrapper `aspect-video` |
| `Card.Header` | Cabecera de la card |
| `Card.Title` | Título (h3) |
| `Card.Description` | Descripción |
| `Card.Body` | Cuerpo (`flex-1`) |
| `Card.Footer` | Pie con borde superior |

### Variantes

| Variante | Estilo |
|----------|--------|
| `default` | Bordes redondeados, sombra sutil |
| `outlined` | Solo bordes, sin sombra |
| `elevated` | Sombra pronunciada |
| `flat` | Sin bordes ni sombra |

### Accesibilidad (Click)

- `role="button"`
- `tabIndex={0}`
- `onKeyDown` Enter/Space

### Uso

```tsx
// Básica
<Card variant="outlined">
  <Card.Header>
    <Card.Title>Título</Card.Title>
    <Card.Description>Descripción</Card.Description>
  </Card.Header>
  <Card.Body>
    <p>Contenido</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>

// Con imagen
<Card>
  <Card.Image src="/photo.jpg" alt="Foto" />
  <Card.Body>
    <Card.Title>Foto</Card.Title>
  </Card.Body>
</Card>

// Clickable
<Card onClick={() => navigate('/detail')}>
  <Card.Body>
    <Card.Title>Haz click</Card.Title>
  </Card.Body>
</Card>
```

---

## StatCard + StatCardGroup

### StatCard Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `number` | required | Valor numérico |
| `label` | `string` | required | Descripción (uppercase) |
| `accent` | `string` | `'#94a3b8'` | Color de acento (borde superior + ícono) |
| `icon` | `IconType` | — | Ícono react-icons |

### StatCardGroup

Grid responsivo `auto-fit minmax(200px, 1fr)`.

### Uso

```tsx
<StatCardGroup>
  <StatCard value={1234} label="Usuarios" accent="#22c55e" icon={LuUsers} />
  <StatCard value={567} label="Pedidos" accent="#3b82f6" icon={LuShoppingCart} />
  <StatCard value={89} label="Ventas" accent="#f59e0b" icon={LuDollarSign} />
</StatCardGroup>
```

---

## FormLayout

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `columns` | `1 \| 2 \| 3 \| 4` | `1` | Columnas del grid |
| `gap` | `string` | `'20px'` | Separación |
| `children` | `ReactNode` | required | Contenido |

### Responsive

`max-[640px]:grid-cols-1` (colapsa a 1 columna en móvil).

### Uso

```tsx
<FormLayout columns={2}>
  <FormField label="Nombre">
    <Input value={name} onChange={setName} />
  </FormField>
  <FormField label="Email">
    <Input value={email} onChange={setEmail} />
  </FormField>
  <FormField label="Teléfono">
    <Input value={phone} onChange={setPhone} />
  </FormField>
  <FormField label="Dirección">
    <Input value={address} onChange={setAddress} />
  </FormField>
</FormLayout>

<FormLayout columns={3} gap="16px">
  {/* ... */}
</FormLayout>
```

---

## Ejemplo: Dashboard Layout

```tsx
function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <StatCardGroup>
        <StatCard value={users} label="Usuarios" icon={LuUsers} accent="#22c55e" />
        <StatCard value={orders} label="Pedidos" icon={LuShoppingCart} accent="#3b82f6" />
      </StatCardGroup>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <Card.Header>
            <Card.Title>Actividad reciente</Card.Title>
          </Card.Header>
          <Card.Body>
            <ActivityList />
          </Card.Body>
        </Card>

        <Card>
          <Card.Header>
            <Card.Title>Resumen</Card.Title>
          </Card.Header>
          <Card.Body>
            <SummaryStats />
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
```
