import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { client, tokenManager, configureClient } from './client';
import { server } from '../../test/mocks/server';
import { http, HttpResponse } from 'msw';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('HTTP Client — Refresh Token Flow', () => {
  beforeEach(() => {
    tokenManager.clear();
    localStorage.clear();
    configureClient({
      baseUrl: '/api',
      onUnauthorized: vi.fn(),
      onForbidden: vi.fn(),
    });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  it('retries request after successful refresh on 401', async () => {
    let callCount = 0;

    server.use(
      http.get('/api/users', () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.json(
            { success: false, message: 'Token expired', code: 'UNAUTHORIZED' },
            { status: 401 },
          );
        }
        return HttpResponse.json({
          success: true,
          message: 'OK',
          data: { id: '1', name: 'Test' },
        });
      }),
      http.post('/api/auth/refresh', () => {
        return HttpResponse.json({
          success: true,
          message: 'Refreshed',
          data: { token: 'new-token', refreshToken: 'new-refresh', expiresIn: 3600 },
        });
      }),
    );

    tokenManager.set('old-token');
    localStorage.setItem('auth_refresh_token', 'refresh-token');

    const response = await client.get('/users');

    expect(response.success).toBe(true);
    expect(callCount).toBe(2);
    expect(tokenManager.get()).toBe('new-token');
  });

  it('emits auth:logout when refresh fails', async () => {
    const logoutHandler = vi.fn();
    window.addEventListener('auth:logout', logoutHandler);

    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { success: false, message: 'Token expired', code: 'UNAUTHORIZED' },
          { status: 401 },
        );
      }),
      http.post('/api/auth/refresh', () => {
        return HttpResponse.json(
          { success: false, message: 'Invalid refresh token', code: 'UNAUTHORIZED' },
          { status: 401 },
        );
      }),
    );

    tokenManager.set('old-token');
    localStorage.setItem('auth_refresh_token', 'refresh-token');

    await client.get('/users');

    expect(logoutHandler).toHaveBeenCalled();
    expect(tokenManager.get()).toBeNull();
    expect(localStorage.getItem('auth_refresh_token')).toBeNull();

    window.removeEventListener('auth:logout', logoutHandler);
  });

  it('does not logout on 401 without a session (public endpoint like login)', async () => {
    const logoutHandler = vi.fn();
    window.addEventListener('auth:logout', logoutHandler);

    server.use(
      http.post('/api/auth/login', () => {
        return HttpResponse.json(
          { success: false, message: 'Credenciales incorrectas', code: 'UNAUTHORIZED' },
          { status: 401 },
        );
      }),
    );

    // Sin sesión: ni token en memoria ni en storage → el 401 es credenciales
    // inválidas, no sesión expirada. No debe desloguear ni recargar.
    const response = await client.post('/auth/login', { email: 'a@b.com', password: 'wrong' });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.code).toBe('UNAUTHORIZED');
      expect(response.message).toBe('Credenciales incorrectas');
    }
    expect(logoutHandler).not.toHaveBeenCalled();
    expect(tokenManager.get()).toBeNull();

    window.removeEventListener('auth:logout', logoutHandler);
  });

  it('does not retry if already retried (prevents infinite loop)', async () => {
    let callCount = 0;

    server.use(
      http.get('/api/users', () => {
        callCount++;
        return HttpResponse.json(
          { success: false, message: 'Still unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 },
        );
      }),
      http.post('/api/auth/refresh', () => {
        return HttpResponse.json({
          success: true,
          message: 'Refreshed',
          data: { token: 'new-token', refreshToken: 'new-refresh', expiresIn: 3600 },
        });
      }),
    );

    tokenManager.set('old-token');
    localStorage.setItem('auth_refresh_token', 'refresh-token');

    await client.get('/users');

    // original(401) → refresh → retry(401) → stops
    expect(callCount).toBe(2);
  });

  it('handles network error gracefully', async () => {
    server.use(
      http.get('/api/users', () => {
        return HttpResponse.error();
      }),
    );

    const response = await client.get('/users');

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.code).toBe('NETWORK_ERROR');
    }
  });

  it('normalizes 403 to FORBIDDEN error code', async () => {
    server.use(
      http.get('/api/admin', () => {
        return HttpResponse.json(
          { success: false, message: 'Forbidden', code: 'FORBIDDEN' },
          { status: 403 },
        );
      }),
    );

    const response = await client.get('/admin');

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.code).toBe('FORBIDDEN');
    }
  });

  it('normalizes 500 to INTERNAL_ERROR error code', async () => {
    server.use(
      http.get('/api/crash', () => {
        return HttpResponse.json(
          { success: false, message: 'Server error', code: 'INTERNAL_ERROR' },
          { status: 500 },
        );
      }),
    );

    const response = await client.get('/crash');

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.code).toBe('INTERNAL_ERROR');
    }
  });

  it('returns TIMEOUT error when request exceeds timeout', async () => {
    vi.useFakeTimers();

    const originalFetch = window.fetch;
    // Mock fetch: resolve only if not aborted; reject with AbortError if aborted
    window.fetch = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          resolve(new Response(JSON.stringify({ success: true, data: 'ok' }), { status: 200 }));
        }, 20000);

        init?.signal?.addEventListener('abort', () => {
          clearTimeout(timer);
          const err = new DOMException('The operation was aborted.', 'AbortError');
          reject(err);
        });
      });
    });

    const response = client.get('/slow-endpoint');

    // Advance past the 15s default timeout → AbortController fires
    await vi.advanceTimersByTimeAsync(16000);

    const result = await response;

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.code).toBe('TIMEOUT');
    }

    window.fetch = originalFetch;
    vi.useRealTimers();
  });

  it('concurrent 401s trigger only one refresh', async () => {
    let refreshCount = 0;

    server.use(
      http.get('/api/users', () => {
        return HttpResponse.json(
          { success: false, message: 'Token expired', code: 'UNAUTHORIZED' },
          { status: 401 },
        );
      }),
      http.post('/api/auth/refresh', () => {
        refreshCount++;
        return HttpResponse.json({
          success: true,
          message: 'Refreshed',
          data: { token: 'new-token', refreshToken: 'new-refresh', expiresIn: 3600 },
        });
      }),
    );

    tokenManager.set('old-token');
    localStorage.setItem('auth_refresh_token', 'refresh-token');

    await Promise.all([client.get('/users'), client.get('/users'), client.get('/users')]);

    expect(refreshCount).toBe(1);
  });
});
