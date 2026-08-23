import styles from './FilterBar.module.css';

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
        <div className={styles.bar}>
            <span className={styles.text}>{label}</span>
            <button
                className={styles.clearBtn}
                onClick={onClearAll}
            >
                {clearLabel}
            </button>
        </div>
    );
}
