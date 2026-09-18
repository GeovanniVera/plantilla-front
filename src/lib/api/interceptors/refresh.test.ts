import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { tryRefreshToken } from './refresh';
import { authStorage } from '../../auth/token-store';
import { tokenManager } from '../client';
import { server } from '../../../test/mocks/server';

/**
 * Storage en memoria para aislar cada test. No se comparte con el jsdom real
 * ni con otros archivos de test: se instala en beforeEach y se revierte en
 * afterEach con vi.unstubAllGlobals().
 */
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

describe('refresh token — session isolation', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.stubGlobal('sessionStorage', memoryStorage());
    tokenManager.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('keeps a session-only refresh in sessionStorage and never promotes it to localStorage', async () => {
    server.use(
      http.post('*/auth/refresh', () =>
        HttpResponse.json({
          success: true,
          message: 'Token refrescado',
          data: { accessToken: 'refreshed-token', expiresIn: 3600 },
        }),
      ),
    );

    authStorage.setToken('session-token', 3600, false);

    const refreshed = await tryRefreshToken();

    expect(refreshed).toBe(true);
    expect(authStorage.getToken(false)).toBe('refreshed-token');
    expect(authStorage.getToken(true)).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('keeps a remembered refresh in localStorage', async () => {
    server.use(
      http.post('*/auth/refresh', () =>
        HttpResponse.json({
          success: true,
          message: 'Token refrescado',
          data: { accessToken: 'refreshed-token', expiresIn: 3600 },
        }),
      ),
    );

    authStorage.setToken('local-token', 3600, true);

    const refreshed = await tryRefreshToken();

    expect(refreshed).toBe(true);
    expect(authStorage.getToken(true)).toBe('refreshed-token');
    expect(authStorage.getToken(false)).toBeNull();
  });

  it('clears the storage where the session lives on failure, leaving other storages untouched', async () => {
    server.use(
      http.post('*/auth/refresh', () =>
        HttpResponse.json(
          { success: false, message: 'Refresh inválido', code: 'UNAUTHORIZED' },
          { status: 401 },
        ),
      ),
    );

    authStorage.setToken('session-token', 3600, false);
    // Token de otra pestaña en localStorage: no debe tocarse desde esta sesión.
    authStorage.setToken('other-tab-token', 3600, true);

    const refreshed = await tryRefreshToken();

    expect(refreshed).toBe(false);
    expect(authStorage.getToken(false)).toBeNull();
    expect(authStorage.getToken(true)).toBe('other-tab-token');
    expect(tokenManager.get()).toBeNull();
  });
});
