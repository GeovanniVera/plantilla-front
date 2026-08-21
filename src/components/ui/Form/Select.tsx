import { LuChevronDown } from 'react-icons/lu'
import type { SelectProps } from './types'
import styles from './Form.module.css'

const variantClass = {
    default: styles.selectDefault,
    filled: styles.selectFilled,
    outlined: styles.selectOutlined,
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
        <div className={`${styles.selectWrap} ${className ?? ''}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                name={name}
                id={id}
                className={`${styles.select} ${variantClass[variant]} ${!value ? styles.selectPlaceholder : ''}`}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <LuChevronDown size={16} className={styles.selectIcon} />
        </div>
    )
}
