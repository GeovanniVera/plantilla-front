# Auth Module

Módulo de autenticación y autorización de la aplicación.

## Visión General

El módulo Auth maneja:
- **Sesión**: Login, logout, restauración de sesión al iniciar la app
- **Tokens**: JWT de acceso + refresh token con persistencia dual
- **Protección de rutas**: Guards basados en autenticación, verificación, roles y privilegios
- **Recuperación de contraseña**: Flujo multi-paso (email → OTP → reset)

## Estructura

```
src/auth/
├── types.ts                    # Contratos de dominio (AuthState, AuthContextValue)
├── context.ts                  # React Context creation
├── provider.tsx                # AuthProvider: sesión, login, logout, permisos
├── hooks.ts                    # useAuth, useHasPrivilege, useHasAnyPrivilege, useHasRole
├── guards.tsx                  # ProtectedRoute, RequirePrivilege, RequireRole, GuestOnly
├── ForgotPasswordContext.tsx   # Contexto para flujo forgot→OTP→reset
└── index.ts                    # Barrel exports

src/hooks/
└── useAuth.ts                  # Hooks React Query integrados con AuthContext

src/lib/auth/
└── token-store.ts              # Persistencia dual localStorage/sessionStorage

src/lib/api/services/
└── auth.service.ts             # 9 llamadas API: login, logout, me, refresh, register, etc.
```

## Quick Start

```tsx
// 1. Envolver la app con AuthProvider
import { AuthProvider } from '@auth/provider';

<App>
  <AuthProvider>
    <Router />
  </AuthProvider>
</App>

// 2. Usar en componentes
import { useAuth } from '@auth/hooks';

function MiComponente() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <Login />;
  return <p>Hola {user.name}</p>;
}

// 3. Proteger rutas
import { ProtectedRoute, RequirePrivilege } from '@auth/guards';

<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>

<Route element={<RequirePrivilege privilege="settings:manage" />}>
  <Route path="/settings" element={<Settings />} />
</Route>
```

## Documentación

- [Arquitectura](./architecture.md) - Estructura, contratos y diseño
- [Flujos](./flows.md) - Secuencias paso a paso de cada proceso
- [API Reference](./api-reference.md) - Firmas de entrada/salida de cada endpoint
- [Guards](./guards.md) - Sistema de protección de rutas

## Dependencias Externas

| Paquete | Uso |
|---------|-----|
| `react-router` | Navegación, rutas, Navigate, useLocation |
| `@tanstack/react-query` | Cache de server state (via hooks/useAuth.ts) |
| `react-i18next` | Traducciones (opcional) |

## Testing

```bash
# Tests unitarios del módulo
npm run test -- src/auth/

# Tests de integración
npm run test -- src/hooks/useAuth.test.ts
```

## Notas de Implementación

1. **Dual hook system**: Exist `src/auth/hooks.ts` (Context) y `src/hooks/useAuth.ts` (React Query). Las páginas usan React Query hooks que internamente llaman al AuthContext.

2. **Persistencia dual**: `remember=true` → localStorage, `remember=false` → sessionStorage. `clearAll()` limpia ambos.

3. **Logout forzado**: El listener de `auth:logout` usa `window.location.href` (hard redirect) para limpiar completamente el estado de React.

4. **Refresh token**: El interceptor deduplica requests concurrentes — si múltiples requests fallan con 401, solo se hace UN refresh.
