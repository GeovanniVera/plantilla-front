# App

Orquestación principal del proyecto plantilla-front: App.tsx, routes, layouts, styles, main.tsx.

## App.tsx

### Árbol de Componentes

```
AuthProvider (contexto global)
  └── ErrorBoundary
        └── Suspense (fallback: "Cargando...")
              └── Routes
                    ├── AuthLayout (login, register)
                    ├── AuthLayout + ForgotPasswordProvider + GuestOnly
                    │     ├── /forgot-password
                    │     ├── /verify-otp
                    │     └── /reset-password
                    ├── AuthLayout (verify-email)
                    ├── Standalone (terms, 403, 500)
                    ├── ProtectedRoute + MainLayout
                    │     └── routes[] (con RequirePrivilege para /ajustes)
                    └── * → NotFoundPage
```

### Lazy Loading

11 páginas lazy-loaded:

```tsx
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const VerifyOTPPage = React.lazy(() => import('./pages/auth/VerifyOTPPage'));
const ResetPasswordPage = React.lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/auth/VerifyEmailPage'));
const VerifyEmailConfirmPage = React.lazy(() => import('./pages/auth/VerifyEmailConfirmPage'));
const ForbiddenPage = React.lazy(() => import('./pages/auth/ForbiddenPage'));
const NotFoundPage = React.lazy(() => import('./pages/auth/NotFoundPage'));
const ServerErrorPage = React.lazy(() => import('./pages/auth/ServerErrorPage'));
const TermsPage = React.lazy(() => import('./pages/auth/TermsPage'));
```

### Guards

| Guard | Uso |
|-------|-----|
| `GuestOnly` | Login, Register, ForgotPassword, VerifyOTP, ResetPassword |
| `ProtectedRoute` | Todas las rutas dentro de `MainLayout` |
| `RequirePrivilege("settings:manage")` | Rutas `/ajustes/*` |

---

## Routes

### Archivos

| Archivo | Función |
|---------|---------|
| `src/routes/index.ts` | Barrel: fusiona todos los arrays |
| `src/routes/ajustes.tsx` | 2 rutas lazy: `/ajustes` y `/ajustes/colores` |
| `src/routes/showcase.tsx` | Array vacío (limpiado) |
| `src/routes/examples.tsx` | Array vacío (limpiado) |

### Uso

```typescript
// src/routes/index.ts
import { ajustesRoutes } from './ajustes';
import { showcaseRoutes } from './showcase';
import { examplesRoutes } from './examples';

export const routes: RouteObject[] = [
  ...ajustesRoutes,
  ...showcaseRoutes,
  ...examplesRoutes,
];
```

### Extensibility

Para agregar un módulo:

1. Crear archivo `src/routes/nombre-modulo.tsx`
2. Exportar array de rutas
3. Importar y spread en `index.ts`

---

## Layouts

### MainLayout (335 líneas)

```
<div flex h-screen>
  <Sidebar>
    ├── Header: SidebarLogo + UserAvatar + UserClock
    ├── Toggle
    ├── Nav: AppNavItems (Inicio, Componentes group, Ejemplos group)
    └── Footer: AppFooter (Ajustes group + Cerrar sesión)
  </Sidebar>
  <main>
    ├── Breadcrumbs (auto from pathname)
    ├── PageHeader (auto from ROUTE_CONFIG)
    └── <Outlet />
  </main>
</div>
```

- **`ROUTE_CONFIG`**: Diccionario de `{title, subtitle}` por segmento de URL
- **`Breadcrumbs`**: Genera migas de pan desde `pathname`
- **`AppNavItems`**: Navegación con `NavGroup` colapsable y `NavItem` activo
- **`AppFooter`**: Ajustes + Logout

### AuthLayout (81 líneas)

```
<div splitLayout h-screen>
  <div leftPanel (55%)>
    <div heroBg> — gradientes + 5 iconos flotantes animados
    <div heroContent> — Logo + Brand name + tagline
  </div>
  <div rightPanel (45%)>
    <div brandMobile> — solo visible en mobile
    <Outlet />
  </div>
</div>
```

- **Responsive**: Mobile solo muestra el form. Desktop split 55/44
- **Hero animado**: 5 gradient layers + 5 floating icons
- **`prefers-reduced-motion`**: Desactiva animaciones

### ErrorLayout (62 líneas)

Componente reutilizable: `image`, `imageAlt`, `title`, `description`, `actions`, `children`.

### AuthFormLayout (84 líneas)

- **`AuthFormHeader`**: Título + subtítulo
- **`AuthFormCheckbox`**: Wrapper de `Checkbox`
- **`AuthFormActions`**: Botón CTA con Spinner + enlace secundario

---

## Styles

### tailwind.css (340 líneas)

Tailwind v4 entry con:

1. **`@import 'tailwindcss'`**: Entry point de Tailwind v4
2. **Status palette**: 24 variables de status (4 semáforos × 6 roles)
3. **Dark mode overrides**: `@media (prefers-color-scheme: dark)`
4. **Theme mapping**: Conecta variables Tailwind con CSS runtime vars
5. **Radius scale**: `--radius-sm: 6px`, `--radius-md: 8px`, `--radius-lg: 12px`
6. **Font stacks**: `--font-sans`, `--font-heading`, `--font-mono`
7. **Animations** (12 keyframes): `btn-pulse`, `toast-in/out`, `drawer-slide-in`, etc.
8. **Focus contract**: `:focus-visible` con outline accent

### index.css (108 líneas)

Design tokens base:

- `:root` con todos los tokens de color, tipografía, sombras
- **Font stack**: `--sans: Inter`, `--heading: Fraunces`, `--mono: ui-monospace`
- **Reset**: `box-sizing: border-box` global
- **Typography**: h1 (56px/36px responsive), h2 (24px/20px)
- **Root font**: 18px con responsive a 16px en ≤1024px

### Patrones

- **Design Tokens**: Variables CSS como contrato de diseño
- **Runtime theming**: Brand colors son `var(--primary)`, nunca literales
- **Dark mode via CSS**: `prefers-color-scheme` sobre las mismas variables
- **Animation tokens**: Cada animación es un token reusable

---

## main.tsx

### Punto de Entrada

```typescript
// 1. Side effects
import './lib/i18n/config';  // Inicializa i18next
import './index.css';         // Design tokens base
import './styles/tailwind.css'; // Tailwind v4 + status palette

// 2. Providers (nested)
<StrictMode>
  <QueryClientProvider client={queryClient}>
    <ReactQueryDevtools />
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider position="top-right" maxVisible={3}>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
</StrictMode>
```

### QueryClient Config

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Orden de Carga

1. `i18n/config` — inicializa i18next
2. `index.css` — design tokens base
3. `tailwind.css` — Tailwind v4 + status palette + animations
4. Providers anidados
5. `App.tsx` — orquestación principal
