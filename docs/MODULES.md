# Módulos — Semilla Tecnologica

## 1. API Layer (`src/api/`)

### `client.ts` — Cliente HTTP centralizado

Wrapper de `fetch` nativo con arquitectura de interceptores similar a Axios pero sin dependencias.

**Componentes clave:**

- **`tokenManager`** (`src/api/client.ts:19-26`): Gestión de token en memoria (get/set/clear). Se sincroniza con `authStorage` para persistencia.
- **`ApiError`** (`src/api/client.ts:36-45`): Clase de error personalizada con `status`, `statusText` y `data`.
- **`request<T>()`** (`src/api/client.ts:112-192`): Función interna que ejecuta peticiones con:
  - Inyección automática de JWT en header `Authorization`
  - Ejecución secuencial de interceptores request/response
  - Manejo de 401 (limpia token + redirige a `/login`)
  - Manejo de 403 (redirige a `/403`)
  - Parsing de JSON y manejo de respuestas vacías (204)
- **`client`** (`src/api/client.ts:199-247`): API pública con métodos `get`, `post`, `put`, `patch`, `delete`.
- **`configureClient()`** (`src/api/client.ts:256`): Permite cambiar config runtime (baseUrl, callbacks).
- **`addRequestInterceptor()` / `addResponseInterceptor()`** (`src/api/client.ts:267-279`): Para agregar interceptores programáticamente.

**URL base:** `VITE_API_BASE` env var, default `/api`.

### `auth.ts` — API de autenticación mock

Todas las funciones están mockeadas con `delay()` artificial. Cada función tiene un `TODO` indicando dónde va la llamada real.

**Funciones:**

| Función | Params | Retorna | Mock data |
|---------|--------|---------|-----------|
| `login(email, password)` | email, password | `{ user, token }` | Valida contra `MOCK_USERS` |
| `logout()` | — | `void` | Delay 300ms |
| `me()` | — | `User` | Decodifica JWT mock de localStorage |
| `refreshToken(refreshToken)` | refreshToken | `{ user, token, refreshToken }` | Retorna admin user |
| `verifyEmail(token)` | token | `{ success, email? }` | Token válido: `verify-token-abc123` |
| `resendVerification(email)` | email | `{ success }` | Siempre retorna success |

**Usuarios mock:**

| Email | Password | Roles | Privilegios | Verificado |
|-------|----------|-------|-------------|------------|
| `admin@test.com` | `admin123` | `admin` | users:read/write/delete, reports:view/export, settings:manage | ✅ |
| `editor@test.com` | `editor123` | `editor` | users:read, reports:view | ✅ |
| `viewer@test.com` | `viewer123` | `viewer` | users:read | ✅ |
| `noverify@test.com` | `test123` | `viewer` | users:read | ❌ |

---

## 2. Auth System (`src/auth/`)

### `provider.tsx` — AuthProvider

El componente central del sistema de auth. Provee estado y métodos vía `AuthContext`.

**Estado inicial:**
```ts
{ user: null, token: null, isAuthenticated: false, isLoading: true }
```

**Flujo de restauración de sesión (useEffect al montar):**
1. Lee token de `authStorage.getToken()`
2. Si no hay token → `isLoading = false`, fin
3. Si hay token → `tokenManager.set(token)` + `authApi.me()`
4. Si `me()` falla → limpia todo (`authStorage.clear()` + `tokenManager.clear()`)

**Métodos expuestos:**

| Método | Tipo | Descripción |
|--------|------|-------------|
| `login(email, password)` | `Promise<void>` | Login + persiste tokens + actualiza estado |
| `logout()` | `Promise<void>` | Logout API + limpia local (siempre) |
| `hasPrivilege(privilege)` | `boolean` | Verifica privilegio específico |
| `hasAnyPrivilege(privileges[])` | `boolean` | Verifica cualquiera de varios |
| `hasRole(role)` | `boolean` | Verifica rol específico |
| `isVerified()` | `boolean` | Verifica email verificado |

### `guards.tsx` — Guards de rutas

| Guard | Props | Comportamiento |
|-------|-------|---------------|
| `ProtectedRoute` | `children, redirectTo?, requireVerification?` | Requiere auth. Si `requireVerification=true` y no verificado → `/verify-email` |
| `RequirePrivilege` | `privilege, anyOf?, children, redirectTo?` | Requiere privilegio o cualquiera de `anyOf`. Si no auth → `/login`. Si no tiene permisos → `/403` |
| `RequireRole` | `role, children, redirectTo?` | Requiere rol específico. ⚠️ Se recomienda `RequirePrivilege` en su lugar |
| `GuestOnly` | `children, redirectTo?` | Solo para no autenticados. Si ya está autenticado → home |
| `RequireVerification` | `children` | Requiere email verificado |

### `storage.ts` — Persistencia de tokens

Abstrae `localStorage` con interfaz `ThemeStorage` (⚠️ nombre confuso — debería ser `AuthStorage`).

| Keys en localStorage | Uso |
|---------------------|-----|
| `auth_token` | JWT de acceso |
| `auth_refresh_token` | JWT de refresco |

Todas las operaciones están envueltas en try/catch para manejar localStorage lleno o deshabilitado.

### `hooks.ts` — Hooks de auth

| Hook | Retorna | Uso |
|------|---------|-----|
| `useAuth()` | `AuthContextValue` | Acceso completo al estado y métodos |
| `useHasPrivilege(privilege)` | `boolean` | Shorthand para verificar un privilegio |
| `useHasAnyPrivilege(privileges[])` | `boolean` | Shorthand para verificar varios privilegios |
| `useHasRole(role)` | `boolean` | Shorthand para verificar un rol |

### `ForgotPasswordContext.tsx` — Flujo de recuperación

Context que maneja estado entre 3 rutas: `/forgot-password` → `/verify-otp` → `/reset-password`.

**Estado:**
```ts
{ email: string, token: string | null, otpVerified: boolean }
```

**Métodos:**
- `setEmail(email)` — Guarda el email
- `verifyOtp(otp)` — Valida OTP mock (`123456`) → retorna token mock
- `resetPassword(password)` — Cambia contraseña mock
- `reset()` — Limpia todo el estado

---

## 3. Theme System (`src/theme/`)

### `tokens.ts` — Design tokens

8 tokens de color por defecto que se mapean a CSS variables:

| Token | CSS Variable | Default | Uso |
|-------|-------------|---------|-----|
| `primary` | `--primary` | `#0d9488` | Color principal (teal) |
| `secondary` | `--secondary` | `#6366f1` | Color secundario (indigo) |
| `accent` | `--accent` | `#0d9488` | Color de acento |
| `background` | `--bg` | `#f6f5f1` | Fondo de página |
| `surface` | `--code-bg` | `#edecea` | Fondo de superficie |
| `text` | `--text` | `#5a5565` | Texto principal |
| `text-h` | `--text-h` | `#1a1525` | Texto de headings |
| `border` | `--border` | `#e4e2dc` | Bordes |

### `ThemeProvider.tsx` — Proveedor de temas

Al montar:
1. Carga tokens guardados de `localStorage` (`brand-theme-v1`)
2. Merge con `defaultTokens`
3. Aplica tokens al `document.documentElement.style` como CSS variables
4. Deriva variantes translúcidas (`--accent-bg`, `--accent-border`, `--secondary-bg`)
5. Genera paletas semánticas accesibles para success/warning/danger/info

**Funciones expuestas:**
- `tokens` — Valores actuales
- `setColor(variable, value)` — Cambia un token
- `resetTheme()` — Restaura defaults

### `semantic.ts` — Generador de paletas semánticas

Genera paletas accesibles (WCAG AA) para 4 estados: success, warning, danger, info.

**Roles generados por cada estado:**

| Role | Contraste mínimo | Uso |
|------|-----------------|-----|
| `base` | ≥ 3:1 vs surfaces | Iconos, dots, elementos gráficos |
| `strong` | ≥ 4.5:1 vs bg + surface | Texto semántico |
| `bg` | — | Superficie suave de fondo |
| `line` | ≥ 3:1 vs surface | Bordes con estado |
| `row` | — | Fila ultra-suave |
| `solidForeground` | ≥ 4.5:1 vs base & strong | Texto sobre botones sólidos |

**Espacio de color:** OKLCH (preserva hue, ajusta lightness para contraste). Output en sRGB hex.

**Bases de colores:**
```ts
SEMANTIC_BASES = {
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
}
```

### `contrast.ts` — Cálculos WCAG

- `contrastRatio(hex1, hex2)` — Ratio de contraste entre dos colores
- `wcagLevel(ratio)` — Retorna `'AAA'`, `'AA'`, o `'fail'`
- `formatRatio(ratio)` — Formatea a `"X.XX:1"`

### `persistence.ts` — Adaptador de persistencia

Interfaz `ThemeStorage` con método `load()`, `save()`, `reset()`.

**Adaptador por defecto:** `localStorageAdapter` con key `brand-theme-v1`.

Se puede cambiar con `setStorageAdapter(adapter)` para usar API, cookies, etc.

---

## 4. Design System (`src/components/`)

### Primitives

#### `Button.tsx`

| Prop | Tipo | Opciones | Default |
|------|------|----------|---------|
| `variant` | `ButtonVariant` | `primary`, `secondary`, `ghost`, `danger` | `primary` |
| `size` | `ButtonSize` | `sm`, `md`, `lg` | `md` |
| `shape` | `ButtonShape` | `default`, `rounded`, `square` | `default` |
| `animation` | `ButtonAnimation` | `none`, `pulse`, `bounce`, `shake` | `none` |
| `color` | `string` | Cualquier CSS color | — |
| `colorBg` | `string` | Cualquier CSS color | — |

#### `Input.tsx`

Dual API: shorthand (`<Input />`) y compound (`<Input.Root>`, `<Input.Control>`, etc.).

**Sub-componentes compound:**
- `Input.Root` — Contenedor con appearance, size, validationState
- `Input.Control` — El input nativo
- `Input.StartAddon` — Adorno izquierdo (con variant: `default` | `icon`)
- `Input.EndAdornment` — Adorno derecho decorativo
- `Input.EndAction` — Acción derecha (botón, link, etc.)

Soporta `type="password"` con toggle de visibilidad (iconos LuEye/LuEyeOff).

#### `Select.tsx`

Dual API similar a Input.

**Sub-componentes compound:**
- `Select.Root` — Contenedor
- `Select.Control` — El select nativo
- `Select.StartAddon` — Adorno izquierdo

#### `Badge.tsx`

Compound: `Badge.Icon` para iconos dentro del badge.

#### `StatusDot.tsx`

Dot de estado con color. Prop `variant` para success/warning/danger/info.

### Layout

#### `Card.tsx`

Tarjeta contenedora con variantes de header.

#### `StatCard.tsx`

Tarjeta para mostrar estadísticas con valor, label e icono.

#### `FormLayout.tsx`

Layout wrapper para formularios con secciones.

### Forms

#### `Form.tsx` + `FormField.tsx` + `useForm.ts`

Sistema de formularios con:
- Validación por campo
- Modo multi-paso
- Context vía `FormContext`
- Custom hook `useForm()` para manejo de estado

### Data Display

#### Calendar (`src/components/data-display/calendar/`)

| Componente | Rol |
|-----------|-----|
| `Calendar.tsx` | Componente principal de calendario |
| `CalendarGrid.tsx` | Grid de días del mes |
| `CalendarHeader.tsx` | Header con navegación (mes/año, flechas) |
| `CalendarView.tsx` | Wrapper con selección de rango de fechas |
| `CalendarList.tsx` | Vista de lista de eventos |
| `calendarHelpers.ts` | Utilidades de manipulación de fechas |

Depende de `react-day-picker` y `date-fns`.

#### Table (`src/components/data-display/table/`)

| Componente | Rol |
|-----------|-----|
| `BaseTable.tsx` | Tabla base con CSS Modules |
| `DataTable.tsx` | Read-oriented: filtros, paginación, sort |
| `ExcelTable.tsx` | Editable: cell editors, grid tipo spreadsheet |

### Navigation

#### Sidebar (`src/components/navigation/sidebar/`)

Compound component con 7 sub-componentes:

| Componente | Rol |
|-----------|-----|
| `Sidebar.tsx` | Root + compound API (Header/Toggle/Nav/Footer) |
| `SidebarLogo.tsx` | Logo + nombre de app |
| `NavItem.tsx` | Item de navegación (soporta `as` prop para NavLink/button) |
| `NavGroup.tsx` | Grupo colapsable con items hijos |
| `UserAvatar.tsx` | Avatar del usuario actual |
| `UserClock.tsx` | Reloj en sidebar |
| `context.ts` | `SidebarContext` (expanded, toggleExpanded) |

**Responsive:** Usa `useMediaQuery('(max-width: 768px)')`. En móvil muestra `MobileBottomBar` + backdrop.

#### Tabs.tsx

3 variantes de tabs.

#### Breadcrumb.tsx

Breadcrumb responsive que genera migas de pan desde la URL actual.

### Feedback

#### Toast

Sistema de notificaciones toast con API imperative:

```tsx
const toast = useToast()
toast.success('Guardado correctamente')
toast.error('Error al guardar', { action: { label: 'Reintentar', onClick: retry } })
```

**Componentes:**
- `ToastProvider.tsx` — Provider que registra la API + renderiza via portal
- `Toast.tsx` — Item individual con variantes (success/error/warning/info)
- `useToast.ts` — Hook que accede a la API imperative

**Posiciones:** `top-right`, `top-center`, `bottom-right`, `bottom-center`

**Config:** `maxVisible` (default 3), `defaultDuration` (default 5000ms)

### Overlays

#### `Modal.tsx`

Portal-based con compound API:
- `Modal` — Root ( isOpen, onClose, width, maxHeight )
- `Modal.Header` — Header con título, rightSlot, botón close
- `Modal.Body` — Contenido scrollable
- `Modal.Footer` — Acciones

Cierra con Escape y click en overlay.

#### `Drawer.tsx`

Slide-in desde la derecha. Responsive: en `max-[480px]` colapsa a bottom sheet.

#### `DrawerStack.tsx`

Multi-level drawer con push/pop animations.

#### `ConfirmDialog.tsx`

Dialog de confirmación para acciones destructivas.

---

## 5. Hooks (`src/hooks/`)

| Hook | Archivo | Descripción |
|------|---------|-------------|
| `useIsMobile(breakpoint?)` | `useIsMobile.ts` | Retorna `boolean`. Default breakpoint: 768px |
| `useMediaQuery(query)` | `useMediaQuery.ts` | Retorna `boolean` para cualquier media query |

Ambos usan `matchMedia` + `addEventListener('change', handler)`.

---

## 6. Layouts (`src/layouts/`)

| Layout | Archivo | Uso |
|--------|---------|-----|
| `MainLayout` | `MainLayout.tsx` | Layout principal: sidebar + contenido con breadcrumbs |
| `AuthLayout` | `AuthLayout.tsx` | Layout de auth: split view con hero animado |
| `ErrorLayout` | `ErrorLayout.tsx` | Layout de páginas de error |

### MainLayout

- Sidebar con composición (`Sidebar.Header`, `Sidebar.Toggle`, `Sidebar.Nav`, `Sidebar.Footer`)
- Breadcrumbs generados desde URL
- PageHeader dinámico según `ROUTE_CONFIG`
- Navegación agrupada: Componentes, Ejemplos, Ajustes
- Logout funcional via `useAuth().logout()`
