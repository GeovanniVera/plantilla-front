import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'

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

/* Active/disabled resolved as single effective class sets per state.
 * Arrow buttons compute their full class string from props instead of
 * relying on enabled:/disabled: variants (hotfix 6I: restores legacy
 * hover/colors deterministically across environments). */
const ROOT_CLASSES = 'flex items-center justify-between px-4 py-3 gap-4'
const INFO_CLASSES = 'text-[13px] text-foreground whitespace-nowrap'
const CONTROLS_CLASSES = 'flex items-center gap-1'

function arrowClasses(disabled: boolean) {
    return disabled
        ? 'flex items-center justify-center size-8 rounded-md border border-border-base bg-background text-foreground opacity-35 cursor-not-allowed'
        : 'flex items-center justify-center size-8 rounded-md border border-border-base bg-background text-foreground cursor-pointer transition-colors duration-150 hover:bg-accent-subtle hover:border-accent-line hover:text-accent'
}

const PAGE_BTN_BASE_CLASSES =
    'flex items-center justify-center min-w-8 h-8 px-2 rounded-md border text-[13px] font-medium font-sans cursor-pointer transition-colors duration-150'
const PAGE_ACTIVE_CLASSES = 'border-accent bg-accent text-white font-semibold hover:brightness-110'
const PAGE_INACTIVE_CLASSES = 'border-transparent bg-transparent text-foreground hover:bg-accent-subtle hover:text-accent'

const DOTS_CLASSES = 'flex items-center justify-center w-8 h-8 text-sm text-foreground opacity-50'

const PAGE_SIZE_SELECT_CLASSES =
    'h-8 px-2 rounded-md border border-border-base bg-background text-foreground text-[13px] font-sans cursor-pointer outline-none ml-2 transition-colors duration-150 ease-in-out hover:border-accent-line focus:border-accent'

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
        <div className={ROOT_CLASSES}>
            {/* Info de registros */}
            {totalItems !== undefined && pageSize !== undefined && (
                <span className={INFO_CLASSES}>
                    {totalItems} registros · Página {currentPage} de {totalPages}
                </span>
            )}

            <div className={CONTROLS_CLASSES}>
                {/* Navegación de páginas — solo si hay más de 1 */}
                {hasNavigation && (
                    <>
                        <button
                            className={arrowClasses(currentPage === 1)}
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Página anterior"
                        >
                            <LuChevronLeft size={16} />
                        </button>

                        {visiblePages.map((page, i) =>
                            page === '...' ? (
                                <span key={`dots-${i}`} className={DOTS_CLASSES}>…</span>
                            ) : (
                                <button
                                    key={page}
                                    className={`${PAGE_BTN_BASE_CLASSES} ${page === currentPage ? PAGE_ACTIVE_CLASSES : PAGE_INACTIVE_CLASSES}`}
                                    onClick={() => onPageChange(page)}
                                    aria-label={`Página ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )
                        )}

                        <button
                            className={arrowClasses(currentPage === totalPages)}
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
                        className={PAGE_SIZE_SELECT_CLASSES}
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
