# Patterns

Patrones de diseño reutilizados en el design system.

## 1. Compound Pattern

Patrón más usado. Componer componentes relacionados usando `Object.assign`.

### Mecánica

```typescript
const InputShorthand = (props) => <input {...props} />;

export const Input = Object.assign(InputShorthand, {
  Root: InputRoot,
  Control: InputControl,
  StartAddon: InputStartAddon,
  EndAdornment: InputEndAdornment,
  EndAction: InputEndAction,
});
```

### Uso

```tsx
// Shorthand (simple)
<Input value={v} onChange={setV} />

// Compound (composable)
<Input.Root>
  <Input.StartAddon>$</Input.StartAddon>
  <Input.Control />
  <Input.EndAdornment>USD</Input.EndAdornment>
</Input.Root>
```

### Componentes que lo usan

- Input, Select, Checkbox, Radio
- Badge, Card
- Modal, Drawer
- Tabs, Sidebar

---

## 2. Dual API

Shorthand para casos simples, compound para composición compleja.

### Mecánica

```tsx
// Shorthand decide internamente
<Input value={v} onChange={setV} />
// → renderiza <input> standalone

<Input startAdornment="$" endAdornment="USD" value={v} onChange={setV} />
// → renderiza InputRoot + InputControl + adornos
```

### Componentes que lo usan

- Input, Select, Checkbox, Textarea

---

## 3. Context-driven

Proveer estado y comportamiento a través de React Context.

### Mecánica

```tsx
const SidebarContext = createContext(null);

export function SidebarRoot({ children }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <SidebarContext.Provider value={{ expanded, toggleExpanded: () => setExpanded(!expanded) }}>
      <aside>{children}</aside>
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within Sidebar.Root');
  return ctx;
}
```

### Contextos del sistema

| Contexto | Usado por |
|----------|-----------|
| `SidebarContext` | Sidebar.Root, Sidebar.Toggle, Sidebar.Nav |
| `TabsContext` | Tabs.Root, Tabs.List, Tabs.Trigger, Tabs.Panel |
| `FormContext` | Form, FormField, useFormContext |
| `InputContext` | Input.Root, Input.Control, Input.StartAddon |
| `SelectContext` | Select.Root, Select.Control |
| `ModalContext` | Modal, Drawer, DrawerStack |

---

## 4. Slot Composition

Callbacks que permiten componer contenido personalizado.

### Mecánica

```tsx
<BaseTable
  columns={columns}
  data={data}
  composeHeader={(ctx) => ({
    children: <CustomHeader column={ctx.column} />,
  })}
  composeCell={(ctx) => ({
    children: ctx.column.key === 'status' 
      ? <StatusBadge value={ctx.value} />
      : ctx.value,
  })}
/>
```

### Uso

Útil cuando necesitas renderizado personalizado sin crear un componente completo.

---

## 5. Portal

Renderizar contenido fuera del árbol DOM del padre.

### Mecánica

```tsx
function Modal({ children }) {
  return createPortal(
    <div className="overlay">{children}</div>,
    document.body
  );
}
```

### Componentes que lo usan

- Modal, Drawer, DrawerStack
- Toast
- DatePicker, DateRangePicker

---

## 6. Singleton API

API registrada en un closure a nivel de módulo.

### Mecánica

```tsx
// toast.ts
let toastAPI = null;

export function registerToast(api) { toastAPI = api; }
export function unregisterToast() { toastAPI = null; }

export function useToast() {
  if (!toastAPI) throw new Error('useToast must be used within ToastProvider');
  return toastAPI;
}
```

### Ventaja

No usa React Context. Funciona desde cualquier componente dentro del provider, incluyendo callbacks y eventos.

---

## 7. CSS Module Bridge

Usar CSS modules para estilos que Tailwind no puede expresar.

### Casos de uso

- Transiciones complejas (Sidebar expand/collapse)
- Cascada de errores (FormField error borders)
- Scrollbars personalizados (Modal.Body)
- Animaciones grid (NavGroup accordion)

### Mecánica

```tsx
// FormField.module.css
.errorBorder { border-color: var(--danger); }
.errorBorderFloating { border-color: var(--danger); }

// FormField.tsx
import styles from './FormField.module.css';

<div className={clsx(styles.errorBorder, error && styles.errorBorderFloating)}>
```

---

## 8. Ref Callback Merge

Combinar ref del consumidor con lógica interna.

### Mecánica

```tsx
const Checkbox = forwardRef(({ indeterminate, ...props }, ref) => {
  const internalRef = useRef(null);
  
  const mergedRef = useCallback((node) => {
    internalRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
    
    // Lógica interna
    if (node) node.indeterminate = indeterminate;
  }, [ref, indeterminate]);
  
  return <input ref={mergedRef} {...props} />;
});
```

### Uso

Permite que el consumidor pase su propio ref mientras internamente se maneja el estado indeterminate.

---

## Resumen

| Patrón | Complejidad | Cuándo usar |
|--------|-------------|-------------|
| Compound | Alta | Componentes relacionados que se componen |
| Dual API | Media | Cuando necesitas simple + composable |
| Context-driven | Media | Estado compartido entre hijos |
| Slot Composition | Baja | Renderizado personalizado sin componente nuevo |
| Portal | Baja | Contenido fuera del árbol DOM |
| Singleton API | Baja | API global sin Context |
| CSS Module Bridge | Baja | Estilos que Tailwind no puede expresar |
| Ref Callback Merge | Media | Combinar ref del consumidor con lógica interna |
