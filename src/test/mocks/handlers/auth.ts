import { http, HttpResponse } from 'msw';
import type { User } from '../../../lib/api/types/api-response';

const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@test.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      roles: ['admin'],
      permissions: [
        'users:read',
        'users:write',
        'users:delete',
        'reports:view',
        'reports:export',
        'settings:manage',
      ],
      isVerified: true,
    },
  },
  'editor@test.com': {
    password: 'editor123',
    user: {
      id: '2',
      email: 'editor@test.com',
      name: 'Editor User',
      roles: ['editor'],
      permissions: ['users:read', 'reports:view'],
      isVerified: true,
    },
  },
};

function makeToken(userId: string): string {
  return btoa(JSON.stringify({ sub: userId, exp: Date.now() + 3600000 }));
}

export const authHandlers = [
  http.post('*/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const record = MOCK_USERS[body.email];

    if (!record || record.password !== body.password) {
      return HttpResponse.json(
        { success: false, message: 'Credenciales inválidas', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Login exitoso',
      data: {
        user: record.user,
        accessToken: makeToken(record.user.id),
        refreshToken: `refresh-${record.user.id}`,
        expiresIn: 3600,
      },
    });
  }),

  http.post('*/auth/logout', () => {
    return HttpResponse.json({ success: true, message: 'Logout exitoso' });
  }),

  http.get('*/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, message: 'No autenticado', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }

    try {
      const token = authHeader.slice(7);
      const payload = JSON.parse(atob(token));
      const userEntry = Object.values(MOCK_USERS).find((u) => u.user.id === payload.sub);
      if (!userEntry) {
        return HttpResponse.json(
          { success: false, message: 'Usuario no encontrado', code: 'NOT_FOUND' },
          { status: 404 },
        );
      }
      return HttpResponse.json({
        success: true,
        message: 'Usuario obtenido',
        data: userEntry.user,
      });
    } catch {
      return HttpResponse.json(
        { success: false, message: 'Token inválido', code: 'UNAUTHORIZED' },
        { status: 401 },
      );
    }
  }),

  http.post('*/auth/refresh', async ({ request }) => {
    const body = (await request.json()) as { refreshToken: string };
    return HttpResponse.json({
      success: true,
      message: 'Token refrescado',
      data: {
        user: MOCK_USERS['admin@test.com'].user,
        accessToken: makeToken('1'),
        refreshToken: body.refreshToken,
        expiresIn: 3600,
      },
    });
  }),

  http.post('*/auth/register', async ({ request }) => {
    const body = (await request.json()) as { name: string; email: string; password: string };
    const newUser: User = {
      id: String(Object.keys(MOCK_USERS).length + 1),
      email: body.email,
      name: body.name,
      roles: ['viewer'],
      permissions: ['users:read'],
      isVerified: false,
    };
    return HttpResponse.json({
      success: true,
      message: 'Registro exitoso',
      data: { user: newUser, token: makeToken(newUser.id) },
    });
  }),

  http.post('*/auth/forgot-password', () => {
    return HttpResponse.json({ success: true, message: 'Email de recuperación enviado' });
  }),

  http.post('*/auth/reset-password', () => {
    return HttpResponse.json({ success: true, message: 'Contraseña actualizada' });
  }),

  http.post('*/auth/verify-email', async ({ request }) => {
    const body = (await request.json()) as { token: string };
    if (body.token === 'verify-token-abc123') {
      return HttpResponse.json({
        success: true,
        message: 'Email verificado',
        data: { email: 'usuario@ejemplo.com' },
      });
    }
    return HttpResponse.json(
      { success: false, message: 'Token inválido', code: 'VALIDATION_ERROR' },
      { status: 400 },
    );
  }),

  http.post('*/auth/resend-verification', () => {
    return HttpResponse.json({ success: true, message: 'Email reenviado' });
  }),

  http.post('*/auth/verify-otp', async ({ request }) => {
    const body = (await request.json()) as { email: string; otp: string };

    if (body.otp === '123456') {
      return HttpResponse.json({
        success: true,
        message: 'OTP verificado',
        data: { verified: true, token: `reset-token-${Date.now()}` },
      });
    }

    if (body.otp === '000000') {
      return HttpResponse.json(
        { success: false, message: 'OTP expirado', code: 'EXPIRED' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { success: false, message: 'OTP inválido', code: 'INVALID_OTP' },
      { status: 400 },
    );
  }),
];
