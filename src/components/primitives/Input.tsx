import type { InputProps } from '@components/forms/types'
import styles from './Form.module.css'

const variantClass = {
    default: styles.inputDefault,
    filled: styles.inputFilled,
    outlined: styles.inputOutlined,
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
            className={`${styles.input} ${variantClass[variant]} ${className ?? ''}`}
        />
    )
}
