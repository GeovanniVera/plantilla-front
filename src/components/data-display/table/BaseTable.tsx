import type { BaseTableProps } from './types';
import defaultStyles from './BaseTable.module.css';

/** Token → CSS module class mapping for conditional row formatting */
function buildRowClassMap(styles: typeof defaultStyles): Record<string, string | undefined> {
  return {
    rowDanger: styles.rowDanger,
    rowWarning: styles.rowWarning,
    rowSuccess: styles.rowSuccess,
    rowInfo: styles.rowInfo,
  };
}

function getCellValue(row: unknown, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}

/**
 * Shared rendering core of the table family: structure, header loop,
 * row/cell rendering with composition slots, generic row events,
 * conditional formatting and the base empty state.
 * Owns NO editing, selection, pagination or filter logic.
 */
export function BaseTable<T extends object>({
  columns,
  data,
  keyExtractor,
  emptyState,
  emptyTitle = 'Sin datos',
  emptyDescription = 'No hay registros para mostrar.',
  onRowClick,
  onRowDoubleClick,
  rowClassName,
  rowStyle,
  rowHeight,
  styles: styleOverrides,
  leadingColumn,
  composeHeader,
  composeCell,
  wrapperProps,
  tableRef,
}: BaseTableProps<T>) {
  const s = { ...defaultStyles, ...styleOverrides };
  const rowClassMap = buildRowClassMap(s);
  const interactive = onRowClick !== undefined;
  const columnCount = columns.length + (leadingColumn ? 1 : 0);

  const joinClasses = (...classes: Array<string | undefined>): string | undefined => {
    const filtered = classes.filter(Boolean);
    return filtered.length > 0 ? filtered.join(' ') : undefined;
  };

  const resolveRowClassName = (row: T, rowIndex: number): string | undefined => {
    const rawClass = rowClassName?.(row, rowIndex);
    const conditionalClass = rawClass ? (rowClassMap[rawClass] ?? rawClass) : undefined;
    return joinClasses(s.tr, interactive ? s.clickable : undefined, conditionalClass);
  };

  return (
    <div className={s.wrapper} {...wrapperProps}>
      <table ref={tableRef} className={s.table}>
        <thead>
          <tr>
            {leadingColumn && <th className={leadingColumn.className}>{leadingColumn.header}</th>}
            {columns.map((col, columnIndex) => {
              const composed = composeHeader?.({ column: col, columnIndex });
              return (
                <th
                  key={col.key}
                  className={joinClasses(s.th, composed?.className)}
                  style={{
                    minWidth: col.minWidth,
                    width: col.width,
                    ...composed?.style,
                  }}
                >
                  {col.renderHeader ? col.renderHeader() : col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className={s.td}>
                <div className={s.empty}>
                  {emptyState ?? (
                    <>
                      <div className={s.emptyIcon}>∅</div>
                      <p className={s.emptyTitle}>{emptyTitle}</p>
                      <p className={s.emptyDesc}>{emptyDescription}</p>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                className={resolveRowClassName(row, rowIndex)}
                style={{
                  ...rowStyle?.(row, rowIndex),
                  ...(rowHeight ? { height: rowHeight } : {}),
                }}
                onClick={interactive ? () => onRowClick?.(row, rowIndex) : undefined}
                onDoubleClick={
                  onRowDoubleClick ? () => onRowDoubleClick?.(row, rowIndex) : undefined
                }
                onKeyDown={
                  interactive
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick?.(row, rowIndex);
                        }
                      }
                    : undefined
                }
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
              >
                {leadingColumn && (
                  <td className={leadingColumn.className}>{leadingColumn.cell?.(rowIndex)}</td>
                )}
                {columns.map((col, columnIndex) => {
                  const value = getCellValue(row, col.key);
                  const composed = composeCell?.({
                    row,
                    rowIndex,
                    column: col,
                    columnIndex,
                    value,
                  });

                  return (
                    <td
                      key={col.key}
                      className={joinClasses(s.td, composed?.className)}
                      style={{
                        textAlign: col.align ?? 'left',
                        ...(rowHeight ? { height: rowHeight, padding: '0 14px' } : {}),
                        ...composed?.style,
                      }}
                      {...composed?.props}
                    >
                      {composed?.content ??
                        (col.render ? col.render(value, row, rowIndex) : String(value ?? ''))}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
