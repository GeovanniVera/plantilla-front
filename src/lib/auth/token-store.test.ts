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

  describe('setActiveSession — memory-only contract', () => {
    it('writes ONLY the session indicator to localStorage (remember=true)', () => {
      authStorage.setActiveSession(true, 3600);

      expect(localStorage.getItem('auth_expires_at')).not.toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('auth_refresh_token')).toBeNull();
      expect(sessionStorage.getItem('auth_expires_at')).toBeNull();
    });

    it('writes ONLY the session indicator to sessionStorage (remember=false)', () => {
      authStorage.setActiveSession(false, 3600);

      expect(sessionStorage.getItem('auth_expires_at')).not.toBeNull();
      expect(sessionStorage.getItem('auth_token')).toBeNull();
      expect(sessionStorage.getItem('auth_refresh_token')).toBeNull();
      expect(localStorage.getItem('auth_expires_at')).toBeNull();
    });

    it('writes a future expiry when expiresIn is provided', () => {
      authStorage.setActiveSession(true, 3600);
      expect(Number(localStorage.getItem('auth_expires_at'))).toBeGreaterThan(Date.now());
    });

    it('writes the current instant when expiresIn is omitted (indicator only)', () => {
      authStorage.setActiveSession(true);
      expect(localStorage.getItem('auth_expires_at')).not.toBeNull();
      expect(authStorage.getActiveSession()).toEqual({ remember: true });
    });
  });

  describe('getActiveSession', () => {
    it('prefers the sessionStorage indicator when both storages hold one', () => {
      authStorage.setActiveSession(true, 3600);
      authStorage.setActiveSession(false, 3600);

      expect(authStorage.getActiveSession()).toEqual({ remember: false });
    });

    it('falls back to localStorage when there is no sessionStorage indicator', () => {
      authStorage.setActiveSession(true, 3600);

      expect(authStorage.getActiveSession()).toEqual({ remember: true });
    });

    it('returns null when neither storage holds an indicator', () => {
      expect(authStorage.getActiveSession()).toBeNull();
    });
  });

  it('isExpired without argument resolves the active sessionStorage session', () => {
    authStorage.setActiveSession(false, 3600);
    authStorage.setExpiresAt(Date.now() - 1000, false);

    expect(authStorage.isExpired()).toBe(true);
  });

  it('isExpired without argument returns false when there is no active session', () => {
    // Sin indicador en ningún storage: no debe considerarse una sesión
    expect(authStorage.isExpired()).toBe(false);
  });

  it('sets the indicator with expiresIn and reads it back', () => {
    authStorage.setActiveSession(true, 3600);
    expect(authStorage.getExpiresAt(true)).toBeGreaterThan(Date.now());
  });

  it('isExpired returns false when no indicator', () => {
    expect(authStorage.isExpired(true)).toBe(false);
  });

  it('isExpired returns false when indicator not expired', () => {
    authStorage.setActiveSession(true, 3600);
    expect(authStorage.isExpired(true)).toBe(false);
  });

  it('isExpired returns true when indicator expired', () => {
    authStorage.setActiveSession(true, 3600);
    authStorage.setExpiresAt(Date.now() - 1000, true);
    expect(authStorage.isExpired(true)).toBe(true);
  });

  it('clear removes the indicator and legacy keys from the specified storage', () => {
    authStorage.setActiveSession(true, 3600);
    // Sembrar claves legacy: clear debe eliminarlas también
    localStorage.setItem('auth_token', 'legacy-token');
    localStorage.setItem('auth_refresh_token', 'legacy-refresh');
    authStorage.clear(true);

    expect(authStorage.getExpiresAt(true)).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_refresh_token')).toBeNull();
  });

  it('clearAll removes indicators and legacy keys from both storages', () => {
    authStorage.setActiveSession(true, 3600);
    authStorage.setActiveSession(false, 3600);
    localStorage.setItem('auth_token', 'legacy-token');
    sessionStorage.setItem('auth_refresh_token', 'legacy-refresh');
    authStorage.clearAll();

    expect(authStorage.getExpiresAt(true)).toBeNull();
    expect(authStorage.getExpiresAt(false)).toBeNull();
    expect(authStorage.getActiveSession()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(sessionStorage.getItem('auth_refresh_token')).toBeNull();
  });
});
