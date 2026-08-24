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

/* Danger action colors consume the semantic danger tokens (exact match
 * with the previous literals: .3 border = --danger-line, .08 bg =
 * danger-strong/8, #dc2626 = --danger-strong). */
const BAR_CLASSES =
    'flex items-center justify-between px-3.5 py-2 bg-accent-subtle border border-accent-line rounded-md gap-3'

const INFO_TEXT_CLASSES = 'text-[13px] font-semibold text-accent'

const SELECT_ALL_BTN_CLASSES =
    'px-2 py-[3px] rounded-[5px] border border-accent-line bg-transparent text-accent text-[11px] font-sans cursor-pointer transition-colors duration-150 hover:bg-accent hover:text-white'

const CLEAR_BTN_CLASSES =
    'flex items-center gap-1 px-2 py-[3px] rounded-[5px] border-none bg-transparent text-foreground text-[11px] font-sans cursor-pointer opacity-60 transition-opacity duration-150 hover:opacity-100'

function actionClasses(isDanger: boolean) {
    return [
        'flex items-center gap-[5px] px-2.5 py-[5px] rounded-sm border text-xs font-sans font-medium cursor-pointer transition-colors duration-150',
        isDanger
            ? 'border-danger-line bg-danger-strong/8 text-danger-strong hover:bg-danger-strong/15'
            : 'border-accent-line bg-transparent text-accent hover:bg-accent hover:text-white',
    ].join(' ')
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
        <div className={BAR_CLASSES}>
            {/* Left: Selection info */}
            <div className="flex items-center gap-2.5">
                <span className={INFO_TEXT_CLASSES}>
                    {selectedCount} de {totalCount} seleccionados
                </span>

                <button onClick={onSelectAll} className={SELECT_ALL_BTN_CLASSES}>
                    Seleccionar todo ({totalCount})
                </button>

                <button onClick={onClearSelection} className={CLEAR_BTN_CLASSES}>
                    <LuX size={12} />
                    Limpiar
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5">
                {actions.map((action, i) => {
                    const Icon = action.icon
                    return (
                        <button key={i} onClick={action.onClick} className={actionClasses(action.variant === 'danger')}>
                            <Icon size={13} />
                            {action.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
