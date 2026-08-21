import { useState, useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import { ModalContext } from './context'
import styles from './Modal.module.css'

// ─── Breadcrumb Item ──────────────────────────────────────
export interface DrawerBreadcrumb {
    label: string
    level: number
}

// ─── Props ────────────────────────────────────────────────
export interface DrawerStackProps {
    isOpen: boolean
    onClose: () => void
    /** Current level (0 = first, 1 = second, etc.) */
    level?: number
    /** Called when back button or breadcrumb is pressed */
    onBack?: () => void
    /** Called when a breadcrumb is clicked — receives target level */
    onNavigate?: (level: number) => void
    /** Breadcrumb items — renders nav path instead of title */
    breadcrumbs?: DrawerBreadcrumb[]
    /** Title (used when no breadcrumbs) */
    title?: string
    width?: number | string
    children: ReactNode
    className?: string
}

// ─── Component ────────────────────────────────────────────
export function DrawerStack({
    isOpen,
    onClose,
    level = 0,
    onBack,
    onNavigate,
    breadcrumbs,
    title = '',
    width = 480,
    children,
    className,
}: DrawerStackProps) {
    const prevLevelRef = useRef(level)
    const animDir = level > prevLevelRef.current ? 'forward' : 'back'

    // Sync ref after render
    useEffect(() => {
        prevLevelRef.current = level
    }, [level])

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (level > 0 && onBack) onBack()
                else onClose()
            }
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [isOpen, level, onBack, onClose])

    if (!isOpen) return null

    const showBack = level > 0
    const showBreadcrumbs = breadcrumbs && breadcrumbs.length > 0

    return createPortal(
        <ModalContext.Provider value={onClose}>
            <div className={styles.drawerOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
                <div
                    className={`${styles.drawerWindow} ${className ?? ''}`}
                    style={{ width }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={styles.drawerHeader}>
                        {showBack ? (
                            <button className={styles.drawerBackBtn} onClick={onBack} title="Volver">
                                <LuChevronLeft size={18} />
                            </button>
                        ) : (
                            <div style={{ width: 32 }} />
                        )}

                        {/* Breadcrumbs or Title */}
                        {showBreadcrumbs ? (
                            <nav className={styles.drawerBreadcrumbs}>
                                {breadcrumbs!.map((crumb, i) => {
                                    const isLast = i === breadcrumbs!.length - 1
                                    const canNavigate = !isLast && onNavigate
                                    return (
                                        <span key={crumb.level} className={styles.drawerCrumb}>
                                            {i > 0 && <LuChevronRight size={12} className={styles.drawerCrumbSep} />}
                                            {canNavigate ? (
                                                <button
                                                    className={styles.drawerCrumbLink}
                                                    onClick={() => onNavigate!(crumb.level)}
                                                >
                                                    {crumb.label}
                                                </button>
                                            ) : (
                                                <span className={styles.drawerCrumbCurrent}>{crumb.label}</span>
                                            )}
                                        </span>
                                    )
                                })}
                            </nav>
                        ) : (
                            <span className={styles.drawerTitle}>{title}</span>
                        )}

                        <button className={styles.drawerCloseBtn} onClick={onClose} title="Cerrar">
                            <LuX size={18} />
                        </button>
                    </div>

                    {/* Level dots */}
                    {level > 0 && !showBreadcrumbs && (
                        <div className={styles.levelIndicator}>
                            {Array.from({ length: level + 1 }).map((_, i) => (
                                <span
                                    key={i}
                                    className={`${styles.levelDot} ${i === level ? styles.levelDotActive : ''}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Content */}
                    <div className={`${styles.body} ${styles.drawerContent}`}>
                        <div className={`${styles.drawerContentInner} ${styles['slide_' + animDir]}`} key={level}>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </ModalContext.Provider>,
        document.body,
    )
}
