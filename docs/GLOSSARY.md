# Glosario — Semilla Tecnologica

## Términos del dominio

| Término | Definición |
|---------|-----------|
| **Design System** | Colección de componentes reutilizables, patrones y estándares que garantizan consistencia visual y funcional en la UI. En este proyecto equivale a `src/components/`. |
| **Design Tokens** | Valores fundamentales de diseño (colores, espaciado, tipografía) que sirven como base para todo el sistema visual. Definidos en `src/theme/tokens.ts`. |
| **Semantic Tokens** | Tokens derivados de los design tokens que representan significado funcional (success, warning, danger, info) en lugar de valores literales. Generados en `src/theme/semantic.ts`. |
| **Compound Component** | Patrón de diseño donde un componente se compone con sub-componentes internos (ej: `Modal.Header`, `Modal.Body`, `Sidebar.Nav`). |
| **Guard** | Componente que protege rutas verificando condiciones de acceso (autenticación, privilegios, roles). Definidos en `src/auth/guards.tsx`. |
| **Lazy Loading** | Técnica de carga diferida de componentes/rutas bajo demanda, usando `React.lazy()`. reduce el bundle inicial. |
| **Code Splitting** | División automática del bundle JavaScript en chunks separados, permitiendo carga parcial. Vite lo genera automáticamente con `React.lazy()`. |
| **Portal** | Mecanismo de React que renderiza componentes fuera del árbol DOM padre, típicamente en `document.body`. Usado por Modal, Drawer, Toast. |
| **HMR (Hot Module Replacement)** | Capacidad de Vite de reemplazar módulos modificados en tiempo de ejecución sin recarga completa del navegador. |
| **CSS-first** | Enfoque de configuración de Tailwind v4 donde los tokens se definen en CSS (bloques `@theme`) en lugar de `tailwind.config.js`. |
| **WCAG** | Web Content Accessibility Guidelines — Estándares de accesibilidad web. El proyecto busca cumplimiento AA (contraste ≥ 4.5:1 para texto, ≥ 3:1 para gráficos). |
| **OKLCH** | Espacio de color perceptivamente uniforme (Oklab Lightness-Chroma-Hue). Usado en `src/theme/semantic.ts` para generar paletas accesibles preservando el matiz original. |

## Términos técnicos

| Término | Definición |
|---------|-----------|
| **AuthState** | Interfaz que representa el estado de autenticación: `{ user, token, isAuthenticated, isLoading }`. Definida en `src/auth/types.ts`. |
| **AuthContextValue** | Interfaz extendida de `AuthState` que incluye métodos (`login`, `logout`, `hasPrivilege`, etc.). Accedida via `useAuth()`. |
| **tokenManager** | Objeto en memoria (`src/api/client.ts`) que gestiona el JWT actual (get/set/clear). Se sincroniza con `authStorage` para persistencia. |
| **authStorage** | Abstracción de persistencia de tokens (`src/auth/storage.ts`). Actualmente usa localStorage con keys `auth_token` y `auth_refresh_token`. |
| **ApiError** | Clase de error personalizada (`src/api/client.ts`) con `status`, `statusText` y `data`. Se lanza en errores HTTP. |
| **RequestInterceptor** | Interfaz con `onFulfilled` y `onRejected` que se ejecuta antes de cada petición HTTP. Se registra vía `addRequestInterceptor()`. |
| **ResponseInterceptor** | Interfaz con `onFulfilled` y `onRejected` que se ejecuta después de cada petición HTTP. Se registra vía `addResponseInterceptor()`. |
| **SemanticPalette** | Paleta de 6 colores generada por `deriveSemanticPalette()`: base, strong, bg, line, row, solidForeground. |
| **ToastAPI** | Interfaz imperative del sistema de toast: `success()`, `error()`, `warning()`, `info()`, `dismiss()`. Accedida via `useToast()`. |
| **DrawerStack** | Sistema de drawers multinivel con push/pop animations. Los drawers se apilan con `animate-stack-slide-forward` y `animate-stack-slide-back`. |
| **MobileBottomBar** | Barra de navegación inferior que aparece en móvil (`max-width: 768px`) cuando el sidebar está oculto. |

## Nombres de rutas

| Ruta | Descripción | Auth requerida |
|------|-------------|----------------|
| `/` | Inicio / Índice de componentes | ✅ |
| `/login` | Página de login | ❌ (GuestOnly) |
| `/register` | Página de registro | ❌ (GuestOnly) |
| `/forgot-password` | Solicitar recuperación | ❌ |
| `/verify-otp` | Verificar OTP | ❌ |
| `/reset-password` | Establecer nueva contraseña | ❌ |
| `/verify-email` | Verificar email | ✅ |
| `/verify-email/confirm` | Confirmar verificación | ✅ |
| `/componentes/*` | Showcase de componentes | ✅ |
| `/examples/*` | Ejemplos reales | ✅ |
| `/ajustes/*` | Configuración | ✅ + `settings:manage` |
| `/terms` | Términos y condiciones | ❌ |
| `/403` | Acceso denegado | ❌ |
| `/500` | Error de servidor | ❌ |
| `/*` | 404 Not Found | ❌ |

## Privilegios del sistema

| Privilegio | Descripción | Asignado a |
|-----------|-------------|------------|
| `users:read` | Leer usuarios | admin, editor, viewer |
| `users:write` | Crear/editar usuarios | admin |
| `users:delete` | Eliminar usuarios | admin |
| `reports:view` | Ver reportes | admin, editor |
| `reports:export` | Exportar reportes | admin |
| `settings:manage` | Gestionar configuración | admin |

## Roles del sistema

| Rol | Descripción | Privilegios |
|-----|-------------|-------------|
| `admin` | Administrador completo | users:read/write/delete, reports:view/export, settings:manage |
| `editor` | Editor de contenido | users:read, reports:view |
| `viewer` | Solo lectura | users:read |

## Colores semánticos

| Estado | Color base (light) | Color base (dark) | Uso |
|--------|-------------------|-------------------|-----|
| `success` | `#22c55e` → `#008736` | `#4dc06c` → `#122014` | Operaciones exitosas, confirmaciones |
| `warning` | `#f59e0b` → `#a76700` | `#ed990e` → `#25190c` | Advertencias, atención requerida |
| `danger` | `#ef4444` → `#c64a46` | `#db5d57` → `#291615` | Errores, acciones destructivas |
| `info` | `#3b82f6` → `#3772d2` | `#4984e6` → `#141c2a` | Información, hints |

Cada estado genera 6 roles: base, strong, bg, line, row, solidForeground.

## Patrones de estilo

| Patrón | Descripción | Ejemplo |
|--------|-------------|---------|
| **Token-based styling** | Estilos derivados de CSS variables en lugar de valores hardcodeados | `bg-accent` → `var(--accent)` |
| **Animation tokens** | Animaciones predefinidas como tokens de Tailwind | `hover:animate-btn-pulse` |
| **Compound API** | Sub-componentes accedidos como propiedades del padre | `Modal.Header`, `Input.Root` |
| **Imperative API** | API accesible fuera del árbol de componentes via closure | `useToast().success()` |
| **Guard pattern** | Componentes que condicionan el renderizado | `ProtectedRoute`, `RequirePrivilege` |
| **Lazy routes** | Carga diferida de páginas | `lazy(() => import('./LoginPage'))` |
