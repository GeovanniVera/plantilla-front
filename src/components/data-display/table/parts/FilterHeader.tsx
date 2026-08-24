import FilterDropdown from './FilterDropdown'
import type { FilterHeaderProps } from '../types'

interface FilterHeaderOwnProps {
    label: string
    filterProps: FilterHeaderProps
}

/** Column header label with its filter dropdown — shared by DataTable and ExcelTable */
export function FilterHeader({ label, filterProps }: FilterHeaderOwnProps) {
    return (
        <div className="flex items-center gap-1.5">
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
