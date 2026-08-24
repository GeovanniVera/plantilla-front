import { useCallback } from 'react'
import { BaseTable } from './BaseTable'
import { FilterBar } from './parts/FilterBar'
import Pagination from './parts/Pagination'
import { useFilterableColumns } from './hooks/useFilterableColumns'
import { useTableFilters } from './hooks/useTableFilters'
import { useTablePagination } from './hooks/useTablePagination'
import type { BaseTableProps, Column } from './types'

export interface DataTableProps<T extends object> extends BaseTableProps<T> {
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
    // baseData is already the filtered dataset when filters are enabled
    const pagination = useTablePagination(baseData.length, initialPageSize)

    const displayData = enablePagination
        ? baseData.slice(pagination.startIndex, pagination.endIndex)
        : baseData

    // Columnas con filtro inyectado
    const composedColumns = useFilterableColumns(columns, enableFilters, filterHeaderProps)

    // BaseTable leaves header text alignment to variants — DataTable applies column align
    const composeHeader = useCallback(({ column }: { column: Column<T> }) => ({
        style: { textAlign: column.align ?? 'left' },
    }), [])

    return (
        <div className="flex flex-col gap-3">
            <FilterBar
                hasActiveFilters={enableFilters && hasActiveFilters}
                onClearAll={clearAllFilters}
            />

            <BaseTable
                columns={composedColumns}
                data={displayData}
                keyExtractor={keyExtractor}
                composeHeader={composeHeader}
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
