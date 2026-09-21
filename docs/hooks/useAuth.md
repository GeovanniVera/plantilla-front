# Hooks de autenticación (`useAuth.ts`)

Detalle de los 8 hooks de React Query exportados por `src/hooks/index.ts`, todos definidos en `src/hooks/useAuth.ts`. Requieren `AuthProvider` (excepto las mutaciones que no usan el contexto, marcadas abajo).

## `useMe`

| | |
|---|---|
| Firma | `() => UseQueryResult<User>` |
| queryKey | `['auth', 'me']` |
| Opciones | `retry: false`, `staleTime: 5 * 60 * 1000` (5 minutos) |
| Servicio | `authService.me()` |

Query del usuario actual. Sin token válido, `queryFn` lanza `Error(response.message || 'No autenticado')` y la query queda en estado de error (sin reintentos).

```tsx
const { data: user, isLoading, error } = useMe();
```

## `useLogin`

| | |
|---|---|
| Firma | `() => useMutation({ email: string; password: string; remember?: boolean })` |
| Dependencia | `AuthContext.login` (requiere `AuthProvider`) |
| onSuccess | Invalida `['auth', 'me']` |

Delega en `login()` del `AuthContext`, que maneja persistencia de tokens y estado. `remember` por defecto es `true`. Devuelve el usuario del cache en `data.user`.

```tsx
const login = useLogin();

login.mutate(
  { email, password, remember: true },
  { onSuccess: () => navigate('/dashboard') },
);
```

## `useLogout`

| | |
|---|---|
| Firma | `() => useMutation(() => void)` |
| Dependencia | `AuthContext.logout` (requiere `AuthProvider`) |
| onSettled | `queryClient.clear()` — descarta **todo** el cache de queries |

Delega en `logout()` del `AuthContext` (que siempre limpia localmente aunque la API falle). Al terminar, limpia el cache completo de React Query.

```tsx
const logout = useLogout();
logout.mutate();
```

## `useRegister`

| | |
|---|---|
| Firma | `useMutation({ name: string; email: string; password: string; acceptedTerms: boolean })` |
| Servicio | `authService.register` |
| Dependencia de contexto | Ninguna |

`register` retorna solo mensaje opaco (`ApiResponse<void>`): no hay user ni token tras registrarse. El email debe verificarse después (ver `useVerifyEmail`).

## `useForgotPassword`

| | |
|---|---|
| Firma | `useMutation(email: string)` |
| Servicio | `authService.forgotPassword` |
| Dependencia de contexto | Ninguna |

Dispara el email de recuperación de contraseña.

> ⚠ Colisión de nombres: `useForgotPassword` **también** existe en `src/auth/ForgotPasswordContext.tsx` como hook de contexto del flujo de 3 pasos (forgot → OTP → reset). El barrel `src/hooks/index.ts` re-exporta el de React Query. Importe con cuidado: si necesita la máquina de estado (guardar `resetToken`, validar OTP), use el del contexto; si solo necesita disparar el email, use este. Detalles en [Notas de uso y limitaciones](gaps.md).

## `useResetPassword`

| | |
|---|---|
| Firma | `useMutation({ token: string; password: string })` |
| Servicio | `authService.resetPassword` |
| Dependencia de contexto | Ninguna |

Restablece la contraseña con el token obtenido del flujo OTP.

## `useVerifyEmail`

| | |
|---|---|
| Firma | `useMutation(token: string)` |
| Servicio | `authService.verifyEmail` (devuelve `{ email }`) |
| Dependencia de contexto | Ninguna |

Verifica el email con el token enviado por correo.

## `useResendVerification`

| | |
|---|---|
| Firma | `useMutation(email: string)` |
| Servicio | `authService.resendVerification` |
| Dependencia de contexto | Ninguna |

Reenvía el email de verificación.

## Tabla resumen

| Hook | Tipo | Firma | Servicio / Contexto | Invalidación |
|---|---|---|---|---|
| `useMe` | Query | `()` | `authService.me()` | — |
| `useLogin` | Mutation | `{ email, password, remember? }` | `AuthContext.login` | invalida `['auth','me']` |
| `useLogout` | Mutation | `() => void` | `AuthContext.logout` | `queryClient.clear()` (settled) |
| `useRegister` | Mutation | `{ name, email, password, acceptedTerms }` | `authService.register` | — |
| `useForgotPassword` | Mutation | `email: string` | `authService.forgotPassword` | — |
| `useResetPassword` | Mutation | `{ token, password }` | `authService.resetPassword` | — |
| `useVerifyEmail` | Mutation | `token: string` | `authService.verifyEmail` | — |
| `useResendVerification` | Mutation | `email: string` | `authService.resendVerification` | — |

## Notas

- Solo `useMe`, `useLogin` y `useLogout` tocan el `AuthContext`; las demás mutaciones llaman a `authService` directamente y funcionan sin `AuthProvider`.
- `useLogin` retorna `data.user` desde el cache `['auth', 'me']` (puede ser `undefined` si la query aún no cargó).