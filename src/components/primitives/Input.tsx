import type { InputProps } from '@components/forms/types'

/*
 * Tailwind utilities consuming the runtime token layer. Variant strings
 * carry their own border-width/radius so no two classes compete for the
 * same property (cascade-order safe, phase 6D.1 lesson). Disabled state
 * replaces the variant background deterministically from the prop.
 */
const BASE_CLASSES =
    'w-full h-10 px-3 font-sans text-sm outline-none box-border transition-[border-color,box-shadow] duration-200 placeholder:text-foreground/40'

const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed bg-surface'

const VARIANT_CLASSES: Record<InputProps['variant'] & string, string> = {
    default:
        'border border-border-base rounded-md bg-background text-foreground focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]',
    filled:
        'border-b-2 border-b-border-base rounded-t-md bg-surface text-foreground focus:border-b-accent focus:bg-[color-mix(in_srgb,var(--accent-bg)_30%,var(--code-bg))]',
    outlined:
        'border-2 border-border-base rounded-[10px] bg-transparent text-foreground focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)]',
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
    className,
}: InputProps) {
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
            className={`${BASE_CLASSES} ${disabled ? DISABLED_CLASSES : VARIANT_CLASSES[variant]} ${className ?? ''}`}
        />
    )
}
