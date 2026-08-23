import { useState, useMemo } from 'react'
import DataTable from '../components/ui/Table/DataTable'
import { DensitySelector, type Density } from '../components/ui/Table/DensitySelector'
import { BulkActionsBar } from '../components/ui/Table/BulkActionsBar'
import { ColumnToggle } from '../components/ui/Table/ColumnToggle'
import { SearchHighlight } from '../components/ui/Table/SearchHighlight'
import { Drawer } from '../components/ui/Modal'
import { LuCheck, LuDownload, LuEye, LuTriangleAlert, LuOctagonAlert, LuInfo } from 'react-icons/lu'
import { StatCard, StatCardGroup } from '../components/ui/StatCard'
import { auditLogs, auditColumns, type AuditLog } from './auditoria-data'
import styles from './TablesShowcase.module.css'

const BASE_COLUMNS = [
    { key: 'timestamp', header: 'Fecha/Hora' },
    { key: 'user', header: 'Usuario' },
    { key: 'action', header: 'Acción' },
    { key: 'resource', header: 'Recurso' },
    { key: 'ip', header: 'IP' },
    { key: 'severity', header: 'Severidad' },
    { key: 'reviewed', header: 'Revisado' },
]

const DENSITY_MAP: Record<Density, string> = {
    compact: '36px',
    comfortable: '44px',
    relaxed: '52px',
}

export default function Auditoria() {
    const [data, setData] = useState(auditLogs)
    const [density, setDensity] = useState<Density>('comfortable')
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
    const [search, setSearch] = useState('')
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
        new Set(BASE_COLUMNS.map((c) => c.key)),
    )
    const [detailsLog, setDetailsLog] = useState<AuditLog | null>(null)

    const filteredData = useMemo(() => {
        if (!search) return data
        const q = search.toLowerCase()
        return data.filter((log) =>
            log.user.toLowerCase().includes(q) ||
            log.action.toLowerCase().includes(q) ||
            log.resource.toLowerCase().includes(q) ||
            log.ip.toLowerCase().includes(q) ||
            log.severity.toLowerCase().includes(q),
        )
    }, [data, search])

    const columns = useMemo(() => {
        return auditColumns.filter((col) => visibleColumns.has(col.key))
    }, [visibleColumns])

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const selectAll = () => setSelectedIds(new Set(filteredData.map((l) => l.id)))
    const clearSelection = () => setSelectedIds(new Set())

    const markAsReviewed = () => {
        setData((prev) => prev.map((log) => selectedIds.has(log.id) ? { ...log, reviewed: true } : log))
        setSelectedIds(new Set())
    }

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const showAllColumns = () => setVisibleColumns(new Set(BASE_COLUMNS.map((c) => c.key)))

    const criticalCount = data.filter((l) => l.severity === 'critical' && !l.reviewed).length
    const highCount = data.filter((l) => l.severity === 'high' && !l.reviewed).length
    const unreviewedCount = data.filter((l) => !l.reviewed).length

    // Columna de acciones — botón "Ver"
    const actionColumn = {
        key: '__actions',
        header: '',
        width: '48px',
        align: 'center' as const,
        render: (_value: unknown, row: AuditLog) => (
            <button
                onClick={(e) => { e.stopPropagation(); setDetailsLog(row) }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    background: 'transparent',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    opacity: 0.4,
                    transition: 'opacity 0.12s, background 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1'
                    e.currentTarget.style.background = 'var(--accent-bg)'
                    e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.4'
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text)'
                }}
                title="Ver detalles"
            >
                <LuEye size={14} />
            </button>
        ),
    }

    // Columnas finales: acciones al final
    const finalColumns = useMemo(() => [...columns, actionColumn], [columns])

    // Severity color map
    const severityColor = (s: string) =>
        s === 'critical' ? '#dc2626' : s === 'high' ? '#d97706' : s === 'medium' ? '#2563eb' : '#6b7280'

    return (
        <div className={styles.page}>
            {/* Resumen */}
            <StatCardGroup>
                <StatCard value={criticalCount} label="Críticos sin revisar" accent="#dc2626" icon={LuTriangleAlert} />
                <StatCard value={highCount} label="Altos sin revisar" accent="#d97706" icon={LuOctagonAlert} />
                <StatCard value={unreviewedCount} label="Total sin revisar" accent="#2563eb" icon={LuInfo} />
            </StatCardGroup>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <SearchHighlight value={search} onChange={setSearch} placeholder="Buscar usuario, acción, IP..." resultCount={filteredData.length} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ColumnToggle columns={BASE_COLUMNS.map((c) => ({ ...c, visible: visibleColumns.has(c.key) }))} onToggle={toggleColumn} onShowAll={showAllColumns} />
                    <DensitySelector value={density} onChange={setDensity} />
                </div>
            </div>

            {/* Bulk actions */}
            <BulkActionsBar
                selectedCount={selectedIds.size}
                totalCount={filteredData.length}
                onSelectAll={selectAll}
                onClearSelection={clearSelection}
                actions={[
                    { label: 'Marcar revisado', icon: LuCheck, onClick: markAsReviewed },
                    { label: 'Exportar', icon: LuDownload, onClick: () => console.log('Export:', Array.from(selectedIds)) },
                ]}
            />

            {/* Tabla */}
            <div style={{ marginTop: selectedIds.size > 0 ? '8px' : '0' }}>
                <DataTable
                    columns={finalColumns}
                    data={filteredData}
                    keyExtractor={(row) => row.id}
                    filters
                    pagination
                    pageSize={10}
                    rowHeight={DENSITY_MAP[density]}
                    rowClassName={(row) => {
                        if (row.severity === 'critical' && !row.reviewed) return 'rowDanger'
                        if (row.severity === 'high' && !row.reviewed) return 'rowWarning'
                        return undefined
                    }}
                    onRowClick={(row) => toggleSelect(row.id)}
                />
            </div>

            {/* Drawer de detalles */}
            <Drawer isOpen={!!detailsLog} onClose={() => setDetailsLog(null)} width={380}>
                <Drawer.Header title={detailsLog ? `Log #${detailsLog.id}` : ''} />
                <Drawer.Body>
                    {detailsLog && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: 'Timestamp', value: detailsLog.timestamp },
                                { label: 'Usuario', value: detailsLog.user },
                                { label: 'Acción', value: detailsLog.action },
                                { label: 'Recurso', value: detailsLog.resource },
                                { label: 'IP', value: detailsLog.ip },
                            ].map((field) => (
                                <div key={field.label}>
                                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text)', opacity: 0.5, marginBottom: '4px' }}>
                                        {field.label}
                                    </div>
                                    <div style={{
                                        padding: '8px 10px',
                                        borderRadius: '6px',
                                        background: 'var(--code-bg)',
                                        border: '1px solid var(--border)',
                                        fontSize: '13px',
                                        fontFamily: 'var(--mono)',
                                        color: 'var(--text)',
                                        wordBreak: 'break-all',
                                    }}>
                                        {field.value}
                                    </div>
                                </div>
                            ))}

                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text)', opacity: 0.5, marginBottom: '4px' }}>
                                    Severidad
                                </div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: `${severityColor(detailsLog.severity)}15`,
                                    border: `1px solid ${severityColor(detailsLog.severity)}30`,
                                }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: severityColor(detailsLog.severity) }} />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: severityColor(detailsLog.severity) }}>
                                        {detailsLog.severity.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text)', opacity: 0.5, marginBottom: '4px' }}>
                                    Revisado
                                </div>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    background: detailsLog.reviewed ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                    border: `1px solid ${detailsLog.reviewed ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: detailsLog.reviewed ? '#22c55e' : '#ef4444' }} />
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: detailsLog.reviewed ? '#16a34a' : '#dc2626' }}>
                                        {detailsLog.reviewed ? 'Sí' : 'No'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </Drawer.Body>
            </Drawer>
        </div>
    )
}
