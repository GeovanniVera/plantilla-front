import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import styles from './Modal.module.css'
import type { ModalProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types'
import { ModalContext, useModalClose } from './context'

// ─── Modal Root ───────────────────────────────────────────
export function Modal({ isOpen, onClose, children, width = 520, maxHeight = '85vh', className }: ModalProps) {
    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return createPortal(
        <ModalContext.Provider value={onClose}>
            <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
                <div
                    className={`${styles.window} ${className ?? ''}`}
                    style={{ width, maxHeight }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </ModalContext.Provider>,
        document.body,
    )
}

// ─── Modal.Header ─────────────────────────────────────────
Modal.Header = function ModalHeader({ title, rightSlot, showClose = true, className, children }: ModalHeaderProps) {
    const onClose = useModalClose()

    return (
        <div className={`${styles.header} ${className ?? ''}`}>
            {children ? (
                <div className={styles.headerChildren}>{children}</div>
            ) : title ? (
                <span className={styles.headerTitle}>{title}</span>
            ) : null}
            {showClose && !rightSlot && (
                <button className={styles.closeBtn} onClick={onClose} title="Cerrar">
                    <LuX size={16} />
                </button>
            )}
            {rightSlot}
        </div>
    )
}

// ─── Modal.Body ───────────────────────────────────────────
Modal.Body = function ModalBody({ children, className }: ModalBodyProps) {
    return (
        <div className={`${styles.body} ${className ?? ''}`}>
            {children}
        </div>
    )
}

// ─── Modal.Footer ─────────────────────────────────────────
Modal.Footer = function ModalFooter({ children, className }: ModalFooterProps) {
    return (
        <div className={`${styles.footer} ${className ?? ''}`}>
            {children}
        </div>
    )
}
