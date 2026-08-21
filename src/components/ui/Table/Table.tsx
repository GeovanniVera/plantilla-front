import type { TableProps } from './types'
import styles from './Table.module.css'

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
}: TableProps<T>) {
    // Estado vacío
    if (data.length === 0) {
        return (
            <div className={styles.empty}>
                {emptyState ?? (
                    <>
                        <div className={styles.emptyIcon}>∅</div>
                        <p className={styles.emptyTitle}>{emptyTitle}</p>
                        <p className={styles.emptyDesc}>{emptyDescription}</p>
                    </>
                )}
            </div>
        )
    }



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
                    {data.map((row, rowIndex) => (
                        <tr
                            key={keyExtractor(row, rowIndex)}
                            className={`${styles.tr} ${onRowClick ? styles.clickable : ''}`}
                            onClick={() => onRowClick?.(row, rowIndex)}
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
                                    style={{ textAlign: col.align ?? 'left' }}
                                >
                                    {col.render
                                        ? col.render(getCellValue(row, col.key), row, rowIndex)
                                        : String(getCellValue(row, col.key) ?? '')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
