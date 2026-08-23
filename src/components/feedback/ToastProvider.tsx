import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { registerToast, unregisterToast } from './useToast'
import styles from './Toast.module.css'
import type { ToastItem, ToastAPI, ToastProviderProps } from './types'

// ─── Counter for unique IDs ───────────────────────────────
let nextId = 0

export function ToastProvider({
    children,
    position = 'top-right',
    maxVisible = 3,
    defaultDuration = 5000,
}: ToastProviderProps) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const addToast = useCallback(
        (variant: ToastItem['variant'], message: string, options?: Partial<Omit<ToastItem, 'id' | 'variant' | 'message' | 'createdAt'>>) => {
            const id = `toast-${++nextId}`
            const toast: ToastItem = {
                id,
                variant,
                message,
                createdAt: Date.now(),
                ...options,
            }
            setToasts((prev) => [...prev, toast])
        },
        [],
    )

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    // Register API on mount
    useEffect(() => {
        const api: ToastAPI = {
            success: (msg, opts) => addToast('success', msg, opts),
            error: (msg, opts) => addToast('error', msg, opts),
            warning: (msg, opts) => addToast('warning', msg, opts),
            info: (msg, opts) => addToast('info', msg, opts),
            dismiss,
        }
        registerToast(api)
        return () => unregisterToast()
    }, [addToast, dismiss])

    // Visible toasts (respect maxVisible)
    const visibleToasts = toasts.slice(-maxVisible)

    return (
        <>
            {children}
            {createPortal(
                <div className={`${styles.toastContainer} ${styles[position]}`}>
                    {visibleToasts.map((item) => (
                        <Toast
                            key={item.id}
                            item={item}
                            defaultDuration={defaultDuration}
                            onDismiss={dismiss}
                        />
                    ))}
                </div>,
                document.body,
            )}
        </>
    )
}
