# Components — Design System

Componentes UI del proyecto plantilla-front. Arquitectura hexagonal por capas.

## Estructura

```
src/components/
├── primitives/          # Componentes hoja (Button, Input, Select, etc.)
├── forms/               # useForm + Form + FormField (orquestación)
├── overlays/            # Modal, Drawer, ConfirmDialog
├── feedback/            # Toast, Spinner, Skeleton
├── navigation/          # Breadcrumb, Tabs, Sidebar
├── layout/              # Card, StatCard, FormLayout
├── data-display/        # Tablas, Calendar
└── ErrorBoundary.tsx    # Fallback global de errores
```

## Grafo de Dependencias

```
forms/types.ts  ← Fuente única de verdad para contratos
      ↓
  primitives   ← Componentes hoja, sin lógica de negocio
      ↓
    forms      ← useForm + Form + FormField
      ↓
  feedback / overlays / navigation / layout / data-display
```

**Regla**: cada `index.ts` solo importa módulos hoja, nunca otro barrel de familia.

## Patrones de Diseño

| Patrón | Componentes | Mecánica |
|--------|-------------|----------|
| **Compound** | Input, Select, Checkbox, Radio, Badge, Card, Modal, Drawer, Tabs, Sidebar | `Object.assign(Root, { Sub1, Sub2 })` |
| **Dual API** | Input, Select, Checkbox, Textarea | Shorthand (simple) + compound (composable) |
| **Context-driven** | Sidebar, Tabs, Form, Input, Select | `createContext` + `useContext` |
| **Slot composition** | BaseTable | `composeHeader`, `composeCell` callbacks |
| **Portal** | Modal, Drawer, DrawerStack, Toast, DatePicker | `createPortal` a `document.body` |
| **Singleton API** | useToast | Module-level closure, no Context |
| **CSS Module bridge** | FormField, BaseTable, Sidebar, ExcelTable | CSS modules para cascada compleja |

## Documentación por Subcategoría

- [Primitives](./primitives.md) — Button, Input, Select, Textarea, Checkbox, Radio, Badge, StatusDot
- [Forms](./forms.md) — useForm, Form, FormField, FormContext
- [Overlays](./overlays.md) — Modal, Drawer, DrawerStack, ConfirmDialog
- [Feedback](./feedback.md) — Toast, Spinner, Skeleton
- [Navigation](./navigation.md) — Breadcrumb, Tabs, Sidebar
- [Layout](./layout.md) — Card, StatCard, FormLayout
- [Data Display](./data-display.md) — BaseTable, DataTable, ExcelTable, Calendar
- [Patterns](./patterns.md) — Patrones de diseño reutilizables

## Accesibilidad

Todos los form controls usan `aria-*` consistentes:
- `aria-invalid` — estado de validación
- `aria-describedby` — asociación label/error/helper
- `aria-selected`, `aria-modal` — overlays y tabs
- `role="alert"`, `role="dialog"`, `role="tablist/tab/tabpanel"` — semántica

## Próximos Pasos

1. Leer la subcategoría que necesitas
2. Copiar el ejemplo de uso mínimo
3. Adaptar props según el caso
