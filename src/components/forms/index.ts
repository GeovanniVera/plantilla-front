/**
 * Public surface of the forms family.
 *
 * FieldConfig is authored outside this family (pages/FormShowcase consumes
 * it directly; dev/form-builder builds editors around it), and FieldType is
 * its vocabulary type — exported alongside so the public config shape stays
 * fully nameable by consumers.
 *
 * Primitive control prop contracts (InputProps, SelectProps, ...) belong to
 * the components they describe and are re-exported by the primitives barrel;
 * they stay reachable here only through the ../types.ts deep path.
 *
 * This barrel only imports leaf modules — never another family barrel — to
 * keep the cross-family graph acyclic.
 */

// ─── Form ────────────────────────────────────────────────
export { Form } from './Form';
export type { FormProps } from './Form';

// ─── FormField ───────────────────────────────────────────
export { default as FormField } from './FormField';

// ─── PasswordRequirements ────────────────────────────────
export { default as PasswordRequirements } from './PasswordRequirements';
export type { PasswordRequirementsProps } from './PasswordRequirements';

// ─── Form hooks ──────────────────────────────────────────
export { useForm } from './useForm';
export { useFormContext } from './FormContext';
export type { UseFormOptions, FormValidator, ZodSchema } from './useForm';
export type { FormContextValue } from './FormContext';

// ─── Types ───────────────────────────────────────────────
export type {
  FormFieldProps,
  FormFieldVariant,
  InputVariant,
  FieldType,
  FieldConfig,
} from './types';
