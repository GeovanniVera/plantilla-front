import type { ReactNode } from 'react'

// ─── FormLayout ──────────────────────────────────────────
export type FormLayoutColumns = 1 | 2 | 3 | 4

export interface FormLayoutProps {
    columns?: FormLayoutColumns
    gap?: string
    children: ReactNode
    className?: string
}

// ─── Variants ────────────────────────────────────────────
export type InputVariant = 'default' | 'filled' | 'outlined'
export type FormFieldVariant = 'default' | 'floating'

// ─── Input ───────────────────────────────────────────────
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

export interface InputProps {
    value: string
    onChange: (value: string) => void
    type?: InputType
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    name?: string
    id?: string
    autoComplete?: string
    variant?: InputVariant
    className?: string
}

// ─── Textarea ────────────────────────────────────────────
export interface TextareaProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
    readOnly?: boolean
    rows?: number
    maxLength?: number
    name?: string
    id?: string
    variant?: InputVariant
    className?: string
}

// ─── Select ──────────────────────────────────────────────
export interface SelectOption {
    value: string
    label: string
    disabled?: boolean
}

export interface SelectProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    placeholder?: string
    disabled?: boolean
    name?: string
    id?: string
    variant?: InputVariant
    className?: string
}

// ─── Checkbox ────────────────────────────────────────────
export interface CheckboxProps {
    checked: boolean
    onChange: (checked: boolean) => void
    label?: string
    disabled?: boolean
    name?: string
    id?: string
    variant?: InputVariant
    className?: string
}

// ─── Radio ───────────────────────────────────────────────
export interface RadioProps {
    checked: boolean
    onChange: () => void
    label?: string
    disabled?: boolean
    name?: string
    value?: string
    id?: string
    variant?: InputVariant
    className?: string
}

export interface RadioGroupProps {
    value: string
    onChange: (value: string) => void
    options: SelectOption[]
    name?: string
    disabled?: boolean
    variant?: InputVariant
    className?: string
}

// ─── FormField ───────────────────────────────────────────
export interface FormFieldProps {
    label?: string
    required?: boolean
    error?: string
    helper?: string
    disabled?: boolean
    children: ReactNode
    variant?: FormFieldVariant
    className?: string
}

// ─── Validation ──────────────────────────────────────────
export interface ValidationRule {
    required?: boolean | string
    minLength?: { value: number; message: string }
    maxLength?: { value: number; message: string }
    pattern?: { value: RegExp; message: string }
    min?: { value: number; message: string }
    max?: { value: number; message: string }
    custom?: (value: string) => string | null
}
