import type { TextareaProps } from '@components/forms/types'

const BASE_CLASSES =
    'w-full px-3 py-2.5 font-sans text-sm leading-normal outline-none box-border resize-y transition-[border-color,box-shadow] duration-200 placeholder:text-foreground/40'

const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed bg-surface'

const VARIANT_CLASSES: Record<TextareaProps['variant'] & string, string> = {
    default:
        'border border-border-base rounded-md bg-background text-foreground focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]',
    filled:
        'border-b-2 border-b-border-base rounded-t-md bg-surface text-foreground focus:border-b-accent',
    outlined:
        'border-2 border-border-base rounded-[10px] bg-transparent text-foreground focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)]',
}

export default function Textarea({
    value,
    onChange,
    placeholder,
    disabled = false,
    readOnly = false,
    rows = 4,
    maxLength,
    name,
    id,
    variant = 'default',
    className,
}: TextareaProps) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            rows={rows}
            maxLength={maxLength}
            name={name}
            id={id}
            data-variant={variant}
            className={`${BASE_CLASSES} ${disabled ? DISABLED_CLASSES : VARIANT_CLASSES[variant]} ${className ?? ''}`}
        />
    )
}
