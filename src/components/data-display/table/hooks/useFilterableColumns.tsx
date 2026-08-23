import { useMemo } from 'react'
import { FilterHeader } from '../parts/FilterHeader'
import type { Column, FilterHeaderProps } from '../types'

/**
 * Injects filter dropdowns into column headers via Column.renderHeader.
 * Shared by DataTable and ExcelTable; returns columns untouched when disabled.
 */
export function useFilterableColumns<T extends object>(
    columns: Column<T>[],
    enabled: boolean,
    filterHeaderProps: Record<string, FilterHeaderProps>,
): Column<T>[] {
    return useMemo(() => {
        if (!enabled) return columns

        return columns.map((col) => ({
            ...col,
            renderHeader: () => {
                const fProps = filterHeaderProps[col.key]
                if (!fProps) return col.header
                return <FilterHeader label={col.header} filterProps={fProps} />
            },
        }))
    }, [columns, enabled, filterHeaderProps])
}
