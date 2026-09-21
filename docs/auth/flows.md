# Flujos de autenticación

Secuencia de cada flujo soportado por el módulo: login, registro, recuperación de contraseña, verificación de email, logout y restauración de sesión.

## Login (con "Recuérdeme")

```
useLogin() [hooks] / login() [AuthContext]
  ├─ authService.login(email, password)
  │     ├─ éxito   → { user, accessToken, expiresIn }
  │     └─ falla   → throw Error(response.message || 'Credenciales inválidas')
  ├─ authStorage.clearAll()                     ← limpia ambos storages
  ├─ authStorage.setActiveSession(remember, expiresIn)
  │     └─ escribe SOLO el indicador auth_expires_at
  │        remember=true  → localStorage
  │        remember=false → sessionStorage
  ├─ tokenManager.set(accessToken, expiresIn)   ← access token SOLO en memoria
  └─ setState({ user, token, isAuthenticated: true, isLoading: false })
```

- `remember` por defecto es `true` (indicador en `localStorage`). Con `false`, la sesión vive solo en `sessionStorage` (scoped a la pestaña).
- El access token nunca se persiste: `authStorage` escribe solo el indicador de sesión; el token vive en `tokenManager` (memoria).
- El refresh token nunca toca el frontend: viaja en cookie HttpOnly del backend.
- El hook `useLogin()` (React Query) delega en `login()` del `AuthContext` e invalida la query `['auth', 'me']` al completar.

## Registro

```
useRegister().mutate({ name, email, password, acceptedTerms })
  └─ authService.register(data)  → POST /auth/register
```

`register` retorna solo un mensaje opaco (`ApiResponse<void>`): **no** devuelve user ni token. Tras registrarse, el usuario debe verificar su email (flujo siguiente) antes de acceder a rutas protegidas.

## Recuperación de contraseña (forgot → OTP → reset)

Máquina de estado gestionada por `ForgotPasswordContext` (`src/auth/ForgotPasswordContext.tsx`), con tres rutas:

| Ruta | Estado | Acción |
|---|---|---|
| `/forgot-password` | `email` | `setEmail(email)`; dispara `authService.forgotPassword` |
| `/verify-otp` | `token: null`, `otpVerified: false` | `verifyOtp(otp)` → guarda `response.data.resetToken` en `state.token` y marca `otpVerified: true` |
| `/reset-password` | `token` disponible | `resetPassword(password)` → `authService.resetPassword(state.token, password)` |

```ts
interface ForgotPasswordState {
  email: string;
  token: string | null;
  otpVerified: boolean;
}
```

Comportamiento clave:

- `verifyOtp(otp)` depende de `state.email`; si la respuesta falla devuelve `{ success: false, error }` (p. ej. "Código inválido o expirado").
- `resetPassword(password)` **requiere** `state.token`; sin token devuelve `{ success: false, error: 'Token no disponible' }`.
- `reset()` reinicia todo el estado (útil al salir del flujo o tras completarlo).
- `useForgotPassword()` lanza `Error` fuera de `ForgotPasswordProvider`.
- `ForgotPasswordProvider` y `useForgotPassword` (contexto) **no** se exportan por el barrel de auth: importe desde `src/auth/ForgotPasswordContext.tsx`.

> ⚠ Colisión de nombres: `useForgotPassword` también existe en `src/hooks/useAuth.ts` como mutación React Query (`authService.forgotPassword(email)`). Para el flujo de 3 pasos use el hook del contexto; para disparar el email de recuperación sin máquina de estado, use el de React Query. Ver [Notas de uso del barrel de hooks](../hooks/gaps.md).

## Verificación de email

- `useVerifyEmail().mutate(token)` → `authService.verifyEmail(token)` → `POST /auth/verify-email` (devuelve `{ email }`).
- `useResendVerification().mutate(email)` → `authService.resendVerification(email)` → `POST /auth/resend-verification`.
- Las rutas de verificación usan `RedirectIfVerified`: si el usuario ya está autenticado **y** verificado, redirige a `/dashboard`; un usuario anónimo o autenticado sin verificar sigue viendo la pantalla.

## Logout

```
useLogout() [hooks] / logout() [AuthContext]
  ├─ try   { await authService.logout() }   ← POST /auth/logout
  └─ finally {
        authStorage.clearAll();             ← limpia AMBOS storages (indicador + claves legacy);
        tokenManager.clear();
        setState(no autenticado);
      }
```

La limpieza local ocurre **siempre**, incluso si la llamada a la API falla. El hook `useLogout()` (React Query) ejecuta `queryClient.clear()` al terminar (settled), descartando todo el cache de queries.

## Restauración de sesión (al montar la app)

```
Montaje del AuthProvider
  └─ restoreSession()
        ├─ authStorage.getActiveSession()     ← sessionStorage primero, luego localStorage
        │     └─ sin indicador → isLoading=false
        ├─ con indicador → tryRefreshToken()  ← POST /auth/refresh (cookie HttpOnly)
        │     ├─ refresh falla → authStorage.clear(remember) + tokenManager.clear() + no autenticado
        │     └─ refresh OK → token nuevo en memoria (tokenManager.set)
        │           └─ authService.me()
        │                 ├─ éxito   → { user, token, isAuthenticated: true }
        │                 └─ falla   → authStorage.clear(remember) + tokenManager.clear() + no autenticado
        └─ isLoading=false
```

- El access token no se lee del storage: el diseño memory-only elimina el vector XSS de token persistido. Tras un reload, la sesión se reconstruye vía refresh (cookie HttpOnly) y `GET /auth/me`.
- `getActiveSession()` evita que un indicador de `localStorage` secuestre una sesión tab-scoped creada en `sessionStorage`.
- Si el refresh falla durante el uso (token expirado), el interceptor de refresh emite `auth:logout`, y el provider limpia todo y hace hard redirect a `/login`.

## Deudas conocidas

- En restore, login y logout quedan `console.log`/`console.error` de depuración (`[AUTH] ...`) activos en producción.