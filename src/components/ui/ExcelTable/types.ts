import type { Column } from '../Table/types'

/** Props del componente ExcelTable */
export interface ExcelTableProps<T extends object> {
    /** Definición de columnas */
    columns: Column<T>[]
    /** Arreglo de datos a mostrar */
    data: T[]
    /** Función para obtener un identificador único por fila */
    keyExtractor: (row: T, index: number) => string | number
    /** Callback cuando se edita una celda — recibe el índice de fila, key de columna y nuevo valor */
    onDataChange?: (rowIndex: number, columnKey: string, value: string) => void
    /** Si la tabla es de solo lectura (deshabilita edición) */
    readOnly?: boolean
    /** Habilitar filtros en cabeceras */
    filters?: boolean
    /** Habilitar paginación */
    pagination?: boolean
    /** Items por página (default 10) */
    pageSize?: number
    /** Clase CSS condicional para filas — formato condicional */
    rowClassName?: (row: T, index: number) => string | undefined
    /** Estilo inline condicional para filas */
    rowStyle?: (row: T, index: number) => React.CSSProperties | undefined
}

/** Posición de una celda en la grilla */
export interface CellPosition {
    row: number
    col: number
}
