import { useState, useCallback, useMemo } from 'react';

/**
 * Validador: recibe values y retorna un objeto de errores.
 * Si retorna objeto vacío, el formulario es válido.
 */
export type FormValidator<T = Record<string, unknown>> = (
  values: T,
) => Record<string, string> | Promise<Record<string, string>>;

/**
 * Schema compatible con Zod (o cualquier librería que tenga .parse()).
 * Adapter: envolvemos el error en nuestro formato.
 */
export interface ZodSchema {
  parse: (data: unknown) => unknown;
}

/**
 * Opciones del hook useForm.
 */
export interface UseFormOptions<T extends Record<string, unknown>> {
  /** Valores iniciales del formulario */
  initialValues: T;
  /** Función de validación (retorna errores por campo) */
  validator?: FormValidator<T>;
  /** Schema Zod para validación (alternativa a validator) */
  zodSchema?: ZodSchema;
  /** Se ejecuta al submit si es válido */
  onSubmit?: (values: T) => void | Promise<void>;
  /** Se ejecuta al resetear */
  onReset?: () => void;
}

/**
 * Estado interno del formulario.
 */
interface FormState<T extends Record<string, unknown>> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  initialValues: T;
}

/**
 * Hook para manejar estado de formularios con validación.
 *
 * Soporta:
 * - Validación custom via función
 * - Validación via Zod schema (pasar zodSchema)
 * - Control de touched/dirty/submitted
 * - Reset a valores iniciales
 *
 * @example
 * ```tsx
 * const form = useForm({
 *     initialValues: { name: '', email: '' },
 *     zodSchema: userSchema, // Zod schema
 *     onSubmit: async (values) => {
 *         await createUser(values)
 *     },
 * })
 *
 * <Form form={form} onSubmit={form.handleSubmit}>
 *   <FormField label="Nombre" name="name">
 *     <Input value={form.values.name} onChange={(v) => form.setFieldValue('name', v)} />
 *   </FormField>
 * </Form>
 * ```
 */
export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const { initialValues, validator, zodSchema, onSubmit, onReset } = options;

  const [state, setState] = useState<FormState<T>>({
    values: { ...initialValues },
    errors: {},
    touched: {},
    initialValues: { ...initialValues },
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar todos los campos
  const validate = useCallback(
    async (values: T): Promise<Record<string, string>> => {
      // Prioridad: Zod schema > validator custom
      if (zodSchema) {
        try {
          zodSchema.parse(values);
          return {};
        } catch (err: unknown) {
          // Zod errors tiene un formato específico
          const zodErr = err as { issues?: Array<{ path: (string | number)[]; message: string }> };
          if (zodErr.issues) {
            const errors: Record<string, string> = {};
            zodErr.issues.forEach((issue) => {
              const key = issue.path.join('.');
              if (key) errors[key] = issue.message;
            });
            return errors;
          }
          return {};
        }
      }

      if (validator) {
        return validator(values);
      }

      return {};
    },
    [zodSchema, validator],
  );

  // Actualizar valor de un campo
  const setFieldValue = useCallback((name: string, value: unknown) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [name]: value },
    }));
  }, []);

  // Marcar campo como touched
  const setFieldTouched = useCallback((name: string) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [name]: true },
    }));
  }, []);

  // Establecer error manualmente
  const setFieldError = useCallback((name: string, error: string) => {
    setState((prev) => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
    }));
  }, []);

  // Obtener valor de un campo
  const getFieldValue = useCallback(
    (name: string): unknown => {
      return state.values[name];
    },
    [state.values],
  );

  // Obtener error de un campo
  const getFieldError = useCallback(
    (name: string): string | undefined => {
      return state.errors[name];
    },
    [state.errors],
  );

  // Validar un campo específico
  const validateField = useCallback(
    async (name: string) => {
      const errors = await validate(state.values);
      const fieldError = errors[name];

      setState((prev) => ({
        ...prev,
        errors: fieldError
          ? { ...prev.errors, [name]: fieldError }
          : (() => {
              const { [name]: _, ...rest } = prev.errors;
              return rest;
            })(),
      }));

      return fieldError;
    },
    [state.values, validate],
  );

  // Validar todo el formulario
  const validateForm = useCallback(async () => {
    const errors = await validate(state.values);
    setState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  }, [state.values, validate]);

  // Submit
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      setSubmitted(true);

      // Validar todos los campos
      const isValid = await validateForm();
      if (!isValid) return;

      // Ejecutar onSubmit
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(state.values);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [state.values, validateForm, onSubmit],
  );

  // Reset
  const reset = useCallback(() => {
    setState((prev) => ({
      values: { ...prev.initialValues },
      errors: {},
      touched: {},
      initialValues: prev.initialValues,
    }));
    setSubmitted(false);
    onReset?.();
  }, [onReset]);

  // Dirty: si algún valor cambió respecto al initial
  const dirty = useMemo(() => {
    return Object.keys(state.values).some((key) => state.values[key] !== state.initialValues[key]);
  }, [state.values, state.initialValues]);

  return {
    // Estado
    values: state.values,
    errors: state.errors,
    touched: state.touched,
    dirty,
    submitted,
    isSubmitting,

    // Acciones
    setFieldValue,
    setFieldTouched,
    setFieldError,
    getFieldValue,
    getFieldError,

    // Validación
    validateField,
    validateForm,

    // Submit/Reset
    handleSubmit,
    reset,
  };
}
