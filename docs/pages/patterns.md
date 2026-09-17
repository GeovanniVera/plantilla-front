# Patterns

Patrones y issues detectados en las páginas.

## Patrones de Diseño

### Lazy Loading

TODAS las páginas usan `React.lazy()` en `App.tsx`:

```tsx
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
// ... etc
```

### Auth Guards

| Guard | Uso |
|-------|-----|
| `GuestOnly` | Login, Register, ForgotPassword, VerifyOTP, ResetPassword |
| `ProtectedRoute` | Todas las rutas dentro de `MainLayout` |
| `RequirePrivilege("settings:manage")` | Rutas `/ajustes/*` |

### Layouts

| Layout | Páginas |
|--------|---------|
| `AuthLayout` | Login, Register, ForgotPassword, VerifyOTP, ResetPassword, VerifyEmail, VerifyEmailConfirm |
| `MainLayout` | AjustesIndex |
| Standalone | ForbiddenPage, NotFoundPage, ServerErrorPage, TermsPage |

### Context Pattern

`ForgotPasswordContext` comparte estado entre ForgotPasswordPage, VerifyOTPPage, ResetPasswordPage:

```tsx
// En App.tsx
<ForgotPasswordProvider>
  <Routes>
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-otp" element={<VerifyOTPPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Routes>
</ForgotPasswordProvider>
```

### Auto-Login Post-Register

```tsx
register.mutate({ name, email, password, acceptedTerms: true }, {
  onSuccess: () => {
    login.mutate({ email, password, remember: true }, {
      onSuccess: () => navigate('/verify-email', { state: { email } }),
    });
  },
});
```

### Auto-Navigation con setTimeout

```tsx
// ForgotPasswordPage
setTimeout(() => navigate('/verify-otp'), 2000);

// ResetPasswordPage
setTimeout(() => navigate('/login'), 3000);
```

---

## Issues Detectados

### 🔴 Bugs

| Issue | Página | Descripción |
|-------|--------|-------------|
| Falta navigate en éxito | VerifyEmailConfirmPage | Dice "Redirigiendo al login..." pero nunca redirige |
| Typo carácter chino | TermsPage | Sección 8 tiene `"终止"` en medio de texto español |

### 🟠 Inconsistencias

| Issue | Páginas | Descripción |
|-------|---------|-------------|
| No usa ErrorLayout | ServerErrorPage | Estilos inline propios, break de consistencia con 403/404 |
| No usa Button | ServerErrorPage | Botones nativos `<button>` en vez de `Button` del design system |
| Mezcla estilos | AjustesIndex | CSS Modules + inline styles + CSS variables |

### 🟡 Déuditos Técnicos

| Issue | Páginas | Descripción |
|-------|---------|-------------|
| Strings hardcodeados | Varios | Textos en español sin i18n |
| Sin schema de validación | Todas auth | Validación manual, sin Zod/Yup |
| HTML5 validation only | LoginPage | Solo `required`, `type="email"` |

---

## Recomendaciones

### 1. Arreglar VerifyEmailConfirmPage

```tsx
// Agregar después del éxito
useEffect(() => {
  if (success) {
    setTimeout(() => navigate('/login'), 2000);
  }
}, [success]);
```

### 2. Unificar ServerErrorPage

Reemplazar estilos inline por `ErrorLayout` + `Button` del design system.

### 3. Migrar a i18n

Los strings hardcodeados en español necesitan migrarse a keys de i18n.

### 4. Agregar schema de validación

Usar Zod o Yup para validación de formularios en vez de validación manual.

### 5. Limpiar TermsPage

Remover el carácter chino `终止` de la sección 8.
