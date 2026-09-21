# Guards de rutas

Componentes de protección de rutas del módulo de auth. Todos usan `useAuth()` + `Navigate` de `react-router`, y muestran el spinner "Verificando sesión..." mientras `isLoading` sea `true`.

## Tabla de guards

| Guard | Props | Comportamiento |
|---|---|---|
| `ProtectedRoute` | `{ children, redirectTo? = '/login', requireVerification? = true }` | `isLoading` → spinner. No autenticado → `redirectTo` con `state.from`. Autenticado pero sin email verificado (y `requireVerification`) → `/verify-email` |
| `RequirePrivilege` | `{ children, redirectTo? = '/403' } & ({ privilege; anyOf? } \| { anyOf })` | No autenticado → `/login` con `state.from`. Sin el privilegio → `redirectTo`. `anyOf` tiene prioridad sobre `privilege` |
| `RequireRole` | `{ children, role, redirectTo? = '/403' }` | No autenticado → `/login` con `state.from`. Sin el rol → `redirectTo`. ⚠ Desaconsejado: prefiera `RequirePrivilege` |
| `GuestOnly` | `{ children, redirectTo? = '/dashboard' }` | Autenticado → `redirectTo`. No autenticado → renderiza `children` (rutas públicas: login, registro) |
| `RedirectIfVerified` | `{ children, redirectTo? = '/dashboard' }` | Redirige **solo** si `isAuthenticated && isVerified()`. Anónimo o autenticado sin verificar → renderiza `children` |
| `RequireVerification` | `{ children }` | No autenticado → `/login`. Email no verificado → `/verify-email`. Verificado → `children` |
| `AuthLoading` | — | Spinner "Verificando sesión...". Uso interno de los guards; no se exporta por el barrel |

## Uso en rutas

```tsx
import {
  ProtectedRoute,
  RequirePrivilege,
  RequireRole,
  GuestOnly,
  RedirectIfVerified,
  RequireVerification,
} from '@/auth';

// Rutas protegidas (layout + página)
<Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/perfil" element={<Perfil />} />
</Route>

// Requiere privilegio específico
<Route
  path="/admin/configuracion"
  element={
    <RequirePrivilege privilege="settings.brand">
      <BrandColorSettings />
    </RequirePrivilege>
  }
/>

// Requiere cualquiera de varios privilegios (anyOf)
<Route
  path="/users"
  element={
    <RequirePrivilege anyOf={['users.read', 'admin.all']}>
      <UsersList />
    </RequirePrivilege>
  }
/>

// Rutas públicas: solo para no autenticados
<Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
<Route path="/registro" element={<GuestOnly><RegisterPage /></GuestOnly>} />

// Pantalla de verificación de email
<Route
  path="/verify-email"
  element={
    <RedirectIfVerified>
      <VerifyEmailPage />
    </RedirectIfVerified>
  }
/>

// Sección que exige email verificado
<Route element={<RequireVerification><CuentaPage /></RequireVerification>} />
```

## `state.from` (redirección post-login)

`ProtectedRoute` y `RequirePrivilege` (y `RequireRole`) pasan la ubicación actual en `state.from` al redirigir a `/login`, para que la página de login pueda devolver al usuario a donde iba tras autenticarse:

```tsx
const location = useLocation();
const from = location.state?.from?.pathname ?? '/dashboard';
```

## `Can` vs `RequirePrivilege`

| | `Can` | `RequirePrivilege` |
|---|---|---|
| Naturaleza | Renderizado condicional | Guard de ruta |
| Sin permiso | Oculta (renderiza `fallback` o nada) | Redirige a `redirectTo` (default `/403`) |
| Sin autenticación | No distingue: evalúa contra `user` actual | Redirige a `/login` con `state.from` |
| Uso típico | Botones, acciones, secciones de UI | Páginas o rutas completas |

```tsx
// Ocultar un botón sin redirección
<Can privilege="users.write" fallback={<span>Sin permisos</span>}>
  <button>Editar usuario</button>
</Can>

// Redirigir toda una ruta
<RequirePrivilege privilege="users.write">
  <UsersEditPage />
</RequirePrivilege>
```

## Gotchas y deudas conocidas

- **`ProtectedRoute.requireVerification = true` por defecto**: cualquier ruta protegida exige email verificado salvo opt-out explícito (`requireVerification={false}`), duplicando el rol de `RequireVerification`. Si una ruta debe permitir usuarios sin verificar, debe optar fuera.
- **`GuestOnly`**: el JSDoc documenta `redirectTo = '/'`, pero el código usa `'/dashboard'`. El comportamiento real es redirigir a `/dashboard`.
- **`RequireRole` está desaconsejado** en su propio JSDoc: los privilegios son más granulares que los roles. Prefiera `RequirePrivilege`.
- **Debug logging**: los guards registran `console.log('[GUARD] ...')` (p. ej. `ProtectedRoute` imprime el estado completo) y quedan activos en producción.