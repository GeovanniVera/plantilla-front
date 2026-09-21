# Aplicación (`src/main.tsx` + `src/App.tsx`)

## Propósito

Documenta la composición de la aplicación: el orden de providers en `main.tsx`, el árbol de rutas reales en `App.tsx`, los guards de autenticación, los layouts y el sistema de estilos. **Las rutas reales viven en `App.tsx`; todo `src/routes/` es código muerto.**

## Composición de providers (`src/main.tsx`)

Orden exacto, de afuera hacia adentro:

```
StrictMode
└── QueryClientProvider (staleTime 5min, retry 1, refetchOnWindowFocus false)
    └── ReactQueryDevtools (initialIsOpen: false)
        └── BrowserRouter
            └── ThemeProvider
                └── ToastProvider (position: 'top-right', maxVisible: 3)
                    └── App
```

- `main.tsx` importa `./lib/i18n/config` como **side-effect** (inicializa i18next antes del render).
- También importa `./index.css` y `./styles/tailwind.css`.

## Árbol de rutas (`src/App.tsx`)

`App` envuelve todo con `AuthProvider` → `ErrorBoundary` → `Suspense` (fallback "Cargando..."), y **todas** las páginas se cargan con `lazy()`.

| Path | Guard | Layout |
|---|---|---|
| `/login`, `/register` | — | `AuthLayout` |
| `/forgot-password`, `/verify-otp`, `/reset-password` | `GuestOnly` | `AuthLayout` + `ForgotPasswordProvider` |
| `/verify-email` | `RedirectIfVerified` | `AuthLayout` |
| `/verify-email/confirm` | — | `AuthLayout` |
| `/terms`, `/403`, `/500` | — | standalone (sin layout) |
| `/dashboard` | `ProtectedRoute` (verifica email) | `MainLayout` |
| `/admin` | `ProtectedRoute` + `RequirePrivilege users.read` | `MainLayout` |
| `/admin/usuarios` | `RequirePrivilege users.read` | `MainLayout` |
| `/admin/roles` | `RequirePrivilege roles.read` | `MainLayout` |
| `/admin/permisos` | `RequirePrivilege permissions.read` | `MainLayout` |
| `/admin/auditoria` | `RequirePrivilege audit.read` | `MainLayout` |
| `/ajustes` | `ProtectedRoute` | `MainLayout` |
| `/ajustes/perfil` | `ProtectedRoute` | `MainLayout` |
| `/ajustes/actividad` | `RequirePrivilege anyOf [audit.read, audit.read-mine]` | `MainLayout` |
| `/ajustes/colores` | `RequirePrivilege settings.brand` | `MainLayout` |
| `*` | — | `NotFoundPage` |

> Nota: `/ajustes` y `/ajustes/perfil` usan `ProtectedRoute` sin guard adicional de privilegio; las rutas de administración y ajustes específicos sí exigen privilegios con notación de punto.

## Guards (`src/auth/guards.tsx`)

| Guard | Comportamiento |
|---|---|
| `ProtectedRoute` | Requiere autenticación; `redirectTo` default `/login`; `requireVerification` default `true` (email sin verificar → `/verify-email`) |
| `RequirePrivilege` | Exige `privilege` XOR `anyOf` (si ambos, `anyOf` tiene prioridad); sin permisos → `/403`; sin sesión → `/login` |
| `RequireRole` | Requiere un rol específico; default `/403`. Nota en código: preferir `RequirePrivilege` (más granular) |
| `GuestOnly` | Solo para invitados; autenticado → `/dashboard` |
| `RedirectIfVerified` | Redirige SOLO si autenticado Y verificado (condición contraria a `GuestOnly`); anónimo o sin verificar sigue viendo la pantalla |
| `RequireVerification` | Requiere email verificado; sin sesión → `/login`; sin verificar → `/verify-email` |

`AuthLoading` ("Verificando sesión...") se muestra mientras el provider restaura la sesión.

## Layouts (`src/layouts/`)

| Layout | Descripción |
|---|---|
| `AuthLayout.tsx` | Split 50/50: hero animado con gradientes + branding "SemillaTecnologica" a la izquierda, `Outlet` a la derecha. En mobile solo se muestra el formulario |
| `auth/AuthFormLayout.tsx` | Composición de formularios de auth: `AuthFormHeader({ title, subtitle })`, `AuthFormCheckbox({ label, checked, onChange })`, `AuthFormActions({ submitLabel, loading, secondaryLabel, secondaryHref })` — el enlace secundario se extrae del texto con regex `¿...?` |
| `MainLayout.tsx` | `Sidebar` compuesta (`Sidebar.Header`, `Sidebar.Logo`, `Sidebar.UserAvatar`, `Sidebar.UserClock`, `Sidebar.Toggle`, `Sidebar.Nav`, `Sidebar.Footer`); breadcrumbs derivados de `pathname` + `ROUTE_CONFIG`; navegación condicionada con `Can` usando permisos con punto (`users.read`, `settings.brand`, etc.) |
| `ErrorLayout.tsx` | Genérico `{ image, imageAlt, title, description, actions?, children? }`, usado por `/403`, `/404` y `/500` |

## Estilos (`src/styles/` + `src/index.css`)

### `src/styles/tailwind.css` — entrada Tailwind v4 (CSS-first)

- `@import 'tailwindcss'` + `@theme` con **escala px fija** (`--spacing: 4px`, `--text-xs/sm/lg/xl`). Hotfix 8E.3: el root usa 18px (index.css), por lo que los `rem` inflaban las utilidades ~12%; fijar la escala en px mantiene paridad con los CSS Modules legacy.
- **Tokens semánticos de status** (`success`, `warning`, `danger`, `info`) con variantes `strong` / `bg` / `border` / `row` / `solid-fg`, con dark mode por `prefers-color-scheme` (re-declarados en un bloque `@media`).
- **Mapeo `--color-*` → vars runtime**: `--color-primary: var(--primary)`, `--color-background: var(--bg)`, `--color-surface: var(--code-bg)`, `--color-foreground: var(--text)`, `--color-heading: var(--text-h)`, etc. Las marcas de color NUNCA se copian como literales: `ThemeProvider` sigue funcionando sin cambios.
- **Radios**: `--radius-sm/md/lg` = 6/8/12px.
- **Animaciones**: `btn-pulse`, `btn-bounce`, `btn-shake`, y keyframes para toast, modal/overlay, drawer, popover y transiciones de pestañas.
- **`:focus-visible`**: outline de acento como anillo de foco por teclado.

> **Deuda interna (comentario en el código)**: NO usar el variante `dark:` de Tailwind hasta que la propiedad del tema migre a un atributo `data-theme`. El dark mode actual funciona vía `prefers-color-scheme` sobre las mismas variables.

### `src/index.css` — variables base y reset

- `--primary: #044311`, `--secondary`, `--accent`, `--text`, `--text-h`, `--bg`, `--border`, `--code-bg`, `--accent-bg`, `--accent-border`, `--shadow`.
- Fuentes: `--sans: 'Inter', ...`, `--heading: 'Fraunces', serif`, `--mono`.
- Tipografía global: `font: 18px/145% var(--sans)`; en pantallas ≤ 1024px baja a 16px.
- Reset de cajas (`box-sizing: border-box`), estilos de `h1`/`h2`/`p` y optimizaciones de renderizado de fuentes.

## Deudas conocidas

- `src/routes/` es código muerto: las rutas reales están en `App.tsx`. No editar `src/routes/` esperando que afecte la navegación.
- Estilos: migrar el dark mode de `prefers-color-scheme` a `data-theme` antes de adoptar `dark:` de Tailwind (ver comentario interno en `tailwind.css`).