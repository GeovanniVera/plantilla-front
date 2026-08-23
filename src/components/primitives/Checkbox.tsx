import { LuCheck } from 'react-icons/lu'
import type { CheckboxProps } from '@components/forms/types'

const LABEL_CLASSES = 'inline-flex items-center gap-2 cursor-pointer select-none'
const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed'

const BOX_BASE_CLASSES =
    'flex items-center justify-center size-[18px] shrink-0 text-white transition-[background,border-color,transform] duration-150'

/*
 * Unchecked/checked states resolved to a single effective class set per
 * variant (no competing utilities). Filled keeps its original 4px radius,
 * which is intentionally outside the shared radius token scale.
 */
const BOX_VARIANT_CLASSES: Record<CheckboxProps['variant'] & string, { unchecked: string; checked: string }> = {
    default: {
        unchecked: 'border-2 border-border-base bg-background',
        checked: 'bg-accent border-accent border-2',
    },
    filled: {
        unchecked: 'rounded-[4px] bg-surface',
        checked: 'rounded-[4px] bg-accent',
    },
    outlined: {
        unchecked: 'rounded-full border-2 border-border-base bg-transparent',
        checked: 'rounded-full bg-accent border-accent border-2',
    },
}

const INPUT_CLASSES = 'absolute size-0 opacity-0 pointer-events-none'
const TEXT_CLASSES = 'text-sm text-foreground'

export default function Checkbox({
    checked,
    onChange,
    label,
    disabled = false,
    name,
    id,
    variant = 'default',
    className,
}: CheckboxProps) {
    const checkboxId = id ?? (name ? `checkbox-${name}` : undefined)
    const boxState = checked ? BOX_VARIANT_CLASSES[variant].checked : BOX_VARIANT_CLASSES[variant].unchecked

    return (
        <label
            className={`${LABEL_CLASSES} ${disabled ? DISABLED_CLASSES : ''} ${className ?? ''}`}
            htmlFor={checkboxId}
        >
            <span className={`${BOX_BASE_CLASSES} ${boxState}`}>
                {checked && <LuCheck size={12} strokeWidth={3} />}
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                name={name}
                id={checkboxId}
                className={INPUT_CLASSES}
            />
            {label && <span className={TEXT_CLASSES}>{label}</span>}
        </label>
    )
}
