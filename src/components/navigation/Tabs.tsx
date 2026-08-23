import { useState, createContext, useContext, useCallback } from 'react'
import styles from './Tabs.module.css'
import type { TabsProps, TabsListProps, TabsTriggerProps, TabsPanelProps, TabsVariant } from './types'

// ─── Context ──────────────────────────────────────────────
interface TabsContextValue {
    activeTab: string
    variant: TabsVariant
    setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
    const ctx = useContext(TabsContext)
    if (!ctx) throw new Error('Tabs.Trigger/Tabs.Panel must be used inside <Tabs>')
    return ctx
}

// ─── Tabs Root ────────────────────────────────────────────
export function Tabs({ value, defaultValue, onChange, variant = 'underline', children, className }: TabsProps) {
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const isControlled = value !== undefined
    const activeTab = isControlled ? value : internalValue

    const setActiveTab = useCallback((v: string) => {
        if (!isControlled) setInternalValue(v)
        onChange?.(v)
    }, [isControlled, onChange])

    return (
        <TabsContext.Provider value={{ activeTab, variant, setActiveTab }}>
            <div className={`${styles.tabs} ${className ?? ''}`}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

// ─── Tabs.List ────────────────────────────────────────────
Tabs.List = function TabsList({ children, className }: TabsListProps) {
    const { variant } = useTabsContext()
    return (
        <div className={`${styles.list} ${styles[`list_${variant}`]} ${className ?? ''}`} role="tablist">
            {children}
        </div>
    )
}

// ─── Tabs.Trigger ─────────────────────────────────────────
Tabs.Trigger = function TabsTrigger({ value, children, icon, disabled, className }: TabsTriggerProps) {
    const { activeTab, variant, setActiveTab } = useTabsContext()
    const isActive = activeTab === value

    return (
        <button
            className={`${styles.trigger} ${styles[`trigger_${variant}`]} ${isActive ? styles.triggerActive : ''} ${disabled ? styles.triggerDisabled : ''} ${className ?? ''}`}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${value}`}
            id={`tab-${value}`}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => !disabled && setActiveTab(value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    if (!disabled) setActiveTab(value)
                }
            }}
        >
            {icon && <span className={styles.triggerIcon}>{icon}</span>}
            {children}
        </button>
    )
}

// ─── Tabs.Panel ───────────────────────────────────────────
Tabs.Panel = function TabsPanel({ value, children, className }: TabsPanelProps) {
    const { activeTab } = useTabsContext()
    if (activeTab !== value) return null
    return (
        <div
            className={`${styles.panel} ${className ?? ''}`}
            role="tabpanel"
            id={`tabpanel-${value}`}
            aria-labelledby={`tab-${value}`}
        >
            {children}
        </div>
    )
}
