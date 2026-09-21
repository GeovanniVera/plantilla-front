# Páginas de error

Las 3 páginas de error viven en `src/pages/auth/` y se registran como rutas públicas en `App.tsx`.

| Página | Ruta | Layout | Imagen |
|---|---|---|---|
| [ForbiddenPage](#forbiddenpage-403) | `/403` | `ErrorLayout` | `/403.png` |
| [NotFoundPage](#notfoundpage-404) | `*` (catch-all) | `ErrorLayout` | `/404.png` |
| [ServerErrorPage](#servererrorpage-500) | `/500` | Estilos inline propios | `/500.png` |

## ErrorLayout (`src/layouts/ErrorLayout.tsx`)

Layout reutilizable para páginas de error: **imagen + título + descripción + acciones** (contenido adicional opcional). Lo que cambia entre páginas son los props: `image`, `imageAlt`, `title`, `description`, `actions`, `children`. Centrado vertical y horizontal, texto centrado.

## ForbiddenPage (403)

Acceso denegado. Usa `ErrorLayout` con `/403.png` y acciones "Volver" (navegación hacia atrás) y "Volver al inicio" (→ `/dashboard`). Textos vía i18n (`pages.forbidden.*`).

**Es el target de `onForbidden` del client HTTP**: cualquier 403 (no vinculado a suspensión) redirige aquí.

## NotFoundPage (404)

Ruta catch-all (`*`). Usa `ErrorLayout` con `/404.png` y las mismas acciones de navegación. Textos vía i18n (`pages.notFound.*`).

## ServerErrorPage (500)

Error de servidor. **No usa `ErrorLayout`**: estilos inline propios con fondo oscuro (`#1a1a1a`), título blanco, mensaje en rojo (`rgba(220, 38, 38, 0.8)`), imagen `/500.png` y dos botones con estética roja. Textos vía i18n (`pages.serverError.*`).

## Comportamiento del client HTTP (`src/lib/api/client.ts`)

El manejo de errores del cliente explica por qué estas páginas existen:

| Status | Comportamiento |
|---|---|
| `401` | Si la petición llevaba sesión → intenta refresh (`tryRefreshToken`) y reintenta una vez con header `_retry: 'true'`; si falla → limpia token y dispara `auth:logout`. En endpoints públicos (login/register) un 401 son credenciales inválidas y **no** dispara refresh ni logout. |
| `403` | Con `code === 'ACCOUNT_SUSPENDED'` → limpia sesión, dispara `auth:logout` y navega a `/login?error=<mensaje>` (banner en `LoginPage`). Caso contrario → `onForbidden` → `/403`. |
| `403` (navegación) | `shouldRedirectToForbidden(pathname)` **excluye** `/login` (un 403 ahí significa "cuenta no verificada") y `/403` mismo (evitar loop de recargas). |

- `onUnauthorized` default: `window.location.href = '/login'`.
- `onForbidden` default: `/403` si `shouldRedirectToForbidden()`.
- Configurable vía `configureClient(newConfig)`.

## Notas

- `ForbiddenPage` y `NotFoundPage` comparten el mismo patrón de acciones; `ServerErrorPage` es intencionalmente distinta (identidad visual propia).
- Sin sesión válida, `RequirePrivilege` redirige a `/login` (no a `/403`); `/403` es solo para autenticados sin permiso.