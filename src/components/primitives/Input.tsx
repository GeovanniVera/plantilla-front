import { useState } from 'react'
import { LuEye, LuEyeOff } from 'react-icons/lu'
import type { InputProps } from '@components/forms/types'

import type { InputSize, StartAdornmentVariant } from '@components/forms/types'

export type { InputSize, StartAdornmentVariant }

// ─── Sizing (shared contract with Select — phase 8E.4) ────
const SIZE_CLASSES = {
    sm: {
        shell: 'h-8 text-xs',
        addon: 'w-7 text-[13px]',
    },
    md: {
        shell: 'h-10 text-sm',
        addon: 'w-8 text-sm',
    },
} as const

/* ─── Variant surface: owned by the SHELL when decorated, by the input
 * itself when bare. One effective class string per variant/state — no
 * competing utilities (6D.1 lesson). ── */
const VARIANT_SHELL_CLASSES: Record<string, string> = {
    default:
        'border border-border-base rounded-md bg-background focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-bg)]',
    filled:
        'border-b-2 border-b-border-base rounded-t-md bg-surface focus-within:border-b-accent',
    outlined:
        'border-2 border-border-base rounded-[10px] bg-transparent focus-within:border-accent focus-within:shadow-[0_0_0_1px_var(--accent)]',
}

const CONTROL_BASE_CLASSES =
    'w-full h-full bg-transparent text-foreground font-sans outline-none border-none placeholder:text-foreground/40 disabled:cursor-not-allowed'

const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed bg-surface'

/** Addon block surfaces — all token-based, themeable (8E.2 decision). */
const ADDON_VARIANT_CLASSES: Record<StartAdornmentVariant, string> = {
    plain: '',
    subtle: 'bg-surface text-foreground',
    accent: 'bg-accent text-background',
    dark: 'bg-(--text-h) text-(--bg)',
}

export default function Input({
    value,
    onChange,
    type = 'text',
    placeholder,
    disabled = false,
    readOnly = false,
    name,
    id,
    autoComplete,
    variant = 'default',
    size = 'md',
    className,
    startAdornment,
    startAdornmentVariant = 'plain',
    endAdornment,
    endAction,
    showPasswordToggle = false,
}: InputProps) {
    // ─── Password visibility (takes precedence over endAction) ───
    const [showPassword, setShowPassword] = useState(false)
    const isPasswordWithToggle = type === 'password' && showPasswordToggle
    const effectiveType = isPasswordWithToggle && showPassword ? 'text' : type

    const hasDecorations =
        startAdornment !== undefined ||
        endAdornment !== undefined ||
        endAction !== undefined ||
        isPasswordWithToggle

    // ─── Bare path: markup compatible with the pre-enrichment API ───
    if (!hasDecorations) {
        return (
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                name={name}
                id={id}
                autoComplete={autoComplete}
                data-variant={variant}
                className={`${VARIANT_SHELL_CLASSES[variant]} h-10 py-2 px-3 ${DISABLED_CLASSES} ${className ?? ''}`}
            />
        )
    }

    // ─── Decorated path: the shell owns the visual unit ───
    const startIsBoxed = startAdornment !== undefined && startAdornmentVariant !== 'plain'

    const paddingClasses = [
        startAdornment ? 'pl-0' : 'pl-3',
        endAdornment || endAction || isPasswordWithToggle ? 'pr-0' : 'pr-3',
    ].join(' ')

    return (
        <div
            data-variant={variant}
            className={`flex items-stretch w-full overflow-hidden ${VARIANT_SHELL_CLASSES[variant]} ${SIZE_CLASSES[size].shell} ${
                disabled ? DISABLED_CLASSES : ''
            } ${className ?? ''}`}
        >
            {startAdornment && (
                <div
                    aria-hidden="true"
                    className={`flex items-center justify-center shrink-0 pointer-events-none ${
                        startIsBoxed ? `${ADDON_VARIANT_CLASSES[startAdornmentVariant]} ${SIZE_CLASSES[size].addon}` : 'pl-3 pr-1'
                    }`}
                >
                    {startAdornment}
                </div>
            )}
            <input
                type={effectiveType}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                readOnly={readOnly}
                name={name}
                id={id}
                autoComplete={autoComplete}
                data-variant={variant}
                className={`${CONTROL_BASE_CLASSES} ${paddingClasses}`}
            />
            {(endAdornment || endAction || isPasswordWithToggle) && (
                <div
                    className="flex items-center gap-1 pr-2.5"
                    aria-hidden={!endAction && !isPasswordWithToggle ? true : undefined}
                >
                    {isPasswordWithToggle && (
                        <button
                            type="button"
                            className="flex items-center justify-center p-1 rounded-sm bg-transparent border-none cursor-pointer text-foreground opacity-60 hover:opacity-100"
                            onClick={() => setShowPassword((p) => !p)}
                            disabled={disabled}
                            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            aria-pressed={showPassword}
                        >
                            {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                        </button>
                    )}
                    {!isPasswordWithToggle && endAction}
                    {endAdornment}
                </div>
            )}
        </div>
    )
}
