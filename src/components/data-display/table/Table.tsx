import type { TableProps } from './types'
import styles from './Table.module.css'

/** Mapping de nombres de clase a CSS module classes */
const ROW_CLASS_MAP: Record<string, string> = {
    rowDanger: styles.rowDanger,
    rowWarning: styles.rowWarning,
    rowSuccess: styles.rowSuccess,
    rowInfo: styles.rowInfo,
}

function getCellValue(row: unknown, key: string): unknown {
    return (row as Record<string, unknown>)[key]
}

export default function Table<T extends object>({
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
}: TableProps<T>) {
    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={styles.th}
                                style={{
                                    minWidth: col.minWidth,
                                    width: col.width,
                                    textAlign: col.align ?? 'left',
                                }}
                            >
                                {col.renderHeader ? col.renderHeader() : col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className={styles.td}>
                                <div className={styles.empty}>
                                    {emptyState ?? (
                                        <>
                                            <div className={styles.emptyIcon}>∅</div>
                                            <p className={styles.emptyTitle}>{emptyTitle}</p>
                                            <p className={styles.emptyDesc}>{emptyDescription}</p>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, rowIndex) => {
                            const rawClass = rowClassName?.(row, rowIndex)
                            const conditionalClass = rawClass ? ROW_CLASS_MAP[rawClass] ?? rawClass : undefined
                            const conditionalStyle = rowStyle?.(row, rowIndex)

                            return (
                                <tr
                                    key={keyExtractor(row, rowIndex)}
                                    className={`${styles.tr} ${onRowClick ? styles.clickable : ''} ${conditionalClass ?? ''}`}
                                    style={{
                                        ...conditionalStyle,
                                        ...(rowHeight ? { height: rowHeight } : {}),
                                    }}
                                    onClick={() => onRowClick?.(row, rowIndex)}
                                    onDoubleClick={() => onRowDoubleClick?.(row, rowIndex)}
                                    onKeyDown={onRowClick ? (e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault()
                                            onRowClick(row, rowIndex)
                                        }
                                    } : undefined}
                                    role={onRowClick ? 'button' : undefined}
                                    tabIndex={onRowClick ? 0 : undefined}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={styles.td}
                                            style={{
                                                textAlign: col.align ?? 'left',
                                                ...(rowHeight ? { height: rowHeight, padding: '0 14px' } : {}),
                                            }}
                                        >
                                            {col.render
                                                ? col.render(getCellValue(row, col.key), row, rowIndex)
                                                : String(getCellValue(row, col.key) ?? '')}
                                        </td>
                                    ))}
                                </tr>
                            )
                        })
                    )}
                </tbody>
            </table>
        </div>
    )
}
