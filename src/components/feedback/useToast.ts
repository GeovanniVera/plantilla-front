import { useCallback } from 'react';
import type { ToastAPI, ToastVariant } from './types';

let toastFn: ToastAPI | null = null;

/** Register the toast function (called by ToastProvider) */
export function registerToast(fn: ToastAPI) {
  toastFn = fn;
}

/** Unregister (called on unmount) */
export function unregisterToast() {
  toastFn = null;
}

/**
 * Hook to access the toast API from any component.
 *
 * Must be rendered inside `<ToastProvider>`.
 *
 * ```tsx
 * const toast = useToast()
 * toast.success('Guardado correctamente')
 * toast.error('Error al guardar', { action: { label: 'Reintentar', onClick: retry } })
 * ```
 */
export function useToast(): ToastAPI {
  const call = useCallback(
    (method: ToastVariant, message: string, options?: Record<string, unknown>) => {
      if (!toastFn) {
        console.warn('[Toast] No ToastProvider found in the tree.');
        return;
      }
      toastFn[method](message, options as never);
    },
    [],
  );

  return {
    success: (msg, opts) => call('success', msg, opts),
    error: (msg, opts) => call('error', msg, opts),
    warning: (msg, opts) => call('warning', msg, opts),
    info: (msg, opts) => call('info', msg, opts),
    dismiss: (id) => toastFn?.dismiss(id),
  };
}
