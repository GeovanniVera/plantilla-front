import { useEffect, useContext } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import styles from './Modal.module.css'
import type { DrawerProps, ModalHeaderProps, ModalBodyProps, ModalFooterProps } from './types'
import { ModalContext } from './context'

// ─── Drawer Root ──────────────────────────────────────────
export function Drawer({ isOpen, onClose, children, width = 480, className }: DrawerProps) {
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
            <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
                <div
                    className={`${styles.drawerWindow} ${className ?? ''}`}
                    style={{ width }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </ModalContext.Provider>,
        document.body,
    )
}

// ─── Drawer.Header (left-aligned title) ───────────────────
Drawer.Header = function DrawerHeader({ title, rightSlot, showClose = true, className, children }: ModalHeaderProps) {
    return (
        <div className={`${styles.drawerHeader} ${className ?? ''}`}>
            {children ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>{children}</div>
            ) : title ? (
                <span className={styles.drawerTitle}>{title}</span>
            ) : <div style={{ flex: 1 }} />}
            {rightSlot ?? (
                showClose && <DrawerCloseButton />
            )}
        </div>
    )
}

// ─── Drawer.Body (reuses modal body styles) ───────────────
Drawer.Body = function DrawerBody({ children, className }: ModalBodyProps) {
    return (
        <div className={`${styles.body} ${className ?? ''}`}>
            {children}
        </div>
    )
}

// ─── Drawer.Footer ────────────────────────────────────────
Drawer.Footer = function DrawerFooter({ children, className }: ModalFooterProps) {
    return (
        <div className={`${styles.footer} ${className ?? ''}`}>
            {children}
        </div>
    )
}

// ─── Internal: Close button for Drawer ────────────────────

function DrawerCloseButton() {
    const onClose = useContext(ModalContext)
    if (!onClose) return null
    return (
        <button className={styles.drawerCloseBtn} onClick={onClose} title="Cerrar">
            <LuX size={18} />
        </button>
    )
}
