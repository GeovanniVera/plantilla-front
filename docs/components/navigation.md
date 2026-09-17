# Navigation

Componentes de navegación: Breadcrumb, Tabs, Sidebar.

## Breadcrumb

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `items` | `BreadcrumbItem[]` | required | `[{ label, href?, icon? }]` |
| `separator` | `'/' \| '>' \| '›' \| ReactNode` | `LuChevronRight` | Separador |
| `className` | `string` | — | Clase CSS |

### Colapso

Si `items.length > 3`, los items del medio se colapsan en un botón con `LuEllipsis` + tooltip nativo.

### Accesibilidad

- `<nav aria-label="Breadcrumb">`
- `<ol>` semántico
- Último item con `aria-current="page"`

### Uso

```tsx
<Breadcrumb
  items={[
    { label: 'Inicio', href: '/', icon: LuHome },
    { label: 'Usuarios', href: '/users' },
    { label: 'Juan Pérez' },
  ]}
/>
```

---

## Tabs (Compound Pattern)

### Props (Root)

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | — | Controlled value |
| `defaultValue` | `string` | — | Uncontrolled default |
| `onChange` | `(value: string) => void` | — | Callback de cambio |
| `variant` | `'underline' \| 'pills' \| 'enclosed'` | `'underline'` | Variante visual |

### Sub-componentes

| Componente | Props | Descripción |
|------------|-------|-------------|
| `Tabs.List` | `children` | `<div role="tablist">` |
| `Tabs.Trigger` | `value`, `icon?`, `disabled?`, `children` | `<button role="tab">` |
| `Tabs.Panel` | `value`, `children` | `<div role="tabpanel">` |

### Accesibilidad

- `role="tablist"`, `role="tab"`, `role="tabpanel"`
- `aria-selected`, `aria-controls`, `aria-labelledby`
- `tabIndex` roving (navegación por teclado)

### Uso

```tsx
<Tabs defaultValue="general">
  <Tabs.List>
    <Tabs.Trigger value="general">General</Tabs.Trigger>
    <Tabs.Trigger value="advanced" icon={LuSettings}>Avanzado</Tabs.Trigger>
    <Tabs.Trigger value="danger" disabled>Peligro</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Panel value="general">
    <GeneralSettings />
  </Tabs.Panel>
  <Tabs.Panel value="advanced">
    <AdvancedSettings />
  </Tabs.Panel>
</Tabs>
```

### Variantes

| Variante | Estilo |
|----------|--------|
| `underline` | Borde inferior en tab activa |
| `pills` | Fondo coloreado en tab activa |
| `enclosed` | Tabs con bordes y fondo |

---

## Sidebar (Compound Pattern — el más complejo)

### Sub-componentes

| Componente | Descripción |
|------------|-------------|
| `Sidebar.Root` | Provee `SidebarContext`, maneja mobile/responsive |
| `Sidebar.Header` | Zona del logo |
| `Sidebar.Toggle` | Botón expand/collapse |
| `Sidebar.Nav` | `<nav aria-label="Navegación principal">` |
| `Sidebar.Footer` | Zona inferior |

### Contexto

```typescript
{
  expanded: boolean,
  toggleExpanded: () => void
}
```

### NavItem Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `as` | `ElementType` | Componente renderizador (default: `Link`) |
| `to` | `string` | Ruta de navegación |
| `icon` | `ElementType` | Icono react-icons |
| `label` | `string` | Texto |
| `active` | `boolean` | Estado activo |
| `danger` | `boolean` | Estilo peligroso (rojo) |

### NavGroup Props

Accordion con animación `grid-template-rows: 0fr → 1fr` (sin max-height guessing).

| Prop | Tipo | Descripción |
|------|------|-------------|
| `icon` | `ElementType` | Icono del grupo |
| `label` | `string` | Texto del grupo |
| `open` | `boolean` | Estado abierto |
| `active` | `boolean` | Tiene item activo |
| `onToggle` | `() => void` | Toggle del accordion |
| `children` | `ReactNode` | Items del grupo |

### Componentes Auxiliares

| Componente | Props | Descripción |
|------------|-------|-------------|
| `SidebarLogo` | `src`, `name` | Logo con Link a `/` |
| `UserAvatar` | `name`, `role` | Avatar con inicial |
| `UserClock` | — | Reloj en tiempo real (HH:MM:SS) |

### Uso

```tsx
<Sidebar.Root>
  <Sidebar.Header>
    <SidebarLogo src="/logo.svg" name="Mi App" />
  </Sidebar.Header>

  <Sidebar.Toggle />

  <Sidebar.Nav>
    <NavItem to="/dashboard" icon={LuLayoutDashboard} label="Dashboard" active />
    <NavItem to="/users" icon={LuUsers} label="Usuarios" />
    <NavItem to="/settings" icon={LuSettings} label="Configuración" />

    <NavGroup icon={LuFolder} label="Proyectos" open onToggle={toggle}>
      <NavItem to="/projects/1" label="Proyecto 1" />
      <NavItem to="/projects/2" label="Proyecto 2" />
    </NavGroup>

    <NavItem to="/logout" icon={LuLogOut} label="Salir" danger />
  </Sidebar.Nav>

  <Sidebar.Footer>
    <UserAvatar name="Juan Pérez" role="Admin" />
    <UserClock />
  </Sidebar.Footer>
</Sidebar.Root>
```

### Responsive

- **Desktop**: Sidebar expanded/collapsed con toggle
- **Mobile**: Drawer overlay con body scroll lock
- **Breakpoint**: `useMediaQuery` hook

### Dependencias

- `react-router`
- `@hooks/useMediaQuery`
- `Sidebar.module.css` (transiciones expand/collapse)
