import { LuCheck, LuX } from 'react-icons/lu'

export interface BulkAction {
    label: string
    icon: typeof LuCheck
    onClick: () => void
    variant?: 'default' | 'danger'
}

interface BulkActionsBarProps {
    selectedCount: number
    totalCount: number
    onSelectAll: () => void
    onClearSelection: () => void
    actions?: BulkAction[]
}

export function BulkActionsBar({
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    actions = [],
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)',
            borderRadius: '8px',
            gap: '12px',
        }}>
            {/* Left: Selection info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                }}>
                    {selectedCount} de {totalCount} seleccionados
                </span>

                <button
                    onClick={onSelectAll}
                    style={{
                        padding: '3px 8px',
                        borderRadius: '5px',
                        border: '1px solid var(--accent-border)',
                        background: 'transparent',
                        color: 'var(--accent)',
                        fontSize: '11px',
                        fontFamily: 'var(--sans)',
                        cursor: 'pointer',
                        transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--accent)'
                        e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--accent)'
                    }}
                >
                    Seleccionar todo ({totalCount})
                </button>

                <button
                    onClick={onClearSelection}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '5px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        fontSize: '11px',
                        fontFamily: 'var(--sans)',
                        cursor: 'pointer',
                        opacity: 0.6,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.6'
                    }}
                >
                    <LuX size={12} />
                    Limpiar
                </button>
            </div>

            {/* Right: Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {actions.map((action, i) => {
                    const Icon = action.icon
                    const isDanger = action.variant === 'danger'
                    return (
                        <button
                            key={i}
                            onClick={action.onClick}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: `1px solid ${isDanger ? 'rgba(239, 68, 68, 0.3)' : 'var(--accent-border)'}`,
                                background: isDanger ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                                color: isDanger ? '#dc2626' : 'var(--accent)',
                                fontSize: '12px',
                                fontFamily: 'var(--sans)',
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'background 0.12s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = isDanger ? 'rgba(239, 68, 68, 0.15)' : 'var(--accent)'
                                e.currentTarget.style.color = isDanger ? '#dc2626' : '#fff'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = isDanger ? 'rgba(239, 68, 68, 0.08)' : 'transparent'
                                e.currentTarget.style.color = isDanger ? '#dc2626' : 'var(--accent)'
                            }}
                        >
                            <Icon size={13} />
                            {action.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
