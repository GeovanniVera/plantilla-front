import type { ApiErrorCode } from '../api/types/api-response';
import i18n from './config';

const ERROR_MAP: Record<ApiErrorCode, string> = {
  NETWORK_ERROR: 'errors.network',
  TIMEOUT: 'errors.timeout',
  UNAUTHORIZED: 'errors.unauthorized',
  FORBIDDEN: 'errors.forbidden',
  ACCOUNT_SUSPENDED: 'errors.accountSuspended',
  NOT_FOUND: 'errors.notFound',
  CONFLICT: 'errors.emailAlreadyExists',
  RATE_LIMITED: 'errors.tooManyRequests',
  INTERNAL_ERROR: 'errors.server',
  VALIDATION_ERROR: 'errors.validation',
  UNKNOWN: 'errors.unknown',
};

export function getErrorMessage(errorCode: ApiErrorCode): string {
  const key = ERROR_MAP[errorCode] || 'errors.unknown';
  return i18n.t(key);
}

export function getErrorKey(errorCode: ApiErrorCode): string {
  return ERROR_MAP[errorCode] || 'errors.unknown';
}
