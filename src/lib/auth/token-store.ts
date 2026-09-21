/**
 * Gestión del indicador de sesión en storage.
 *
 * Diseño "access token memory-only": el access token NUNCA se persiste en
 * localStorage/sessionStorage (vector XSS). En storage solo vive un
 * INDICADOR de sesión (`auth_expires_at`) que permite saber, tras un reload,
 * que existe una sesión y en qué storage vive (sessionStorage = sin
 * "Recuérdeme", localStorage = con "Recuérdeme"). El token real se obtiene en
 * memoria vía `POST /auth/refresh` (refresh token en cookie HttpOnly) y luego
 * `GET /auth/me`.
 */

// LEGACY: el access token se persistía en releases anteriores. La clave se
// conserva solo para borrarla en clear()/clearAll(): los usuarios que corrieron
// una release anterior todavía la tienen en su storage y el logout debe
// eliminarla. Nada en el código escribe ni lee esta clave.
const TOKEN_KEY = 'auth_token';
// LEGACY: el refresh token ahora vive en una cookie HttpOnly del backend, nadie
// lo escribe en el frontend. La clave se conserva solo para borrarla en
// clear()/clearAll(): los usuarios que corrieron una release anterior todavía
// la tienen en su storage y el logout debe eliminarla.
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
// Única clave que se escribe en storage: indicador de expiración de la sesión.
const EXPIRES_AT_KEY = 'auth_expires_at';

/** Storage adapter: localStorage (remember) or sessionStorage (session) */
function getStorage(remember: boolean = true): Storage {
  return remember ? localStorage : sessionStorage;
}

export const authStorage = {
  /**
   * Resuelve la sesión activa (indicador presente) junto con el storage donde vive.
   *
   * Revisa sessionStorage PRIMERO y localStorage después: sessionStorage es
   * tab-scoped, así que una pestaña que creó una sesión sin "Recuérdeme" nunca
   * debe ser secuestrada por una sesión profile-wide que otro login dejó en
   * localStorage.
   *
   * Solo consulta el INDICADOR (`auth_expires_at`); el access token nunca se
   * persiste y por lo tanto no puede leerse desde storage.
   *
   * @returns `{ remember }` o `null` si no hay indicador en ningún storage
   */
  getActiveSession: (): { remember: boolean } | null => {
    if (authStorage.getExpiresAt(false) !== null) return { remember: false };
    if (authStorage.getExpiresAt(true) !== null) return { remember: true };
    return null;
  },

  /**
   * Marca la sesión como activa escribiendo SOLO el indicador de expiración.
   *
   * Nunca escribe el access token (memory-only). Si se provee `expiresIn`, el
   * indicador refleja la expiración real; si no, se escribe el instante actual
   * (el indicador solo testimonia que la sesión existe, no su vigencia).
   *
   * @param remember - Storage a usar: localStorage (true) o sessionStorage (false)
   * @param expiresIn - Segundos de vida del token; opcional
   */
  setActiveSession: (remember: boolean = true, expiresIn?: number): void => {
    try {
      const storage = getStorage(remember);
      if (expiresIn) {
        storage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
      } else {
        storage.setItem(EXPIRES_AT_KEY, String(Date.now()));
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
   * Indica si la sesión activa ya expiró (según el indicador en storage).
   *
   * Si `remember` se omite, se resuelve desde la sesión activa. Sin indicador,
   * devuelve `false` para no refrescar ni limpiar por una sesión inexistente.
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
      // LEGACY: limpia el access token que persistían releases anteriores.
      storage.removeItem(TOKEN_KEY);
      // LEGACY: limpia el refresh token que persistían releases anteriores.
      storage.removeItem(REFRESH_TOKEN_KEY);
      storage.removeItem(EXPIRES_AT_KEY);
    } catch {
      // ignore
    }
  },

  /** Limpia el indicador y las claves legacy de AMBOS storages (útil en logout) */
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
