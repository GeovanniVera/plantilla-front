import { createContext, useContext } from 'react';

/**
 * Estado del formulario compartido via Context.
 * FormField lee de aquí para obtener error/touched automáticamente.
 */
export interface FormContextValue {
  /** Valores actuales del formulario */
  values: Record<string, unknown>;
  /** Errores de validación por campo */
  errors: Record<string, string>;
  /** Campos que el usuario ya tocó */
  touched: Record<string, boolean>;
  /** Si algún valor cambió respecto al initial */
  dirty: boolean;
  /** Si el formulario fue submitteado */
  submitted: boolean;
  /** Si el formulario está deshabilitado */
  disabled: boolean;
  /** Actualiza el valor de un campo */
  setFieldValue: (name: string, value: unknown) => void;
  /** Marca un campo como touched */
  setFieldTouched: (name: string) => void;
  /** Establece error manualmente para un campo */
  setFieldError: (name: string, error: string) => void;
  /** Obtiene el valor de un campo (para uso externo) */
  getFieldValue: (name: string) => unknown;
  /** Obtiene el error de un campo (para uso externo) */
  getFieldError: (name: string) => string | undefined;
}

/** Contexto vacío por defecto (fuera de <Form>) */
export const FormContext = createContext<FormContextValue | null>(null);

/**
 * Hook para acceder al estado del formulario.
 * Debe usarse dentro de un <Form>.
 *
 * @throws Error si se usa fuera de <Form>
 */
export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error('useFormContext debe usarse dentro de un <Form>');
  }
  return ctx;
}
