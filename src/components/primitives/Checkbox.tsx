import { LuCheck } from 'react-icons/lu'
import type { CheckboxProps } from '@components/forms/types'
import styles from './Form.module.css'

const variantClass = {
    default: styles.checkboxDefault,
    filled: styles.checkboxFilled,
    outlined: styles.checkboxOutlined,
}

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

    return (
        <label
            className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ''} ${className ?? ''}`}
            htmlFor={checkboxId}
        >
            <span className={`${styles.checkbox} ${variantClass[variant]} ${checked ? styles.checkboxChecked : ''}`}>
                {checked && <LuCheck size={12} strokeWidth={3} />}
            </span>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                name={name}
                id={checkboxId}
                className={styles.checkboxInput}
            />
            {label && <span className={styles.checkboxText}>{label}</span>}
        </label>
    )
}
