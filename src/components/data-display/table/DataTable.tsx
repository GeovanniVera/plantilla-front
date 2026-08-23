import { useMemo } from 'react'
import Table from './Table'
import FilterDropdown from './parts/FilterDropdown'
import { FilterBar } from './parts/FilterBar'
import Pagination from './parts/Pagination'
import { useTableFilters } from './hooks/useTableFilters'
import { useTablePagination } from './hooks/useTablePagination'
import type { Column, TableProps } from './types'
import styles from './DataTable.module.css'

export interface DataTableProps<T extends object> extends TableProps<T> {
    /** Habilitar filtros en cabeceras */
    filters?: boolean
    /** Habilitar paginación */
    pagination?: boolean
    /** Items por página (default 10) */
    pageSize?: number
}

export default function DataTable<T extends object>({
    columns,
    data,
    keyExtractor,
    filters: enableFilters = false,
    pagination: enablePagination = false,
    pageSize: initialPageSize = 10,
    ...tableProps
}: DataTableProps<T>) {
    // Filtros — solo pasan datos reales si están habilitados
    const {
        filteredData,
        filterHeaderProps,
        clearAllFilters,
        hasActiveFilters,
    } = useTableFilters<T>(
        enableFilters ? columns : [],
        enableFilters ? data : [],
    )

    // Datos a mostrar: filtrados si hay filtros, originales si no
    const baseData = enableFilters ? filteredData : data

    // Paginación
    const pagination = useTablePagination(
        enablePagination ? baseData.length : baseData.length,
        initialPageSize,
    )

    const displayData = enablePagination
        ? baseData.slice(pagination.startIndex, pagination.endIndex)
        : baseData

    // Columnas con filtro inyectado
    const composedColumns: Column<T>[] = useMemo(() => {
        if (!enableFilters) return columns

        return columns.map((col) => ({
            ...col,
            renderHeader: () => {
                const fProps = filterHeaderProps[col.key]
                if (!fProps) return col.header
                return (
                    <div className={styles.filterHeader}>
                        <span>{col.header}</span>
                        <FilterDropdown
                            header={col.header}
                            filterType={fProps.filterType}
                            uniqueValues={fProps.uniqueValues}
                            selectedValues={fProps.selectedValues}
                            numericRange={fProps.numericRange}
                            hasFilter={fProps.hasFilter}
                            onChange={fProps.onFilterChange}
                            onNumericChange={fProps.onNumericChange}
                            onClear={fProps.onFilterClear}
                        />
                    </div>
                )
            },
        }))
    }, [columns, enableFilters, filterHeaderProps])

    return (
        <div className={styles.container}>
            <FilterBar
                hasActiveFilters={enableFilters && hasActiveFilters}
                onClearAll={clearAllFilters}
            />

            <Table
                columns={composedColumns}
                data={displayData}
                keyExtractor={keyExtractor}
                {...tableProps}
            />

            {enablePagination && (
                <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    pageSize={pagination.pageSize}
                    onPageChange={pagination.goToPage}
                    onPageSizeChange={pagination.setPageSize}
                />
            )}
        </div>
    )
}
