# Notas de uso y limitaciones del barrel de hooks

Este documento registra los huecos y trampas reales del módulo `src/hooks/`, para que quien importe hooks no tropiece con comportamientos inesperados. Nada de lo listado aquí corresponde a hooks inexistentes: son limitaciones del barrel y de los archivos que lo componen.

## 1. Colisión de nombres: `useForgotPassword`

Existen **dos** hooks con el mismo nombre en el proyecto:

| | Hook de React Query | Hook de contexto |
|---|---|---|
| Ubicación | `src/hooks/useAuth.ts` | `src/auth/ForgotPasswordContext.tsx` |
| Re-exportado por | `src/hooks/index.ts` ✔ | `src/auth/index.ts` ✘ (import directo) |
| Propósito | Disparar `authService.forgotPassword(email)` | Máquina de estado del flujo forgot → OTP → reset (`setEmail`, `verifyOtp`, `resetPassword`, `reset`) |
| Requiere provider | No | `ForgotPasswordProvider` |
| Retorno | `useMutation` | `ForgotPasswordContextValue` |

**Riesgo**: un import descuidado de `@/hooks` trae la mutación de React Query cuando en realidad se necesitaba el contexto del flujo de 3 pasos (y viceversa). El barrel `src/hooks/index.ts` re-exporta el de React Query; el del contexto **no** sale por ningún barrel.

**Regla práctica**:
- ¿Solo disparar el email de recuperación? → `useForgotPassword` de `@/hooks`.
- ¿Navegar `/forgot-password` → `/verify-otp` → `/reset-password` con estado (email, `resetToken`, `otpVerified`)? → `useForgotPassword` de `@/auth/ForgotPasswordContext` (envuelto en `ForgotPasswordProvider`).

## 2. Barrel incompleto: `useIsMobile` y `useMediaQuery` fuera de `src/hooks/index.ts`

El barrel exporta solo los 9 hooks de auth. Los hooks responsive existen pero **no** se re-exportan:

```ts
// ✔ Funciona
import { useMe, useLogin } from '@/hooks';

// ✘ No existe en el barrel (falla el import)
import { useIsMobile, useMediaQuery } from '@/hooks';

// ✔ Import directo desde el archivo
import { useIsMobile } from '@/hooks/useIsMobile';
import { useMediaQuery } from '@/hooks/useMediaQuery';
```

El mismo patrón afecta al módulo auth: `AuthContext`, `ForgotPasswordProvider`, `useForgotPassword` (contexto) y `AuthLoading` tampoco salen por `src/auth/index.ts` (ver [Referencia de API del módulo auth](../auth/api-reference.md)).

## 3. Template muerto: `_template.hook.ts`

`src/hooks/_template.hook.ts` es una **plantilla** para crear hooks de React Query, no un hook utilizable:

- `useTemplateList()` y `useTemplateItem(id)` tienen el `queryFn` con el código real **comentado**; la función async retorna `undefined`.
- Importarlos **rompe queries**: `useQuery` queda en estado `success` con `data: undefined`, y el consumo de `data` falla en runtime (p. ej. `data.map(...)`).
- `useTemplateItem` además tiene `enabled: !!id`, por lo que con `id` vacío ni siquiera dispara la query.

**Regla**: nunca importe `_template.hook.ts`. Úselo solo como referencia para crear hooks nuevos (copiar, descomentar y adaptar al servicio real).

## 4. Notas de uso adicionales

### Solo `useMe`, `useLogin` y `useLogout` dependen de `AuthProvider`

Las demás mutaciones (`useRegister`, `useForgotPassword`, `useResetPassword`, `useVerifyEmail`, `useResendVerification`) llaman a `authService` directamente y funcionan sin el provider. Si un componente usa `useLogin`/`useLogout` fuera de `AuthProvider`, el `AuthContext` lanzará `Error`.

### `useLogin` retorna el usuario desde el cache

El `data` de `useLogin` es `{ success: true, data: { user } }`, donde `user` proviene de `queryClient.getQueryData(['auth', 'me'])` y puede ser `undefined` si la query aún no cargó. No asuma que `data.user` siempre existe tras el mutate; prefiera leer `useMe()` después de invalidar.

### `useLogout` limpia todo el cache de React Query

`onSettled` ejecuta `queryClient.clear()`, que descarta **todas** las queries de la aplicación (no solo las de auth). Es intencional (sesión cerrada = cache fresco), pero tenga en cuenta que cualquier estado de query en memoria se pierde al hacer logout.