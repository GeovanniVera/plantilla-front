# useAuth

8 hooks de autenticación que combinan React Query con AuthContext.

## Arquitectura

```
useAuth.ts (React Query wrappers)
   ├── useMe()      → Query: GET /auth/me
   ├── useLogin()   → Mutation + invalidación cache
   ├── useLogout()  → Mutation + queryClient.clear()
   └── useRegister, useForgotPassword, useResetPassword, useVerifyEmail, useResendVerification

AuthContext (src/auth/hooks.ts)
   ├── Estado: user, token, isAuthenticated, isLoading
   ├── Persistencia: authStorage (localStorage/sessionStorage)
   └── Token management: tokenManager (en client.ts)
```

**Separación de responsabilidades**:
- `AuthContext` → tokens y estado local (persistencia)
- React Query → cache del server state (queries y mutations)

---

## useMe

### Params

Ninguno.

### Retorno

`UseQueryResult<User>` — data, isLoading, error, refetch, etc.

### Config

- Query Key: `['auth', 'me']`
- `retry: false`
- `staleTime: 5 min`

### Dependencias

`authService.me()` → `GET /auth/me`

### Uso

```tsx
const { data: user, isLoading } = useMe();

if (isLoading) return <Spinner />;
return <p>{user.name}</p>;
```

---

## useLogin

### Params

```typescript
{
  email: string;
  password: string;
  remember?: boolean;  // default: true
}
```

### Retorno

`UseMutationResult` con `mutate()` y `mutateAsync()`

### Flujo

1. Llama `login()` del AuthContext
2. Obtiene user del cache
3. Invalida `['auth', 'me']`

### Uso

```tsx
const login = useLogin();

const handleSubmit = () => {
  login.mutate({ email, password, remember: true }, {
    onSuccess: () => navigate('/dashboard'),
    onError: (err) => setError(err.message),
  });
};
```

---

## useLogout

### Params

Ninguno.

### Retorno

`UseMutationResult`

### Flujo

1. Llama `logout()` del AuthContext
2. `queryClient.clear()` en `onSettled` (limpia TODO el cache)

### Uso

```tsx
const logout = useLogout();

<button onClick={() => logout.mutate()}>Cerrar sesión</button>
```

---

## useRegister

### Params

```typescript
{
  name: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}
```

### Retorno

`UseMutationResult<ApiResponse<AuthResponse>>`

### Nota

**NO toca AuthContext** — solo llama a la API.

### Uso

```tsx
const register = useRegister();

register.mutate({ name, email, password, acceptedTerms: true }, {
  onSuccess: () => navigate('/verify-email'),
});
```

---

## useForgotPassword

### Params

`email: string`

### Retorno

`UseMutationResult`

### Uso

```tsx
const forgotPassword = useForgotPassword();

forgotPassword.mutate('user@example.com');
```

---

## useResetPassword

### Params

```typescript
{
  token: string;
  password: string;
}
```

### Retorno

`UseMutationResult`

### Uso

```tsx
const resetPassword = useResetPassword();

resetPassword.mutate({ token: 'abc', password: 'newpass' });
```

---

## useVerifyEmail

### Params

`token: string`

### Retorno

`UseMutationResult`

### Uso

```tsx
const verifyEmail = useVerifyEmail();

verifyEmail.mutate('verification-token');
```

---

## useResendVerification

### Params

`email: string`

### Retorno

`UseMutationResult`

### Uso

```tsx
const resendVerification = useResendVerification();

resendVerification.mutate('user@example.com');
```

---

## Patrón de Diseño

### Integración React Query + Context

```tsx
// useLogin integra ambos mundos
export function useLogin() {
  const { login } = useAuth();  // Context
  const queryClient = useQueryClient();  // React Query

  return useMutation({
    mutationFn: async (credentials) => {
      await login(credentials);  // Llama al contexto
      return queryClient.getQueryData(['auth', 'me']);  // Obtiene del cache
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });  // Refresca
    },
  });
}
```

### Por qué no usar solo React Query

El AuthContext maneja:
- Persistencia de tokens (localStorage/sessionStorage)
- Estado de isLoading inicial
- Escuchadores de eventos (auth:logout del ThemeProvider)

React Query no puede manejar esto porque:
- No persiste estado entre sesiones
- No tiene eventos de lifecycle
- No maneja tokens de refresh

### Por qué no usar solo Context

El Context no puede manejar:
- Cache de datos del usuario
- Deduplicación de requests
- Retry automático
- Stale-while-revalidate

React Query resuelve todo esto con `useMe()`.
