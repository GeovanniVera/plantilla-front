import { useState, useMemo, useCallback } from 'react'
import type { FilterHeaderProps } from '../types'

export type FilterState = Record<string, Set<string>>

export interface UseTableFiltersReturn<T> {
    /** Datos filtrados */
    filteredData: T[]
    /** Mapa de props de filtro por key de columna — usar con column.renderHeader */
    filterHeaderProps: Record<string, FilterHeaderProps>
    /** Cambiar selección de una columna */
    setFilter: (columnKey: string, selected: Set<string>) => void
    /** Limpiar filtro de una columna */
    clearFilter: (columnKey: string) => void
    /** Limpiar todos los filtros */
    clearAllFilters: () => void
    /** Si hay algún filtro activo */
    hasActiveFilters: boolean
}

/**
 * Hook que encapsula la lógica de filtrado por columnas.
 * Devuelve un mapa de FilterHeaderProps que se inyecta vía column.renderHeader().
 *
 * @param columns - Definición de columnas
 * @param data - Datos originales
 * @param onFilterChange - Callback al cambiar filtros (útil para resetear paginación)
 */
export function useTableFilters<T extends object>(
    columns: Array<{ key: string }>,
    data: T[],
    onFilterChange?: () => void,
): UseTableFiltersReturn<T> {
    const [filters, setFilters] = useState<FilterState>({})

    // Valores únicos por columna
    const uniqueValuesMap = useMemo(() => {
        const map: Record<string, string[]> = {}
        for (const col of columns) {
            const values = new Set(
                data.map((row) => String((row as Record<string, unknown>)[col.key] ?? '')),
            )
            map[col.key] = Array.from(values).sort()
        }
        return map
    }, [columns, data])

    // Datos filtrados
    const filteredData = useMemo(() => {
        return data.filter((row) => {
            for (const [key, selected] of Object.entries(filters)) {
                if (selected.size === 0) continue
                const cellValue = String((row as Record<string, unknown>)[key] ?? '')
                if (!selected.has(cellValue)) return false
            }
            return true
        })
    }, [data, filters])

    // Handlers
    const setFilter = useCallback((columnKey: string, selected: Set<string>) => {
        setFilters((prev) => ({ ...prev, [columnKey]: selected }))
        onFilterChange?.()
    }, [onFilterChange])

    const clearFilter = useCallback((columnKey: string) => {
        setFilters((prev) => {
            const next = { ...prev }
            delete next[columnKey]
            return next
        })
        onFilterChange?.()
    }, [onFilterChange])

    const clearAllFilters = useCallback(() => {
        setFilters({})
        onFilterChange?.()
    }, [onFilterChange])

    const hasActiveFilters = useMemo(
        () => Object.values(filters).some((s) => s.size > 0),
        [filters],
    )

    // Props map — cada columna tiene sus props de filtro listas para renderHeader
    const filterHeaderProps = useMemo(() => {
        const map: Record<string, FilterHeaderProps> = {}
        for (const col of columns) {
            map[col.key] = {
                header: col.key, // Se sobreescribe con el header real al componer
                hasFilter: !!filters[col.key] && filters[col.key].size > 0,
                uniqueValues: uniqueValuesMap[col.key] ?? [],
                selectedValues: filters[col.key] ?? new Set(),
                onFilterChange: (selected) => setFilter(col.key, selected),
                onFilterClear: () => clearFilter(col.key),
            }
        }
        return map
    }, [columns, filters, uniqueValuesMap, setFilter, clearFilter])

    return {
        filteredData,
        filterHeaderProps,
        setFilter,
        clearFilter,
        clearAllFilters,
        hasActiveFilters,
    }
}
