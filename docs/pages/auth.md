# Auth Pages

Páginas de autenticación: Login, Register, ForgotPassword, VerifyOTP, ResetPassword, VerifyEmail, VerifyEmailConfirm.

---

## LoginPage

### Componente

Formulario con email + password + "Recordarme" + link "Forgot Password".

### Guard

`GuestOnly` — redirige a `/` si ya está autenticado.

### Hooks

- `useLogin()` → POST `/auth/login`

### Estado Local

- `email`, `password`, `remember`

### Navegación

- Post-login: `navigate(from)` donde `from` = ruta previa o `/`
- Link: `/forgot-password`
- Link secundario: `/register`

### i18n Keys

- `auth.login.title`
- `auth.login.subtitle`
- `auth.login.email`
- `auth.login.emailPlaceholder`
- `auth.login.password`
- `auth.login.passwordPlaceholder`
- `auth.login.forgotPassword`
- `auth.login.submit`
- `auth.login.noAccount`
- `auth.login.register`
- `errors.unknown`

### Validación

Solo HTML5 (`required`, `type="email"`). Sin schema.

### Uso

```tsx
const login = useLogin();

const handleSubmit = () => {
  login.mutate({ email, password, remember }, {
    onSuccess: () => navigate(from),
  });
};
```

---

## RegisterPage

### Componente

Formulario con name + email + password + confirmPassword + checkbox de términos.

### Guard

`GuestOnly`

### Hooks

- `useRegister()` → POST `/auth/register`
- `useLogin()` → POST `/auth/login` (auto-login post-registro)

### Flujo

1. Registrar
2. Login automático (`remember: true`)
3. Navigate a `/verify-email` con `state.email`

### Navegación

- Post-registro: `/verify-email` (con email en state)
- Si falla login post-registro: `/login`
- Link secundario: `/login`
- Link a `/terms` (target="_blank")

### i18n Keys

- `auth.register.title`
- `auth.register.subtitle`
- `auth.register.name`
- `auth.register.namePlaceholder`
- `auth.register.email`
- `auth.register.password`
- `auth.register.passwordPlaceholder`
- `auth.register.confirmPassword`
- `auth.register.confirmPasswordPlaceholder`
- `auth.register.termsPrefix`
- `auth.register.terms`
- `auth.register.submit`
- `auth.register.hasAccount`
- `auth.register.login`
- `errors.unknown`

### Validación

Manual: `acceptTerms` check, `password === confirmPassword`. Sin schema.

### Uso

```tsx
const register = useRegister();
const login = useLogin();

const handleSubmit = async () => {
  if (!acceptTerms) {
    setError("Debés aceptar los términos");
    return;
  }
  if (password !== confirmPassword) {
    setError("Las contraseñas no coinciden");
    return;
  }

  register.mutate({ name, email, password, acceptedTerms: true }, {
    onSuccess: () => {
      login.mutate({ email, password, remember: true }, {
        onSuccess: () => navigate('/verify-email', { state: { email } }),
      });
    },
  });
};
```

---

## ForgotPasswordPage (Paso 1/3)

### Componente

Formulario de un solo campo (email). Vista de "sent" con icono check y redirección automática.

### Guard

`GuestOnly`

### Hooks

- `useForgotPassword()` → POST `/auth/forgot-password`
- `useForgotPasswordContext()` → para `setEmail` en el context

### Contexto Compartido

Guarda el email en `ForgotPasswordContext` para los pasos 2 y 3.

### Flujo

1. Submit email → mutate
2. OnSuccess: guarda email en context → `setSent(true)`
3. setTimeout 2s → navigate `/verify-otp`

### Navegación

- Back: `/login`
- Siguiente paso: `/verify-otp` (auto after 2s)

### i18n Keys

- `auth.forgotPassword.title`
- `auth.forgotPassword.subtitle`
- `auth.forgotPassword.email`
- `auth.forgotPassword.submit`
- `auth.forgotPassword.submitting`
- `auth.forgotPassword.successTitle`
- `auth.forgotPassword.successMessage`
- `auth.forgotPassword.backToLogin`
- `errors.network`
- `errors.unknown`

### Uso

```tsx
const forgotPassword = useForgotPassword();
const { setEmail } = useForgotPasswordContext();

const handleSubmit = () => {
  forgotPassword.mutate(email, {
    onSuccess: () => {
      setEmail(email);
      setSent(true);
      setTimeout(() => navigate('/verify-otp'), 2000);
    },
  });
};
```

---

## VerifyOTPPage (Paso 2/3)

### Componente

6 inputs individuales para OTP. Auto-avance entre inputs, auto-submit al completar, soporte paste.

### Guard

`GuestOnly`

### Contexto

Lee `email` de `ForgotPasswordContext`. Llama `verifyOtp()` del mismo context.

### Flujo

1. Si no hay `email` en context → redirect `/forgot-password`
2. Si OTP completo → auto-submit
3. On success → navigate `/reset-password`

### Navegación

- Back: `/forgot-password`
- Siguiente: `/reset-password`

### i18n Keys

- `auth.verifyOTP.title`
- `auth.verifyOTP.subtitle` (con interpolación `{email}`)
- `auth.verifyOTP.submitting`

### Validación

Dígitos solamente (`/^\d+$/`). maxlength=1.

### Nota

No usa React Query directamente — usa `verifyOtp()` del `ForgotPasswordContext`.

---

## ResetPasswordPage (Paso 3/3)

### Componente

Formulario password + confirmPassword + panel de requisitos visuales + vista de éxito.

### Guard

`GuestOnly`

### Hooks

- `useResetPassword()` → POST `/auth/reset-password`

### Contexto

Lee `email`, `token`, `reset()` de `ForgotPasswordContext`.

### Flujo

1. Submit → validación manual (≥6 chars, passwords match)
2. mutate → success view
3. reset() context → setTimeout 3s → navigate `/login`

### Navegación

- Back: `/verify-otp`
- Post-éxito: `/login` (auto after 3s)

### i18n Keys

- `auth.resetPassword.title`
- `auth.resetPassword.subtitle` (con interpolación `{email}`)
- `auth.resetPassword.password`
- `auth.resetPassword.passwordPlaceholder`
- `auth.resetPassword.confirmPassword`
- `auth.resetPassword.confirmPasswordPlaceholder`
- `auth.resetPassword.successTitle`
- `auth.resetPassword.successMessage`
- `auth.resetPassword.submitting`
- `auth.resetPassword.submit`
- `auth.resetPassword.backToLogin`

### Uso

```tsx
const resetPassword = useResetPassword();
const { email, token, reset } = useForgotPasswordContext();

const handleSubmit = () => {
  if (password.length < 6) {
    setError("Mínimo 6 caracteres");
    return;
  }
  if (password !== confirmPassword) {
    setError("Las contraseñas no coinciden");
    return;
  }

  resetPassword.mutate({ token, password }, {
    onSuccess: () => {
      reset();
      setTimeout(() => navigate('/login'), 3000);
    },
  });
};
```

---

## VerifyEmailPage

### Componente

Vista informativa: email del usuario + instrucciones + botón reenviar + botón cerrar sesión.

### Hooks

- `useResendVerification()` → POST `/auth/resend-verification`

### Datos

Email de `user.email` o de `location.state.email` (post-registration).

### Flujo

1. Click reenviar → mutate → success message
2. Click cerrar sesión → `logout()` → navigate `/login`

### Navegación

- Cerrar sesión → `/login`

### i18n Keys

- `auth.verifyEmail.title`
- `auth.verifyEmail.subtitle`
- `auth.verifyEmail.successMessage`
- `auth.verifyEmail.submitting`
- `auth.verifyEmail.submit`

### Nota

Instrucciones hardcodeadas en español (no i18n): "Revisá tu bandeja de entrada", "Revisá la carpeta de spam".

---

## VerifyEmailConfirmPage

### Componente

3 estados: error (no token), loading (verificando), éxito/error de mutation.

### Datos

Token desde `searchParams.get('token')` (query string).

### Hooks

- `useVerifyEmail()` → POST `/auth/verify-email`. Se ejecuta en `useEffect` al montar con el token.

### Flujo

1. URL con `?token=xxx`
2. useEffect dispara mutation
3. Loading → éxito (auto redirect) o error

### Navegación

- En error: botón a `/login`
- En éxito: "Redirigiendo al login..."

### ⚠️ Bug Confirmado

En estado de éxito dice "Redirigiendo al login..." pero **no tiene `navigate('/login')`** — nunca redirige.
