import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { AuthProvider } from './provider';
import { useAuth, useHasAnyPrivilege, useHasPrivilege, useHasRole } from './hooks';
import { tokenManager } from '../lib/api/client';
import { server } from '../test/mocks/server';

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function AuthConsumer() {
  const { user, isAuthenticated, isLoading, isVerified, login, logout } = useAuth();
  const canReadUsers = useHasPrivilege('users:read');
  const canExportOrManage = useHasAnyPrivilege(['reports:export', 'settings:manage']);
  const isAdmin = useHasRole('admin');

  return (
    <>
      <output aria-label="auth status">
        {isLoading ? 'loading' : isAuthenticated ? user?.email : 'anonymous'}
      </output>
      <output aria-label="permissions">
        {String(canReadUsers)}:{String(canExportOrManage)}:{String(isAdmin)}:{String(isVerified())}
      </output>
      <button onClick={() => login('admin@test.com', 'admin123', false)}>Log in</button>
      <button onClick={() => login('admin@test.com', 'admin123', true)}>Log in remembered</button>
      <button onClick={() => login('admin@test.com', 'admin123', false)}>Log in session</button>
      <button onClick={() => logout()}>Log out</button>
    </>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.stubGlobal('sessionStorage', memoryStorage());
    tokenManager.clear();
  });

  it('settles as anonymous when no stored session exists', async () => {
    renderProvider();
    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(screen.getByLabelText('permissions')).toHaveTextContent('false:false:false:false');
  });

  it('logs in through the API, exposes permissions, and logs out', async () => {
    const user = userEvent.setup();
    renderProvider();
    await screen.findByText('anonymous');

    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByLabelText('permissions')).toHaveTextContent('true:true:true:true');
    expect(sessionStorage.getItem('auth_token')).toBeTruthy();
    expect(tokenManager.get()).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(sessionStorage.getItem('auth_token')).toBeNull();
    expect(tokenManager.get()).toBeNull();
  });

  it('restores a valid local session through the current-user endpoint', async () => {
    localStorage.setItem('auth_token', btoa(JSON.stringify({ sub: '1' })));
    renderProvider();

    expect(await screen.findByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByLabelText('permissions')).toHaveTextContent('true:true:true:true');
  });

  it('clears a stored session rejected by the current-user endpoint', async () => {
    localStorage.setItem('auth_token', btoa(JSON.stringify({ sub: '1' })));
    server.use(
      http.get('*/auth/me', () =>
        HttpResponse.json(
          { success: false, message: 'Sesión inválida', code: 'VALIDATION_ERROR' },
          { status: 400 },
        ),
      ),
    );
    renderProvider();

    expect(await screen.findByText('anonymous')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(tokenManager.get()).toBeNull();
  });

  it('does not leave a localStorage token after a session-only login follows a remembered login', async () => {
    const user = userEvent.setup();
    const apiUser = {
      id: '2',
      email: 'editor@test.com',
      name: 'Editor User',
      roles: ['editor'],
      permissions: ['users:read'],
      isVerified: true,
    };

    server.use(
      http.post('*/auth/login', () =>
        HttpResponse.json({
          success: true,
          message: 'Login exitoso',
          data: { user: apiUser, accessToken: 'login-token', expiresIn: 3600 },
        }),
      ),
    );

    renderProvider();
    await screen.findByText('anonymous');

    await user.click(screen.getByRole('button', { name: 'Log in remembered' }));
    expect(await screen.findByText('editor@test.com')).toBeInTheDocument();
    expect(localStorage.getItem('auth_token')).toBe('login-token');

    // Segundo login sin "Recuérdeme": debe dejar exactamente un token, en sessionStorage.
    await user.click(screen.getByRole('button', { name: 'Log in session' }));
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBe('login-token');
  });

  it('restores the sessionStorage session when both storages hold a token', async () => {
    const sessionToken = btoa(JSON.stringify({ sub: '2' }));
    const localToken = btoa(JSON.stringify({ sub: '1' }));

    server.use(
      http.get('*/auth/me', ({ request }) => {
        const authHeader = request.headers.get('Authorization') ?? '';
        const payload = JSON.parse(atob(authHeader.slice(7))) as { sub: string };
        const user =
          payload.sub === '2'
            ? {
                id: '2',
                email: 'editor@test.com',
                name: 'Editor User',
                roles: ['editor'],
                permissions: ['users:read'],
                isVerified: true,
              }
            : {
                id: '1',
                email: 'admin@test.com',
                name: 'Admin User',
                roles: ['admin'],
                permissions: ['users:read'],
                isVerified: true,
              };
        return HttpResponse.json({ success: true, message: 'Usuario obtenido', data: user });
      }),
    );

    sessionStorage.setItem('auth_token', sessionToken);
    localStorage.setItem('auth_token', localToken);

    renderProvider();

    expect(await screen.findByText('editor@test.com')).toBeInTheDocument();
    expect(tokenManager.get()).toBe(sessionToken);
    // El token profile-wide de localStorage queda intacto pero NO se adopta.
    expect(localStorage.getItem('auth_token')).toBe(localToken);
  });
});
