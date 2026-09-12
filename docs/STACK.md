# Stack Tecnológico — Semilla Tecnologica

## Framework y runtime

| Tecnología | Versión | Rol |
|------------|---------|-----|
| React | 19.2.8 | UI library (concurrent features, Suspense, lazy) |
| TypeScript | 6.0.2 | Type safety, IntelliSense, compile-time checks |
| Vite | 8.2.0 | Dev server, build tool, HMR, code splitting |

## UI y estilos

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Tailwind CSS | 4.3.3 | Utility-first CSS, design tokens via CSS variables |
| react-icons | 5.7.0 | Iconos (Lucide icons via `react-icons/lu`) |
| react-loading-skeleton | 3.5.0 | Skeleton placeholders para carga de datos |

### Fuentes tipográficas

| Fuente | Tipo | Uso |
|--------|------|-----|
| Inter | Sans-serif | Texto general, UI |
| Fraunces | Serif | Headings, display |

⚠️ POR CONFIRMAR: Las fuentes se declaran en `src/index.css` — verificar si se cargan vía Google Fonts o auto-hosted.

## Routing

| Tecnología | Versión | Rol |
|------------|---------|-----|
| react-router | 8.3.0 | Client-side routing, lazy route loading, guards |

## Formularios y fechas

| Tecnología | Versión | Rol |
|------------|---------|-----|
| react-day-picker | 10.0.1 | Calendar component, date range picking |
| date-fns | 4.4.0 | Manipulación de fechas (used por Calendar, DatePicker) |

## Testing

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Vitest | latest | Test runner (configured, minimal usage) |
| Playwright | latest | Browser automation (via `@vitest/browser-playwright`) |
| @vitest/coverage-v8 | latest | Code coverage |
| Storybook | 10.5.10 | Component documentation + visual testing |

### Storybook Addons

| Addon | Rol |
|-------|-----|
| `@storybook/addon-a11y` | Accessibility checks (WCAG) |
| `@storybook/addon-docs` | Auto-generated documentation |
| `@storybook/addon-mcp` | MCP integration |
| `@storybook/addon-vitest` | Test integration |
| `@storybook/react-vite` | Vite integration for Storybook |
| `@chromatic-com/storybook` | Visual regression testing |

## Linting

| Tecnología | Versión | Rol |
|------------|---------|-----|
| Oxlint | 1.75.0 | Linting rápido (Rust-based, ESLint alternative) |

## Build tools

| Tecnología | Versión | Rol |
|------------|---------|-----|
| @vitejs/plugin-react | 6.0.4 | React Fast Refresh, JSX transform |
| @tailwindcss/vite | 4.3.3 | Tailwind integration con Vite (CSS-first) |

## Types

| Paquete | Rol |
|---------|-----|
| @types/react | Tipos de React |
| @types/react-dom | Tipos de ReactDOM |
| @types/node | Tipos de Node.js (para `import.meta.env`) |

## Scripts disponibles

```jsonc
{
  "dev": "vite",                    // Dev server en http://localhost:5173
  "build": "tsc -b && vite build",  // Type-check + build para producción
  "lint": "oxlint",                 // Linting con Oxlint
  "preview": "vite preview",        // Preview del build de producción
  "storybook": "storybook dev -p 6006",         // Storybook dev
  "build-storybook": "storybook build"          // Storybook estático
}
```

⚠️ POR CONFIRMAR: No hay script de `test` en `package.json` aunque Vitest está configurado. El test se ejecuta a través de Storybook addon o directamente con `npx vitest`.

## Dev server

- **Puerto**: 5173 (Vite default)
- **API proxy**: Las llamadas a `/api` se redirigen según `VITE_API_BASE` (default: `/api`)
- **HMR**: Habilitado por defecto con Vite

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_BASE` | `/api` | URL base para llamadas API (`src/api/client.ts:9`) |

⚠️ No hay archivos `.env` en el repositorio. Se espera que se creen en el deploy.
