# Auth Flows

## Diagrama de Flujo General

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
```

---

## Login

### Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario completa formulario (email, password, remember)      │
│ 2. handleSubmit() → e.preventDefault()                          │
│ 3. setLoading(true), setError('')                               │
│ 4. await login(email, password, remember)                       │
│    └─ provider.tsx: login()                                     │
│       ├─ await authService.login(email, password)               │
│       │   └─ client.post('/auth/login', {email, password})      │
│       ├─ Si !response.success → throw Error(message)            │
│       ├─ Desestructura { user, token, refreshToken, expiresIn } │
│       ├─ authStorage.setToken(token, expiresIn, remember)       │
│       ├─ authStorage.setRefreshToken(refreshToken, remember)    │
│       ├─ tokenManager.set(token)                                │
│       └─ setState({ user, token, isAuthenticated: true })       │
│ 5. navigate(from, { replace: true })                            │
└─────────────────────────────────────────────────────────────────┘
```

### API

```
POST /auth/login
Body: { email: string, password: string }

Response (éxito):
{
  "success": true,
  "data": {
    "user": { "id", "email", "name", "roles", "privileges", "isVerified" },
    "token": "eyJ...",
    "refreshToken": "refresh-1",
    "expiresIn": 3600
  }
}

Response (error):
{
  "success": false,
  "message": "Credenciales inválidas",
  "code": "UNAUTHORIZED"
}
```

---

## Register

### Flujo

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario llena: name, email, password, confirmPassword,      │
│    acceptTerms                                                  │
│ 2. Validaciones client-side:                                    │
│    ├─ !acceptTerms → "Debés aceptar los términos"              │
│    └─ password !== confirmPassword → "Las contraseñas no        │
│       coinciden"                                                │
│ 3. await registerMutation.mutate({ name, email, password })     │
│    └─ authService.register({ name, email, password })           │
│ 4. Si !response.success → setError(response.message)            │
│ 5. Si success:                                                  │
│    └─ Login automático:                                         │
│       loginMutation.mutate({ email, password, remember: true }) │
│       └─ navigate('/verify-email', { state: { email } })        │
└─────────────────────────────────────────────────────────────────┘
```

### API

```
POST /auth/register
Body: { name: string, email: string, password: string }

Response (éxito):
{
  "success": true,
  "data": {
    "user": { "id", "email", "name", "roles": ["viewer"], "isVerified": false },
    "token": "eyJ..."
  }
}
```

---

## Forgot Password (3 pasos)

### Paso 1: Solicitar Email

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Usuario ingresa email                                        │
│ 2. await forgotPasswordMutation.mutate(email)                   │
│    └─ authService.forgotPassword(email)                         │
│ 3. Si success:                                                  │
│    ├─ setEmail(email) ← guarda en ForgotPasswordContext         │
│    └─ setTimeout → navigate('/verify-otp') después de 2s        │
└─────────────────────────────────────────────────────────────────┘
```

**API:**
```
POST /auth/forgot-password
Body: { email: string }

Response: { "success": true, "message": "Email de recuperación enviado" }
```

### Paso 2: Verificar OTP

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Página renderiza 6 inputs de dígito                         │
│ 2. Auto-submit al completar 6 dígitos                           │
│ 3. await verifyOtp(otpString)                                   │
│    └─ ForgotPasswordContext.verifyOtp                           │
│       └─ authService.verifyOtp(email, otp)                      │
│ 4. Si success:                                                  │
│    ├─ setState({ token: data.token, otpVerified: true })        │
│    └─ navigate('/reset-password')                               │
│ 5. Si error:                                                    │
│    ├─ setError(result.error)                                    │
│    └─ Resetea inputs a ['', '', '', '', '', '']                │
└─────────────────────────────────────────────────────────────────┘
```

**API:**
```
POST /auth/verify-otp
Body: { email: string, otp: string }

Response (éxito): { "success": true, "data": { "verified": true, "token": "reset-token-..." } }
Response (OTP inválido): { "success": false, "code": "INVALID_OTP" }
Response (OTP expirado): { "success": false, "code": "EXPIRED" }
```

### Paso 3: Reset Password

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Guard: si !token → navigate('/forgot-password')              │
│ 2. Usuario llena: password, confirmPassword                     │
│ 3. await resetPasswordMutation.mutate({ token, password })      │
│    └─ authService.resetPassword(token, password)                │
│ 4. Si success:                                                  │
│    ├─ reset() ← limpia ForgotPasswordContext                     │
│    └─ setTimeout → navigate('/login') después de 3s            │
└─────────────────────────────────────────────────────────────────┘
```

**API:**
```
POST /auth/reset-password
Body: { token: string, password: string }

Response: { "success": true, "message": "Contraseña actualizada" }
```

---

## Verify Email

### Desde enlace del email

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. useEffect al montar:                                        │
│    ├─ const token = searchParams.get('token')                   │
│    └─ await verifyEmailMutation.mutate(token)                   │
│ 2. Si success:                                                  │
│    └─ setTimeout → navigate('/login') después de 3s            │
│ 3. Si error → mostrar mensaje de error                          │
└─────────────────────────────────────────────────────────────────┘
```

**API:**
```
POST /auth/verify-email
Body: { token: string }

Response (éxito): { "success": true, "data": { "email": "usuario@ejemplo.com" } }
Response (token inválido): { "success": false, "code": "VALIDATION_ERROR" }
```

---

## Logout

### Flujo normal

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. await logout()                                               │
│    └─ authService.logout()                                      │
│ 2. finally (SIEMPRE):                                           │
│    ├─ authStorage.clearAll()                                    │
│    ├─ tokenManager.clear()                                      │
│    └─ setState({ user: null, isAuthenticated: false })          │
└─────────────────────────────────────────────────────────────────┘
```

### Logout forzado (refresh token fallido)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. client.ts detecta 401 tras refresh                           │
│ 2. Despacha CustomEvent('auth:logout')                          │
│ 3. AuthProvider listener:                                       │
│    ├─ authStorage.clearAll()                                    │
│    ├─ tokenManager.clear()                                      │
│    └─ window.location.href = '/login' ← hard redirect          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Restaurar Sesión (al montar la app)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. AuthProvider monta → useEffect([], ...)                      │
│ 2. restoreSession():                                           │
│    ├─ token = authStorage.getToken(true)  ← localStorage       │
│    ├─ Si !token → token = authStorage.getToken(false) ← session │
│    ├─ Si !token → isLoading=false, return (no sesión)           │
│    ├─ tokenManager.set(token)                                   │
│    ├─ await authService.me()                                    │
│    ├─ Si !success: limpiar todo                                 │
│    └─ Si success: setState({ user, token, isAuthenticated })    │
└─────────────────────────────────────────────────────────────────┘
```
