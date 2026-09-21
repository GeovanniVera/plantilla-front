# Feature: Perfil (`src/features/profile/`)

Edición del perfil del usuario autenticado: nombre y foto. **No incluye componentes ni utils** — solo servicio y hook.

## Estructura

```
src/features/profile/
├── hooks/useProfile.ts             # Mutación de actualización de perfil
└── services/profile.service.ts     # Tipo + cliente HTTP
```

## Servicios (`services/profile.service.ts`)

| Endpoint | Método | Propósito |
|---|---|---|
| `PUT /auth/me` (multipart `FormData`: `name`, `photo`) | `profileService.updateMe(data)` | Actualiza nombre y/o foto del usuario autenticado. |

**El email no se envía**: el backend solo admite `name` y `photo`, y el cambio de email **no está habilitado**; el frontend lo trata como no editable (en `PerfilPage` el email se muestra en solo lectura).

### Tipos

- `UpdateProfileData` — `name?`, `photo?: File`.

Notas de implementación:
- Se construye `FormData` y solo se agregan los campos presentes (`if (data.name)`, `if (data.photo)`).
- El cliente HTTP no fuerza `Content-Type` para `FormData` (fetch setea el boundary automáticamente).
- Retorna `ApiResponse<User>` (el usuario actualizado).

## Hooks (`hooks/useProfile.ts`)

| Hook | Tipo | Notas |
|---|---|---|
| `useUpdateProfile()` | Mutation | Llama a `profileService.updateMe(data)`. `onSuccess` invalida `['auth', 'me']` para refrescar los datos del usuario autenticado. |

## Permisos

Ninguno específico: solo requiere estar autenticado. La ruta `/ajustes/perfil` está bajo `ProtectedRoute` en `App.tsx`.

## Consumidores

- `PerfilPage` (`/ajustes/perfil`) → `useUpdateProfile()`. Formulario de nombre + selector de foto; email en solo lectura; badge de estado de verificación.

## Deudas conocidas

- El cambio de email no está habilitado por decisión de backend; si en el futuro se habilita, `UpdateProfileData` y `PerfilPage` deberán extenderse.
- No hay handlers MSW para `PUT /auth/me` en `src/test/mocks/handlers/`.