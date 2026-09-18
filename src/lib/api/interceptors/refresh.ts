import { tokenManager } from '../client';
// Relative path: src/lib/api/interceptors/ → ../../auth/token-store → src/lib/auth/token-store
import { authStorage } from '../../auth/token-store';
import { env } from '../../../config/env';

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefreshToken(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = doRefresh();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function doRefresh(): Promise<boolean> {
  // La sesión renovada debe quedarse en el mismo storage donde fue creada.
  // Si la procedencia es desconocida, se asume sessionStorage (tab-scoped):
  // nunca se promueve implícitamente una sesión a localStorage.
  const activeSession = authStorage.getActiveSession();
  const remember = activeSession?.remember ?? false;

  try {
    const API_BASE = env.VITE_API_BASE;
    // No enviamos refreshToken en el body — viene en HttpOnly cookie
    const response = await fetch(`${API_BASE}${env.VITE_AUTH_REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Importante: enviar cookies HttpOnly
    });

    if (!response.ok) {
      return invalidate(activeSession);
    }

    const data = await response.json();

    if (!data || typeof data !== 'object' || !data.success || !data.data) {
      return invalidate(activeSession);
    }

    const { accessToken, expiresIn } = data.data;

    tokenManager.set(accessToken);
    authStorage.setToken(accessToken, expiresIn, remember);
    // No hay refreshToken en el body — viene en cookie

    return true;
  } catch {
    return invalidate(activeSession);
  }
}

/**
 * Invalida la sesión tras un refresh fallido.
 *
 * Limpia el storage donde vive la sesión activa (no siempre localStorage) para
 * no dejar tokens huérfanos en sessionStorage. Si no hay sesión identificable,
 * aplica una invalidación dura sobre ambos storages.
 */
function invalidate(activeSession: { token: string; remember: boolean } | null): false {
  if (activeSession) {
    authStorage.clear(activeSession.remember);
  } else {
    authStorage.clearAll();
  }
  tokenManager.clear();
  return false;
}
