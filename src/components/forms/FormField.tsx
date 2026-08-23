import type { FormFieldProps } from './types'

/*
 * Error borders for the wrapped controls come from Form.module.css
 * (.fieldError [data-variant]) — the controls emit data-variant (6D.2)
 * and descendant overrides can't be expressed safely as utilities.
 */
import styles from '@components/primitives/Form.module.css'

const WRAPPER_CLASSES = 'flex flex-col gap-1.5'
const DISABLED_CLASSES = 'opacity-60 pointer-events-none'

const LABEL_CLASSES = 'text-[13px] font-semibold text-heading'
const REQUIRED_CLASSES = 'text-danger-strong ml-0.5'
const INPUT_WRAP_CLASSES = 'flex flex-col'
const ERROR_TEXT_CLASSES = 'text-xs text-danger-strong'
const HELPER_TEXT_CLASSES = 'text-xs text-foreground opacity-60'

/*
 * variant="floating" preserves PRE-EXISTING behavior exactly: the label
 * renders as a static overlay centered over the control. The float-up
 * interaction has never worked with this DOM order (the legacy sibling
 * selectors required the label AFTER the control); documented as a known
 * bug, deliberately not redesigned here.
 */
const FLOATING_LABEL_CLASSES =
    'absolute top-1/2 left-3 -translate-y-1/2 text-sm font-normal text-foreground opacity-50 pointer-events-none transition-[opacity,transform] duration-200 z-10'

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
    const isFloating = variant === 'floating'

    return (
        <div
            className={`${WRAPPER_CLASSES} ${isFloating ? 'relative' : ''} ${error ? styles.fieldError : ''} ${disabled ? DISABLED_CLASSES : ''} ${className ?? ''}`}
        >
            {label && (
                <span
                    className={`${isFloating ? FLOATING_LABEL_CLASSES : LABEL_CLASSES}`}
                    aria-hidden="true"
                >
                    {label}
                    {required && <span className={REQUIRED_CLASSES}>*</span>}
                </span>
            )}
            <div className={INPUT_WRAP_CLASSES}>
                {children}
            </div>
            {error && <span className={ERROR_TEXT_CLASSES}>{error}</span>}
            {!error && helper && <span className={HELPER_TEXT_CLASSES}>{helper}</span>}
        </div>
    )
}
