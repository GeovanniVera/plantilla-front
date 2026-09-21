# Páginas — Inventario

La aplicación tiene **20 páginas funcionales** bajo `src/pages/` (más 16 archivos de tests y CSS modules asociados). Todas se cargan con **lazy imports** dentro de un `Suspense` con fallback "Cargando...".

> **El router real vive íntegro en `src/App.tsx`.** El directorio `src/routes/` es código muerto (ver [Deudas conocidas](#deudas-conocidas)).

## Inventario total

| Página | Ruta | Sección | Acceso |
|---|---|---|---|
| [LoginPage](./auth.md#loginpage) | `/login` | auth | Público (GuestOnly) |
| [RegisterPage](./auth.md#registerpage) | `/register` | auth | Público |
| [ForgotPasswordPage](./auth.md#forgotpasswordpage) | `/forgot-password` | auth | Público (GuestOnly) |
| [VerifyOTPPage](./auth.md#verifyotppage) | `/verify-otp` | auth | Público (GuestOnly) |
| [ResetPasswordPage](./auth.md#resetpasswordpage) | `/reset-password` | auth | Público (GuestOnly) |
| [VerifyEmailPage](./auth.md#verifyemailpage) | `/verify-email` | auth | Autenticado sin verificar (RedirectIfVerified) |
| [VerifyEmailConfirmPage](./auth.md#verifyemailconfirmpage) | `/verify-email/confirm?token=` | auth | Público |
| [TermsPage](./other.md#termspage) | `/terms` | auth | Público |
| [ForbiddenPage](./errors.md#forbiddenpage-403) | `/403` | auth | Público |
| [NotFoundPage](./errors.md#notfoundpage-404) | `*` (catch-all) | auth | Público |
| [ServerErrorPage](./errors.md#servererrorpage-500) | `/500` | auth | Público |
| [DashboardPage](./other.md#dashboardpage) | `/dashboard` | raíz | Autenticado |
| [AdminIndexPage](./admin.md#adminindexpage) | `/admin` | admin | `users.read` |
| [UsersPage](./admin.md#userspage) | `/admin/usuarios` | admin | `users.read` |
| [RolesPage](./admin.md#rolespage) | `/admin/roles` | admin | `roles.read` |
| [PermissionsPage](./admin.md#permissionspage) | `/admin/permisos` | admin | `permissions.read` |
| [AuditLogsPage](./admin.md#auditlogspage) | `/admin/auditoria` | admin | `audit.read` |
| [AjustesIndex](./ajustes.md#ajustesindex) | `/ajustes` | ajustes | Autenticado |
| [PerfilPage](./ajustes.md#perfilpage) | `/ajustes/perfil` | ajustes | Autenticado |
| [MiActividadPage](./ajustes.md#miactividadpage) | `/ajustes/actividad` | ajustes | `audit.read` **o** `audit.read-mine` |

> Las páginas de error y términos (403, 404, 500, Terms) **viven físicamente en `src/pages/auth/`**, no en la raíz.

## Lazy loading

Todos los componentes de página se importan con `React.lazy` en `App.tsx` y se envuelven en un único `Suspense` (fallback: "Cargando..."). La ruta `/ajustes/colores` no es una página: renderiza directamente `BrandColorSettings` (feature settings) dentro de un contenedor.

## Guards del sistema (`src/auth/guards.tsx`)

| Guard | Comportamiento |
|---|---|
| `ProtectedRoute` | Requiere autenticación (default `requireVerification: true`); sin sesión → `/login`; sin email verificado → `/verify-email`. |
| `RequirePrivilege` | Requiere un privilegio (`privilege`) o cualquiera de una lista (`anyOf`); sin permisos → `/403`. |
| `RequireRole` | Requiere un rol específico; sin permisos → `/403`. ⚠ Exportado **sin uso** en `App.tsx`. |
| `GuestOnly` | Para rutas públicas; autenticado → `/dashboard`. |
| `RedirectIfVerified` | Para la pantalla de verificación: redirige a `/dashboard` solo si está autenticado **y** verificado. |
| `RequireVerification` | Requiere email verificado. ⚠ Exportado **sin uso** en `App.tsx`. |

Además, `Can` (`src/auth/Can.tsx`) es render condicional **sin redirección**, con `fallback` opcional (default `null`).

## Permisos reales usados (9, dot notation)

`users.read`, `users.write`, `roles.read`, `roles.write`, `roles.assign`, `permissions.read`, `audit.read`, `audit.read-mine`, `settings.brand`.

`hasPrivilege` = `user.permissions.includes(privilege)` — **match exacto** contra lo que mande el backend.

## Flujo de autenticación resumido

Ver [docs/features/README.md](../features/README.md) para el inventario de features. El flujo completo de auth (login → verificación → recovery) está en [auth.md](./auth.md#flujo-completo).

## Deudas conocidas

1. **`src/routes/` es código muerto**: el router vive íntegro en `App.tsx`. `showcase.tsx` y `examples.tsx` exportan arrays vacíos (removidos en una limpieza); `ajustes.tsx` duplica `/ajustes` y `/ajustes/colores` sin guards y **no se importa** en ningún lado. El tipo `routes` de `src/routes/index.ts` no se usa.
2. **Convención de permisos desincronizada**: el código real usa dot notation (`users.read`), pero los JSDoc de `guards.tsx`, `Can.tsx`, `hooks.ts` y `types.ts` documentan colon notation (`users:read`). Como `hasPrivilege` hace match exacto, **el backend debe enviar dot notation**.
3. **`settings.brand` es cliente-solo**: `ThemeResponse` está tipado en `api-response.ts` pero no hay servicio; la persistencia es solo `localStorage` (`brand-theme-v1`). Ver [docs/features/settings.md](../features/settings.md#deudas-conocidas).
4. **Hooks/servicios huérfanos**: `useUser(id)` (users) y `useRemoveRoleFromUser` (roles) existen sin consumidores en la UI; tampoco se usan `userService.get` ni `roleService.get`/`removeRoleFromUser` desde páginas.
5. **`console.log` de debug persistentes en producción**: `AuthProvider` (`[AUTH]…`), `ProtectedRoute` (`[GUARD]…`) y `VerifyEmailPage` (imprime `[Mock] Token de verificación: verify-token-abc123`).
6. **Client HTTP**: 403 → `onForbidden` → `/403` (excluye `/login` y `/403`); 403 con `ACCOUNT_SUSPENDED` → logout + `/login?error=…`; 401 → refresh + retry con header `_retry`. Ver [errors.md](./errors.md#comportamiento-del-cliente-http).
7. **Mocks de test**: solo `src/test/mocks/handlers/auth.ts` — no hay handlers MSW para admin/roles/users/audit. Además los permisos de los mocks usan colon notation (`users:read`).
8. **DashboardPage** con `StatCards` placeholder (valores `0` hardcodeados); **TermsPage** con cuerpo legal hardcodeado en español (no traducido). Ver [other.md](./other.md).