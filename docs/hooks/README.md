# Hooks

Hooks personalizados del proyecto plantilla-front.

## Inventario

| Hook | Tipo | Archivo | Exportado en barrel |
|------|------|---------|---------------------|
| `useMe` | Query | `useAuth.ts` | ✅ |
| `useLogin` | Mutation | `useAuth.ts` | ✅ |
| `useLogout` | Mutation | `useAuth.ts` | ✅ |
| `useRegister` | Mutation | `useAuth.ts` | ✅ |
| `useForgotPassword` | Mutation | `useAuth.ts` | ✅ |
| `useResetPassword` | Mutation | `useAuth.ts` | ✅ |
| `useVerifyEmail` | Mutation | `useAuth.ts` | ✅ |
| `useResendVerification` | Mutation | `useAuth.ts` | ✅ |
| `useMediaQuery` | State | `useMediaQuery.ts` | ❌ |
| `useIsMobile` | State | `useIsMobile.ts` | ❌ |

## Arquitectura

```
AuthProvider (context.tsx + provider.tsx)
   ├── Estado: user, token, isAuthenticated, isLoading
   ├── Persistencia: authStorage (localStorage/sessionStorage)
   └── Token management: tokenManager (en client.ts)

useAuth.ts (React Query wrappers)
   ├── useMe()      → Query: GET /auth/me
   ├── useLogin()   → Mutation + invalidación cache
   ├── useLogout()  → Mutation + queryClient.clear()
   └── useRegister, useForgotPassword, useResetPassword, useVerifyEmail, useResendVerification
```

**La clave**: `useAuth.ts` NO es el hook de contexto. Usa `useAuth()` de `src/auth/hooks.ts` (el contexto real) y lo envuelve en React Query para manejar cache de server state.

- `AuthContext` maneja **tokens y estado local** (persistencia)
- React Query maneja **cache del server state** (queries y mutations)

## Documentación

- [useAuth](./useAuth.md) — 8 hooks de autenticación con React Query
- [Responsive](./responsive.md) — useMediaQuery y useIsMobile
- [Gaps](./gaps.md) — Hooks faltantes (useDebounce, useLocalStorage)

## Gaps Detectados

1. **No existen `useDebounce` ni `useLocalStorage`**
2. **`useMediaQuery` e `useIsMobile` no están en el barrel**
3. **No hay `useDebouncedValue`** — búsqueda en tiempo real hará llamada API por cada keystroke
4. **No hay `useLocalStorage` genérico** — solo `authStorage` para tokens
