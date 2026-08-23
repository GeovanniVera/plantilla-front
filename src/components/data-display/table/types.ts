import type { ReactNode } from 'react'

/** Tipos de filtro disponibles */
export type FilterType = 'text' | 'number' | 'boolean' | 'select'

/** Props que recibe el renderHeader de una columna con filtro */
export interface FilterHeaderProps {
    header: string
    hasFilter: boolean
    filterType: FilterType
    uniqueValues: string[]
    selectedValues: Set<string>
    numericRange?: { min?: number; max?: number }
    onFilterChange: (selected: Set<string>) => void
    onNumericChange?: (range: { min?: number; max?: number }) => void
    onFilterClear: () => void
}

/** Definición de una columna de la tabla */
export interface Column<T> {
    /** Clave del objeto a mostrar */
    key: string
    /** Título de la cabecera */
    header: string
    /** Tipo de filtro para esta columna (default: 'text') */
    filterType?: FilterType
    /** Para filterType 'select': opciones válidas (si no se provee, se infiere de los datos) */
    filterOptions?: string[]
    /** Para filterType 'boolean': labels personalizados */
    booleanLabels?: { true?: string; false?: string }
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
    onRowDoubleClick?: (row: T, index: number) => void
    loading?: boolean
    /** Clase CSS condicional para filas — formato condicional */
    rowClassName?: (row: T, index: number) => string | undefined
    /** Estilo inline condicional para filas */
    rowStyle?: (row: T, index: number) => React.CSSProperties | undefined
    /** Altura de las filas (compact: 36px, comfortable: 44px, relaxed: 52px) */
    rowHeight?: string
}
