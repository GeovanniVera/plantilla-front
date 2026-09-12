# Plantilla Front — React Admin Template

[![CI](https://github.com/GeovanniVera/plantilla-front/actions/workflows/ci.yml/badge.svg)](https://github.com/GeovanniVera/plantilla-front/actions/workflows/ci.yml)

Plantilla de front-end para aplicaciones admin, construida con **React + TypeScript**. Incluye design system, autenticación, theming, i18n y CI/CD configurado.

## Stack

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | ^19.2.8 | Framework UI |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite | ^8.2.0 | Build tool y dev server |
| Tailwind CSS | ^4.3.3 | Utility-first CSS |
| React Router | ^8.3.0 | Enrutamiento SPA |
| i18next | ^26.4.2 | Internacionalización |
| React Query | ^5.102.8 | Server state management |
| Storybook | ^10.5.10 | Documentación de componentes |

## Quick Start

```bash
# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env

# Dev server
npm run dev

# Storybook
npm run storybook
```

Credenciales mock: `admin@test.com` / `admin123`

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Type-check + build producción |
| `npm run test` | Ejecutar tests |
| `npm run test:coverage` | Tests con cobertura |
| `npm run lint` | Linting (oxlint) |
| `npm run format` | Formatear código (prettier) |
| `npm run typecheck` | Type-check sin emitir |
| `npm run storybook` | Storybook dev server |
| `npm run build-storybook` | Build estático de Storybook |

## Documentación

La documentación detallada está en [`docs/`](./docs/):

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Arquitectura y diagramas de capas |
| [CONFIGURATION.md](./docs/CONFIGURATION.md) | Variables de entorno y configuración |
| [ADDING_RESOURCES.md](./docs/ADDING_RESOURCES.md) | Cómo añadir un recurso nuevo |
| [TESTING.md](./docs/TESTING.md) | Estrategia y guía de testing |
| [NEW_PROJECT_CHECKLIST.md](./docs/NEW_PROJECT_CHECKLIST.md) | Checklist para nuevo proyecto |
| [ROADMAP.md](./docs/ROADMAP.md) | Roadmap y deuda técnica |
| [STACK.md](./docs/STACK.md) | Stack tecnológico detallado |
| [STRUCTURE.md](./docs/STRUCTURE.md) | Estructura de directorios |
| [CONVENTIONS.md](./docs/CONVENTIONS.md) | Convenciones de código |

## Licencia

Privado — Uso interno.
