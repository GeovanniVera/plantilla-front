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
  try {
    const API_BASE = env.VITE_API_BASE;
    // No enviamos refreshToken en el body — viene en HttpOnly cookie
    const response = await fetch(`${API_BASE}${env.VITE_AUTH_REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Importante: enviar cookies HttpOnly
    });

    if (!response.ok) {
      authStorage.clear();
      tokenManager.clear();
      return false;
    }

    const data = await response.json();

    if (!data || typeof data !== 'object' || !data.success || !data.data) {
      authStorage.clear();
      tokenManager.clear();
      return false;
    }

    const { accessToken, expiresIn } = data.data;

    tokenManager.set(accessToken);
    authStorage.setToken(accessToken, expiresIn);
    // No hay refreshToken en el body — viene en cookie

    return true;
  } catch {
    authStorage.clear();
    tokenManager.clear();
    return false;
  }
}
