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
  const refreshToken = authStorage.getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const API_BASE = env.VITE_API_BASE;
    const response = await fetch(`${API_BASE}${env.VITE_AUTH_REFRESH_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
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

    const { token, refreshToken: newRefreshToken, expiresIn } = data.data;

    tokenManager.set(token);
    authStorage.setToken(token, expiresIn);
    if (newRefreshToken) {
      authStorage.setRefreshToken(newRefreshToken);
    }

    return true;
  } catch {
    authStorage.clear();
    tokenManager.clear();
    return false;
  }
}
