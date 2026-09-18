import { describe, it, expect, beforeEach } from 'vitest';
import { authStorage } from './token-store';

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

const sessionStorageMock = (() => {
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
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, writable: true });

describe('authStorage', () => {
  beforeEach(() => {
    authStorage.clearAll();
  });

  it('sets and gets token from localStorage (remember=true)', () => {
    authStorage.setToken('test-token', undefined, true);
    expect(authStorage.getToken(true)).toBe('test-token');
  });

  it('sets and gets token from sessionStorage (remember=false)', () => {
    authStorage.setToken('test-token', undefined, false);
    expect(authStorage.getToken(false)).toBe('test-token');
    expect(authStorage.getToken(true)).toBeNull();
  });

  it('does not write to localStorage when remember=false', () => {
    authStorage.setToken('session-only', 3600, false);
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_expires_at')).toBeNull();
    expect(sessionStorage.getItem('auth_token')).toBe('session-only');
  });

  describe('getActiveSession', () => {
    it('prefers the sessionStorage token when both storages hold one', () => {
      authStorage.setToken('local-token', undefined, true);
      authStorage.setToken('session-token', undefined, false);

      expect(authStorage.getActiveSession()).toEqual({ token: 'session-token', remember: false });
    });

    it('falls back to localStorage when there is no sessionStorage token', () => {
      authStorage.setToken('local-token', undefined, true);

      expect(authStorage.getActiveSession()).toEqual({ token: 'local-token', remember: true });
    });

    it('returns null when neither storage holds a token', () => {
      expect(authStorage.getActiveSession()).toBeNull();
    });
  });

  it('isExpired without argument resolves the active sessionStorage session', () => {
    authStorage.setToken('session-token', undefined, false);
    authStorage.setExpiresAt(Date.now() - 1000, false);

    expect(authStorage.isExpired()).toBe(true);
  });

  it('isExpired without argument returns false when there is no active session', () => {
    // expiresAt huérfano sin token: no debe considerarse una sesión
    localStorage.setItem('auth_expires_at', String(Date.now() - 1000));

    expect(authStorage.isExpired()).toBe(false);
  });

  it('sets token with expiresIn', () => {
    authStorage.setToken('test-token', 3600, true);
    expect(authStorage.getToken(true)).toBe('test-token');
    expect(authStorage.getExpiresAt(true)).toBeGreaterThan(Date.now());
  });

  it('isExpired returns false when no expiresAt', () => {
    authStorage.setToken('test-token', undefined, true);
    expect(authStorage.isExpired(true)).toBe(false);
  });

  it('isExpired returns false when token not expired', () => {
    authStorage.setToken('test-token', 3600, true);
    expect(authStorage.isExpired(true)).toBe(false);
  });

  it('isExpired returns true when token expired', () => {
    authStorage.setToken('test-token', undefined, true);
    authStorage.setExpiresAt(Date.now() - 1000, true);
    expect(authStorage.isExpired(true)).toBe(true);
  });

  it('clear removes tokens from specified storage', () => {
    authStorage.setToken('test-token', 3600, true);
    authStorage.clear(true);
    expect(authStorage.getToken(true)).toBeNull();
    expect(authStorage.getExpiresAt(true)).toBeNull();
  });

  it('clearAll removes from both storages', () => {
    authStorage.setToken('local-token', undefined, true);
    authStorage.setToken('session-token', undefined, false);
    authStorage.clearAll();
    expect(authStorage.getToken(true)).toBeNull();
    expect(authStorage.getToken(false)).toBeNull();
  });
});
