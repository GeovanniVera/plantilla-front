import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import styles from './Pagination.module.css'

export interface PaginationProps {
    /** Página actual (1-indexed) */
    currentPage: number
    /** Total de páginas */
    totalPages: number
    /** Callback al cambiar de página */
    onPageChange: (page: number) => void
    /** Mostrar información de registros */
    totalItems?: number
    /** Items por página */
    pageSize?: number
    /** Callback al cambiar items por página */
    onPageSizeChange?: (size: number) => void
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize,
    onPageSizeChange,
}: PaginationProps) {
    // Si solo hay 1 página y no hay selector de page size, no mostrar nada
    if (totalPages <= 1 && !onPageSizeChange) return null

    // Generar páginas visibles
    const getVisiblePages = (): (number | '...')[] => {
        const pages: (number | '...')[] = []
        const maxVisible = 5

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
            return pages
        }

        pages.push(1)

        if (currentPage > 3) pages.push('...')

        const start = Math.max(2, currentPage - 1)
        const end = Math.min(totalPages - 1, currentPage + 1)
        for (let i = start; i <= end; i++) pages.push(i)

        if (currentPage < totalPages - 2) pages.push('...')

        pages.push(totalPages)

        return pages
    }

    const visiblePages = getVisiblePages()
    const hasNavigation = totalPages > 1

    return (
        <div className={styles.pagination}>
            {/* Info de registros */}
            {totalItems !== undefined && pageSize !== undefined && (
                <span className={styles.info}>
                    {totalItems} registros · Página {currentPage} de {totalPages}
                </span>
            )}

            <div className={styles.controls}>
                {/* Navegación de páginas — solo si hay más de 1 */}
                {hasNavigation && (
                    <>
                        <button
                            className={styles.btn}
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Página anterior"
                        >
                            <LuChevronLeft size={16} />
                        </button>

                        {visiblePages.map((page, i) =>
                            page === '...' ? (
                                <span key={`dots-${i}`} className={styles.dots}>…</span>
                            ) : (
                                <button
                                    key={page}
                                    className={`${styles.pageBtn} ${page === currentPage ? styles.pageActive : ''}`}
                                    onClick={() => onPageChange(page)}
                                    aria-label={`Página ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        <button
                            className={styles.btn}
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Página siguiente"
                        >
                            <LuChevronRight size={16} />
                        </button>
                    </>
                )}

                {/* Selector de page size — siempre visible si hay callback */}
                {onPageSizeChange && (
                    <select
                        className={styles.pageSizeSelect}
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        aria-label="Registros por página"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                )}
            </div>
        </div>
    )
}
