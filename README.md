# Semilla Tecnológica — React Design System

Plantilla modular de diseño para proyectos React + TypeScript + Vite. Incluye componentes UI reutilizables, sistema de theming de marca, sidebar configurable y showcases interactivos para documentación y demostración a stakeholders.

---

## Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.x | Framework UI |
| TypeScript | 6.x | Tipado estático |
| Vite | 8.x | Build tool y dev server |
| React Router | 8.x | Enrutamiento SPA |
| react-icons | 5.x | Iconografía (Lucide) |
| Storybook | 10.x | Documentación de componentes |
| Oxlint | 1.x | Linting rápido |
| Vitest | latest | Testing |
| Playwright | latest | E2E testing |

---

## Estructura del proyecto

```
src/
├── components/
│   ├── sidebar/                    # Sidebar configurable
│   │   ├── Sidebar.tsx             # Contenedor principal (toggle, mobile, desktop)
│   │   ├── Sidebar.module.css
│   │   ├── NavItem.tsx             # Link de navegación individual
│   │   ├── NavGroup.tsx            # Grupo desplegable con sub-items
│   │   ├── SidebarLogo.tsx         # Logo + nombre de empresa
│   │   ├── UserAvatar.tsx          # Card de perfil (relieve neumórfico)
│   │   ├── UserClock.tsx           # Reloj en tiempo real
│   │   ├── MobileBottomBar.tsx     # Barra inferior para mobile
│   │   └── types.ts                # Tipos compartidos
│   │
│   └── ui/                         # Design System
│       ├── Button.tsx              # Botón (primary, secondary, ghost)
│       ├── Badge.tsx               # Badge (default, success, warning, info)
│       ├── Card.tsx                # Card con header + body
│       ├── CategorySection.tsx     # Sección agrupadora para showcases
│       │
│       ├── Table/                  # Tabla base y variante DataTable
│       │   ├── Table.tsx           # BaseTable — estructura genérica tipada
│       │   ├── DataTable.tsx       # DataTable — filtros + paginación
│       │   ├── FilterDropdown.tsx   # Dropdown de filtros por columna
│       │   ├── hooks/
│       │   │   ├── useTableFilters.ts
│       │   │   └── useTablePagination.ts
│       │   └── types.ts
│       │
│       ├── ExcelTable/             # Tabla estilo hoja de cálculo
│       │   ├── ExcelTable.tsx      # Celdas editables, navegación por teclado
│       │   └── types.ts
│       │
│       ├── Pagination/             # Paginador genérico
│       │   ├── Pagination.tsx
│       │   └── Pagination.module.css
│       │
│       └── Form/                   # Sistema de formularios
│           ├── Input.tsx           # Input genérico (text, email, password, number, tel)
│           ├── Textarea.tsx        # Textarea auto-resize
│           ├── Select.tsx          # Select con icono chevron
│           ├── Checkbox.tsx        # Checkbox custom animado
│           ├── Radio.tsx           # Radio + RadioGroup
│           ├── FormField.tsx       # Wrapper: label + input + error + helper
│           ├── FormLayout.tsx      # Grid: 1, 2, 3 o 4 columnas
│           ├── Form.module.css     # Estilos con 3 variantes (default, filled, outlined)
│           └── types.ts
│
├── theme/                          # Sistema de theming de marca
│   ├── tokens.ts                   # Tokens de color por defecto
│   ├── ThemeProvider.tsx           # Context + aplicación en vivo
│   ├── theme-context.ts            # React Context definition
│   ├── persistence.ts              # Capa de persistencia (localStorage → API)
│   ├── useTheme.ts                 # Hook para consumir el theme
│   ├── BrandColorSettings.tsx       # Panel de configuración en /ajustes
│   ├── ContrastChecker.tsx          # Validador WCAG de contraste
│   └── ThemePreview.tsx             # Preview en vivo de componentes
│
├── hooks/
│   └── useMediaQuery.ts            # Hook reutilizable para breakpoints
│
├── layouts/
│   └── MainLayout.tsx              # Layout: sidebar + contenido principal
│
├── pages/                          # Páginas y showcases
│   ├── ComponentesBotones.tsx      # Showcase de botones
│   ├── ComponentesCards.tsx         # Showcase de cards
│   ├── TablesShowcase.tsx           # Configurador interactivo de tablas
│   ├── FormShowcase.tsx             # Configurador interactivo de formularios
│   └── components-data/            # Datos de ejemplo para showcases
│
├── App.tsx                         # Definición de rutas
├── main.tsx                        # Entry point (StrictMode, Router, ThemeProvider)
└── index.css                       # Variables globales + temas light/dark
```

---

## Arquitectura del Design System

### Principios de diseño

1. **Composición sobre configuración** — Los componentes se componen entre sí, no se configuran con docenas de props booleanas
2. **Separación de concerns** — Lógica de negocio separada de la vista
3. **Tipado genérico** — Componentes como `BaseTable<T>` funcionan con cualquier tipo de dato
4. **Variantes por CSS** — Cada componente soporta variantes visuales (`default`, `filled`, `outlined`)
5. **Theming de marca** — Tokens de color configurables en vivo que persisten entre sesiones

### Patrón de composición (ejemplo: Tablas)

```
BaseTable<T>           → Estructura genérica (columnas + filas + empty state)
  ├── DataTable       → + filtros + paginación (client-side)
  └── ExcelTable      → + celdas editables + navegación por teclado

Uso en producción:
<DataTable
    columns={userColumns}
    data={users}
    keyExtractor={(u) => u.id}
    filters
    pagination
/>
```

### Patrón de composición (ejemplo: Formularios)

```
FormLayout             → Grid responsive (1-4 columnas)
  └── FormField        → Label + input + error + helper text
       └── Input       → Input con variantes (default, filled, outlined)

Uso en producción:
<FormLayout columns={2}>
    <FormField label="Email" required error={errors.email}>
        <Input type="email" variant="filled" value={data.email} onChange={...} />
    </FormField>
</FormLayout>
```

---

## Variantes visuales

### Componentes de formulario

| Variante | Estilo | Uso recomendado |
|----------|--------|-----------------|
| `default` | Bordes sutiles, esquinas redondeadas 8px | Apps web generales |
| `filled` | Fondo relleno, borde inferior | Apps mobile / Material Design |
| `outlined` | Bordes prominentes 2px, sin relleno | Formularios densos / Dashboards |

### Sidebar

| Comportamiento | Desktop | Mobile |
|----------------|---------|--------|
| Colapsado | 80px con solo iconos centrados | — |
| Expandido | 240px con icono + texto | 280px slide-in |
| Toggle | Botón fijo en el nav | Bottom bar (56px) |
| Animación | CSS grid-template-rows (0fr → 1fr) | transform: translateX + backdrop |

---

## Sistema de theming

### Tokens disponibles

| Token | CSS Variable | Default Light | Default Dark |
|-------|-------------|---------------|--------------|
| `primary` | `--primary` | `#0d9488` | `#2dd4bf` |
| `secondary` | `--secondary` | `#6366f1` | `#818cf8` |
| `accent` | `--accent` | `#0d9488` | `#2dd4bf` |
| `background` | `--bg` | `#f6f5f1` | `#16171d` |
| `surface` | `--code-bg` | `#edecea` | `#1f2028` |
| `text` | `--text` | `#5a5565` | `#9ca3af` |
| `text-h` | `--text-h` | `#1a1525` | `#f3f4f6` |
| `border` | `--border` | `#e4e2dc` | `#2e303a` |

### Persistencia

```typescript
// Cambiar adaptador de localStorage a API
import { setStorageAdapter } from './theme/persistence'

setStorageAdapter({
    load: () => fetch('/api/theme').then(r => r.json()),
    save: (theme) => fetch('/api/theme', { method: 'PUT', body: JSON.stringify(theme) }),
    reset: () => fetch('/api/theme', { method: 'DELETE' }),
})
```

---

## Rutas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | — | Inicio (placeholder) |
| `/proyectos` | — | Proyectos (placeholder) |
| `/componentes/botones` | `ComponentesBotones` | Showcase de botones reutilizables |
| `/componentes/cards` | `ComponentesCards` | Showcase de cards y badges |
| `/componentes/tablas` | `TablesShowcase` | Configurador interactivo de tablas |
| `/componentes/formularios` | `FormShowcase` | Configurador interactivo de formularios |
| `/ajustes` | `BrandColorSettings` | Configuración de theming de marca |

---

## Scripts

```bash
npm run dev          # Dev server con HMR
npm run build        # TypeScript check + Vite build
npm run lint         # Oxlint
npm run preview      # Preview del build
npm run storybook    # Storybook en puerto 6006
```

---

## Componentes incluidos

### UI Core

- **Button** — Primary, secondary, ghost | sm, md, lg
- **Badge** — Default, success, warning, info
- **Card** — Header + body con hover effect
- **CategorySection** — Contenedor agrupador para showcases

### Tablas

- **BaseTable\<T\>** — Estructura genérica tipada con empty state
- **DataTable** — Filtros desplegables + paginador con configurable rows per page
- **ExcelTable** — Celdas editables en línea, navegación por teclado (arrow keys, Tab, Enter)
- **Pagination** — Paginador standalone con navegación por página

### Formularios

- **Input** — Text, email, password, number, tel | 3 variantes
- **Textarea** — Auto-resize con min/max height
- **Select** — Select custom con icono chevron | 3 variantes
- **Checkbox** — Checkbox animado con icono de check
- **Radio** — Radio + RadioGroup
- **FormField** — Wrapper label + input + error + helper
- **FormLayout** — Grid responsive 1-4 columnas

### Sidebar

- **Sidebar** — Contenedor principal con toggle, mobile drawer, backdrop
- **NavItem** — Link con icono + texto, active state, danger variant
- **NavGroup** — Grupo desplegable con animación grid-template-rows
- **SidebarLogo** — Logo SVG + nombre de empresa
- **UserAvatar** — Card de perfil con relieve neumórfico
- **UserClock** — Reloj actualizado en tiempo real
- **MobileBottomBar** — Barra de navegación inferior para mobile

---

## Checklist de calidad

- [x] Tipado TypeScript estricto (sin `any`)
- [x] CSS Modules sin `!important`
- [x] Transiciones con propiedades específicas (sin `transition: all`)
- [x] Responsive design (desktop + mobile)
- [x] Theming en vivo con persistencia
- [x] Storybook para documentación de componentes
- [x] React Doctor para auditoría de calidad
- [x] Empty states en todos los componentes de datos
- [x] Empty states personalizables

---

## Licencia

MIT
