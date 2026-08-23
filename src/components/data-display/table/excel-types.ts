import type { BaseTableProps } from './types'

/** Props del componente ExcelTable */
export interface ExcelTableProps<T extends object>
    extends Pick<BaseTableProps<T>, 'columns' | 'data' | 'keyExtractor' | 'rowClassName' | 'rowStyle'> {
    /**
     * Callback when a cell edit is committed. `rowIndex` is the index in the
     * ORIGINAL `data` array (resolved internally by matching row identity via
     * keyExtractor), NOT the page-relative display index — so parents patching
     * state by index stay correct even with filters + pagination active.
     * Edits on rows whose key cannot be matched (missing/duplicate) are dropped.
     */
    onDataChange?: (rowIndex: number, columnKey: string, value: string) => void
    /** Si la tabla es de solo lectura (deshabilita edición) */
    readOnly?: boolean
    /** Habilitar filtros en cabeceras */
    filters?: boolean
    /** Habilitar paginación */
    pagination?: boolean
    /** Items por página (default 10) */
    pageSize?: number
}

/** Posición de una celda en la grilla */
export interface CellPosition {
    row: number
    col: number
}
