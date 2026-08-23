import type { RadioProps, RadioGroupProps } from '@components/forms/types'
import styles from './Form.module.css'

const variantClass = {
    default: styles.radioDefault,
    filled: styles.radioFilled,
    outlined: styles.radioOutlined,
}

export function Radio({
    checked,
    onChange,
    label,
    disabled = false,
    name,
    value,
    id,
    variant = 'default',
    className,
}: RadioProps) {
    const radioId = id ?? (name && value ? `radio-${name}-${value}` : undefined)

    return (
        <label
            className={`${styles.radioLabel} ${disabled ? styles.disabled : ''} ${className ?? ''}`}
            htmlFor={radioId}
        >
            <span className={`${styles.radio} ${variantClass[variant]} ${checked ? styles.radioChecked : ''}`}>
                {checked && <span className={styles.radioDot} />}
            </span>
            <input
                type="radio"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                name={name}
                value={value}
                id={radioId}
                className={styles.radioInput}
            />
            {label && <span className={styles.radioText}>{label}</span>}
        </label>
    )
}

export function RadioGroup({
    value,
    onChange,
    options,
    name,
    disabled = false,
    variant = 'default',
    className,
}: RadioGroupProps) {
    return (
        <div className={`${styles.radioGroup} ${className ?? ''}`} role="radiogroup">
            {options.map((opt) => (
                <Radio
                    key={opt.value}
                    checked={value === opt.value}
                    onChange={() => onChange(opt.value)}
                    label={opt.label}
                    disabled={disabled || opt.disabled}
                    name={name}
                    value={opt.value}
                    variant={variant}
                />
            ))}
        </div>
    )
}
