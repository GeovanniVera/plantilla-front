import { useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import { FormContext } from './FormContext';
import type { FormContextValue } from './FormContext';
import type { UseFormOptions, FormValidator, ZodSchema } from './useForm';
import { useForm } from './useForm';

/** Props del componente Form */
export interface FormProps<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Instancia de useForm() — pasá el resultado del hook */
  form: ReturnType<typeof useForm<T>>;
  /** Contenido del formulario */
  children: ReactNode;
  /** Clase CSS adicional */
  className?: string;
  /** Deshabilitar todo el formulario */
  disabled?: boolean;
}

/**
 * Contenedor de formulario que provee el FormContext.
 * FormField dentro de este componente lee automáticamente error/touched.
 *
 * @example
 * ```tsx
 * const form = useForm({
 *     initialValues: { name: '', email: '' },
 *     zodSchema: userSchema,
 *     onSubmit: async (values) => await createUser(values),
 * })
 *
 * <Form form={form}>
 *   <FormField label="Nombre" name="name">
 *     <Input value={form.values.name} onChange={(v) => form.setFieldValue('name', v)} />
 *   </FormField>
 *   <FormField label="Email" name="email">
 *     <Input value={form.values.email} onChange={(v) => form.setFieldValue('email', v)} />
 *   </FormField>
 *   <Button type="submit" disabled={form.isSubmitting}>Guardar</Button>
 * </Form>
 * ```
 */
export function Form<T extends Record<string, unknown>>({
  form,
  children,
  className,
  disabled = false,
}: FormProps<T>) {
  const contextValue: FormContextValue = useMemo(
    () => ({
      values: form.values,
      errors: form.errors,
      touched: form.touched,
      dirty: form.dirty,
      submitted: form.submitted,
      disabled,
      setFieldValue: form.setFieldValue,
      setFieldTouched: form.setFieldTouched,
      setFieldError: form.setFieldError,
      getFieldValue: form.getFieldValue,
      getFieldError: form.getFieldError,
    }),
    [
      form.values,
      form.errors,
      form.touched,
      form.dirty,
      form.submitted,
      disabled,
      form.setFieldValue,
      form.setFieldTouched,
      form.setFieldError,
      form.getFieldValue,
      form.getFieldError,
    ],
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={form.handleSubmit} className={className} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
}
