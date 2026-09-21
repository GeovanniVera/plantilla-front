# Referencia de API del módulo de autenticación

Todas las exportaciones públicas del barrel `src/auth/index.ts`, con firmas y tipos.

## Exportaciones del barrel (`src/auth/index.ts`)

### Proveedor

| Export | Fuente | Firma |
|---|---|---|
| `AuthProvider` | `./provider` | `({ children }: { children: ReactNode }) => JSX` |

Envuelve la aplicación y provee el estado de autenticación. Al montarse intenta restaurar la sesión (ver [Arquitectura](architecture.md)).

### Hooks

| Export | Fuente | Firma | Lanza |
|---|---|---|---|
| `useAuth` | `./hooks` | `() => AuthContextValue` | `Error` fuera de `AuthProvider` |
| `useHasPrivilege` | `./hooks` | `(privilege: string) => boolean` | — |
| `useHasAnyPrivilege` | `./hooks` | `(privileges: string[]) => boolean` | — |
| `useHasRole` | `./hooks` | `(role: string) => boolean` | — |

### Guards (componentes de protección de rutas)

| Export | Fuente | Props |
|---|---|---|
| `ProtectedRoute` | `./guards` | `{ children, redirectTo?: string = '/login', requireVerification?: boolean = true }` |
| `RequirePrivilege` | `./guards` | `{ children, redirectTo?: string = '/403' } & ({ privilege: string; anyOf?: string[] } \| { privilege?: never; anyOf: string[] })` |
| `RequireRole` | `./guards` | `{ children, role: string, redirectTo?: string = '/403' }` |
| `GuestOnly` | `./guards` | `{ children, redirectTo?: string = '/dashboard' }` |
| `RedirectIfVerified` | `./guards` | `{ children, redirectTo?: string = '/dashboard' }` |
| `RequireVerification` | `./guards` | `{ children }` |

Detalles de comportamiento y ejemplos en [Guards de rutas](guards.md).

### Control de acceso por renderizado

| Export | Fuente | Props |
|---|---|---|
| `Can` | `./Can` | `{ privilege?: string, anyOf?: string[], children: ReactNode, fallback?: ReactNode = null }` |

Oculta su contenido si no hay permiso; **no** redirige (a diferencia de `RequirePrivilege`).

### Tipos

| Export | Fuente | Definición |
|---|---|---|
| `User` | `./types` (re-export de `src/lib/api/types/api-response.ts`) | `{ id: string; email: string; name: string; roles: string[]; permissions: string[]; isVerified: boolean; photoUrl?: string }` |
| `AuthState` | `./types` | `{ user: User \| null; token: string \| null; isAuthenticated: boolean; isLoading: boolean }` |
| `AuthContextValue` | `./types` | `AuthState` + `login`, `logout`, `hasPrivilege`, `hasAnyPrivilege`, `hasRole`, `isVerified` |

## No exportados por el barrel

Estos símbolos existen en el módulo pero **no** forman parte de la API pública; impórtelos desde su archivo de origen solo si es necesario:

| Símbolo | Archivo de origen | Nota |
|---|---|---|
| `AuthContext` | `src/auth/context.tsx` | Uso interno; prefiera `useAuth()` |
| `ForgotPasswordProvider` | `src/auth/ForgotPasswordContext.tsx` | Proveedor del flujo de 3 pasos de recuperación de contraseña |
| `useForgotPassword` | `src/auth/ForgotPasswordContext.tsx` | Contexto del flujo forgot → OTP → reset. ⚠ Colisiona con `useForgotPassword` de React Query (ver [gaps del barrel de hooks](../hooks/gaps.md)) |
| `AuthLoading` | `src/auth/guards.tsx` | Spinner "Verificando sesión..." usado internamente por los guards |

## Ejemplo de uso completo

```tsx
import {
  AuthProvider,
  useAuth,
  useHasPrivilege,
  ProtectedRoute,
  RequirePrivilege,
  Can,
} from '@/auth';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/admin"
            element={
              <RequirePrivilege privilege="settings.brand">
                <AdminPanel />
              </RequirePrivilege>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

function BotonEliminar() {
  const puedeEliminar = useHasPrivilege('users.write');
  if (!puedeEliminar) return null;
  return <button>Eliminar</button>;
}

// Alternativa de renderizado condicional:
<Can privilege="users.write" fallback={<span>Sin permisos</span>}>
  <button>Editar</button>
</Can>;
```