import { LuChevronRight, LuEllipsis } from 'react-icons/lu';
import type { BreadcrumbProps } from './types';

// ─── Default separator icon ───────────────────────────────
function DefaultSeparator() {
  return <LuChevronRight size={14} className="text-foreground shrink-0 opacity-35" />;
}

// ─── Component ────────────────────────────────────────────
export function Breadcrumb({ items, separator, className }: BreadcrumbProps) {
  const sep =
    separator === undefined ? (
      <DefaultSeparator />
    ) : separator === '/' || separator === '>' || separator === '›' ? (
      <span className="text-foreground font-medium opacity-35 select-none">{separator}</span>
    ) : (
      separator
    );

  // If more than 3 items, collapse middle ones
  const shouldCollapse = items.length > 3;
  const firstItem = items[0];
  const lastItem = items[items.length - 1];
  const middleItems = items.slice(1, -1);

  const linkClasses =
    'inline-flex items-center gap-1 text-foreground no-underline px-1 py-0.5 rounded-sm transition-colors duration-150 hover:text-accent hover:bg-accent-subtle';
  const currentClasses = 'inline-flex items-center gap-1 text-heading font-semibold px-1 py-0.5';
  const itemIconClasses = 'flex items-center opacity-70';

  return (
    <nav className={`text-[13px] ${className ?? ''}`} aria-label="Breadcrumb">
      <ol className="m-0 flex list-none flex-wrap items-center gap-1 p-0">
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
            <li className="inline-flex items-center gap-1" aria-hidden="true">
              {sep}
            </li>
            <li className="inline-flex items-center gap-1">
              <button
                className="text-foreground hover:bg-accent-subtle hover:text-accent inline-flex cursor-pointer items-center justify-center rounded-sm border-none bg-transparent px-1.5 py-0.5 transition-colors duration-150"
                title={middleItems.map((i) => i.label).join(', ')}
              >
                <LuEllipsis size={16} />
              </button>
            </li>
          </>
        ) : (
          middleItems.map((item) => (
            <li key={item.href ?? item.label} className="inline-flex items-center gap-1">
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
  );
}
