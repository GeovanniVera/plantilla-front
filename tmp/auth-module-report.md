# 🔐 Análisis Exhaustivo del Módulo de Autenticación — `plantilla-front`

## 1. Arquitectura General

```
src/
├── auth/                         ← Módulo central de estado de sesión
│   ├── types.ts                  ← Contratos de dominio (AuthState, AuthContextValue)
│   ├── context.ts                ← React Context creation
│   ├── provider.tsx              ← AuthProvider: sesión, login, logout, permisos
│   ├── hooks.ts                  ← useAuth, useHasPrivilege, useHasAnyPrivilege, useHasRole
│   ├── guards.tsx                ← ProtectedRoute, RequirePrivilege, RequireRole, GuestOnly, RequireVerification
│   ├── ForgotPasswordContext.tsx  ← Contexto para flujo forgot→OTP→reset
│   └── index.ts                  ← Barrel exports
│
├── lib/
│   ├── api/
│   │   ├── client.ts             ← HTTP client con interceptores, refresh token, JWT injection
│   │   ├── services/
│   │   │   └── auth.service.ts   ← 9 llamadas API: login, logout, me, refresh, register, forgot, reset, verifyEmail, verifyOtp
│   │   ├── interceptors/
│   │   │   └── refresh.ts        ← Refresh token automático con deduplicación
│   │   └── types/
│   │       └── api-response.ts   ← ApiResponse<T>, User, AuthResponse, ApiErrorCode
│   └── auth/
│       └── token-store.ts        ← Persistencia dual localStorage/sessionStorage
│
├── hooks/
│   └── useAuth.ts                ← Hooks React Query (useMe, useLogin, useLogout, useRegister, etc.)
│
├── layouts/
│   ├── AuthLayout.tsx            ← Layout split hero+form
│   └── auth/
│       └── AuthFormLayout.tsx    ← AuthFormHeader, AuthFormCheckbox, AuthFormActions
│
├── pages/auth/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── VerifyOTPPage.tsx
│   ├── ResetPasswordPage.tsx
│   ├── VerifyEmailPage.tsx
│   ├── VerifyEmailConfirmPage.tsx
│   └── ForbiddenPage.tsx
│
├── test/mocks/handlers/
│   └── auth.ts                   ← MSW handlers mockando los 9 endpoints
│
└── App.tsx                       ← Router: wiring de todos los flujos
```

---

## 2. Contratos Fundamentales (TypeScript)

### 2.1 `User` — `src/lib/api/types/api-response.ts:151-161`

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
  privileges: string[];
  isVerified: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}
```

### 2.2 `AuthResponse` — `src/lib/api/types/api-response.ts:166-171`

```typescript
interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;  // segundos
}
```

### 2.3 `ApiResponse<T>` — Contrato unificado de respuesta API

```typescript
type ApiResponse<T> = ApiSuccess<T> | ApiError;

interface ApiSuccess<T> {
  success: true;
  message: string;
  data?: T;
}

interface ApiError {
  success: false;
  message: string;
  code: ApiErrorCode;  // 'VALIDATION_ERROR'|'UNAUTHORIZED'|'FORBIDDEN'|'NOT_FOUND'|'CONFLICT'|'RATE_LIMITED'|'INTERNAL_ERROR'|'NETWORK_ERROR'|'TIMEOUT'|'UNKNOWN'
  fields?: Record<string, string[]>;
  timestamp?: string;
  traceId?: string;
}
```

### 2.4 `AuthState` y `AuthContextValue` — `src/auth/types.ts`

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  hasPrivilege: (privilege: string) => boolean;
  hasAnyPrivilege: (privileges: string[]) => boolean;
  hasRole: (role: string) => boolean;
  isVerified: () => boolean;
}
```

### 2.5 `ForgotPasswordState` / `ForgotPasswordContextValue` — `src/auth/ForgotPasswordContext.tsx:14-25`

```typescript
interface ForgotPasswordState {
  email: string;
  token: string | null;
  otpVerified: boolean;
}

interface ForgotPasswordContextValue extends ForgotPasswordState {
  setEmail: (email: string) => void;
  verifyOtp: (otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  reset: () => void;
}
```

---

## 3. Análisis Proceso por Proceso

---

### 3.1 LOGIN

**Archivos involucrados:** `LoginPage.tsx`, `provider.tsx` (`login`), `auth.service.ts` (`login`), `token-store.ts`, `client.ts` (`tokenManager`)

#### Firma de Entrada (API)

```
POST /auth/login
Content-Type: application/json

Body: { email: string, password: string }
```

#### Firma de Salida (API)

**Éxito (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { "id", "email", "name", "roles", "privileges", "isVerified" },
    "token": "eyJ...",
    "refreshToken": "refresh-1",
    "expiresIn": 3600
  }
}
```

**Error (401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "code": "UNAUTHORIZED"
}
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario completa formulario (email, password, remember)      │
│ 2. handleSubmit() → e.preventDefault()                          │
│ 3. setLoading(true), setError('')                               │
│ 4. await login(email, password, remember)                       │
│    └─ provider.tsx: login()                                     │
│       ├─ await authService.login(email, password)               │
│       │   └─ client.post('/auth/login', {email, password})      │
│       │       ├─ Inyecta Bearer token si existe (pre-refresh)   │
│       │       ├─ fetch → POST                                   │
│       │       └─ Parsea ApiResponse<AuthResponse>               │
│       ├─ Si !response.success → throw Error(message)            │
│       ├─ Desestructura { user, token, refreshToken, expiresIn } │
│       ├─ authStorage.setToken(token, expiresIn, remember)       │
│       ├─ authStorage.setRefreshToken(refreshToken, remember)    │
│       ├─ tokenManager.set(token)                                │
│       └─ setState({ user, token, isAuthenticated: true,         │
│                     isLoading: false })                          │
│ 5. navigate(from, { replace: true })  ← from = location.state   │
│ 6. Captcha error: setError(err.message)                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Persistencia
- Si `remember=true` → `localStorage` (token + expiresAt + refreshToken)
- Si `remember=false` → `sessionStorage` (misma data)
- Token en memoria via `tokenManager` (variable closure en `client.ts`)

#### Protección
- Envuelto en `<GuestOnly>` — si ya está autenticado, redirige a `/`

---

### 3.2 REGISTRO

**Archivos involucrados:** `RegisterPage.tsx`, `auth.service.ts` (`register`)

#### Firma de Entrada (API)

```
POST /auth/register
Content-Type: application/json

Body: { name: string, email: string, password: string }
```

#### Firma de Salida (API)

**Éxito (200):**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "data": {
    "user": { "id", "email", "name", "roles": ["viewer"], "privileges": ["users:read"], "isVerified": false },
    "token": "eyJ..."
  }
}
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario llena: email, password, confirmPassword, acceptTerms │
│ 2. Validaciones client-side:                                    │
│    ├─ !acceptTerms → "Debés aceptar los términos"              │
│    └─ password !== confirmPassword → "Las contraseñas no        │
│       coinciden"                                                │
│ 3. await authService.register({                                 │
│      name: email.split('@')[0],  ← nombre derivado del email   │
│      email,                                                    │
│      password                                                  │
│    })                                                          │
│ 4. Si !response.success → setError(response.message)            │
│ 5. Si success → navigate('/verify-email', { state: { email } }) │
│ 6. NO persiste token, NO loguea al usuario                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Protección
- Envuelto en `<GuestOnly>`

---

### 3.3 FORGOT PASSWORD (Paso 1: Solicitar email)

**Archivos involucrados:** `ForgotPasswordPage.tsx`, `ForgotPasswordContext.tsx`, `auth.service.ts` (`forgotPassword`)

#### Firma de Entrada (API)

```
POST /auth/forgot-password
Content-Type: application/json

Body: { email: string }
```

#### Firma de Salida (API)

**Éxito:**
```json
{ "success": true, "message": "Email de recuperación enviado" }
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa email                                        │
│ 2. handleSubmit()                                               │
│ 3. await authService.forgotPassword(email)                      │
│    └─ client.post('/auth/forgot-password', { email })           │
│ 4. Si !response.success → setError(message)                     │
│ 5. Si success:                                                  │
│    ├─ setEmail(email)  ← guarda en ForgotPasswordContext        │
│    ├─ setSent(true) → muestra pantalla de confirmación          │
│    └─ setTimeout → navigate('/verify-otp') después de 2s        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.4 VERIFY OTP (Paso 2: Verificar código)

**Archivos involucrados:** `VerifyOTPPage.tsx`, `ForgotPasswordContext.tsx` (`verifyOtp`), `auth.service.ts` (`verifyOtp`)

#### Firma de Entrada (API)

```
POST /auth/verify-otp
Content-Type: application/json

Body: { email: string, otp: string }
```

#### Firma de Salida (API)

**Éxito (OTP correcto, mock: `123456`):**
```json
{
  "success": true,
  "message": "OTP verificado",
  "data": { "verified": true, "token": "reset-token-1694..." }
}
```

**Error — OTP expirado (mock: `000000`):**
```json
{ "success": false, "message": "OTP expirado", "code": "EXPIRED" }
```

**Error — OTP inválido:**
```json
{ "success": false, "message": "OTP inválido", "code": "INVALID_OTP" }
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Página renderiza 6 inputs de dígito                         │
│ 2. handleChange(index, value):                                  │
│    ├─ Filtra solo dígitos (regex /^\d+$/)                       │
│    ├─ Actualiza array otp[]                                     │
│    ├─ Auto-avanza focus al siguiente input                      │
│    └─ Si los 6 están completos → auto-submit                    │
│ 3. handlePaste: permite pegar código de 6 dígitos completo      │
│ 4. handleSubmit(otpString):                                     │
│    ├─ await verifyOtp(otpString)                                │
│    │   └─ ForgotPasswordContext.verifyOtp                       │
│    │       └─ authService.verifyOtp(state.email, otp)           │
│    │           └─ client.post('/auth/verify-otp', {email, otp}) │
│    ├─ Si success:                                              │
│    │   ├─ setState({ token: data.token, otpVerified: true })    │
│    │   └─ navigate('/reset-password')                           │
│    └─ Si error:                                                 │
│        ├─ setError(result.error)                                │
│        ├─ Resetea otp[] a ['', '', '', '', '', '']             │
│        └─ Foca el primer input                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### Validaciones client-side
- Solo acepta dígitos (`/^\d+$/`)
- Máximo 1 dígito por input
- Auto-submit al completar 6 dígitos
- Auto-retroceso con Backspace

---

### 3.5 RESET PASSWORD (Paso 3: Nueva contraseña)

**Archivos involucrados:** `ResetPasswordPage.tsx`, `ForgotPasswordContext.tsx` (`resetPassword`, `reset`), `auth.service.ts` (`resetPassword`)

#### Firma de Entrada (API)

```
POST /auth/reset-password
Content-Type: application/json

Body: { token: string, password: string }
```

> `token` viene del contexto (`ForgotPasswordState.token`), obtenido en el paso de OTP.

#### Firma de Salida (API)

**Éxito:**
```json
{ "success": true, "message": "Contraseña actualizada" }
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Guard: si !token → navigate('/forgot-password')              │
│ 2. Usuario llena: password, confirmPassword                     │
│ 3. Validaciones client-side:                                    │
│    ├─ password.length < 6 → error                               │
│    └─ password !== confirmPassword → error                      │
│ 4. await resetPassword(password)                                │
│    └─ ForgotPasswordContext.resetPassword                       │
│        ├─ Si !state.token → return { success: false }           │
│        └─ authService.resetPassword(token, password)            │
│            └─ client.post('/auth/reset-password',               │
│                 { token, password })                             │
│ 5. Si success:                                                  │
│    ├─ setSuccess(true) → pantalla de confirmación               │
│    ├─ reset() ← limpia todo el ForgotPasswordContext             │
│    └─ setTimeout → navigate('/login') después de 3s            │
│ 6. Si error → setError(result.error)                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.6 VERIFY EMAIL (Página informativa post-registro)

**Archivos involucrados:** `VerifyEmailPage.tsx`, `auth.service.ts` (`resendVerification`), `auth.hooks` (`logout`)

#### Firma de Entrada (API — reenvío)

```
POST /auth/resend-verification
Content-Type: application/json

Body: { email: string }
```

#### Firma de Salida (API)

**Éxito:**
```json
{ "success": true, "message": "Email reenviado" }
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Email = user?.email || location.state?.email || ''           │
│    └─ Viene del registro (state) o del usuario logueado        │
│ 2. Muestra: instrucciones, email, botones de reenvío y logout   │
│ 3. handleResend():                                              │
│    └─ await authService.resendVerification(email)               │
│       └─ client.post('/auth/resend-verification', { email })    │
│ 4. handleLogout():                                              │
│    ├─ await logout() ← del AuthContext                          │
│    └─ navigate('/login')                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Protección
- **NO** tiene `<GuestOnly>` — es accesible tanto logueado como no logueado (la ruta `/verify-email` es pública en `App.tsx:78`)

---

### 3.7 VERIFY EMAIL CONFIRM (Desde enlace del email)

**Archivos involucrados:** `VerifyEmailConfirmPage.tsx`, `auth.service.ts` (`verifyEmail`)

#### Firma de Entrada (API)

```
POST /auth/verify-email
Content-Type: application/json

Body: { token: string }
```

> El `token` se obtiene de la query string: `?token=verify-token-abc123`

#### Firma de Salida (API)

**Éxito (token = `verify-token-abc123`):**
```json
{
  "success": true,
  "message": "Email verificado",
  "data": { "email": "usuario@ejemplo.com" }
}
```

**Error (token inválido):**
```json
{ "success": false, "message": "Token inválido", "code": "VALIDATION_ERROR" }
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. useEffect al montar:                                        │
│    ├─ const token = searchParams.get('token')                   │
│    ├─ Si !token → setStatus('error'), setError(...)             │
│    └─ await authService.verifyEmail(token)                      │
│       └─ client.post('/auth/verify-email', { token })           │
│ 2. Si success:                                                  │
│    ├─ setStatus('success') → pantalla de éxito                  │
│    └─ setTimeout → navigate('/login') después de 3s            │
│ 3. Si error:                                                    │
│    ├─ code === 'NETWORK_ERROR' || 'TIMEOUT' → msg genérico      │
│    └─ Otro → "Token inválido o expirado"                        │
│ 4. Tres estados UI: loading (Spinner) | success (LuCheck) |     │
│    error (LuX + botón "Volver al login")                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Protección
- Ruta **pública** (sin guards) — accedida desde el enlace en el email del usuario

---

### 3.8 LOGOUT

**Archivos involucrados:** `provider.tsx` (`logout`), `auth.service.ts` (`logout`)

#### Firma de Entrada (API)

```
POST /auth/logout
(No body)
```

#### Firma de Salida (API)

```json
{ "success": true, "message": "Logout exitoso" }
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. await authService.logout()                                   │
│    └─ client.post('/auth/logout')                               │
│ 2. finally (SIEMPRE se ejecuta):                                │
│    ├─ authStorage.clearAll()  ← limpia AMBOS storages           │
│    ├─ tokenManager.clear()   ← limpia token en memoria         │
│    └─ setState({ user: null, token: null,                       │
│                  isAuthenticated: false, isLoading: false })     │
│                                                                  │
│ ─── Logout externo (refresh token failure):                     │
│ 1. client.ts detecta 401 tras intentar refresh                  │
│ 2. Despacha CustomEvent('auth:logout')                          │
│ 3. provider.tsx listener:                                       │
│    ├─ authStorage.clearAll()                                    │
│    ├─ tokenManager.clear()                                      │
│    ├─ setState(...)                                             │
│    └─ window.location.href = '/login'  ← hard redirect         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.9 REFRESH TOKEN (Automático)

**Archivos involucrados:** `interceptors/refresh.ts`, `client.ts`, `auth.service.ts` (`refreshToken`)

#### Firma de Entrada (API)

```
POST /auth/refresh
Content-Type: application/json

Body: { refreshToken: string }
```

#### Firma de Salida (API)

```json
{
  "success": true,
  "message": "Token refrescado",
  "data": {
    "user": { ... },
    "token": "nuevo-jwt",
    "refreshToken": "nuevo-refresh",
    "expiresIn": 3600
  }
}
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. client.ts: antes de cada request, verifica authStorage       │
│    .isExpired()                                                 │
│ 2. Si expirado → tryRefreshToken()                              │
│    ├─ Deduplicación: si ya hay un refresh en curso, reutiliza  │
│    │  la misma Promise                                          │
│    ├─ authStorage.getRefreshToken() → lee de localStorage       │
│    ├─ fetch → POST { API_BASE }{ VITE_AUTH_REFRESH_PATH }     │
│    │  Content-Type: application/json                            │
│    │  Body: { refreshToken }                                    │
│    ├─ Si response.ok y data.success:                           │
│    │  ├─ tokenManager.set(token)                               │
│    │  ├─ authStorage.setToken(token, expiresIn)                │
│    │  └─ authStorage.setRefreshToken(newRefreshToken) si existe│
│    │  └─ return true                                           │
│    ├─ Si falla → authStorage.clear() + tokenManager.clear()    │
│    └─ return false                                             │
│ 3. Si refresh falló → dispatch 'auth:logout' → redirige /login │
│ 4. Si refresh OK → la request original se reintenta con nuevo  │
│    token (flag _retry para evitar loop infinito)               │
└─────────────────────────────────────────────────────────────────┘
```

---

### 3.10 RESTAURAR SESIÓN (Al montar la app)

**Archivos involucrados:** `provider.tsx` (`useEffect` de mount), `auth.service.ts` (`me`)

#### Firma de Entrada (API)

```
GET /auth/me
Authorization: Bearer {token}
```

#### Firma de Salida (API)

**Éxito:**
```json
{
  "success": true,
  "message": "Usuario obtenido",
  "data": { "id", "email", "name", "roles", "privileges", "isVerified" }
}
```

#### Flujo Paso a Paso

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. AuthProvider monta → useEffect([], ...)                      │
│ 2. restoreSession():                                           │
│    ├─ token = authStorage.getToken(true)  ← localStorage first │
│    ├─ Si !token → token = authStorage.getToken(false) ← session │
│    ├─ Si !token → isLoading=false, return (no sesión)           │
│    ├─ tokenManager.set(token)                                   │
│    ├─ await authService.me()                                    │
│    │   └─ client.get('/auth/me') con Bearer token              │
│    ├─ Si !success o !data:                                     │
│    │  ├─ authStorage.clear(remember)                            │
│    │  ├─ tokenManager.clear()                                   │
│    │  └─ setState({ no autenticado })                           │
│    └─ Si success:                                              │
│       └─ setState({ user: data, token, isAuthenticated: true }) │
│ 3. En caso de exception (token inválido):                       │
│    ├─ authStorage.clear(remember)                               │
│    ├─ tokenManager.clear()                                      │
│    └─ setState({ no autenticado })                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Tokens y Persistencia (`token-store.ts`)

| Clave (key) | Storage | Descripción |
|---|---|---|
| `auth_token` | localStorage / sessionStorage | JWT de acceso |
| `auth_refresh_token` | localStorage / sessionStorage | Token de refresco |
| `auth_expires_at` | localStorage / sessionStorage | Timestamp de expiración (Date.now + expiresIn*1000) |

**Dual storage:**
- `remember=true` → `localStorage` (persiste entre sesiones del navegador)
- `remember=false` → `sessionStorage` (se limpia al cerrar pestaña)

**`clearAll()`** limpiar AMBOS storages — se usa en logout y en refresh fallido.

**`isExpired()`** compara `Date.now() >= expiresAt` — usado por el interceptor para proactively refrescar antes de enviar requests.

---

## 5. Guard Components — `guards.tsx`

| Guard | Autenticación | Verificación email | Privilegio/Rol | Redirección si falla |
|---|---|---|---|---|
| `ProtectedRoute` | Requerida | Opcional (`requireVerification`) | — | `/login` (o `/verify-email`) |
| `RequirePrivilege` | Requerida | — | `privilege` o `anyOf[]` | `/login` → `/403` |
| `RequireRole` | Requerida | — | `role` | `/login` → `/403` |
| `GuestOnly` | **NO** requerida | — | — | `/` (si autenticado) |
| `RequireVerification` | Requerida | Sí | — | `/login` / `/verify-email` |

Todos muestran `<AuthLoading />` durante `isLoading === true`.

---

## 6. Wiring de Rutas — `App.tsx`

```
/AuthLayout (hero split)
├── /login              → LoginPage + <GuestOnly>
├── /register           → RegisterPage + <GuestOnly>

/ForgotPasswordProvider + /AuthLayout
├── /forgot-password    → ForgotPasswordPage + <GuestOnly>
├── /verify-otp         → VerifyOTPPage + <GuestOnly>
├── /reset-password     → ResetPasswordPage + <GuestOnly>

/AuthLayout
├── /verify-email       → VerifyEmailPage (público)
├── /verify-email/confirm → VerifyEmailConfirmPage (público)

/Públicas
├── /terms              → TermsPage
├── /403                → ForbiddenPage
├── /500                → ServerErrorPage

/ProtectedRoute + /MainLayout
├── /ajustes/*          → RequirePrivilege("settings:manage")
├── (resto de routes)   → requireVerification=true por defecto

/* → NotFoundPage (catch-all)
```

---

## 7. Hooks React Query — `hooks/useAuth.ts`

Hooks que **envuelven** `authService` con React Query (paralelos al AuthProvider):

| Hook | Tipo | Mutates/Queries | Notes |
|---|---|---|---|
| `useMe()` | `useQuery` | `GET /auth/me` | `staleTime: 5min`, `retry: false` |
| `useLogin()` | `useMutation` | `POST /auth/login` | Actualiza cache `['auth','me']` |
| `useLogout()` | `useMutation` | `POST /auth/logout` | `queryClient.clear()` en settle |
| `useRegister()` | `useMutation` | `POST /auth/register` | — |
| `useForgotPassword()` | `useMutation` | `POST /auth/forgot-password` | — |
| `useResetPassword()` | `useMutation` | `POST /auth/reset-password` | — |
| `useVerifyEmail()` | `useMutation` | `POST /auth/verify-email` | — |
| `useResendVerification()` | `useMutation` | `POST /auth/resend-verification` | — |

> **Nota:** Las páginas actuales usan directamente `authService` + `useState` local en vez de estos hooks. Los hooks existen como alternativa más limpia para consumo futuro.

---

## 8. Mock Handlers — `test/mocks/handlers/auth.ts`

### Usuarios mockeados

| Email | Password | Roles | Privilegios | Verificado |
|---|---|---|---|---|
| `admin@test.com` | `admin123` | `['admin']` | `users:read, users:write, users:delete, reports:view, reports:export, settings:manage` | ✅ |
| `editor@test.com` | `editor123` | `['editor']` | `users:read, reports:view` | ✅ |

### Endpoints mockeados

| Endpoint | Comportamiento |
|---|---|
| `POST /auth/login` | Valida credenciales contra `MOCK_USERS`. Token = `btoa(JSON.stringify({sub, exp}))` |
| `POST /auth/logout` | Siempre success |
| `GET /auth/me` | Decodifica token Bearer, busca usuario por `sub` |
| `POST /auth/refresh` | Siempre retorna datos de `admin@test.com` |
| `POST /auth/register` | Crea usuario con `roles: ['viewer']`, `isVerified: false` |
| `POST /auth/forgot-password` | Siempre success |
| `POST /auth/reset-password` | Siempre success |
| `POST /auth/verify-email` | Token `verify-token-abc123` → success, otro → error 400 |
| `POST /auth/resend-verification` | Siempre success |
| `POST /auth/verify-otp` | `123456` → success con token, `000000` → expirado, otro → inválido |

---

## 9. Diagrama de Flujo Completo

```
                         ┌──────────────┐
                         │   Inicio App  │
                         └──────┬───────┘
                                │
                    ┌───────────▼───────────┐
                    │  ¿Hay token en storage?│
                    └───────┬───────┬───────┘
                     Sí     │       │   No
               ┌────────────▼─┐   ┌─▼──────────────┐
               │  GET /me     │   │ isLoading=false  │
               │  ¿success?   │   │ No autenticado   │
               └──┬───────┬──┘   └─────────────────┘
            Sí    │   No  │
       ┌──────────▼┐  ┌───▼──────────┐
       │Autenticado │  │ Limpiar todo │
       └────────────┘  └──────────────┘

═══════════════════════════════════════════════

  FLUJO LOGIN:                    FLUJO REGISTER:
  ┌──────────┐                    ┌──────────┐
  │/login    │                    │/register │
  │(GuestOnly)│                   │(GuestOnly)│
  └────┬─────┘                    └────┬─────┘
       │                              │
  POST /auth/login               POST /auth/register
       │                              │
  ┌────▼─────┐                   ┌────▼──────┐
  │Success?  │                   │Success?   │
  └──┬────┬──┘                   └──┬────┬───┘
  Yes│    │No                  Yes  │    │No
     │    └──setError()            │    └──setError()
  ┌──▼──────┐                 ┌────▼──────┐
  │Persistir │                 │Navigate   │
  │token+user│                 │/verify-   │
  │navigate  │                 │email      │
  └──────────┘                 └───────────┘

  FLUJO FORGOT PASSWORD (3 pasos):
  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
  │/forgot-pw   │───▶│/verify-otp   │───▶│/reset-pw     │
  │email input  │    │6-digit code  │    │new password  │
  └──────┬──────┘    └──────┬───────┘    └──────┬───────┘
         │                  │                   │
  POST /forgot-pw    POST /verify-otp    POST /reset-pw
  Guarda email        Guarda token+OTP    Limpia context
  ─────────────▶/verify-otp ──────────▶/reset-pw ──────────▶/login

  FLUJO VERIFY EMAIL:
  ┌───────────────┐        ┌──────────────────┐
  │/verify-email  │        │/verify-email/    │
  │(reenviar,     │        │confirm?token=xxx │
  │ cerrar sesión)│        │(desde enlace)    │
  └───────┬───────┘        └────────┬─────────┘
          │                         │
  POST /resend-verification   POST /verify-email
                               │
                         ┌─────▼──────┐
                         │ Success?   │
                         └──┬─────┬───┘
                        Yes │     │ No
                    3s→/login   Error msg
```

---

## 10. Observaciones y Notas Relevantes

1. **Doble sistema de hooks:** Existen tanto `src/auth/hooks.ts` (basado en Context) como `src/hooks/useAuth.ts` (basado en React Query). Las páginas usan el Context. Los React Query hooks están disponibles pero subutilizados.

2. **Token de registro no persiste:** El endpoint `POST /auth/register` retorna un `token` en el mock, pero `RegisterPage.tsx` no lo persiste — simplemente redirige a `/verify-email`. El usuario queda con sesión no iniciada tras registro.

3. **Nombre auto-generado en registro:** El campo `name` se genera como `email.split('@')[0]`, lo cual es un placeholder. Un frontend real debería solicitar este dato explícitamente.

4. **`authService` vs hooks:** Las páginas llaman `authService` directamente y manejan estado local con `useState`, mientras que los hooks de React Query encapsulan lo mismo. Hay redundancia deliberada (dual path para elegir el approach que mejor se adapte).

5. **Logout forzado:** El listener de `auth:logout` CustomEvent usa `window.location.href = '/login'` (hard navigation), no `navigate()`. Esto garantiza limpieza completa de estado React al fallar el refresh token.

6. **El guard `ProtectedRoute` tiene `requireVerification=true` por defecto** — cualquier ruta protegida requiere email verificado a menos que se desactive explícitamente.

7. **La ruta `/verify-email` es pública** — no tiene `<GuestOnly>` ni `<ProtectedRoute>`. Esto es correcto: puede ser accedida tanto por usuarios logueados no verificados como por usuarios no logueados (post-registro via state).

8. **El interceptor de refresh deduplica:** Si múltiples requests fallan simultáneamente con 401, solo se hace UN refresh. Las demás reutilizan la misma Promise.
