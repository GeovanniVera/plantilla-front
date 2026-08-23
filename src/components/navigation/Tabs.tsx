import { useState, createContext, useContext, useCallback } from 'react'
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

// ─── Styling ──────────────────────────────────────────────
// Variant styles resolved to single effective class sets per state —
// hover classes are only attached when the trigger is neither active
// nor disabled (replaces the legacy :not() selector chains).
const ROOT_CLASSES = 'flex flex-col'

const LIST_BASE_CLASSES = 'flex items-center gap-0.5'
const LIST_VARIANT_CLASSES: Record<TabsVariant, string> = {
    underline: 'border-b border-border-base',
    pills: 'bg-surface rounded-[10px] p-[3px] gap-1',
    enclosed: 'gap-0',
}

const TRIGGER_BASE_CLASSES =
    'relative inline-flex items-center gap-1.5 px-4 py-2.5 border-none bg-transparent text-[13px] font-medium font-sans text-foreground cursor-pointer whitespace-nowrap transition-[color,background-color,border-color] duration-150 focus-visible:outline-2 focus-visible:outline-accent focus-visible:-outline-offset-2 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed'

const TRIGGER_ACTIVE_CLASSES = 'text-accent font-semibold'
const TRIGGER_HOVER_CLASSES = 'hover:text-heading hover:bg-black/3'

const TRIGGER_VARIANT_CLASSES: Record<TabsVariant, { base: string; active: string; hover: string }> = {
    underline: {
        base: 'border-b-2 border-transparent -mb-px',
        active: 'border-accent',
        hover: 'hover:bg-black/3',
    },
    pills: {
        base: 'rounded-md',
        active: 'bg-background shadow-[0_1px_3px_rgba(0,0,0,0.08)]',
        hover: 'hover:bg-black/4',
    },
    enclosed: {
        base: 'border border-border-base border-b-0 rounded-t-md -mb-px bg-surface',
        active: 'bg-background',
        hover: 'hover:bg-black/3',
    },
}

const PANEL_CLASSES = 'py-4 animate-tabs-panel'

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
            <div className={`${ROOT_CLASSES} ${className ?? ''}`}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

// ─── Tabs.List ────────────────────────────────────────────
Tabs.List = function TabsList({ children, className }: TabsListProps) {
    const { variant } = useTabsContext()
    return (
        <div className={`${LIST_BASE_CLASSES} ${LIST_VARIANT_CLASSES[variant]} ${className ?? ''}`} role="tablist">
            {children}
        </div>
    )
}

// ─── Tabs.Trigger ─────────────────────────────────────────
Tabs.Trigger = function TabsTrigger({ value, children, icon, disabled, className }: TabsTriggerProps) {
    const { activeTab, variant, setActiveTab } = useTabsContext()
    const isActive = activeTab === value
    const v = TRIGGER_VARIANT_CLASSES[variant]

    // Single effective state class set: active > disabled-hover > hover
    const stateClasses = isActive
        ? `${TRIGGER_ACTIVE_CLASSES} ${v.active}`
        : disabled
            ? ''
            : `${TRIGGER_HOVER_CLASSES} ${v.hover}`

    return (
        <button
            className={`${TRIGGER_BASE_CLASSES} ${v.base} ${stateClasses} ${className ?? ''}`}
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
            {icon && <span className="flex items-center">{icon}</span>}
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
            className={`${PANEL_CLASSES} ${className ?? ''}`}
            role="tabpanel"
            id={`tabpanel-${value}`}
            aria-labelledby={`tab-${value}`}
        >
            {children}
        </div>
    )
}
