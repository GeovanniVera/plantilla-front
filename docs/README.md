# Documentación — Plantilla Frontend Admin

Documentación de la plantilla de frontend admin, sincronizada con el código real del repositorio. Cada guía describe el estado actual de su módulo en `src/`; si un archivo de código cambia, la guía correspondiente debe actualizarse en el mismo cambio.

## Módulos documentados

| Área | Guía | Alcance |
|---|---|---|
| API client | [api-client/README.md](./api-client/README.md) | Cliente HTTP, interceptors, servicios y tipos de respuesta (`src/lib/api`) |
| Autenticación | [auth/README.md](./auth/README.md) | Autenticación y autorización: `AuthProvider`, guards, `Can`, flujos de login/registro/recuperación (`src/auth`) |
| Componentes | [components/README.md](./components/README.md) | Design system: primitives, forms, overlays, feedback, navigation, layout, data-display (`src/components`) |
| Features | [features/README.md](./features/README.md) | Features de dominio: audit, profile, roles, settings, users (`src/features`) |
| Hooks | [hooks/README.md](./hooks/README.md) | Hooks React Query de auth, `useMediaQuery`, `useIsMobile` (`src/hooks`) |
| Pages | [pages/README.md](./pages/README.md) | Páginas de auth, admin, ajustes y raíz (`src/pages`) |
| Support | [support/README.md](./support/README.md) | Configuración de soporte: app, config, i18n, lib, test |
| Theme | [theme/README.md](./theme/README.md) | `ThemeProvider`, tokens, colores semánticos OKLCH, contraste WCAG y persistencia (`src/theme`) |

## Stack tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| React / react-dom | ^19.2.8 | UI |
| react-router | ^8.3.0 | Enrutamiento declarativo (`Routes`/`Route`, sin `react-router-dom`) |
| @tanstack/react-query | ^5.102.8 | Server state (+ devtools) |
| i18next + react-i18next | ^26.4.2 / ^17.0.13 | Internacionalización |
| date-fns | ^4.4.0 | Fechas |
| react-day-picker | ^10.0.1 | Calendarios |
| react-icons | ^5.7.0 | Iconos |
| react-loading-skeleton | ^3.5.0 | Skeletons |
| TypeScript | ~6.0.2 | Tipado estático |
| Vite + @vitejs/plugin-react | ^8.2.0 / ^6.0.4 | Build tool y dev server |
| Tailwind CSS + @tailwindcss/vite | ^4.3.3 | Utility-first CSS |
| Vitest + jsdom | latest / ^30.0.1 | Testing unitario |
| MSW | ^2.15.0 | Mocks de API |
| Storybook | ^10.5.10 | Documentación de componentes (addons a11y/docs/mcp/vitest, react-vite, chromatic) |
| @testing-library/react / jest-dom / user-event | ^16.3.3 / ^7.0.1 / ^14.6.7 | Testing de UI |
| oxlint | ^1.75.0 | Linting |
| Prettier + prettier-plugin-tailwindcss | ^3.4.2 / ^0.6.9 | Formateo |
| husky + lint-staged | ^9.1.7 / ^17.5.1 | Git hooks |
| Playwright + @vitest/browser-playwright | latest | Tests de Storybook |

## Estructura del proyecto

```
src/
├── auth/          # Autenticación y autorización (AuthProvider, guards, Can)
├── components/    # Design system: primitives, forms, overlays, feedback,
│                  # navigation, layout, data-display (cada familia con barrel propio)
├── config/        # Configuración de entorno tipada (env)
├── features/      # Features de dominio: audit, profile, roles, settings, users
├── hooks/         # Hooks React Query de auth, useMediaQuery, useIsMobile
├── layouts/       # AuthLayout, MainLayout, ErrorLayout
├── lib/           # API client, token store e i18n
├── pages/         # Páginas de auth, admin, ajustes y raíz
├── routes/        # Código muerto: el router real vive en src/App.tsx
├── styles/        # Estilos globales
├── test/          # Setup de tests y mocks de MSW
├── theme/         # ThemeProvider, tokens, colores semánticos y persistencia
├── App.tsx        # Router real (todas las rutas)
└── main.tsx       # Orquestación: StrictMode → QueryClientProvider →
                   # BrowserRouter → ThemeProvider → ToastProvider → App
```

Alias de importación: `@components`, `@hooks`, `@theme`, `@config`, `@lib` → `src/*`.

## Comandos útiles

| Comando | Descripción |
|---|---|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Type-check (`tsc -b`) + build de producción |
| `npm run typecheck` | Type-check sin emitir |
| `npm run lint` | Linting (oxlint) |
| `npm run format` / `format:check` | Formatear / verificar formato (Prettier) |
| `npm run test` / `test:watch` / `test:coverage` | Tests (Vitest) |
| `npm run storybook` / `build-storybook` | Storybook dev / build estático |
| `npm run preview` | Previsualizar el build |

## Nota sobre el router

El router real de la aplicación vive en `src/App.tsx`, con todas las rutas declaradas de forma lazy. El directorio `src/routes/` es código muerto y no debe usarse como referencia.