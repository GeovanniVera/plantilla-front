/**
 * Public surface of the primitives family.
 *
 * Prop contracts for Input, Textarea, Select, Checkbox and Radio are declared
 * in ../forms/types.ts (single source of truth since the phase-2 taxonomy)
 * and re-exported here so each component's contract is importable next to
 * the component itself. No declarations were moved.
 *
 * This barrel only imports leaf modules — never another family barrel — to
 * keep the cross-family graph acyclic (forms/types.ts imports nothing back).
 */

// ─── Button ──────────────────────────────────────────
export { default as Button } from './Button';
export type { ButtonVariant, ButtonSize, ButtonShape, ButtonAnimation } from './Button';

// ─── Badge ───────────────────────────────────────────
export { default as Badge } from './Badge';

// ─── StatusDot ───────────────────────────────────────
export { StatusDot } from './StatusDot';
export type { StatusColor, StatusDotProps } from './StatusDot';

// ─── Form controls ───────────────────────────────────
export {
  default as Input,
  InputBase,
  InputRoot,
  InputControl,
  InputStartAddon,
  InputEndAdornment,
  InputEndAction,
} from './Input';
export { default as Textarea, TextareaBase } from './Textarea';
export {
  default as Select,
  SelectBase,
  SelectRoot,
  SelectControl,
  SelectStartAddon,
} from './Select';
export { default as Checkbox, CheckboxBase } from './Checkbox';
export { default as Radio, RadioGroup } from './Radio';

export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxValidationState,
  TextareaProps,
  TextareaVariant,
  TextareaValidationState,
  SelectProps,
  SelectOption,
  SelectSize,
  SelectVariant,
  SelectValidationState,
  RadioProps,
  RadioGroupProps,
  RadioValidationState,
} from '../forms/types';

export type {
  SelectAppearance,
  SelectBaseProps,
  SelectControlProps,
  SelectRootProps,
  SelectStartAddonProps,
} from './Select';

export type {
  InputAppearance,
  InputBaseProps,
  InputControlProps,
  InputEndActionProps,
  InputEndAdornmentProps,
  InputProps,
  InputRootProps,
  InputSize,
  InputStartAddonProps,
  InputValidationState,
  InputVariant,
  StartAdornmentVariant,
} from './Input';
