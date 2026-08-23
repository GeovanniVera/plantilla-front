import { LuChevronDown } from 'react-icons/lu'
import type { SelectProps } from '@components/forms/types'

const WRAP_CLASSES = 'relative inline-flex w-full'

const BASE_CLASSES =
    'w-full h-10 pl-3 pr-8 font-sans text-sm outline-none cursor-pointer appearance-none box-border transition-[border-color,box-shadow] duration-200'

const VARIANT_CLASSES: Record<SelectProps['variant'] & string, string> = {
    default:
        'border border-border-base rounded-md bg-background focus:border-accent focus:shadow-[0_0_0_3px_var(--accent-bg)]',
    filled: 'border-b-2 border-b-border-base rounded-t-md bg-surface focus:border-b-accent',
    outlined: 'border-2 border-border-base rounded-[10px] bg-transparent focus:border-accent focus:shadow-[0_0_0_1px_var(--accent)]',
}

export default function Select({
    value,
    onChange,
    options,
    placeholder = 'Seleccionar...',
    disabled = false,
    name,
    id,
    variant = 'default',
    className,
}: SelectProps) {
    return (
        <div className={`${WRAP_CLASSES} ${className ?? ''}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                name={name}
                id={id}
                data-variant={variant}
                className={`${BASE_CLASSES} ${VARIANT_CLASSES[variant]} ${value ? 'text-foreground' : 'text-foreground/40'}`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <LuChevronDown
                size={16}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground opacity-50 pointer-events-none"
            />
        </div>
    )
}
