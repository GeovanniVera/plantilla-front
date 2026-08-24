import { useState, useMemo, useCallback } from 'react'

export interface UseTablePaginationReturn {
    /** Página actual efectiva (1-indexed, nunca > totalPages ni < 1) */
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
 *
 * The stored page may temporarily exceed totalPages when data/filters
 * shrink the dataset; the EFFECTIVE page is derived as
 * min(max(1, stored), totalPages) — pure computation, no setState during
 * render (hotfix 7D). Empty datasets yield totalPages = 1 and are valid.
 *
 * @param totalItems - Total de items (ya filtrados)
 * @param initialPageSize - Items por página (default 10)
 */
export function useTablePagination(
    totalItems: number,
    initialPageSize: number = 10,
): UseTablePaginationReturn {
    const [storedPage, setStoredPage] = useState(1)
    const [pageSize, setPageSizeState] = useState(initialPageSize)

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

    // Derived, never mutated during render.
    const effectivePage = Math.min(Math.max(1, storedPage), totalPages)

    const goToPage = useCallback((page: number) => {
        setStoredPage(Math.max(1, Math.min(page, totalPages)))
    }, [totalPages])

    // Navigation bases itself on the effective page so a stored out-of-range
    // page can't produce out-of-range jumps.
    const nextPage = useCallback(() => {
        setStoredPage(Math.min(effectivePage + 1, totalPages))
    }, [effectivePage, totalPages])

    const prevPage = useCallback(() => {
        setStoredPage(Math.max(effectivePage - 1, 1))
    }, [effectivePage])

    const setPageSize = useCallback((size: number) => {
        setPageSizeState(size)
        setStoredPage(1) // Reset a página 1 al cambiar tamaño
    }, [])

    const { startIndex, endIndex } = useMemo(() => {
        const start = (effectivePage - 1) * pageSize
        return { startIndex: start, endIndex: start + pageSize }
    }, [effectivePage, pageSize])

    return {
        currentPage: effectivePage,
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
