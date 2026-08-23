import FilterDropdown from './FilterDropdown'
import type { FilterHeaderProps } from '../types'
import styles from './FilterHeader.module.css'

interface FilterHeaderOwnProps {
    label: string
    filterProps: FilterHeaderProps
}

/** Column header label with its filter dropdown — shared by DataTable and ExcelTable */
export function FilterHeader({ label, filterProps }: FilterHeaderOwnProps) {
    return (
        <div className={styles.filterHeader}>
            <span>{label}</span>
            <FilterDropdown
                header={filterProps.header}
                filterType={filterProps.filterType}
                uniqueValues={filterProps.uniqueValues}
                selectedValues={filterProps.selectedValues}
                numericRange={filterProps.numericRange}
                hasFilter={filterProps.hasFilter}
                onChange={filterProps.onFilterChange}
                onNumericChange={filterProps.onNumericChange}
                onClear={filterProps.onFilterClear}
            />
        </div>
    )
}
