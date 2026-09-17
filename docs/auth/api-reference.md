# Auth API Reference

## Endpoints

### POST /auth/login

Inicia sesión con credenciales.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "miPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "123",
      "email": "usuario@ejemplo.com",
      "name": "Juan Pérez",
      "roles": ["admin"],
      "privileges": ["users:read", "users:write"],
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh-token-abc",
    "expiresIn": 3600
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "code": "UNAUTHORIZED"
}
```

---

### POST /auth/register

Registra un nuevo usuario.

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "miPassword123",
  "acceptedTerms": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Registro exitoso",
  "data": {
    "user": {
      "id": "124",
      "email": "juan@ejemplo.com",
      "name": "Juan Pérez",
      "roles": ["viewer"],
      "privileges": ["users:read"],
      "isVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### GET /auth/me

Obtiene el usuario actual (requiere Bearer token).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario obtenido",
  "data": {
    "id": "123",
    "email": "usuario@ejemplo.com",
    "name": "Juan Pérez",
    "roles": ["admin"],
    "privileges": ["users:read", "users:write"],
    "isVerified": true
  }
}
```

---

### POST /auth/refresh

Refresca el token de acceso.

**Request:**
```json
{
  "refreshToken": "refresh-token-abc"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refrescado",
  "data": {
    "user": { ... },
    "token": "nuevo-jwt...",
    "refreshToken": "nuevo-refresh...",
    "expiresIn": 3600
  }
}
```

---

### POST /auth/logout

Cierra la sesión.

**Request:**
```json
// Sin body
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout exitoso"
}
```

---

### POST /auth/forgot-password

Envía email de recuperación.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email de recuperación enviado"
}
```

---

### POST /auth/verify-otp

Verifica el código OTP.

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "otp": "123456"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "OTP verificado",
  "data": {
    "verified": true,
    "token": "reset-token-xyz"
  }
}
```

**Response (OTP inválido):**
```json
{
  "success": false,
  "message": "OTP inválido",
  "code": "INVALID_OTP"
}
```

**Response (OTP expirado):**
```json
{
  "success": false,
  "message": "OTP expirado",
  "code": "EXPIRED"
}
```

---

### POST /auth/reset-password

Restablece la contraseña.

**Request:**
```json
{
  "token": "reset-token-xyz",
  "password": "nuevaPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contraseña actualizada"
}
```

---

### POST /auth/verify-email

Verifica el email desde el enlace.

**Request:**
```json
{
  "token": "verify-token-abc123"
}
```

**Response (éxito):**
```json
{
  "success": true,
  "message": "Email verificado",
  "data": {
    "email": "usuario@ejemplo.com"
  }
}
```

**Response (token inválido):**
```json
{
  "success": false,
  "message": "Token inválido",
  "code": "VALIDATION_ERROR"
}
```

---

### POST /auth/resend-verification

Reenvía el email de verificación.

**Request:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Email reenviado"
}
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `VALIDATION_ERROR` | Datos de entrada inválidos |
| `UNAUTHORIZED` | Credenciales inválidas o token expirado |
| `FORBIDDEN` | Sin permisos |
| `NOT_FOUND` | Recurso no encontrado |
| `CONFLICT` | Conflicto (ej: email ya registrado) |
| `RATE_LIMITED` | Demasiadas solicitudes |
| `INTERNAL_ERROR` | Error del servidor |
| `NETWORK_ERROR` | Error de conexión |
| `TIMEOUT` | Timeout de la petición |
| `UNKNOWN` | Error desconocido |

## Contrato ApiResponse

```typescript
type ApiResponse<T> = ApiSuccess<T> | ApiError;

interface ApiSuccess<T> {
  success: true;
  message: string;
  data?: T;
}

interface ApiError {
  success: false;
  message: string;
  code: ApiErrorCode;
  fields?: Record<string, string[]>;
  timestamp?: string;
  traceId?: string;
}
```
