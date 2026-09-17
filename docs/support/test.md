# Test

Infraestructura de testing del proyecto plantilla-front.

## Archivos

| Archivo | Función |
|---------|---------|
| `src/test/setup.ts` | Setup global de Vitest |
| `src/test/mocks/server.ts` | Instancia MSW |
| `src/test/mocks/handlers/auth.ts` | 8 handlers MSW para auth |

## Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## MSW Server

```typescript
// src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { authHandlers } from './handlers/auth';

export const server = setupServer(...authHandlers);
```

## Auth Handlers

### Usuarios Predefinidos

| Email | Password | Roles |
|-------|----------|-------|
| `admin@test.com` | `admin123` | `['admin']` |
| `editor@test.com` | `editor123` | `['editor']` |

### Handlers

| Handler | Método | Endpoint |
|---------|--------|----------|
| `loginHandler` | POST | `/auth/login` |
| `logoutHandler` | POST | `/auth/logout` |
| `meHandler` | GET | `/auth/me` |
| `refreshHandler` | POST | `/auth/refresh` |
| `registerHandler` | POST | `/auth/register` |
| `forgotPasswordHandler` | POST | `/auth/forgot-password` |
| `resetPasswordHandler` | POST | `/auth/reset-password` |
| `verifyEmailHandler` | POST | `/auth/verify-email` |
| `resendVerificationHandler` | POST | `/auth/resend-verification` |
| `verifyOtpHandler` | POST | `/auth/verify-otp` |

### Tokens Fake

```typescript
function createToken(user: User): string {
  return btoa(JSON.stringify({
    sub: user.id,
    email: user.email,
    roles: user.roles,
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
}
```

## Uso en Tests

```typescript
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mocks/server';

test('login exitoso', async () => {
  render(<LoginPage />);
  
  await userEvent.type(screen.getByLabelText(/email/i), 'admin@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'admin123');
  await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
  
  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

test('login fallido', async () => {
  server.use(
    http.post('/auth/login', () => {
      return HttpResponse.json({
        success: false,
        message: 'Credenciales inválidas',
        code: 'UNAUTHORIZED',
      }, { status: 401 });
    })
  );
  
  render(<LoginPage />);
  
  await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
  await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
  
  await waitFor(() => {
    expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
  });
});
```

## Patrones

### MSW (Mock Service Worker)

Intercepts a nivel de red, no de módulo. Los tests no saben que están usando mocks.

### Contract Testing

Los mocks responden con la misma estructura que el backend real (`ApiResponse<T>`).

### Deterministic Fixtures

Tokens predecibles, usuarios hardcoded. Cada test tiene el mismo resultado.
