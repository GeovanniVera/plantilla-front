import type { ReactNode } from 'react'

/** Props que recibe el renderHeader de una columna con filtro */
export interface FilterHeaderProps {
    header: string
    hasFilter: boolean
    uniqueValues: string[]
    selectedValues: Set<string>
    onFilterChange: (selected: Set<string>) => void
    onFilterClear: () => void
}

/** Definición de una columna de la tabla */
export interface Column<T> {
    /** Clave del objeto a mostrar */
    key: string
    /** Título de la cabecera */
    header: string
    /** Ancho mínimo de la columna */
    minWidth?: string
    /** Ancho fijo de la columna */
    width?: string
    /** Alineación del contenido */
    align?: 'left' | 'center' | 'right'
    /** Renderizado personalizado del contenido de la celda */
    render?: (value: unknown, row: T, index: number) => ReactNode
    /** Renderizado personalizado del header (para inyectar filtros) */
    renderHeader?: (props?: FilterHeaderProps) => ReactNode
}

/** Props del componente Table */
export interface TableProps<T> {
    columns: Column<T>[]
    data: T[]
    keyExtractor: (row: T, index: number) => string | number
    renderRow?: (row: T, index: number) => ReactNode
    emptyState?: ReactNode
    emptyTitle?: string
    emptyDescription?: string
    onRowClick?: (row: T, index: number) => void
    loading?: boolean
}
