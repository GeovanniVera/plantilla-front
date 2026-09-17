# Overlays

Componentes de superposición: Modal, Drawer, DrawerStack, ConfirmDialog.

## Modal (Compound Pattern)

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controla visibilidad |
| `onClose` | `() => void` | required | Callback de cierre |
| `width` | `number \| string` | `520` | Ancho de la ventana |
| `maxHeight` | `string` | `'85vh'` | Altura máxima |
| `children` | `ReactNode` | required | Contenido |

### Sub-componentes

| Componente | Props | Descripción |
|------------|-------|-------------|
| `Modal.Header` | `title`, `rightSlot`, `showClose` (default true), `children` | Cabecera con título |
| `Modal.Body` | `children` | Cuerpo scrollable |
| `Modal.Footer` | `children` | Pie con borde superior |

### Accesibilidad

- `role="dialog"`, `aria-modal="true"`
- Cierre con Escape
- Click en overlay cierra
- Focus trap dentro del modal

### Portal

`createPortal(..., document.body)`

### Uso

```tsx
<Modal isOpen={showModal} onClose={() => setShowModal(false)}>
  <Modal.Header title="Confirmar acción" />
  <Modal.Body>
    <p>¿Estás seguro de que deseas continuar?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancelar
    </Button>
    <Button onClick={handleConfirm}>Confirmar</Button>
  </Modal.Footer>
</Modal>
```

---

## Drawer (Compound Pattern)

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controla visibilidad |
| `onClose` | `() => void` | required | Callback de cierre |
| `width` | `number \| string` | `480` | Ancho del drawer |
| `children` | `ReactNode` | required | Contenido |

### Sub-componentes

Misma API que Modal pero con título alineado a la izquierda:
- `Drawer.Header`
- `Drawer.Body`
- `Drawer.Footer`

### Responsive

En `max-[480px]` colapsa a bottom sheet:
- `rounded-t-[16px]`
- `max-h-[85vh]`

### Uso

```tsx
<Drawer isOpen={showDrawer} onClose={() => setShowDrawer(false)}>
  <Drawer.Header title="Detalles" />
  <Drawer.Body>
    <p>Contenido del drawer</p>
  </Drawer.Body>
  <Drawer.Footer>
    <Button onClick={() => setShowDrawer(false)}>Cerrar</Button>
  </Drawer.Footer>
</Drawer>
```

---

## DrawerStack

Drawer multi-nivel con breadcrumbs y animaciones.

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controla visibilidad |
| `onClose` | `() => void` | required | Callback de cierre |
| `level` | `number` | `0` | Nivel actual (0 = primero) |
| `onBack` | `() => void` | — | Callback de retroceso |
| `onNavigate` | `(level: number) => void` | — | Click en breadcrumb |
| `breadcrumbs` | `DrawerBreadcrumb[]` | — | Items de navegación `[{ label, level }]` |
| `title` | `string` | `''` | Título (cuando no hay breadcrumbs) |
| `width` | `number \| string` | `480` | Ancho |
| `children` | `ReactNode` | required | Contenido |

### Comportamiento

- **Escape**: retrocede si `level > 0`, cierra si `level === 0`
- **Animaciones**: push/pop según dirección de navegación
- **Breadcrumbs**: navegación rápida entre niveles
- **Indicador de nivel**: dots que muestran profundidad

### Uso

```tsx
const [level, setLevel] = useState(0);

<DrawerStack
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  level={level}
  onBack={() => setLevel(level - 1)}
  onNavigate={(l) => setLevel(l)}
  breadcrumbs={[
    { label: 'Usuarios', level: 0 },
    { label: 'Detalle', level: 1 },
    { label: 'Editar', level: 2 },
  ]}
>
  {level === 0 && <UserList />}
  {level === 1 && <UserDetail />}
  {level === 2 && <UserEdit />}
</DrawerStack>
```

---

## ConfirmDialog

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controla visibilidad |
| `onClose` | `() => void` | required | Callback de cierre |
| `onConfirm` | `() => void` | required | Callback de confirmación |
| `title` | `string` | required | Título del diálogo |
| `message` | `string` | required | Mensaje descriptivo |
| `confirmLabel` | `string` | `'Confirmar'` | Label del botón confirmar |
| `cancelLabel` | `string` | `'Cancelar'` | Label del botón cancelar |
| `variant` | `'default' \| 'destructive' \| 'warning' \| 'info'` | `'default'` | Variante de color/icono |
| `icon` | `ReactNode` | — | Override del icono auto-generado |

### Variantes

| Variante | Icono | Color Botón Confirmar |
|----------|-------|----------------------|
| `default` | — | primary |
| `destructive` | `LuTrash2` | danger |
| `warning` | `LuAlertTriangle` | warning |
| `info` | `LuInfo` | info |

### Uso

```tsx
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="Eliminar usuario"
  message="Esta acción no se puede deshacer. El usuario será eliminado permanentemente."
  confirmLabel="Eliminar"
  variant="destructive"
/>
```

### Patrón Interno

Compone `Modal` internamente:
```tsx
<Modal isOpen={isOpen} onClose={onClose} width={420}>
  <Modal.Header title={title} />
  <Modal.Body>
    <div className="flex gap-3">
      {icon}
      <p>{message}</p>
    </div>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
    <Button variant={buttonVariant} onClick={onConfirm}>{confirmLabel}</Button>
  </Modal.Footer>
</Modal>
```

---

## Compartido: ModalContext

Modal y Drawer comparten el mismo contexto para manejar:
- Estado de apertura
- Focus management
- Scroll lock del body
- Cierre con Escape
