import { LuChevronRight, LuEllipsis } from 'react-icons/lu'
import type { BreadcrumbProps } from './types'

// ─── Default separator icon ───────────────────────────────
function DefaultSeparator() {
    return <LuChevronRight size={14} className="text-foreground opacity-35 shrink-0" />
}

// ─── Component ────────────────────────────────────────────
export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
    const sep = separator === undefined ? <DefaultSeparator /> : separator === '/' || separator === '>' || separator === '›'
        ? <span className="text-foreground opacity-35 font-medium select-none">{separator}</span>
        : separator

    // If more than 3 items, collapse middle ones
    const shouldCollapse = items.length > 3
    const firstItem = items[0]
    const lastItem = items[items.length - 1]
    const middleItems = items.slice(1, -1)

    const linkClasses =
        'inline-flex items-center gap-1 text-foreground no-underline px-1 py-0.5 rounded-sm transition-colors duration-150 hover:text-accent hover:bg-accent-subtle'
    const currentClasses = 'inline-flex items-center gap-1 text-heading font-semibold px-1 py-0.5'
    const itemIconClasses = 'flex items-center opacity-70'

    return (
        <nav className={`text-[13px] ${className ?? ''}`} aria-label="Breadcrumb">
            <ol className="flex items-center flex-wrap gap-1 list-none m-0 p-0">
                {/* First item */}
                <li className="inline-flex items-center gap-1">
                    {firstItem.href ? (
                        <a href={firstItem.href} className={linkClasses}>
                            {firstItem.icon && <span className={itemIconClasses}>{firstItem.icon}</span>}
                            {firstItem.label}
                        </a>
                    ) : (
                        <span className={currentClasses}>
                            {firstItem.icon && <span className={itemIconClasses}>{firstItem.icon}</span>}
                            {firstItem.label}
                        </span>
                    )}
                </li>

                {/* Collapsed middle or individual items */}
                {shouldCollapse ? (
                    <>
                        <li className="inline-flex items-center gap-1" aria-hidden="true">{sep}</li>
                        <li className="inline-flex items-center gap-1">
                            <button
                                className="inline-flex items-center justify-center px-1.5 py-0.5 border-none bg-transparent text-foreground cursor-pointer rounded-sm transition-colors duration-150 hover:bg-accent-subtle hover:text-accent"
                                title={middleItems.map((i) => i.label).join(', ')}
                            >
                                <LuEllipsis size={16} />
                            </button>
                        </li>
                    </>
                ) : (
                    middleItems.map((item, i) => (
                        <li key={i} className="inline-flex items-center gap-1">
                            <span aria-hidden="true">{sep}</span>
                            {item.href ? (
                                <a href={item.href} className={linkClasses}>
                                    {item.icon && <span className={itemIconClasses}>{item.icon}</span>}
                                    {item.label}
                                </a>
                            ) : (
                                <span className={currentClasses}>
                                    {item.icon && <span className={itemIconClasses}>{item.icon}</span>}
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))
                )}

                {/* Last item (always text, never a link) */}
                {items.length > 1 && (
                    <li className="inline-flex items-center gap-1">
                        <span aria-hidden="true">{sep}</span>
                        <span className={currentClasses} aria-current="page">
                            {lastItem.icon && <span className={itemIconClasses}>{lastItem.icon}</span>}
                            {lastItem.label}
                        </span>
                    </li>
                )}
            </ol>
        </nav>
    )
}
