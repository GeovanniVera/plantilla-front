# Overlays (`src/components/overlays/`)

Diálogos y superficies superpuestas: modal, drawer, drawer multi-nivel y diálogo de confirmación. Todos renderizan por **portal a `document.body`** y comparten el `ModalContext` para el cierre.

## Barrel (`overlays/index.ts`)

Exporta: `Modal`, `Drawer`, `ConfirmDialog`, `DrawerStack` + tipos (`ModalProps`, `DrawerProps`, `ModalHeaderProps`, `ModalBodyProps`, `ModalFooterProps`, `ConfirmDialogProps`, `ConfirmVariant`, `DrawerStackProps`, `DrawerBreadcrumb`).

## Modal

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controla la visibilidad |
| `onClose` | `() => void` | — | Callback de cierre |
| `children` | `ReactNode` | — | Contenido |
| `width` | `number \| string` | `520` | Ancho de la ventana |
| `maxHeight` | `string` | `'85vh'` | Altura máxima |
| `className` | `string` | — | Clase adicional |

Comportamiento:

- Portal a `document.body`, `role="dialog"`, `aria-modal="true"`.
- Cierre con **Escape** y **click en el overlay** (solo si el target es el overlay mismo).
- **Sin focus trap** (deuda conocida).

```tsx
<Modal isOpen={open} onClose={close} width={560}>
  <Modal.Header title="Editar usuario" />
  <Modal.Body>...</Modal.Body>
  <Modal.Footer>
    <Button variant="ghost" onClick={close}>Cancelar</Button>
    <Button onClick={save}>Guardar</Button>
  </Modal.Footer>
</Modal>
```

### Modal.Header

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` | — | Título (centrado) |
| `rightSlot` | `ReactNode` | — | Contenido derecho; **reemplaza el botón de cierre** |
| `showClose` | `boolean` | `true` | Muestra el botón de cierre |
| `children` | `ReactNode` | — | Alternativa a `title` (contenido custom en el centro) |

El botón de cierre usa `title="Cerrar"`. `Modal.Body` es el área scrollable; `Modal.Footer` el pie con acciones. Header/Body/Footer lanzan error si se usan fuera de `Modal`/`Drawer` (vía `useModalClose`).

## Drawer

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` / `onClose` / `children` | — | — | Igual que Modal |
| `width` | `number \| string` | `480` | Ancho |
| `className` | `string` | — | Clase adicional |

- Comparte `ModalContext` y los contratos `ModalHeaderProps`/`ModalBodyProps`/`ModalFooterProps` con `Modal` (mismo contrato, header alineado a la izquierda).
- Breakpoint `max-[480px]`: colapsa a **bottom-sheet** (`w-full!` con `!important` para ganarle al width inline).
- Mismo cierre por Escape + click en overlay; sin focus trap.

```tsx
<Drawer isOpen={open} onClose={close} width={420}>
  <Drawer.Header title="Detalle" />
  <Drawer.Body>...</Drawer.Body>
  <Drawer.Footer>...</Drawer.Footer>
</Drawer>
```

## DrawerStack

Drawer multi-nivel con breadcrumbs y animación push/pop.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` / `onClose` | — | — | Igual que Drawer |
| `level` | `number` | `0` | Nivel actual (0 = primero) |
| `onBack` | `() => void` | — | Botón volver / breadcrumb |
| `onNavigate` | `(level: number) => void` | — | Click en breadcrumb no actual |
| `breadcrumbs` | `{ label: string; level: number }[]` | — | Ruta de navegación (reemplaza el título) |
| `title` | `string` | `''` | Título (cuando no hay breadcrumbs) |
| `width` | `number \| string` | `480` | Ancho |
| `children` | `ReactNode` | — | Contenido del nivel actual |

Comportamiento:

- **Escape**: si `level > 0` llama `onBack()`; si no, `onClose()`.
- Con breadcrumbs muestra el botón volver, los crumbs clicables (el último es el actual, no clicable) y el botón cerrar; sin breadcrumbs y `level > 0` muestra **dots indicadores** de nivel.
- Animación push/pop: `animate-stack-slide-forward` / `animate-stack-slide-back`, elegidas por dirección de navegación (nunca concatenadas), con `key={level}` en el contenedor de contenido.
- También colapsa a bottom-sheet en `max-[480px]`.

## ConfirmDialog

Diálogo de confirmación construido **sobre `Modal`** (width `420`).

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `isOpen` / `onClose` | — | — | Igual que Modal |
| `onConfirm` | `() => void` | — | Acción de confirmación |
| `title` | `string` | — | Título |
| `message` | `string` | — | Mensaje |
| `confirmLabel` | `string` | `'Confirmar'` | Texto del botón confirmar |
| `cancelLabel` | `string` | `'Cancelar'` | Texto del botón cancelar |
| `variant` | `'default' \| 'destructive' \| 'warning' \| 'info'` | `'default'` | Token semántico de color |
| `icon` | `ReactNode` | — | Override del ícono auto-generado |

Notas:

- **No usa el primitivo `Button`**: los botones son custom, con estilos propios por variante.
- ⚠️ **`handleConfirm` llama `onConfirm(); onClose();` en ese orden fijo**: el consumidor no controla el orden del cierre.

```tsx
<ConfirmDialog
  isOpen={open}
  onClose={close}
  onConfirm={deleteUser}
  title="Eliminar usuario"
  message="Esta acción no se puede deshacer."
  variant="destructive"
  confirmLabel="Eliminar"
/>
```

## context.ts

- `ModalContext`: `createContext<(() => void) | null>(null)` — el callback `onClose` del overlay activo.
- `useModalClose()`: devuelve el callback; **lanza error** fuera de `Modal`/`Drawer` (`'Modal.Header/Body/Footer must be used inside <Modal> or <Drawer>'`).

`Drawer` y `DrawerStack` proveen el mismo contexto, por eso los headers/bodies/footers compartidos funcionan en ambos.

## Gotchas y deudas

- **Sin focus trap** en `Modal`/`Drawer`: el foco no se confina dentro del diálogo.
- `ConfirmDialog` no usa `Button` (botones custom) y `handleConfirm` fija el orden `onConfirm()` → `onClose()`.
- `Modal.Header` con `rightSlot` **oculta** el botón de cierre (`showClose && !rightSlot`).
- La animación de entrada depende de tokens `animate-*` definidos en `src/styles/tailwind.css` (overlay-fade-in, window-slide-in, drawer-slide-in, stack-slide-forward/back).