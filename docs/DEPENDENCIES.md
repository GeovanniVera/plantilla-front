# Dependencias Críticas — Semilla Tecnologica

## Dependencias de producción

### React

| Paquete | Versión | Rol |
|---------|---------|-----|
| `react` | ^19.2.8 | UI library principal. Concurrent features, Suspense, lazy loading |
| `react-dom` | ^19.2.8 | Renderizado DOM. Portal rendering (Modal, Drawer, Toast) |

**Uso crítico:**
- `StrictMode` en `src/main.tsx` — Detección de side effects
- `Suspense` en `src/App.tsx` — Fallback para lazy loading
- `lazy()` en `src/App.tsx` y `src/routes/*.tsx` — Code splitting
- `createPortal()` en Modal, Drawer, ToastProvider — Renderizado fuera del árbol

### React Router

| Paquete | Versión | Rol |
|---------|---------|-----|
| `react-router` | ^8.3.0 | Client-side routing, lazy routes, guards |

**Uso crítico:**
- `BrowserRouter` en `src/main.tsx` — Context de routing
- `Routes`/`Route` en `src/App.tsx` — Definición de rutas
- `Navigate` en `src/auth/guards.tsx` — Redirecciones programáticas
- `useLocation` en guards y MainLayout — Lectura de URL actual
- `NavLink` en Sidebar — Navegación con estado activo
- `Outlet` en `src/layouts/MainLayout.tsx` — Renderizado de rutas hijas

**⚠️ Nota:** `react-router` v8 consolida `react-router-dom` en un solo paquete.

### Tailwind CSS

| Paquete | Versión | Rol |
|---------|---------|-----|
| `tailwindcss` | ^4.3.3 | Utility-first CSS framework |
| `@tailwindcss/vite` | ^4.3.3 | Integración Tailwind con Vite (CSS-first) |

**Configuración:** CSS-first en `src/styles/tailwind.css` usando bloques `@theme`.

**Uso crítico:**
- Mapeo de design tokens a utility classes (`bg-accent`, `text-white`, etc.)
- Animaciones definidas en `@theme` blocks (`btn-pulse`, `toast-in`, etc.)
- Semantic status tokens (`success-*`, `warning-*`, `danger-*`, `info-*`)
- Dark mode vía `prefers-color-scheme`

### react-icons

| Paquete | Versión | Rol |
|---------|---------|-----|
| `react-icons` | ^5.7.0 | Iconos de la UI |

**Iconos usados:** Lucide icons vía `react-icons/lu`

**Iconos principales:**
- `LuX` — Cerrar (Modal, Drawer, Toast)
- `LuCheck` — Éxito (Toast)
- `LuTriangleAlert` — Advertencia (Toast)
- `LuInfo` — Info (Toast)
- `LuCircleAlert` — Error (Toast)
- `LuEye`/`LuEyeOff` — Toggle password visibility (Input)
- `LuPanelLeftClose`/`LuPanelLeftOpen` — Toggle sidebar
- `LuSettings`, `LuLogOut`, `LuMenu` — Sidebar navigation
- `LuHouse`, `LuBlocks`, `LuMousePointerClick` — Nav items

### date-fns

| Paquete | Versión | Rol |
|---------|---------|-----|
| `date-fns` | ^4.4.0 | Manipulación de fechas |

**Uso crítico:** Calendar component, DatePicker, CalendarView, CalendarRange.

⚠️ POR CONFIRMAR: Verificar funciones específicas usadas (format, addMonths, startOfMonth, etc.)

### react-day-picker

| Paquete | Versión | Rol |
|---------|---------|-----|
| `react-day-picker` | ^10.0.1 | Calendar component base |

**Uso crítico:** Base para Calendar, DatePicker, CalendarRange.

### react-loading-skeleton

| Paquete | Versión | Rol |
|---------|---------|-----|
| `react-loading-skeleton` | ^3.5.0 | Skeleton placeholders |

**Uso:** `src/components/feedback/Skeleton.tsx`

## Dependencias de desarrollo

### Vite

| Paquete | Versión | Rol |
|---------|---------|-----|
| `vite` | ^8.2.0 | Dev server, build tool, HMR |
| `@vitejs/plugin-react` | ^6.0.4 | React Fast Refresh, JSX transform |

### TypeScript

| Paquete | Versión | Rol |
|---------|---------|-----|
| `typescript` | ~6.0.2 | Type checking, compilation |

**Config:** `tsconfig.json` referencia `tsconfig.app.json` y `tsconfig.node.json`.

### Oxlint

| Paquete | Versión | Rol |
|---------|---------|-----|
| `oxlint` | ^1.75.0 | Linting rápido (Rust-based) |

**Uso:** `npm run lint` ejecuta `oxlint`.

**⚠️ Nota:** Oxlint es significativamente más rápido que ESLint pero tiene reglas limitadas. No soporta plugins custom.

### Storybook

| Paquete | Versión | Rol |
|---------|---------|-----|
| `storybook` | ^10.5.10 | Component development environment |
| `@storybook/react-vite` | ^10.5.10 | React + Vite integration |
| `@storybook/addon-a11y` | ^10.5.10 | Accessibility testing |
| `@storybook/addon-docs` | ^10.5.10 | Auto-generated docs |
| `@storybook/addon-vitest` | ^10.5.10 | Vitest integration |
| `@storybook/addon-mcp` | latest | MCP integration |
| `@chromatic-com/storybook` | latest | Visual regression testing |

### Testing

| Paquete | Versión | Rol |
|---------|---------|-----|
| `vitest` | latest | Test runner |
| `@vitest/browser-playwright` | latest | Browser testing via Playwright |
| `@vitest/coverage-v8` | latest | Code coverage |
| `playwright` | latest | Browser automation |

⚠️ Aunque están instalados, no hay tests configurados más allá de `semantic.test.ts`.

### Types

| Paquete | Versión | Rol |
|---------|---------|-----|
| `@types/react` | ^19.2.17 | Tipos de React |
| `@types/react-dom` | ^19.2.3 | Tipos de ReactDOM |
| `@types/node` | ^24.13.3 | Tipos de Node.js (`import.meta.env`) |

## Dependencias faltantes

Según `PENDIENTES.md`:

| Herramienta | Propósito | Prioridad |
|------------|-----------|-----------|
| Prettier | Code formatting consistente | Alta |
| Husky | Pre-commit hooks | Media |
| lint-staged | Ejecutar lint en archivos staged | Media |
| @vitest/ui | UI de Vitest para debugging | Baja |
| rollup-plugin-visualizer | Análisis de bundle size | Baja |

## Matriz de dependencias por módulo

| Módulo | Dependencias críticas |
|--------|----------------------|
| `api/client.ts` | fetch (nativa), VITE_API_BASE |
| `api/auth.ts` | `api/client.ts`, `MOCK_USERS` |
| `auth/provider.tsx` | `api/auth.ts`, `api/client.ts` (tokenManager), `auth/storage.ts` |
| `auth/guards.tsx` | `react-router` (Navigate, useLocation), `auth/hooks.ts` |
| `theme/ThemeProvider.tsx` | `theme/tokens.ts`, `theme/persistence.ts`, `theme/semantic.ts` |
| `theme/semantic.ts` | `theme/contrast.ts` |
| `components/primitives/Input.tsx` | `react-icons/lu` (LuEye, LuEyeOff), `components/forms/types.ts` |
| `components/feedback/Toast.tsx` | `react-icons/lu` (icons), `components/feedback/types.ts` |
| `components/overlays/Modal.tsx` | `react-dom` (createPortal), `react-icons/lu` (LuX) |
| `components/navigation/sidebar/Sidebar.tsx` | `react-router` (useLocation), `hooks/useMediaQuery.ts`, `react-icons/lu` |
| `components/data-display/calendar/*` | `react-day-picker`, `date-fns` |
| `layouts/MainLayout.tsx` | `react-router` (Outlet, useLocation, Link, NavLink), `components/navigation/sidebar/*` |
