import type { TextareaProps } from './types'
import styles from './Form.module.css'

const variantClass = {
    default: styles.textareaDefault,
    filled: styles.textareaFilled,
    outlined: styles.textareaOutlined,
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
            className={`${styles.textarea} ${variantClass[variant]} ${className ?? ''}`}
        />
    )
}
