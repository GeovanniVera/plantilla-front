const BAR_CLASSES =
    'flex items-center justify-between px-4 py-2.5 bg-accent-subtle border border-accent-line rounded-md mb-3'
const TEXT_CLASSES = 'text-[13px] text-accent font-medium'
const CLEAR_BTN_CLASSES =
    'bg-transparent border border-accent-line rounded-sm px-2.5 py-1 text-xs text-accent cursor-pointer transition-colors duration-150 hover:bg-accent hover:text-background'

interface FilterBarProps {
    hasActiveFilters: boolean;
    onClearAll: () => void;
    label?: string;
    clearLabel?: string;
}

export function FilterBar({
    hasActiveFilters,
    onClearAll,
    label = 'Filtros activos',
    clearLabel = 'Limpiar todos',
}: FilterBarProps) {
    if (!hasActiveFilters) return null;

    return (
        <div className={BAR_CLASSES}>
            <span className={TEXT_CLASSES}>{label}</span>
            <button
                className={CLEAR_BTN_CLASSES}
                onClick={onClearAll}
            >
                {clearLabel}
            </button>
        </div>
    );
}
