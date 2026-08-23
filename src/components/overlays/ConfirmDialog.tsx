import { LuCircleCheck, LuCircleAlert, LuTriangleAlert, LuInfo } from 'react-icons/lu'
import { Modal } from './Modal'
import styles from './ConfirmDialog.module.css'

// ─── Types ────────────────────────────────────────────────
export type ConfirmVariant = 'default' | 'destructive' | 'warning' | 'info'

export interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: ConfirmVariant
    /** Override the auto-generated icon */
    icon?: React.ReactNode
}

// ─── Variant config ───────────────────────────────────────
const VARIANT_CONFIG: Record<ConfirmVariant, { icon: React.ReactNode; iconClass: string }> = {
    default: { icon: <LuCircleCheck size={24} />, iconClass: styles.iconDefault },
    destructive: { icon: <LuCircleAlert size={24} />, iconClass: styles.iconDestructive },
    warning: { icon: <LuTriangleAlert size={24} />, iconClass: styles.iconWarning },
    info: { icon: <LuInfo size={24} />, iconClass: styles.iconInfo },
}

// ─── Component ────────────────────────────────────────────
export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'default',
    icon,
}: ConfirmDialogProps) {
    const config = VARIANT_CONFIG[variant]

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} width={420}>
            <Modal.Header title={title} showClose />
            <Modal.Body>
                <div className={styles.content}>
                    <div className={`${styles.icon} ${config.iconClass}`}>
                        {icon || config.icon}
                    </div>
                    <p className={styles.message}>{message}</p>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
                    {cancelLabel}
                </button>
                <button
                    className={`${styles.btn} ${styles[`btn${variant.charAt(0).toUpperCase() + variant.slice(1)}`]}`}
                    onClick={handleConfirm}
                >
                    {confirmLabel}
                </button>
            </Modal.Footer>
        </Modal>
    )
}
