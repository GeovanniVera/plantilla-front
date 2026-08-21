import type { FormFieldProps } from './types'
import styles from './Form.module.css'

export default function FormField({
    label,
    required = false,
    error,
    helper,
    disabled = false,
    variant = 'default',
    children,
    className,
}: FormFieldProps) {
    return (
        <div className={`${styles.field} ${variant === 'floating' ? styles.fieldFloating : ''} ${error ? styles.fieldError : ''} ${disabled ? styles.fieldDisabled : ''} ${className ?? ''}`}>
            {label && (
                <span className={styles.label} aria-hidden="true">
                    {label}
                    {required && <span className={styles.required}>*</span>}
                </span>
            )}
            <div className={styles.inputWrap}>
                {children}
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
            {!error && helper && <span className={styles.helperText}>{helper}</span>}
        </div>
    )
}
