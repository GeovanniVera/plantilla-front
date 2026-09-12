/**
 * Gestión de persistencia de tokens.
 *
 * Soporta localStorage (remember) y sessionStorage (session).
 */

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const EXPIRES_AT_KEY = 'auth_expires_at';

/** Storage adapter: localStorage (remember) or sessionStorage (session) */
function getStorage(remember: boolean = true): Storage {
  return remember ? localStorage : sessionStorage;
}

export const authStorage = {
  getToken: (remember: boolean = true): string | null => {
    try {
      return getStorage(remember).getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (token: string, expiresIn?: number, remember: boolean = true): void => {
    try {
      const storage = getStorage(remember);
      storage.setItem(TOKEN_KEY, token);
      if (expiresIn) {
        storage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
      }
    } catch {
      // ignore
    }
  },

  getRefreshToken: (remember: boolean = true): string | null => {
    try {
      return getStorage(remember).getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setRefreshToken: (token: string, remember: boolean = true): void => {
    try {
      getStorage(remember).setItem(REFRESH_TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },

  getExpiresAt: (remember: boolean = true): number | null => {
    try {
      const val = getStorage(remember).getItem(EXPIRES_AT_KEY);
      return val ? Number(val) : null;
    } catch {
      return null;
    }
  },

  setExpiresAt: (timestamp: number, remember: boolean = true): void => {
    try {
      getStorage(remember).setItem(EXPIRES_AT_KEY, String(timestamp));
    } catch {
      // ignore
    }
  },

  isExpired: (remember: boolean = true): boolean => {
    const expiresAt = authStorage.getExpiresAt(remember);
    if (!expiresAt) return false;
    return Date.now() >= expiresAt;
  },

  clear: (remember: boolean = true): void => {
    try {
      const storage = getStorage(remember);
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
      storage.removeItem(EXPIRES_AT_KEY);
    } catch {
      // ignore
    }
  },

  /** Limpia tokens de AMBOS storages (útil en logout) */
  clearAll: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(EXPIRES_AT_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      sessionStorage.removeItem(EXPIRES_AT_KEY);
    } catch {
      // ignore
    }
  },
};
