import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from 'react';

// ─── FormLayout ──────────────────────────────────────────
export type FormLayoutColumns = 1 | 2 | 3 | 4;

export interface FormLayoutProps {
  columns?: FormLayoutColumns;
  gap?: string;
  children: ReactNode;
  className?: string;
}

// ─── Variants ────────────────────────────────────────────
export type InputVariant = 'default' | 'filled' | 'outlined';
export type FormFieldVariant = 'default' | 'floating';

// ─── Input ───────────────────────────────────────────────
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';

export type InputSize = 'sm' | 'md';
export type StartAdornmentVariant = 'plain' | 'subtle' | 'accent' | 'dark';
export type InputValidationState = 'none' | 'invalid' | 'valid';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'onChange' | 'size' | 'type' | 'value'
> {
  value: string;
  onChange: (value: string) => void;
  type?: InputType;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  name?: string;
  id?: string;
  autoComplete?: string;
  variant?: InputVariant;
  appearance?: InputVariant;
  validationState?: InputValidationState;
  className?: string;
  /** Visual size. Default: 'md'. */
  size?: InputSize;
  /** Decorative leading content. Non-interactive. */
  startAdornment?: ReactNode;
  /** Leading addon surface. Default: 'plain'. */
  startAdornmentVariant?: StartAdornmentVariant;
  /** Decorative trailing content. Non-interactive. */
  endAdornment?: ReactNode;
  /** Interactive trailing content. The consumer owns its accessible name. */
  endAction?: ReactNode;
  /**
   * Muestra toggle mostrar/ocultar cuando type='password'.
   * Precedencia: si está activo, reemplaza endAction (documentado en 8E.2).
   */
  showPasswordToggle?: boolean;
}

// ─── Textarea ────────────────────────────────────────────
export type TextareaSize = InputSize;
export type TextareaVariant = InputVariant;
/**
 * Visual validation axis, shared vocabulary with the other form controls.
 * Pure presentation: it never implies that any rule was evaluated.
 */
export type TextareaValidationState = InputValidationState;

export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children' | 'onChange' | 'value'
> {
  value: string;
  onChange: (value: string) => void;
  variant?: TextareaVariant;
  appearance?: TextareaVariant;
  size?: TextareaSize;
  validationState?: TextareaValidationState;
}

// ─── Select ──────────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export type SelectSize = InputSize;
export type SelectVariant = InputVariant;
/**
 * Visual validation axis, shared vocabulary with the other form controls.
 * Pure presentation: it never implies that any rule was evaluated.
 */
export type SelectValidationState = InputValidationState;

export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'children' | 'onChange' | 'size' | 'value' | 'multiple'
> {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  variant?: SelectVariant;
  appearance?: SelectVariant;
  size?: SelectSize;
  validationState?: SelectValidationState;
  startAdornment?: ReactNode;
  startAdornmentVariant?: StartAdornmentVariant;
}

// ─── Checkbox ────────────────────────────────────────────
export type CheckboxSize = InputSize;
/**
 * Visual validation axis, shared vocabulary with the other form controls.
 * Pure presentation: it never implies that any rule was evaluated.
 */
export type CheckboxValidationState = InputValidationState;

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'onChange' | 'checked' | 'size' | 'type'
> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  /**
   * Tri-state marker. It is not an HTML attribute: the component sets the
   * DOM property `indeterminate` on the real input (and paints the dash).
   */
  indeterminate?: boolean;
  size?: CheckboxSize;
  validationState?: CheckboxValidationState;
}

// ─── Radio ───────────────────────────────────────────────
/**
 * Visual validation axis, shared vocabulary with the other form controls.
 * Pure presentation: it never implies that any rule was evaluated.
 */
export type RadioValidationState = InputValidationState;

export interface RadioProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  disabled?: boolean;
  name?: string;
  value?: string;
  id?: string;
  variant?: InputVariant;
  validationState?: RadioValidationState;
  className?: string;
}

export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  name?: string;
  disabled?: boolean;
  variant?: InputVariant;
  className?: string;
}

// ─── FormField ───────────────────────────────────────────
export interface FormFieldProps {
  label?: string;
  required?: boolean;
  /**
   * Nombre del campo en el formulario.
   * Cuando se usa dentro de <Form>, permite leer error/touched automáticamente del contexto.
   * El prop `error` tiene prioridad sobre el error del contexto.
   */
  name?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  children: ReactNode;
  variant?: FormFieldVariant;
  className?: string;
  /**
   * Id of the control inside the field, for label association.
   * Needed only when the visible input is not the direct child element
   * (compound controls); for simple children FormField wires the id itself.
   */
  controlId?: string;
}

// ─── Field Config (Form Builder) ─────────────────────────
export type FieldType =
  'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio';

/** Identificadores serializables de icono para el addon inicial del Input. */
export type FieldIcon = 'none' | 'search' | 'mail' | 'user';

export interface FieldConfig {
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  options?: string[];
  helperText?: string;
  defaultValue?: string;
  layoutSpan?: 1 | 2 | 3;
  /** Decoración del control (solo tipos tipo-texto). Serializable: el builder no guarda ReactNodes. */
  startIcon?: FieldIcon;
  startAdornmentVariant?: StartAdornmentVariant;
  /** Solo para type='password': toggle mostrar/ocultar. */
  showPasswordToggle?: boolean;
}
