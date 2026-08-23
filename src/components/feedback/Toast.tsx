import { useState, useEffect, useCallback } from 'react'
import { LuX, LuCheck, LuTriangleAlert, LuInfo, LuCircleAlert } from 'react-icons/lu'
import styles from './Toast.module.css'
import type { ToastItem } from './types'

// ─── Variant config ───────────────────────────────────────
const VARIANT_CONFIG: Record<ToastItem['variant'], { icon: React.ReactNode; className: string }> = {
    success: { icon: <LuCheck size={16} />, className: styles.toastSuccess },
    error: { icon: <LuCircleAlert size={16} />, className: styles.toastError },
    warning: { icon: <LuTriangleAlert size={16} />, className: styles.toastWarning },
    info: { icon: <LuInfo size={16} />, className: styles.toastInfo },
}

// ─── Props ────────────────────────────────────────────────
interface ToastProps {
    item: ToastItem
    defaultDuration: number
    onDismiss: (id: string) => void
}

// ─── Component ────────────────────────────────────────────
export function Toast({ item, defaultDuration, onDismiss }: ToastProps) {
    const [isPaused, setIsPaused] = useState(false)
    const [isExiting, setIsExiting] = useState(false)

    const duration = item.duration ?? defaultDuration
    const config = VARIANT_CONFIG[item.variant]

    const handleClose = useCallback(() => {
        setIsExiting(true)
        setTimeout(() => onDismiss(item.id), 200)
    }, [item.id, onDismiss])

    // Auto-close timer
    useEffect(() => {
        if (isPaused || isExiting) return
        const timer = setTimeout(handleClose, duration)
        return () => clearTimeout(timer)
    }, [isPaused, isExiting, duration, handleClose])

    return (
        <div
            className={`${styles.toast} ${config.className} ${isExiting ? styles.toastExiting : ''}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            role="alert"
            aria-live="polite"
        >
            <span className={styles.toastIcon}>{config.icon}</span>
            <div className={styles.toastBody}>
                <span className={styles.toastMessage}>{item.message}</span>
                {item.action && (
                    <button className={styles.toastAction} onClick={item.action.onClick}>
                        {item.action.label}
                    </button>
                )}
            </div>
            <button className={styles.toastClose} onClick={handleClose} title="Cerrar">
                <LuX size={14} />
            </button>
        </div>
    )
}
