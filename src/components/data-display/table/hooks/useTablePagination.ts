import { useState, useMemo, useCallback } from 'react'

export interface UseTablePaginationReturn {
    /** Página actual (1-indexed) */
    currentPage: number
    /** Total de páginas */
    totalPages: number
    /** Items por página */
    pageSize: number
    /** Ir a una página */
    goToPage: (page: number) => void
    /** Ir a la siguiente página */
    nextPage: () => void
    /** Ir a la página anterior */
    prevPage: () => void
    /** Cambiar tamaño de página */
    setPageSize: (size: number) => void
    /** Total de items (post-filtrado) */
    totalItems: number
    /** Índice de inicio del slice (0-indexed) */
    startIndex: number
    /** Índice de fin del slice (0-indexed, exclusive) */
    endIndex: number
}

/**
 * Hook que encapsula la lógica de paginación client-side.
 * Recibe la cantidad total de items (ya filtrados) y devuelve
 * los índices de slice para que el componente haga data.slice().
 *
 * @param totalItems - Total de items (post-filtrado)
 * @param initialPageSize - Items por página (default 10)
 */
export function useTablePagination(
    totalItems: number,
    initialPageSize: number = 10,
): UseTablePaginationReturn {
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSizeState] = useState(initialPageSize)

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    // Clamp si el total de items cambia y la página actual queda fuera de rango
    const clampedPage = Math.min(currentPage, totalPages)
    if (clampedPage !== currentPage) {
        setCurrentPage(clampedPage)
    }

    const goToPage = useCallback((page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)))
    }, [totalPages])

    const nextPage = useCallback(() => {
        setCurrentPage((p) => Math.min(p + 1, totalPages))
    }, [totalPages])

    const prevPage = useCallback(() => {
        setCurrentPage((p) => Math.max(p - 1, 1))
    }, [])

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size)
        setCurrentPage(1) // Reset a página 1 al cambiar tamaño
    }, [])

    const { startIndex, endIndex } = useMemo(() => {
        const start = (clampedPage - 1) * pageSize
        return { startIndex: start, endIndex: start + pageSize }
    }, [clampedPage, pageSize])

    return {
        currentPage: clampedPage,
        totalPages,
        pageSize,
        goToPage,
        nextPage,
        prevPage,
        setPageSize,
        totalItems,
        startIndex,
        endIndex,
    }
}
