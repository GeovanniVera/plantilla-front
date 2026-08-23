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
export { default as Button } from './Button'
export type { ButtonVariant, ButtonSize, ButtonShape, ButtonAnimation } from './Button'

// ─── Badge ───────────────────────────────────────────
export { default as Badge } from './Badge'

// ─── StatusDot ───────────────────────────────────────
export { StatusDot } from './StatusDot'
export type { StatusColor, StatusDotProps } from './StatusDot'

// ─── Form controls ───────────────────────────────────
export { default as Input } from './Input'
export { default as Textarea } from './Textarea'
export { default as Select } from './Select'
export { default as Checkbox } from './Checkbox'
export { Radio, RadioGroup } from './Radio'

export type {
    InputProps,
    TextareaProps,
    SelectProps,
    SelectOption,
    CheckboxProps,
    RadioProps,
    RadioGroupProps,
} from '../forms/types'
