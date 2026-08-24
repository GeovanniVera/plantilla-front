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

export type InputSize = 'sm' | 'md'
export type StartAdornmentVariant = 'plain' | 'subtle' | 'accent' | 'dark'

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
    /** Tamaño compartido con Select. Default: 'md'. */
    size?: InputSize
    /** Contenido decorativo al inicio (icono o bloque addon). No interactivo. */
    startAdornment?: ReactNode
    /** Superficie del bloque inicial cuando hay startAdornment. Default: 'plain' (sin caja). */
    startAdornmentVariant?: StartAdornmentVariant
    /** Contenido decorativo al final (texto, icono informativo). No interactivo. */
    endAdornment?: ReactNode
    /** Zona interactiva al final (botón clear/acción custom). Responsabilidad de aria-label es del consumidor. */
    endAction?: ReactNode
    /**
     * Muestra toggle mostrar/ocultar cuando type='password'.
     * Precedencia: si está activo, reemplaza endAction (documentado en 8E.2).
     */
    showPasswordToggle?: boolean
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

// ─── Field Config (Form Builder) ─────────────────────────
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio'

/** Identificadores serializables de icono para el addon inicial del Input. */
export type FieldIcon = 'none' | 'search' | 'mail' | 'user'

export interface FieldConfig {
    type: FieldType
    label: string
    placeholder: string
    required: boolean
    minLength?: number
    maxLength?: number
    pattern?: string
    options?: string[]
    helperText?: string
    defaultValue?: string
    layoutSpan?: 1 | 2 | 3
    /** Decoración del control (solo tipos tipo-texto). Serializable: el builder no guarda ReactNodes. */
    startIcon?: FieldIcon
    startAdornmentVariant?: StartAdornmentVariant
    /** Solo para type='password': toggle mostrar/ocultar. */
    showPasswordToggle?: boolean
}

