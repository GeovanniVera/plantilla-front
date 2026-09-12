/**
 * Environment configuration.
 *
 * Validates and exports typed environment variables.
 * All VITE_ prefixed vars are exposed to the client bundle.
 *
 * @see .env.example for the full list of variables
 */

// ─── Type definition ───────────────────────────────────────
interface Env {
  /** API base URL (e.g., http://localhost:3000/api) */
  VITE_API_BASE: string;
  /** Login endpoint path */
  VITE_AUTH_LOGIN_PATH: string;
  /** Token refresh endpoint path */
  VITE_AUTH_REFRESH_PATH: string;
  /** Logout endpoint path */
  VITE_AUTH_LOGOUT_PATH: string;
  /** Get current user endpoint path */
  VITE_AUTH_ME_PATH: string;
  /** Request timeout in milliseconds */
  VITE_REQUEST_TIMEOUT: number;
  /** Application name */
  VITE_APP_NAME: string;
}

// ─── Validation ────────────────────────────────────────────
function getEnvVar(key: string, required: boolean = true): string | undefined {
  const value = import.meta.env[key];
  if (required && !value) {
    const message = `Missing required environment variable: ${key}`;
    if (import.meta.env.DEV) {
      console.error(`[ENV ERROR] ${message}`);
    }
    throw new Error(message);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env[key];
  if (!value) return defaultValue;
  const parsed = Number(value);
  if (isNaN(parsed)) {
    console.warn(
      `[ENV WARNING] Invalid number for ${key}: "${value}", using default ${defaultValue}`,
    );
    return defaultValue;
  }
  return parsed;
}

// ─── Validate and export ───────────────────────────────────
function validateEnv(): Env {
  // Validate required variables in development
  if (import.meta.env.DEV) {
    getEnvVar('VITE_API_BASE');
  }

  return {
    VITE_API_BASE: getEnvVar('VITE_API_BASE') || '/api',
    VITE_AUTH_LOGIN_PATH: getEnvVar('VITE_AUTH_LOGIN_PATH') || '/auth/login',
    VITE_AUTH_REFRESH_PATH: getEnvVar('VITE_AUTH_REFRESH_PATH') || '/auth/refresh',
    VITE_AUTH_LOGOUT_PATH: getEnvVar('VITE_AUTH_LOGOUT_PATH') || '/auth/logout',
    VITE_AUTH_ME_PATH: getEnvVar('VITE_AUTH_ME_PATH') || '/auth/me',
    VITE_REQUEST_TIMEOUT: getEnvNumber('VITE_REQUEST_TIMEOUT', 15000),
    VITE_APP_NAME: getEnvVar('VITE_APP_NAME') || 'SemillaTecnologica',
  };
}

/**
 * Typed and validated environment configuration.
 * Use this instead of import.meta.env directly.
 *
 * @example
 * ```ts
 * import { env } from '@config/env'
 *
 * const response = await fetch(`${env.VITE_API_BASE}/users`)
 * ```
 */
export const env = validateEnv();
