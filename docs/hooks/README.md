# Módulo de hooks (`src/hooks/`)

Inventario del barrel de hooks de la aplicación, con foco en los hooks de autenticación basados en React Query.

## Inventario del barrel (`src/hooks/index.ts`)

Exporta **exactamente 9 hooks**, todos de `./useAuth`:

| Hook | Tipo | Descripción |
|---|---|---|
| `useMe` | Query | Usuario actual (`GET /auth/me`) |
| `usePasswordPolicy` | Query | Política pública de contraseñas y expiraciones (`GET /auth/password-policy`) |
| `useLogin` | Mutation | Inicia sesión (delega en `AuthContext.login`) |
| `useLogout` | Mutation | Cierra sesión (delega en `AuthContext.logout`) |
| `useRegister` | Mutation | Registro de usuario |
| `useForgotPassword` | Mutation | Solicita email de recuperación de contraseña |
| `useResetPassword` | Mutation | Resetea la contraseña con token |
| `useVerifyEmail` | Mutation | Verifica el email con token |
| `useResendVerification` | Mutation | Reenvía el email de verificación |

### Lo que el barrel NO exporta

| Símbolo | Archivo de origen | Estado |
|---|---|---|
| `useIsMobile` | `src/hooks/useIsMobile.ts` | Existe, **fuera del barrel**. Importe directo desde su archivo |
| `useMediaQuery` | `src/hooks/useMediaQuery.ts` | Existe, **fuera del barrel**. Importe directo desde su archivo |
| `useTemplateList` / `useTemplateItem` | `src/hooks/_template.hook.ts` | Plantilla **muerta** (queryFn retorna `undefined`). No importar |

## Arquitectura de los hooks de auth

Los hooks combinan dos fuentes de estado:

1. **React Query** (`@tanstack/react-query`) — cache del server state (usuario, mutaciones).
2. **AuthContext** (`src/auth/`) — persistencia de tokens y estado de autenticación.

```
┌─────────────────────────┐      ┌──────────────────────────────┐
│  hooks/useAuth.ts       │      │  auth/AuthProvider           │
│  useLogin / useLogout   │─────▶│  login() / logout()          │
│  (React Query)          │      │  maneja tokens + estado      │
└─────────────────────────┘      └──────────────────────────────┘
        │
        ▼
  authService (src/lib/api/services/auth.service)
```

- `useLogin` y `useLogout` son **delgados**: delegan la persistencia y el estado en `AuthContext`; React Query solo orquesta la mutación y el cache.
- El resto de las mutaciones (`useRegister`, `useForgotPassword`, `useResetPassword`, `useVerifyEmail`, `useResendVerification`) llaman a `authService` directamente.
- Hay dos queries: `useMe` (`queryKey ['auth', 'me']`) y `usePasswordPolicy` (`queryKey ['auth', 'password-policy']`), ambas sin retry y con `staleTime` de 5 minutos.

## Documentación

- [Hooks de auth (useAuth)](useAuth.md) — los 9 hooks en detalle: firmas, queryKeys, invalidaciones y uso.
- [Hooks responsive](responsive.md) — `useMediaQuery` y `useIsMobile`.
- [Notas de uso y limitaciones](gaps.md) — colisión `useForgotPassword`, barrel incompleto, template muerto y otros gotchas.

## Dependencia

Los hooks de auth requieren que la aplicación esté envuelta en `AuthProvider` (ver [README del módulo auth](../auth/README.md)).