/**
 * Gestión de persistencia de tokens.
 *
 * Soporta localStorage (remember) y sessionStorage (session).
 */

const TOKEN_KEY = 'auth_token';
// LEGACY: el refresh token ahora vive en una cookie HttpOnly del backend, nadie
// lo escribe en el frontend. La clave se conserva solo para borrarla en
// clear()/clearAll(): los usuarios que corrieron una release anterior todavía
// la tienen en su storage y el logout debe eliminarla.
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

  /**
   * Resuelve la sesión activa junto con el storage donde vive.
   *
   * Revisa sessionStorage PRIMERO y localStorage después: sessionStorage es
   * tab-scoped, así que una pestaña que creó una sesión sin "Recuérdeme" nunca
   * debe ser secuestrada por un token profile-wide que otro login dejó en
   * localStorage.
   *
   * @returns `{ token, remember }` o `null` si no hay sesión en ningún storage
   */
  getActiveSession: (): { token: string; remember: boolean } | null => {
    const sessionToken = authStorage.getToken(false);
    if (sessionToken) {
      return { token: sessionToken, remember: false };
    }

    const localToken = authStorage.getToken(true);
    if (localToken) {
      return { token: localToken, remember: true };
    }

    return null;
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

  /**
   * Indica si el token activo ya expiró.
   *
   * Si `remember` se omite, se resuelve desde la sesión activa. Sin sesión,
   * devuelve `false` para no refrescar ni limpiar por un token inexistente.
   *
   * @param remember - Storage a consultar; si se omite, usa la sesión activa
   */
  isExpired: (remember?: boolean): boolean => {
    if (remember === undefined) {
      const session = authStorage.getActiveSession();
      if (!session) return false;
      remember = session.remember;
    }

    const expiresAt = authStorage.getExpiresAt(remember);
    if (!expiresAt) return false;
    return Date.now() >= expiresAt;
  },

  clear: (remember: boolean = true): void => {
    try {
      const storage = getStorage(remember);
      storage.removeItem(TOKEN_KEY);
      // LEGACY: limpia el refresh token que persistían releases anteriores.
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
      // LEGACY: limpia el refresh token que persistían releases anteriores.
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
