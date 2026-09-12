# Arquitectura — Plantilla Front

## Visión general

La aplicación sigue una arquitectura **component-driven** con separación por dominios (auth, theme, routes, components). No hay framework meta (Next, Remix); es un SPA client-side con React Router.

```mermaid
graph TB
    subgraph "Entry Point"
        main["main.tsx"]
    end

    subgraph "Providers (wrapper hierarchy)"
        strict["StrictMode"]
        query["QueryClientProvider"]
        router["BrowserRouter"]
        theme["ThemeProvider"]
        toast["ToastProvider"]
        auth["AuthProvider"]
        error["ErrorBoundary"]
        suspend["Suspense"]
    end

    subgraph "Routing Layer"
        routes["Routes (App.tsx)"]
        guards["Guards (ProtectedRoute, RequirePrivilege)"]
    end

    subgraph "Layout Layer"
        mainL["MainLayout"]
        authL["AuthLayout"]
        errL["ErrorLayout"]
    end

    subgraph "Pages"
        pages["Lazy-loaded pages"]
    end

    subgraph "Design System"
        primitives["Primitives"]
        layout_c["Layout components"]
        forms["Forms"]
        feedback["Feedback"]
        overlays["Overlays"]
        nav["Navigation"]
        data["Data Display"]
    end

    subgraph "Services"
        api["API Layer (src/lib/api/)"]
        i18n["i18n Layer (src/lib/i18n/)"]
        theme_s["Theme System"]
        auth_s["Auth System"]
    end

    main --> strict --> query --> router --> theme --> toast --> auth --> error --> suspend --> routes
    routes --> guards --> pages
    pages --> mainL
    pages --> authL
    pages --> errL
    mainL --> nav
    mainL --> primitives
    pages --> forms
    pages --> data
    pages --> overlays
    pages --> feedback
    pages --> layout_c
    pages --> api
    pages --> i18n
    pages --> theme_s
    pages --> auth_s
```

## Capas de la aplicación

### 1. Provider Hierarchy (`src/main.tsx`)

El orden de los providers es **crítico** y no debe cambiarse sin revisar dependencias:

```mermaid
graph TB
    strict["StrictMode"]
    query["QueryClientProvider<br/>(React Query)"]
    router["BrowserRouter"]
    theme["ThemeProvider"]
    toast["ToastProvider"]
    app["App"]
    auth["AuthProvider"]

    strict --> query --> router --> theme --> toast --> app --> auth
```

**¿Por qué `AuthProvider` dentro de `App`?** Porque necesita acceso a `react-router` para redirigir en 401/403.

### 2. Routing (`src/routes/`)

Las rutas se agrupan por dominio en archivos separados:

| Archivo | Dominio | Rutas |
|---------|---------|-------|
| `showcase.tsx` | Componentes UI | `/`, `/componentes/*` |
| `ajustes.tsx` | Configuración | `/ajustes/*` |
| `examples.tsx` | Ejemplos reales | `/examples/*` |

Se combinan en `src/routes/index.ts` y se importan en `App.tsx`.

### 3. Design System (`src/components/`)

Organizado bajo el patrón **Atomic Design simplificado**:

```mermaid
graph LR
    subgraph "Primitives"
        Button
        Badge
        Input
        Select
        Checkbox
        Radio
        Textarea
        StatusDot
    end

    subgraph "Layout"
        Card
        StatCard
        FormLayout
    end

    subgraph "Forms"
        Form
        FormField
        useForm
    end

    subgraph "Feedback"
        Toast
        Skeleton
        Spinner
    end

    subgraph "Overlays"
        Modal
        Drawer
        DrawerStack
        ConfirmDialog
    end

    subgraph "Navigation"
        Sidebar
        Tabs
        Breadcrumb
        NavItem
        NavGroup
    end

    subgraph "Data Display"
        Calendar
        DatePicker
        CalendarView
        BaseTable
        DataTable
        ExcelTable
    end
```

### 4. Capa de Servicios

```mermaid
graph TB
    subgraph "HTTP Client (src/lib/api/client.ts)"
        client["client.ts<br/>fetch wrapper + interceptores"]
        tokenManager["tokenManager<br/>JWT en memoria"]
        interceptors["Interceptors<br/>request/response"]
    end

    subgraph "Services (src/lib/api/services/)"
        authService["authService.ts<br/>login, logout, me, refresh"]
    end

    subgraph "Types (src/lib/api/types/)"
        apiResponse["api-response.ts<br/>ApiResponse&lt;T&gt;, ApiErrorCode"]
    end

    subgraph "Refresh Token (src/lib/api/interceptors/)"
        refresh["refresh.ts<br/>tryRefreshToken()"]
    end

    client --> tokenManager
    client --> interceptors
    client --> refresh
    authService --> client
    refresh --> client
    client --> apiResponse
```

#### HTTP Client (`src/lib/api/client.ts`)

- **`tokenManager`**: Gestión de token en memoria (get/set/clear). Se sincroniza con `authStorage` para persistencia.
- **`ApiError`**: Clase de error personalizada con `status`, `statusText` y `data`.
- **`request<T>()`**: Función interna que ejecuta peticiones con inyección automática de JWT, interceptores y manejo de 401/403.
- **`client`**: API pública con métodos `get`, `post`, `put`, `patch`, `delete`.
- **`configureClient()`**: Permite cambiar config runtime (baseUrl, callbacks).

#### Auth Service (`src/lib/api/services/auth.service.ts`)

Servicio que encapsula llamadas HTTP de autenticación:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `login(email, password)` | POST `/auth/login` | Iniciar sesión |
| `logout()` | POST `/auth/logout` | Cerrar sesión |
| `me()` | GET `/auth/me` | Obtener perfil |
| `refreshToken(refreshToken)` | POST `/auth/refresh` | Renovar access token |
| `register(data)` | POST `/auth/register` | Registrar usuario |
| `forgotPassword(email)` | POST `/auth/forgot-password` | Solicitar recuperación |
| `resetPassword(token, password)` | POST `/auth/reset-password` | Establecer nueva contraseña |
| `verifyEmail(token)` | POST `/auth/verify-email` | Verificar email |
| `resendVerification(email)` | POST `/auth/resend-verification` | Reenviar verificación |

#### Refresh Token Flow

```mermaid
sequenceDiagram
    participant Client as client.ts
    participant Refresh as refresh.ts
    participant AuthStorage as authStorage
    participant Server as Backend

    Note over Client,Server: Request normal falla con 401
    Client->>Client: Recibe 401
    Client->>Refresh: tryRefreshToken()
    Refresh->>AuthStorage: getRefreshToken()
    AuthStorage-->>Refresh: refreshToken

    alt Hay refresh token
        Refresh->>Server: POST /auth/refresh { refreshToken }
        alt Refresh exitoso
            Server-->>Refresh: { user, token, refreshToken }
            Refresh->>AuthStorage: setToken(newToken)
            Refresh->>AuthStorage: setRefreshToken(newRefreshToken)
            Refresh-->>Client: true (retry original request)
            Client->>Server: Reintenta request con nuevo token
            Server-->>Client: 200 OK
        else Refresh fallido
            Server-->>Refresh: 401
            Refresh-->>Client: false
            Client->>Client: Dispatch 'auth:logout'
            Client->>Client: Redirect to /login
        end
    else No hay refresh token
        Refresh-->>Client: false
        Client->>Client: Dispatch 'auth:logout'
        Client->>Client: Redirect to /login
    end
```

### 5. i18n Layer (`src/lib/i18n/`)

```mermaid
graph TB
    subgraph "i18n Configuration"
        i18nConfig["config.ts<br/>i18next + react-i18next"]
        errors["errors.ts<br/>getErrorMessage()"]
    end

    subgraph "Locales"
        es["locales/es.json<br/>Español"]
        en["locales/en.json<br/>Inglés"]
    end

    subgraph "Consumers"
        clientAPI["client.ts<br/>Errores de API"]
        components["Components<br/>useTranslation()"]
    end

    i18nConfig --> es
    i18nConfig --> en
    errors --> i18nConfig
    clientAPI --> errors
    components --> i18nConfig
```

#### Configuración (`src/lib/i18n/config.ts`)

- Inicializa i18next con `initReactI18next`
- Idioma por defecto: español (`es`)
- Persiste idioma seleccionado en `localStorage` (`i18n_lang`)
- Fallback a español si el idioma seleccionado no existe

#### Errores (`src/lib/i18n/errors.ts`)

- Mapea códigos de error API (`ApiErrorCode`) a claves de traducción
- `getErrorMessage(code)` retorna el mensaje traducido
- Usado por `client.ts` para errores de red y HTTP

### 6. Auth System (`src/auth/`)

```mermaid
graph TB
    provider_p["provider.tsx<br/>AuthProvider"]
    context_c["context.tsx<br/>AuthContext"]
    guards_g["guards.tsx<br/>ProtectedRoute, RequirePrivilege,<br/>RequireRole, GuestOnly, RequireVerification"]
    hooks_h["hooks.ts<br/>useAuth, useHasPrivilege,<br/>useHasRole"]
    storage_s["token-store.ts<br/>authStorage (localStorage)"]
    types_t["types.ts<br/>AuthState, AuthContextValue"]
    forgot["ForgotPasswordContext.tsx"]

    provider_p --> context_c
    context_c --> hooks_h
    hooks_h --> guards_g
    provider_p --> storage_s
    provider_p --> types_t
    forgot -.-> provider_p
```

### 7. Token Store (`src/lib/auth/token-store.ts`)

Gestión de persistencia de tokens:

| Key en localStorage | Descripción |
|---------------------|-------------|
| `auth_token` | JWT de acceso |
| `auth_refresh_token` | JWT de refresco |
| `auth_expires_at` | Timestamp de expiración |

Todas las operaciones están envueltas en try/catch para manejar localStorage lleno o deshabilitado.

## Patrones de diseño aplicados

### Compound Components

Componentes que se componen con sub-componentes internos:

```tsx
// Modal
<Modal isOpen onClose={close}>
  <Modal.Header title="Título" />
  <Modal.Body>Contenido</Modal.Body>
  <Modal.Footer>Acciones</Modal.Footer>
</Modal>

// Sidebar
<Sidebar>
  <Sidebar.Header>...</Sidebar.Header>
  <Sidebar.Toggle />
  <Sidebar.Nav>...</Sidebar.Nav>
  <Sidebar.Footer>...</Sidebar.Footer>
</Sidebar>

// Input (compound)
<Input.Root>
  <Input.StartAddon>@</Input.StartAddon>
  <Input.Control placeholder="email" />
  <Input.EndAdornment>.com</Input.EndAdornment>
</Input.Root>
```

### Guard Pattern

Los guards se componen jerárquicamente en `App.tsx`:

```tsx
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  {routes.map(r =>
    r.path.startsWith('/ajustes')
      ? <RequirePrivilege privilege="settings:manage">{r.element}</RequirePrivilege>
      : r.element
  )}
</Route>
```

### Imperative API via Module-Level State

El sistema de Toast usa un patrón no usual: el `ToastProvider` registra una API en un closure de nivel módulo (`src/components/feedback/useToast.ts`), permitiendo llamar `toast.success()` desde cualquier componente sin prop drilling.

### Lazy Loading con Code Splitting

Todas las páginas usan `React.lazy()` + `Suspense` en `App.tsx`. Las rutas se cargan bajo demanda.

## Decisiones arquitectónicas clave

| Decisión | Elección | Alternativa descartada | Razón |
|----------|----------|----------------------|-------|
| CSS approach | Tailwind v4 CSS-first + CSS Modules legacy | styled-components, CSS-in-JS | Tailwind v4 permite CSS-first config sin JS runtime |
| Router | React Router v8 | TanStack Router, Wouter | Ecosistema maduro, soporte lazy loading nativo |
| State management | React Context + useState | Redux, Zustand, Jotai | App con pocos estados globales; Context es suficiente |
| Formularios | Custom `useForm` hook | React Hook Form, Formik | Control total, sin dependencias externas |
| Storybook | Storybook 10 | Lad, Histoire | Ecosistema más amplio, addons de a11y y docs |
| Linting | Oxlint | ESLint, Biome | Velocidad (Rust-based), suficiente para el proyecto |
| Dark mode | `prefers-color-scheme` | Manual toggle | Pendiente migrar a `data-theme` |
| API client | Custom fetch wrapper | Axios, ky | Control total, interceptores, sin dependencias extra |
| i18n | i18next + react-i18next | react-intl, FormatJS | Ecosistema maduro, lazy loading de traducciones |
| Server state | React Query | SWR, custom hooks | Cache, refetch, mutations integradas |

## Rutas / demos

| Ruta | Renderiza | Auth |
|------|-----------|------|
| `/`, `/componentes` | Índice de componentes | ✅ |
| `/componentes/botones` | Showcase de botones | ✅ |
| `/componentes/cards` | Showcase de cards | ✅ |
| `/componentes/tablas` | TablesShowcase | ✅ |
| `/componentes/formularios` | FormShowcase | ✅ |
| `/componentes/modales` | Showcase de modales | ✅ |
| `/componentes/notificaciones` | Showcase de toasts | ✅ |
| `/componentes/navegacion` | Showcase de tabs/breadcrumbs/sidebar | ✅ |
| `/componentes/calendario` | Showcase de calendario | ✅ |
| `/calendario` | Demo de calendario docente | ✅ |
| `/ajustes` | Índice de ajustes | ✅ + settings:manage |
| `/ajustes/colores` | Editor de colores de marca | ✅ + settings:manage |
| `/auditoria` | App de ejemplo con DataTable | ✅ |
| `/login` | Página de login | ❌ (GuestOnly) |
| `/register` | Página de registro | ❌ (GuestOnly) |
