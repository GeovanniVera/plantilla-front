# Páginas de autenticación (`src/pages/auth/`)

La carpeta contiene **11 páginas funcionales**: el flujo de auth (login, registro, recovery, verificación de email) más las páginas de términos y de error, que **viven físicamente aquí** (no en la raíz). Todas se cargan con lazy import.

## Flujo completo

```
Registro
  └─ sin auto-login → /verify-email

Login
  ├─ cuenta no verificada → /verify-email (redirect con state.email)
  ├─ cuenta suspendida → banner vía /login?error=…
  └─ ok → /dashboard (o la ruta original en location.state.from)

Recovery de contraseña (3 pasos, ForgotPasswordProvider + GuestOnly)
  1. /forgot-password  → email → OTP
  2. /verify-otp       → OTP de 6 dígitos → resetToken
  3. /reset-password   → nueva contraseña con token

Verificación de email
  /verify-email (RedirectIfVerified) → reenviar / logout
  /verify-email/confirm?token= → valida token (bug conocido: no redirige)
```

Los pasos 1–3 de recovery comparten `ForgotPasswordProvider` (que sostiene el estado entre pasos) y están envueltos en `GuestOnly` y `AuthLayout`.

## Inventario

| Página | Ruta | Propósito | Acceso | Lazy |
|---|---|---|---|---|
| [LoginPage](#loginpage) | `/login` | Login; redirige a `/verify-email` si la cuenta "no está verificada"; banner de suspensión vía `?error=` | Público (`AuthLayout` + `GuestOnly` en wrapper) | Sí |
| [RegisterPage](#registerpage) | `/register` | Registro; **sin auto-login** → `/verify-email` | Público | Sí |
| [ForgotPasswordPage](#forgotpasswordpage) | `/forgot-password` | Paso 1: email → OTP | Público (`GuestOnly` + `ForgotPasswordProvider`) | Sí |
| [VerifyOTPPage](#verifyotppage) | `/verify-otp` | Paso 2: OTP de 6 dígitos → obtiene `resetToken` | Público (`GuestOnly`) | Sí |
| [ResetPasswordPage](#resetpasswordpage) | `/reset-password` | Paso 3: nueva contraseña con token | Público (`GuestOnly`) | Sí |
| [VerifyEmailPage](#verifyemailpage) | `/verify-email` | "Revisá tu email" + reenviar + logout | Autenticado sin verificar (`RedirectIfVerified`) | Sí |
| [VerifyEmailConfirmPage](#verifyemailconfirmpage) | `/verify-email/confirm?token=` | Valida token; **bug conocido: no redirige a `/login`** | Público | Sí |
| [TermsPage](#termspage) | `/terms` | Términos estáticos (cuerpo hardcodeado en español, no i18n) | Público | Sí |
| [ForbiddenPage](#forbiddenpage) | `/403` | Acceso denegado (target de `onForbidden` del client) | Público | Sí |
| [NotFoundPage](#notfoundpage) | `*` (catch-all) | 404 | Público | Sí |
| [ServerErrorPage](#servererrorpage) | `/500` | Error de servidor (estilos inline propios) | Público | Sí |

Detalles de las páginas de error y términos en [errors.md](./errors.md) y [other.md](./other.md).

## LoginPage

Formulario de login con `useLogin` (de `src/hooks/useAuth.ts`). Comportamientos clave:

- **Redirección post-login**: usa `location.state.from` (seteado por `ProtectedRoute`) o `/dashboard` por defecto.
- **Cuenta no verificada**: si el error del login contiene "no verificada", navega a `/verify-email` con `state: { email }`.
- **Banner de suspensión**: lee `?error=` de la query string (`searchParams.get('error')`), poblado por el client HTTP al recibir un 403 con `ACCOUNT_SUSPENDED`.

## RegisterPage

Formulario de registro con `useRegister`. Tras registrarse **no hay auto-login**: se redirige a `/verify-email`.

## ForgotPasswordPage / VerifyOTPPage / ResetPasswordPage

Flujo de recovery en 3 pasos bajo `ForgotPasswordProvider`:

1. **ForgotPasswordPage** — pide el email y dispara el OTP.
2. **VerifyOTPPage** — valida el OTP de 6 dígitos y obtiene el `resetToken`.
3. **ResetPasswordPage** — envía la nueva contraseña junto con el token.

Todas envueltas en `GuestOnly` (un usuario autenticado no ve recovery).

## VerifyEmailPage

Pantalla de verificación de email. Puntos de diseño:

- **`canResend` desactivado si ya verificado**: `canResend = !(isAuthenticated && isVerified())`. La razón: un usuario autenticado y verificado no puede reenviar — el backend responde 200 opaco (anti-enumeración) sin hacer nada, y la UI mostraría un falso "Email reenviado exitosamente".
- Acciones: reenviar email y cerrar sesión (`logout` → `/login`).
- ⚠ Imprime en consola `[Mock] Email de verificación reenviado a:` y `[Mock] Token de verificación: verify-token-abc123` (ver deudas en [README](./README.md#deudas-conocidas)).

## VerifyEmailConfirmPage

Valida el token recibido por query string (`?token=`). Al confirmar, muestra el estado "Redirigiendo al login..." pero **no navega a `/login`** — bug conocido y pendiente (no hay `navigate('/login')` en el estado de éxito). Se recomienda corregirlo en el código antes de producción.

## Detalles de layout

- `AuthLayout` (split): hero animado a la izquierda (gradientes + íconos flotantes usando colores del tema) y formulario a la derecha; en mobile solo se muestra el formulario. Ver `src/layouts/AuthLayout.tsx`.
- `AuthFormLayout` (`src/layouts/auth/`) provee `AuthFormHeader`, `AuthFormCheckbox`, `AuthFormActions`.
- Las páginas de error usan `ErrorLayout` — ver [errors.md](./errors.md).