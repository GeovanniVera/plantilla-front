# Documentación del Proyecto

## Módulos Documentados

### 🔴 Auth
Módulo de autenticación y autorización.

- [README](./auth/README.md) - Visión general y quick start
- [Arquitectura](./auth/architecture.md) - Contratos, persistencia, eventos
- [Flujos](./auth/flows.md) - Secuencias paso a paso
- [API Reference](./auth/api-reference.md) - Endpoints y contratos
- [Guards](./auth/guards.md) - Protección de rutas

### 🔴 API Client
Cliente HTTP centralizado para comunicación con el backend.

- [README](./api-client/README.md) - Visión general y quick start
- [Arquitectura](./api-client/architecture.md) - Pipeline de requests, config, timeout
- [Types](./api-client/types.md) - Contratos ApiResponse, User, AuthResponse, etc.
- [Interceptors](./api-client/interceptors.md) - Refresh token, deduplicación, anti-bucle

### 🔴 Theme
Sistema de diseño y theming con paletas semánticas accesibles.

- [README](./theme/README.md) - Visión general y quick start
- [Arquitectura](./theme/architecture.md) - Flujo de datos, effects, orquestación
- [Tokens](./theme/tokens.md) - Tokens disponibles y CSS variables
- [Semantic](./theme/semantic.md) - Generador de paletas OKLCH
- [Contrast](./theme/contrast.md) - Motor WCAG 2.1
- [Persistence](./theme/persistence.md) - Strategy Pattern para persistencia

### 🔴 Components
Design system completo con 30+ componentes UI.

- [README](./components/README.md) - Visión general y patrones
- [Primitives](./components/primitives.md) - Button, Input, Select, Textarea, Checkbox, Radio, Badge, StatusDot
- [Forms](./components/forms.md) - useForm, Form, FormField, FormContext
- [Overlays](./components/overlays.md) - Modal, Drawer, DrawerStack, ConfirmDialog
- [Feedback](./components/feedback.md) - Toast, Spinner, Skeleton
- [Navigation](./components/navigation.md) - Breadcrumb, Tabs, Sidebar
- [Layout](./components/layout.md) - Card, StatCard, FormLayout
- [Data Display](./components/data-display.md) - BaseTable, DataTable, ExcelTable, Calendar
- [Patterns](./components/patterns.md) - Compound, Dual API, Context-driven, Portal, etc.

### 🔴 Hooks
Hooks personalizados para autenticación y responsive design.

- [README](./hooks/README.md) - Inventario y arquitectura
- [useAuth](./hooks/useAuth.md) - 8 hooks de autenticación con React Query
- [Responsive](./hooks/responsive.md) - useMediaQuery y useIsMobile
- [Gaps](./hooks/gaps.md) - Hooks faltantes (useDebounce, useLocalStorage)

### 🔴 Features
Funcionalidades de negocio (solo settings implementada).

- [README](./features/README.md) - Inventario y arquitectura
- [Settings](./features/settings.md) - Configuración de brand colors y theming

### 🔴 Pages
12 páginas del proyecto (7 auth, 3 error, 2 otras).

- [README](./pages/README.md) - Inventario, flujos, lazy loading
- [Auth](./pages/auth.md) - Login, Register, ForgotPassword, VerifyOTP, ResetPassword, VerifyEmail, VerifyEmailConfirm
- [Errors](./pages/errors.md) - Forbidden (403), NotFound (404), ServerError (500)
- [Other](./pages/other.md) - TermsPage, AjustesIndex
- [Patterns](./pages/patterns.md) - Patrones, issues, bugs, recomendaciones

### 🔴 Support
Módulos de soporte: config, i18n, API client, testing, app.

- [README](./support/README.md) - Inventario y mapa de dependencias
- [Config](./support/config.md) — Variables de entorno tipadas
- [i18n](./support/i18n.md) — Internacionalización con i18next
- [Lib](./support/lib.md) — API Client, Token Store, servicios
- [Test](./support/test.md) — Infraestructura de testing con MSW
- [App](./support/app.md) — App.tsx, routes, layouts, styles, main.tsx

---

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | React 19 + TypeScript 6 |
| Bundler | Vite 8 |
| Routing | React Router 8 |
| Estilos | Tailwind CSS 4 + CSS Modules |
| State Server | TanStack React Query 5 |
| i18n | i18next + react-i18next |
| Testing | Vitest + Testing Library + MSW |
| Docs | Storybook 10 |

---

## Estructura del Proyecto

```
src/
├── auth/           # Autenticación y autorización
├── components/     # Design system (UI library)
├── config/         # Variables de entorno
├── features/       # Funcionalidades de negocio
├── hooks/          # Hooks personalizados
├── layouts/        # Estructura de página
├── lib/            # Utilidades, servicios, helpers
├── pages/          # Páginas/rutas
├── routes/         # Definición de rutas
├── styles/         # Estilos globales
├── test/           # Infraestructura de testing
├── theme/          # Sistema de diseño y theming
└── App.tsx         # Orquestación principal
```

---

## Comandos Utiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm run test
npm run test:watch
npm run test:coverage

# Lint y format
npm run lint
npm run format
npm run typecheck

# Storybook
npm run storybook
```
