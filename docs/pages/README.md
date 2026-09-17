# Pages

Páginas del proyecto plantilla-front.

## Inventario

| Página | Ruta | Layout | Guard |
|--------|------|--------|-------|
| LoginPage | `/login` | AuthLayout | GuestOnly |
| RegisterPage | `/register` | AuthLayout | GuestOnly |
| ForgotPasswordPage | `/forgot-password` | AuthLayout + ForgotPasswordProvider | GuestOnly |
| VerifyOTPPage | `/verify-otp` | AuthLayout + ForgotPasswordProvider | GuestOnly |
| ResetPasswordPage | `/reset-password` | AuthLayout + ForgotPasswordProvider | GuestOnly |
| VerifyEmailPage | `/verify-email` | AuthLayout | — |
| VerifyEmailConfirmPage | `/verify-email/confirm` | AuthLayout | — |
| ForbiddenPage | `/403` | Standalone | — |
| NotFoundPage | `*` | Standalone | — |
| ServerErrorPage | `/500` | Standalone | — |
| TermsPage | `/terms` | Standalone | — |
| AjustesIndex | `/ajustes` | MainLayout | ProtectedRoute + RequirePrivilege |

## Flujos de Navegación

```
Login ──→ "/" (o ruta previa)
   └── /forgot-password ──→ /verify-otp ──→ /reset-password ──→ /login

Register ──→ /verify-email ──→ (verificar email desde link) ──→ /login

/verify-email/confirm?token=xxx ──→ /login
```

## Documentación

- [Auth](./auth.md) — Páginas de autenticación (7 páginas)
- [Errors](./errors.md) — Páginas de error (403, 404, 500)
- [Other](./other.md) — TermsPage, AjustesIndex
- [Patterns](./patterns.md) — Patrones y issues detectados

## Lazy Loading

TODAS las páginas usan `React.lazy()` en `App.tsx`. Ninguna es importada de forma eager.

## Design System Components

| Componente | Páginas |
|------------|---------|
| `Input` | Login, Register, ForgotPassword, ResetPassword |
| `Checkbox` | Register |
| `Spinner` | ForgotPassword, ResetPassword, VerifyEmailPage, VerifyEmailConfirmPage |
| `Button` | ForbiddenPage, NotFoundPage |
| `CardSkeleton` | AjustesIndex |
| `AuthFormHeader` | Login, Register, ForgotPassword, VerifyOTP, ResetPassword, VerifyEmail |
| `AuthFormCheckbox` | Login |
| `AuthFormActions` | Login, Register |
| `ErrorLayout` | ForbiddenPage, NotFoundPage |
