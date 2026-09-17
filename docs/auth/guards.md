# Auth Guards

Sistema de protección de rutas basado en composición.

## Guards Disponibles

| Guard | Autenticación | Verificación | Privilegio/Rol | Redirección si falla |
|-------|---------------|--------------|----------------|---------------------|
| `ProtectedRoute` | Requerida | Opcional | — | `/login` o `/verify-email` |
| `RequirePrivilege` | Requerida | — | `privilege` o `anyOf[]` | `/login` → `/403` |
| `RequireRole` | Requerida | — | `role` | `/login` → `/403` |
| `GuestOnly` | **NO** requerida | — | — | `/` (si autenticado) |
| `RequireVerification` | Requerida | Sí | — | `/login` o `/verify-email` |

---

## ProtectedRoute

Protege rutas que requieren autenticación.

```tsx
import { ProtectedRoute } from '@auth/guards';

// Básico - requiere estar logueado
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

// Con verificación de email
<Route element={<ProtectedRoute requireVerification />}>
  <Route path="/profile" element={<Profile />} />
</Route>
```

### Props

```typescript
interface ProtectedRouteProps {
  requireVerification?: boolean;  // default: true
  children: ReactNode;
}
```

### Comportamiento

1. Si `isLoading === true` → muestra `<AuthLoading />`
2. Si no está autenticado → redirige a `/login`
3. Si `requireVerification=true` y no está verificado → redirige a `/verify-email`
4. Si está autenticado → renderiza children

---

## RequirePrivilege

Requiere un privilegio específico.

```tsx
import { RequirePrivilege } from '@auth/guards';

// Un privilegio
<Route element={<RequirePrivilege privilege="settings:manage" />}>
  <Route path="/settings" element={<Settings />} />
</Route>

// Cualquiera de varios privilegios
<Route element={<RequirePrivilege anyOf={["reports:export", "admin:all"]} />}>
  <Route path="/reports/export" element={<ExportReports />} />
</Route>
```

### Props

```typescript
interface RequirePrivilegeProps {
  privilege?: string;
  anyOf?: string[];
  children: ReactNode;
}
```

### Comportamiento

1. Si no está autenticado → redirige a `/login`
2. Si no tiene el privilegio → redirige a `/403`
3. Si tiene el privilegio → renderiza children

---

## RequireRole

Requiere un rol específico.

```tsx
import { RequireRole } from '@auth/guards';

<Route element={<RequireRole role="admin" />}>
  <Route path="/admin" element={<AdminPanel />} />
</Route>
```

### Props

```typescript
interface RequireRoleProps {
  role: string;
  children: ReactNode;
}
```

### Comportamiento

1. Si no está autenticado → redirige a `/login`
2. Si no tiene el rol → redirige a `/403`
3. Si tiene el rol → renderiza children

---

## GuestOnly

Solo permite usuarios NO autenticados (login, register).

```tsx
import { GuestOnly } from '@auth/guards';

<Route element={<GuestOnly />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Route>
```

### Props

```typescript
interface GuestOnlyProps {
  children: ReactNode;
}
```

### Comportamiento

1. Si `isLoading === true` → muestra `<AuthLoading />`
2. Si está autenticado → redirige a `/`
3. Si no está autenticado → renderiza children

---

## RequireVerification

Requiere email verificado.

```tsx
import { RequireVerification } from '@auth/guards';

<Route element={<RequireVerification />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

### Props

```typescript
interface RequireVerificationProps {
  children: ReactNode;
}
```

### Comportamiento

1. Si no está autenticado → redirige a `/login`
2. Si no está verificado → redirige a `/verify-email`
3. Si está verificado → renderiza children

---

## Composición de Guards

Los guards se componen anidándolos:

```tsx
// Admin-only con verificación de email
<Route element={
  <ProtectedRoute requireVerification>
    <RequireRole role="admin">
      <AdminPanel />
    </RequireRole>
  </ProtectedRoute>
}>
```

O usando el guard `RequireVerification` explícitamente:

```tsx
<Route element={<ProtectedRoute requireVerification={false} />}>
  <Route element={<RequireVerification />}>
    <Route path="/dashboard" element={<Dashboard />} />
  </Route>
</Route>
```

---

## Ejemplo Completo: App.tsx

```tsx
// Rutas públicas (no requieren auth)
<Route element={<GuestOnly />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
</Route>

// Rutas de forgot password (flujo completo)
<Route element={<ForgotPasswordProvider />}>
  <Route element={<GuestOnly />}>
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/verify-otp" element={<VerifyOTPPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </Route>
</Route>

// Rutas protegidas (requieren auth + verificación)
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/profile" element={<Profile />} />
</Route>

// Rutas con privilegios específicos
<Route element={<RequirePrivilege privilege="settings:manage" />}>
  <Route path="/settings" element={<Settings />} />
</Route>

// Rutas con roles específicos
<Route element={<RequireRole role="admin" />}>
  <Route path="/admin" element={<AdminPanel />} />
</Route>
```
