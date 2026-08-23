import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from './Toast'
import { registerToast, unregisterToast } from './useToast'
import type { ToastItem, ToastAPI, ToastProviderProps, ToastPosition } from './types'

// ─── Container styling ────────────────────────────────────
// One effective class set per position: translate/align/flex-direction
// never compete across entries (phase 6F.2 cascade rule).
const CONTAINER_BASE_CLASSES =
    'fixed z-[2000] flex flex-col gap-2 p-4 pointer-events-none max-w-[400px] w-full [&>*]:pointer-events-auto'

const CONTAINER_POSITION_CLASSES: Record<ToastPosition, string> = {
    'top-right': 'top-0 right-0 items-end',
    'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-0 right-0 items-end flex-col-reverse',
    'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
}

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
                <div className={CONTAINER_BASE_CLASSES + ' ' + CONTAINER_POSITION_CLASSES[position]}>
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
