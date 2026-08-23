# Pendientes — Sesión 2

> Planeación para la siguiente sesión. Seguir los patrones de composición, variantes CSS y theming establecidos.

---

## 1. Fixes de calidad (PRIORITARIO)

> React Doctor reportó 48 issues. Los más importantes están en componentes core.

### Bugs (2)

| Componente | Línea | Issue | Fix |
|-----------|-------|-------|-----|
| `ExcelTable.tsx` | 197 | Static element interaction — `<div>` con `onKeyDown` sin `role` | Agregar `role="grid"` al wrapper |
| `ExcelTable.tsx` | 226 | Click handler sin keyboard handler — `<td>` clickeable sin soporte teclado | Agregar `onKeyDown` con Enter/Space en `<td>` |
| `Table.tsx` | 54 | Click handler sin keyboard handler | Agregar `role="button"` + `tabIndex` + `onKeyDown` |

### Performance (1)

| Componente | Línea | Issue | Fix |
|-----------|-------|-------|-----|
| `FormShowcase.tsx` | 371 | `transition: all` inline | Reemplazar con propiedades específicas |

---

## 2. Nuevos componentes UI

### 2.1 Modal / Dialog / Drawer

**Ubicación:** `src/components/overlays/`

**Componentes:**
```
src/components/overlays/
├── Modal.tsx              # Dialog centrado con backdrop
├── Modal.module.css
├── Drawer.tsx             # Panel lateral deslizante
├── Drawer.module.css
├── ConfirmDialog.tsx      # Confirmación con callback onConfirm/onCancel
└── types.ts
```

**Requerimientos:**
- **Modal**: Focus trap, escape para cerrar, backdrop click, animación fade + scale
- **Drawer**: Slide-in desde izquierda/derecha, 3 anchos (sm: 320px, md: 480px, lg: 720px)
- **ConfirmDialog**: Wraps Modal con patrón de confirmación (title, message, confirmLabel, cancelLabel)
- **Variantes**: `default`, `destructive` (botón rojo para eliminar)
- **Composición**: `<Modal><Modal.Header>...<Modal.Body>...<Modal.Footer>...`
- **Accesibilidad**: `aria-modal`, `aria-labelledby`, focus management
- **Código generado**: El FormShowcase debería poder generar modales para formularios flotantes

**Patrón de uso:**
```tsx
<Modal isOpen={open} onClose={() => setOpen(false)}>
    <Modal.Header title="Editar usuario" />
    <Modal.Body>
        <FormField label="Nombre">
            <Input value={name} onChange={...} />
        </FormField>
    </Modal.Body>
    <Modal.Footer>
        <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar</Button>
    </Modal.Footer>
</Modal>
```

---

### 2.2 Toast / Snackbar / Alerts

**Ubicación:** `src/components/feedback/`

**Componentes:**
```
src/components/feedback/
├── ToastProvider.tsx       # Context provider para gestión global
├── Toast.tsx              # Toast individual
├── Toast.module.css
├── useToast.ts            # Hook: toast.success(), toast.error(), toast.warning()
└── types.ts
```

**Requerimientos:**
- **Posiciones**: top-right, top-center, bottom-right, bottom-center
- **Variantes**: `success` (verde), `error` (rojo), `warning` (amarillo), `info` (azul)
- **Animaciones**: Slide-in desde la dirección de posición, fade-out al auto-close
- **Auto-close**: configurable (default 5s), pause on hover
- **Stacking**: máximo 3 visibles, el resto en cola
- **Acciones**: botón de cerrar + callback opcional (ej: "Deshacer")
- **API imperativa**: `toast.success('Guardado')` desde cualquier componente

**Patrón de uso:**
```tsx
// En main.tsx
<ThemeProvider>
    <ToastProvider position="top-right" maxVisible={3}>
        <App />
    </ToastProvider>
</ThemeProvider>

// En cualquier componente
import { useToast } from '@components/feedback'

function MyComponent() {
    const toast = useToast()

    const handleSave = async () => {
        try {
            await api.save(data)
            toast.success('Cambios guardados')
        } catch {
            toast.error('Error al guardar', { action: { label: 'Reintentar', onClick: handleSave } })
        }
    }
}
```

---

### 2.3 Tabs y Breadcrumbs

**Ubicación:** `src/components/navigation/`

**Componentes:**
```
src/components/navigation/
├── Tabs.tsx               # Navegación por pestañas
├── Tabs.module.css
├── Breadcrumb.tsx         # Migas de pan
├── Breadcrumb.module.css
└── types.ts
```

**Requerimientos:**
- **Tabs**:
  - Variantes: `underline` (default), `pills`, `enclosed`
  - Soporte `defaultValue` y `value` controlado
  - Lazy rendering (solo renderizar el tab activo)
  - Animación de indicador activo
  - Soporte icono + label
  - Accesibilidad: `role="tablist"`, `role="tab"`, `role="tabpanel"`, arrow keys

- **Breadcrumb**:
  - Separador customizable (`,`, `/`, `>` o icono)
  - Último item como texto (no link)
  - Responsive: items intermedios colapsan en `...`
  - Soporte icono por item

**Patrón de uso:**
```tsx
<Tabs defaultValue="overview">
    <Tabs.List>
        <Tabs.Trigger value="overview">Resumen</Tabs.Trigger>
        <Tabs.Trigger value="details">Detalles</Tabs.Trigger>
        <Tabs.Trigger value="activity">Actividad</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Panel value="overview">...</Tabs.Panel>
    <Tabs.Panel value="details">...</Tabs.Panel>
</Tabs>

<Breadcrumb items={[
    { label: 'Inicio', href: '/' },
    { label: 'Proyectos', href: '/proyectos' },
    { label: 'Proyecto Alpha' },  // último = texto
]} />
```

---

### 2.4 Stat Cards / Charts Wrapper

**Ubicación:** `src/components/layout/`

**Componentes:**
```
src/components/layout/
├── StatCard.tsx           # Tarjeta de métrica con valor + tendencia
├── StatCard.module.css
├── ChartCard.tsx          # Contenedor para gráficos
├── ChartCard.module.css
└── types.ts
```

**Requerimientos:**
- **StatCard**:
  - Props: `title`, `value`, `trend` (up/down/neutral), `trendValue` (ej: +12%), `icon`, `prefix/suffix`
  - Variante: `default`, `gradient` (fondo degradado sutil)
  - Mini sparkline opcional (CSS-only o inline SVG)
  - Animación de conteo al montar (countUp)

- **ChartCard**:
  - Wrapper para librerías de gráficos (recharts, chart.js, etc.)
  - Header con título + subtítulo + acciones
  - Estado vacío y loading
  - Responsive: full width en mobile, configurable en desktop

**Patrón de uso:**
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
    <StatCard title="Usuarios activos" value={1234} trend="up" trendValue="+12%" icon={LuUsers} />
    <StatCard title="Ingresos" value="$45,200" trend="up" trendValue="+8%" prefix="$" icon={LuDollarSign} />
    <StatCard title="Tasa de rebote" value="32%" trend="down" trendValue="-5%" icon={LuTrendingDown} />
</div>

<ChartCard title="Ventas mensuales" subtitle="Últimos 12 meses">
    <YourChartComponent data={salesData} />
</ChartCard>
```

---

### 2.5 DropdownMenu / Popover

**Ubicación:** `src/components/overlays/`

**Componentes:**
```
src/components/overlays/
├── DropdownMenu.tsx       # Menú desplegable de acciones
├── DropdownMenu.module.css
├── Popover.tsx            # Contenido flotante genérico
├── Popover.module.css
└── types.ts
```

**Requerimientos:**
- **DropdownMenu**:
  - Trigger: botón, icono, o cualquier elemento
  - Posiciones: bottom-start, bottom-end, top-start, top-end
  - Items con icono + label + shortcut (ej: `Ctrl+K`)
  - Divisor entre grupos de items
  - Item de peligro (rojo, para eliminar)
  - Separator
  - Focus trap + arrow keys + escape
  - Animación: fade + scale desde el trigger

- **Popover**:
  - Contenido genérico (no solo menú)
  - Trigger: click o hover
  - Ancho configurable
  - Close on outside click + escape

**Patrón de uso:**
```tsx
// En una tabla — acciones por fila
<DropdownMenu trigger={<Button variant="ghost" icon={LuMoreHorizontal} />}>
    <DropdownMenu.Item icon={LuPencil} onClick={handleEdit}>Editar</DropdownMenu.Item>
    <DropdownMenu.Item icon={LuCopy} onClick={handleDuplicate}>Duplicar</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item icon={LuTrash2} onClick={handleDelete} variant="danger">Eliminar</DropdownMenu.Item>
</DropdownMenu>

// Popover con contenido custom
<Popover trigger={<Button>Configuración</Button>}>
    <div style={{ padding: 16 }}>
        <FormField label="Idioma">
            <Select options={[...]} />
        </FormField>
    </div>
</Popover>
```

---

## 3. Integración con showcases existentes

### 3.1 TablesShowcase

- [ ] Agregar opción de **data mode** server-side en el generador de código
- [ ] Integrar DropdownMenu como acciones de fila en el preview
- [ ] Mostrar ejemplo de uso con API real (fetch + loading + error states)

### 3.2 FormShowcase

- [ ] Integrar Modal para formularios flotantes
- [ ] Generar código con validación Zod + React Hook Form
- [ ] Agregar variante de multi-step con tabs en vez de botones

### 3.3 Nuevos showcases

- [ ] `/componentes/modales` — Showcase de Modal, Drawer, ConfirmDialog
- [ ] `/componentes/notificaciones` — Showcase de Toast con demo interactiva
- [ ] `/componentes/navegacion` — Showcase de Tabs, Breadcrumbs
- [ ] `/componentes/dashboard` — Showcase de StatCards, ChartCards

---

## 4. Sidebar — Nuevos sub-items

```tsx
// Agregar al grupo 'componentes' en Sidebar.tsx
{
    id: 'componentes',
    children: [
        { to: '/componentes/botones', icon: LuMousePointerClick, label: 'Botones' },
        { to: '/componentes/cards', icon: LuCreditCard, label: 'Cards' },
        { to: '/componentes/tablas', icon: LuTable2, label: 'Tablas' },
        { to: '/componentes/formularios', icon: LuTextCursorInput, label: 'Formularios' },
        // NUEVOS:
        { to: '/componentes/modales', icon: LuPanelRightOpen, label: 'Modales' },
        { to: '/componentes/notificaciones', icon: LuBell, label: 'Notificaciones' },
        { to: '/componentes/navegacion', icon: LuNavigation, label: 'Navegación' },
        { to: '/componentes/dashboard', icon: LuLayoutDashboard, label: 'Dashboard' },
    ],
}
```

---

## 5. Infraestructura

### 5.1 Storybook

- [ ] Configurar stories para cada componente nuevo
- [ ] Agregar addon-a11y para auditoría de accesibilidad
- [ ] Agregar addon-docs para documentación automática

### 5.2 Testing

- [ ] Configurar Vitest para unit tests
- [ ] Tests para hooks (useTableFilters, useTablePagination, useToast)
- [ ] Tests para componentes core (BaseTable, FormField, Modal)

### 5.3 React Doctor

- [ ] Alcanzar score > 70/100
- [ ] Configurar reglas custom en `.react-doctor.json`
- [ ] Integrar en CI/CD

---

## 6. Orden de ejecución sugerido

```
Día 2 — Mañana:
  1. Fixes de calidad (bugs ExcelTable + Table)
  2. Componente Modal / Drawer / ConfirmDialog
  3. Integrar Modal en FormShowcase (formularios flotantes)

Día 2 — Tarde:
  4. Componente Toast / Snackbar
  5. Componente Tabs + Breadcrumb
  6. Crear rutas y showcases para los nuevos componentes

Día 2 — Final:
  7. Actualizar sidebar con nuevos links
  8. Actualizar PENDIENTES.md con lo completado
  9. Run react-doctor y documentar score final
```

---

## 7. Notas de diseño

### Patrones a seguir

- **Cada componente** lleva su `.module.css` + `.tsx` + `types.ts`
- **Variantes** se manejan con CSS classes, no con props booleanas
- **Empty states** siempre personalizables (prop `emptyState`)
- **Tipado genérico** en componentes de datos (`<T extends object`)
- **CSS variables** del theming — nunca colores hardcodeados en componentes core
- **Sin `!important`** — usar especificidad o clases CSS
- **Sin `transition: all`** — especificar propiedades exactas
- **Accesibilidad** — aria labels, focus management, keyboard navigation

### Estructura de archivos

```
src/components/{familia}/{NombreComponente}/
├── {Componente}.tsx          # Componente principal
├── {Componente}.module.css   # Estilos CSS Modules
├── types.ts                  # Interfaces y tipos
└── index.ts                  # Barrel export (opcional)
```

### Storybook stories

```tsx
// {Componente}.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Componente } from './Componente'

const meta: Meta<typeof Componente> = {
    title: 'UI/{Componente}',
    component: Componente,
    tags: ['autodocs'],
}
export default meta
type Story = StoryObj<typeof Componente>

export const Default: Story = { args: { ... } }
export const Variante: Story = { args: { ... } }
```
