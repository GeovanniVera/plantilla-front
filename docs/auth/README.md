# Módulo de autenticación (`src/auth/`)

Documentación del módulo de autenticación: proveedor de contexto, hooks, guards de rutas y control de acceso por permisos.

## Quick start

1. Envuelva la aplicación con `AuthProvider` (debe estar por encima de cualquier componente que use `useAuth`):

   ```tsx
   import { AuthProvider } from '@/auth';

   <AuthProvider>
     <App />
   </AuthProvider>
   ```

2. Acceda al estado y métodos desde cualquier componente:

   ```tsx
   import { useAuth } from '@/auth';

   const { user, isAuthenticated, login, logout } = useAuth();
   ```

3. Proteja rutas y oculte UI según permisos:

   ```tsx
   import { ProtectedRoute, RequirePrivilege, Can } from '@/auth';

   <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
     <Route path="/dashboard" element={<Dashboard />} />
   </Route>

   <RequirePrivilege privilege="settings.brand"><Configuracion /></RequirePrivilege>
   <Can privilege="users.write"><button>Editar</button></Can>
   ```

> `useAuth()` lanza un `Error` si se usa fuera de `AuthProvider`.

## Mapa de archivos del módulo

| Archivo | Responsabilidad | Exporta |
|---|---|---|
| `index.ts` | Barrel público del módulo | `AuthProvider`, `useAuth`, `useHasPrivilege`, `useHasAnyPrivilege`, `useHasRole`, guards, `Can`, tipos |
| `provider.tsx` | `AuthProvider`: estado global, restauración de sesión, login, logout, verificaciones | `AuthProvider` |
| `context.tsx` | `AuthContext` (React context) | `AuthContext` (uso interno, no va por el barrel) |
| `hooks.ts` | Hooks de acceso al contexto | `useAuth`, `useHasPrivilege`, `useHasAnyPrivilege`, `useHasRole` |
| `guards.tsx` | Guards de rutas (redirección) | `ProtectedRoute`, `RequirePrivilege`, `RequireRole`, `GuestOnly`, `RedirectIfVerified`, `RequireVerification`, `AuthLoading` |
| `Can.tsx` | Control de acceso por renderizado (oculta, no redirige) | `Can` |
| `types.ts` | Tipos del dominio (`User`, `AuthState`, `AuthContextValue`) | tipos |
| `ForgotPasswordContext.tsx` | Máquina de estado del flujo forgot → OTP → reset | `ForgotPasswordProvider`, `useForgotPassword` (no van por el barrel) |

### No exportados por el barrel (`src/auth/index.ts`)

Estos símbolos existen en el módulo pero **no** se exportan desde `index.ts`; deben importarse desde su archivo de origen:

- `AuthContext` → `src/auth/context.tsx` (uso interno; prefiera `useAuth()`).
- `ForgotPasswordProvider` y `useForgotPassword` (contexto) → `src/auth/ForgotPasswordContext.tsx`.
- `AuthLoading` → `src/auth/guards.tsx`.

> ⚠ Gotcha: `useForgotPassword` también existe en `src/hooks/useAuth.ts` como mutación de React Query. Vea [Notas de uso del barrel de hooks](../hooks/gaps.md).

## Dependencias externas

| Dependencia | Uso |
|---|---|
| `src/lib/api/services/auth.service` | `login`, `me`, `logout`, `verifyOtp`, `resetPassword`, `forgotPassword`, `register`, `verifyEmail`, `resendVerification` |
| `src/lib/api/client` | `tokenManager` (access token en memoria del cliente HTTP) |
| `src/lib/auth/token-store.ts` | `authStorage` (persistencia en `localStorage`/`sessionStorage`) |

## Documentación del módulo

- [Arquitectura](architecture.md) — contratos, persistencia, eventos y flujo de datos del provider.
- [Referencia de API](api-reference.md) — tabla completa de exportaciones públicas con firmas y tipos.
- [Flujos](flows.md) — login, registro, recuperación de contraseña, verificación de email, logout y restauración de sesión.
- [Guards de rutas](guards.md) — tabla de guards, comportamiento de redirección y ejemplos de uso.
- [Flujo de sesión (full-stack)](session-flow.md) — secuencia unificada React UI → AuthContext → tokenManager → authStorage → HTTP client → backend /api/auth → DB.
- Hooks de auth con React Query: [README de hooks](../hooks/README.md) y [usoAuth.md](../hooks/useAuth.md).

## Deudas conocidas

- `console.log` / `console.error` de depuración (`[AUTH] ...`, `[GUARD] ...`) quedan activos en producción en `provider.tsx` y `guards.tsx`.
- `GuestOnly` documenta en su JSDoc `redirectTo = '/'`, pero el código usa `'/dashboard'`.
- `ProtectedRoute` exige email verificado por defecto (`requireVerification = true`), lo que duplica el rol de `RequireVerification` en rutas protegidas.