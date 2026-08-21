import { useState, useMemo, useCallback } from 'react'
import { LuEye, LuCode, LuCopy, LuCheck, LuFileCode2, LuSettings2, LuRotateCcw } from 'react-icons/lu'
import styles from './TablesShowcase.module.css'

// ─── Components ──────────────────────────────────────────
import DataTable from '../components/ui/Table/DataTable'
import ExcelTable from '../components/ui/ExcelTable/ExcelTable'

// ─── Data ────────────────────────────────────────────────
import {
    sampleUsers,
    employees,
    initialSpreadsheet,
    userColumns,
    spreadsheetColumns,
    employeeColumns,
} from './components-data'

// ─── Types ───────────────────────────────────────────────
type TableType = 'datatable' | 'exceltable'
type DatasetKey = 'none' | 'users' | 'employees' | 'spreadsheet'
type DataMode = 'client' | 'server'
type ViewMode = 'preview' | 'code'

interface BuilderConfig {
    tableType: TableType
    dataset: DatasetKey
    dataMode: DataMode
    filters: boolean
    pagination: boolean
}

const DEFAULT_CONFIG: BuilderConfig = {
    tableType: 'datatable',
    dataset: 'none',
    dataMode: 'client',
    filters: false,
    pagination: false,
}

// ─── Dataset Options ─────────────────────────────────────
const DATASETS: Record<DatasetKey, { label: string; description: string; rows: number | null }> = {
    none:       { label: 'Sin datos',      description: 'Muestra el estado vacío de la tabla', rows: null },
    users:      { label: 'Usuarios',       description: '20 registros con nombre, email, rol y estado', rows: 20 },
    employees:  { label: 'Empleados',      description: '20 registros con departamento, posición y ciudad', rows: 20 },
    spreadsheet:{ label: 'Hoja de cálculo', description: '15 partidas con cantidades y montos', rows: 15 },
}

const TABLE_TYPES: Record<TableType, { label: string; description: string; editable: boolean }> = {
    datatable: { label: 'DataTable', description: 'Solo lectura — minimalista estilo Mac', editable: false },
    exceltable: { label: 'ExcelTable', description: 'Editable — cuadrícula densa tipo hoja de cálculo', editable: true },
}

// ─── CopyButton ──────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [text])

    return (
        <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
            onClick={handleCopy}
        >
            {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
        </button>
    )
}

// ─── CodeBlock ───────────────────────────────────────────
function CodeBlock({ filename, code }: { filename: string; code: string }) {
    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeFilename}>
                    <span className={styles.codeFilenameIcon}>
                        <LuFileCode2 size={14} />
                    </span>
                    {filename}
                </span>
                <CopyButton text={code} />
            </div>
            <pre className={styles.codeContent}>{code}</pre>
        </div>
    )
}

// ─── Configurator Panel ──────────────────────────────────
function ConfiguratorPanel({
    config,
    onChange,
    onReset,
}: {
    config: BuilderConfig
    onChange: (patch: Partial<BuilderConfig>) => void
    onReset: () => void
}) {
    const [collapsed, setCollapsed] = useState(false)
    return (
        <div className={styles.configurator}>
            <div className={styles.configHeader}>
                <span className={styles.configIcon}><LuSettings2 size={18} /></span>
                <span className={styles.configTitle}>Configurador</span>
                <button className={`${styles.collapseBtn} ${collapsed ? styles.collapseBtnCollapsed : ''}`} onClick={() => setCollapsed(!collapsed)} title={collapsed ? 'Expandir' : 'Colapsar'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <button className={styles.resetBtn} onClick={onReset} title="Restaurar valores por defecto">
                    <LuRotateCcw size={14} />
                </button>
            </div>

            {!collapsed && (
            <>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Tipo de tabla</label>
                <div className={styles.radioGroup}>
                    {(Object.entries(TABLE_TYPES) as [TableType, typeof TABLE_TYPES[TableType]][]).map(([key, info]) => (
                        <button
                            key={key}
                            className={`${styles.radioCard} ${config.tableType === key ? styles.radioCardActive : ''}`}
                            onClick={() => onChange({ tableType: key })}
                        >
                            <span className={styles.radioLabel}>{info.label}</span>
                            <span className={styles.radioDesc}>{info.description}</span>
                            {info.editable && <span className={styles.radioBadge}>Editable</span>}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Datos de ejemplo</label>
                <div className={styles.radioGroup}>
                    {(Object.entries(DATASETS) as [DatasetKey, typeof DATASETS[DatasetKey]][]).map(([key, info]) => (
                        <button
                            key={key}
                            className={`${styles.radioCard} ${config.dataset === key ? styles.radioCardActive : ''}`}
                            onClick={() => onChange({ dataset: key })}
                        >
                            <span className={styles.radioLabel}>{info.label}</span>
                            <span className={styles.radioDesc}>{info.description}</span>
                            <span className={styles.radioBadge}>
                                {info.rows !== null ? `${info.rows} filas` : 'Vacío'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Integración de datos</label>
                <div className={styles.radioGroup}>
                    <button
                        className={`${styles.radioCard} ${config.dataMode === 'client' ? styles.radioCardActive : ''}`}
                        onClick={() => onChange({ dataMode: 'client' })}
                    >
                        <span className={styles.radioLabel}>Client-side</span>
                        <span className={styles.radioDesc}>Filtra y pagina en el frontend. Ideal para &lt;1,000 registros.</span>
                        <span className={styles.radioBadge}>useTableFilters + useTablePagination</span>
                    </button>
                    <button
                        className={`${styles.radioCard} ${config.dataMode === 'server' ? styles.radioCardActive : ''}`}
                        onClick={() => onChange({ dataMode: 'server' })}
                    >
                        <span className={styles.radioLabel}>Server-side</span>
                        <span className={styles.radioDesc}>Envía page, pageSize y filtros al backend. Ideal para producción.</span>
                        <span className={styles.radioBadge}>fetch + API params</span>
                    </button>
                </div>
            </div>

            <div className={styles.configGroup}>
                <label className={styles.configLabel}>Características</label>
                <div className={styles.toggleGroup}>
                    <label className={styles.toggleItem}>
                        <span className={styles.toggleInfo}>
                            <span className={styles.toggleName}>Filtros</span>
                            <span className={styles.toggleDesc}>Filtros desplegables en cabeceras de columna</span>
                        </span>
                        <button
                            className={`${styles.toggleSwitch} ${config.filters ? styles.toggleSwitchOn : ''}`}
                            onClick={() => onChange({ filters: !config.filters })}
                            role="switch"
                            aria-checked={config.filters}
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    </label>

                    <label className={styles.toggleItem}>
                        <span className={styles.toggleInfo}>
                            <span className={styles.toggleName}>Paginación</span>
                            <span className={styles.toggleDesc}>Navegación por páginas con selector de registros</span>
                        </span>
                        <button
                            className={`${styles.toggleSwitch} ${config.pagination ? styles.toggleSwitchOn : ''}`}
                            onClick={() => onChange({ pagination: !config.pagination })}
                            role="switch"
                            aria-checked={config.pagination}
                        >
                            <span className={styles.toggleKnob} />
                        </button>
                    </label>
                </div>
            </div>

            <div className={styles.configSummary}>
                <span className={styles.summaryLabel}>Componente resultante:</span>
                <code className={styles.summaryCode}>
                    {config.tableType === 'datatable' ? 'DataTable' : 'ExcelTable'}
                </code>
                <div className={styles.summaryFlags}>
                    <span className={styles.flagBadge}>{config.dataMode === 'client' ? 'client-side' : 'server-side'}</span>
                    {config.dataset !== 'none' && <span className={styles.flagBadge}>data={DATASETS[config.dataset].label}</span>}
                    {config.dataset === 'none' && <span className={styles.flagBadge}>data={'[]'}</span>}
                    {config.filters && <span className={styles.flagBadge}>filters</span>}
                    {config.pagination && <span className={styles.flagBadge}>pagination</span>}
                </div>
            </div>
            </>
            )}
        </div>
    )
}

// ─── Live Preview ────────────────────────────────────────
function LivePreview({ config }: { config: BuilderConfig }) {
    const editHandler = useCallback((_rowIdx: number, _key: string, _value: string) => {
        // Handler de edición en vivo — integrar con API real
    }, [])

    const props = {
        filters: config.filters,
        pagination: config.pagination,
    }

    const isExcel = config.tableType === 'exceltable'
    const isEmpty = config.dataset === 'none'

    if (isEmpty) {
        return isExcel
            ? <ExcelTable columns={[]} data={[]} keyExtractor={(_, i) => i} onDataChange={editHandler} {...props} />
            : <DataTable columns={[]} data={[]} keyExtractor={(_, i) => i} {...props} />
    }

    if (config.dataset === 'users') {
        return isExcel
            ? <ExcelTable columns={userColumns} data={sampleUsers} keyExtractor={(r) => r.id} onDataChange={editHandler} {...props} />
            : <DataTable columns={userColumns} data={sampleUsers} keyExtractor={(r) => r.id} {...props} />
    }

    if (config.dataset === 'employees') {
        return isExcel
            ? <ExcelTable columns={employeeColumns} data={employees} keyExtractor={(_, i) => i} onDataChange={editHandler} {...props} />
            : <DataTable columns={employeeColumns} data={employees} keyExtractor={(_, i) => i} {...props} />
    }

    return isExcel
        ? <ExcelTable columns={spreadsheetColumns} data={initialSpreadsheet} keyExtractor={(_, i) => i} onDataChange={editHandler} {...props} />
        : <DataTable columns={spreadsheetColumns} data={initialSpreadsheet} keyExtractor={(_, i) => i} {...props} />
}

// ─── Generated Code (Realistic Examples) ─────────────────
function GeneratedCode({ config }: { config: BuilderConfig }) {
    const isExcel = config.tableType === 'exceltable'
    const isEmpty = config.dataset === 'none'

    // ─── Archivo 1: Tipos ─────────────────────────────
    const typesCode = useMemo(() => {
        if (config.dataset === 'users') {
            return `// types/user.ts
export interface User {
    id: number
    name: string
    email: string
    role: 'Admin' | 'Editor' | 'Viewer'
    status: 'Activo' | 'Inactivo'
}`
        }
        if (config.dataset === 'employees') {
            return `// types/employee.ts
export interface Employee {
    name: string
    department: string
    position: string
    city: string
    status: 'Activo' | 'Inactivo'
}`
        }
        if (config.dataset === 'spreadsheet') {
            return `// types/invoice.ts
export interface InvoiceItem {
    concepto: string
    cantidad: string
    precio: string
    total: string
}`
        }
        return `// types/item.ts
export interface Item {
    id: number
    name: string
    status: string
}`
    }, [config.dataset])

    // ─── Archivo 2: Columnas ───────────────────────────
    const columnsCode = useMemo(() => {
        if (config.dataset === 'users') {
            return `// columns/userColumns.ts
import { type Column } from '../components/ui/Table/types'
import Badge from '../components/ui/Badge'
import type { User } from '../types/user'

export const userColumns: Column<User>[] = [
    { key: 'name', header: 'Nombre', minWidth: '180px' },
    { key: 'email', header: 'Email', minWidth: '220px' },
    {
        key: 'role',
        header: 'Rol',
        align: 'center',
        render: (value) => {
            const variant = value === 'Admin' ? 'success'
                : value === 'Editor' ? 'info' : 'default'
            return <Badge variant={variant}>{String(value)}</Badge>
        },
    },
    {
        key: 'status',
        header: 'Estado',
        align: 'center',
        render: (value) => {
            const variant = value === 'Activo' ? 'success' : 'warning'
            return <Badge variant={variant}>{String(value)}</Badge>
        },
    },
]`
        }

        if (config.dataset === 'employees') {
            return `// columns/employeeColumns.ts
import { type Column } from '../components/ui/Table/types'
import Badge from '../components/ui/Badge'
import type { Employee } from '../types/employee'

export const employeeColumns: Column<Employee>[] = [
    { key: 'name', header: 'Nombre', minWidth: '180px' },
    { key: 'department', header: 'Departamento', minWidth: '140px', align: 'center' },
    { key: 'position', header: 'Posición', minWidth: '140px' },
    { key: 'city', header: 'Ciudad', minWidth: '120px', align: 'center' },
    {
        key: 'status',
        header: 'Estado',
        width: '100px',
        align: 'center',
        render: (value) => {
            const variant = value === 'Activo' ? 'success' : 'warning'
            return <Badge variant={variant}>{String(value)}</Badge>
        },
    },
]`
        }

        if (config.dataset === 'spreadsheet') {
            return `// columns/invoiceColumns.ts
import { type Column } from '../components/ui/Table/types'
import type { InvoiceItem } from '../types/invoice'

export const invoiceColumns: Column<InvoiceItem>[] = [
    { key: 'concepto', header: 'Concepto', minWidth: '200px' },
    { key: 'cantidad', header: 'Cantidad', width: '100px', align: 'right' },
    { key: 'precio', header: 'Precio', width: '120px', align: 'right' },
    { key: 'total', header: 'Total', width: '120px', align: 'right' },
]`
        }

        return `// columns/itemColumns.ts
import { type Column } from '../components/ui/Table/types'

export const itemColumns = [
    { key: 'name', header: 'Nombre', minWidth: '180px' },
    { key: 'status', header: 'Estado', align: 'center' },
]`
    }, [config.dataset, isExcel])

    // ─── Archivo 3: Componente principal ───────────────
    const componentCode = useMemo(() => {
        const componentName = isExcel ? 'ExcelTable' : 'DataTable'
        const importPath = isExcel
            ? '../components/ui/ExcelTable/ExcelTable'
            : '../components/ui/Table/DataTable'

        const typeName = config.dataset === 'users' ? 'User'
            : config.dataset === 'employees' ? 'Employee'
            : config.dataset === 'spreadsheet' ? 'InvoiceItem'
            : 'Item'

        const keyFn = config.dataset === 'users' ? '(row) => row.id' : '(_, i) => i'

        const columnsVar = config.dataset === 'users' ? 'userColumns'
            : config.dataset === 'employees' ? 'employeeColumns'
            : config.dataset === 'spreadsheet' ? 'invoiceColumns'
            : 'itemColumns'

        const pageName = config.dataset === 'users' ? 'UsuariosPage'
            : config.dataset === 'employees' ? 'EmpleadosPage'
            : config.dataset === 'spreadsheet' ? 'FacturacionPage' : 'ListaPage'

        const apiEndpoint = config.dataset === 'users' ? '/api/users'
            : config.dataset === 'employees' ? '/api/employees'
            : config.dataset === 'spreadsheet' ? '/api/invoices' : '/api/items'

        const isServer = config.dataMode === 'server'

        const lines: string[] = []

        // ─── Imports ───
        lines.push(`import { useState, useEffect, useCallback } from 'react'`)
        lines.push(`import ${componentName} from '${importPath}'`)
        lines.push(`import { ${columnsVar} } from './columns/${config.dataset === 'users' ? 'userColumns' : config.dataset === 'employees' ? 'employeeColumns' : config.dataset === 'spreadsheet' ? 'invoiceColumns' : 'itemColumns'}'`)
        if (config.dataset !== 'none') {
            lines.push(`import type { ${typeName} } from '../types/${config.dataset === 'users' ? 'user' : config.dataset === 'employees' ? 'employee' : config.dataset === 'spreadsheet' ? 'invoice' : 'item'}'`)
        }
        lines.push('')

        // ─── API Response type (server-side) ───
        if (isServer && !isEmpty) {
            lines.push(`// Respuesta esperada del backend`)
            lines.push(`interface ApiResponse {`)
            lines.push(`    data: ${typeName}[]`)
            lines.push(`    total: number       // Total de registros (para el paginador)`)
            lines.push(`    page: number        // Página actual`)
            lines.push(`    pageSize: number    // Registros por página`)
            lines.push(`}`)
            lines.push('')
        }

        // ─── Component ───
        lines.push(`export default function ${pageName}() {`)

        // ─── Empty state ───
        if (isEmpty) {
            lines.push(`    return (`)
            lines.push(`        <div>`)
            lines.push(`            <h1>${pageName.replace('Page', '')}</h1>`)
            lines.push(`            <${componentName}`)
            lines.push(`                columns={${columnsVar}}`)
            lines.push(`                data={[]}`)
            lines.push(`                keyExtractor={${keyFn}}`)
            if (isExcel) lines.push(`                onDataChange={() => {}}`)
            if (config.filters) lines.push(`                filters`)
            if (config.pagination) lines.push(`                pagination`)
            lines.push(`            />`)
            lines.push(`        </div>`)
            lines.push(`    )`)
        // ─── Server-side ───
        } else if (isServer) {
            lines.push(`    const [data, setData] = useState<${typeName}[]>([])`)
            lines.push(`    const [total, setTotal] = useState(0)`)
            lines.push(`    const [page, setPage] = useState(1)`)
            lines.push(`    const [pageSize] = useState(10)`)
            lines.push(`    const [loading, setLoading] = useState(true)`)
            lines.push(`    const [error, setError] = useState<string | null>(null)`)
            if (config.filters) {
                lines.push(`    const [filters, setFilters] = useState<Record<string, string>>({})`)
            }
            lines.push(``)
            lines.push(`    // ─── Fetch paginado del backend ───`)
            lines.push(`    useEffect(() => {`)
            lines.push(`        async function fetchData() {`)
            lines.push(`            setLoading(true)`)
            lines.push(`            try {`)
            lines.push(`                const params = new URLSearchParams({`)
            lines.push(`                    page: String(page),`)
            lines.push(`                    pageSize: String(pageSize),`)
            if (config.filters) {
                lines.push(`                    ...filters,`)
            }
            lines.push(`                })`)
            lines.push(``)
            lines.push(`                const res = await fetch(\`${apiEndpoint}?\${params}\`)`)
            lines.push(`                if (!res.ok) throw new Error('Error al cargar datos')`)
            lines.push(`                const json: ApiResponse = await res.json()`)
            lines.push(``)
            lines.push(`                setData(json.data)`)
            lines.push(`                setTotal(json.total)`)
            lines.push(`            } catch (err) {`)
            lines.push(`                setError(err instanceof Error ? err.message : 'Error desconocido')`)
            lines.push(`            } finally {`)
            lines.push(`                setLoading(false)`)
            lines.push(`            }`)
            lines.push(`        }`)
            lines.push(`        fetchData()`)
            lines.push(`    }, [page, pageSize${config.filters ? ', filters' : ''}])`)
            if (config.filters) {
                lines.push(``)
                lines.push(`    // ─── Filtros se envían al backend ───`)
                lines.push(`    // El backend recibe los filtros como query params`)
                lines.push(`    // y retorna solo los datos que coinciden`)
            }
            lines.push(``)
            lines.push(`    if (loading) return <div>Cargando...</div>`)
            lines.push(`    if (error) return <div>Error: {error}</div>`)
            lines.push(``)
            lines.push(`    return (`)
            lines.push(`        <div>`)
            lines.push(`            <h1>${pageName.replace('Page', '')}</h1>`)
            lines.push(`            <${componentName}`)
            lines.push(`                columns={${columnsVar}}`)
            lines.push(`                data={data}`)
            lines.push(`                keyExtractor={${keyFn}}`)
            if (isExcel) lines.push(`                onDataChange={(rowIdx, key, value) => {`)
            if (isExcel) lines.push(`                    // TODO: PATCH ${apiEndpoint}/:id`)
            if (isExcel) lines.push(`                    console.log(\`Edit [\${rowIdx}].\${key} = \${value}\`)`)
            if (isExcel) lines.push(`                }}`)
            if (config.filters) lines.push(`                filters`)
            if (config.pagination) lines.push(`                pagination`)
            lines.push(`            />`)
            lines.push(`        </div>`)
            lines.push(`    )`)
        // ─── Client-side (with data) ───
        } else {
            lines.push(`    const [data, setData] = useState<${typeName}[]>([])`)
            lines.push(`    const [loading, setLoading] = useState(true)`)
            lines.push(`    const [error, setError] = useState<string | null>(null)`)
            lines.push(``)
            lines.push(`    // ─── Cargar TODOS los datos de la API ───`)
            lines.push(`    // El frontend filtra y pagina en memoria`)
            lines.push(`    useEffect(() => {`)
            lines.push(`        async function fetchData() {`)
            lines.push(`            try {`)
            lines.push(`                const res = await fetch('${apiEndpoint}')`)
            lines.push(`                if (!res.ok) throw new Error('Error al cargar datos')`)
            lines.push(`                const json = await res.json()`)
            lines.push(`                setData(json)`)
            lines.push(`            } catch (err) {`)
            lines.push(`                setError(err instanceof Error ? err.message : 'Error desconocido')`)
            lines.push(`            } finally {`)
            lines.push(`                setLoading(false)`)
            lines.push(`            }`)
            lines.push(`        }`)
            lines.push(`        fetchData()`)
            lines.push(`    }, [])`)
            if (isExcel) {
                lines.push(``)
                lines.push(`    const handleCellEdit = (rowIndex: number, columnKey: string, value: string) => {`)
                lines.push(`        setData((prev) => {`)
                lines.push(`            const next = [...prev]`)
                lines.push(`            next[rowIndex] = { ...next[rowIndex], [columnKey]: value }`)
                lines.push(`            return next`)
                lines.push(`        })`)
                lines.push(`        // TODO: PATCH ${apiEndpoint}/:id`)
                lines.push(`    }`)
            }
            lines.push(``)
            lines.push(`    if (loading) return <div>Cargando...</div>`)
            lines.push(`    if (error) return <div>Error: {error}</div>`)
            lines.push(``)
            lines.push(`    return (`)
            lines.push(`        <div>`)
            lines.push(`            <h1>${pageName.replace('Page', '')}</h1>`)
            lines.push(`            <${componentName}`)
            lines.push(`                columns={${columnsVar}}`)
            lines.push(`                data={data}`)
            lines.push(`                keyExtractor={${keyFn}}`)
            if (isExcel) lines.push(`                onDataChange={handleCellEdit}`)
            if (config.filters) lines.push(`                filters`)
            if (config.pagination) lines.push(`                pagination`)
            lines.push(`            />`)
            lines.push(`        </div>`)
            lines.push(`    )`)
        }

        lines.push(`}`)
        return lines.join('\n')
    }, [config, isExcel, isEmpty])

    return (
        <div className={styles.codeStack}>
            <CodeBlock
                filename={`types/${config.dataset === 'users' ? 'user' : config.dataset === 'employees' ? 'employee' : config.dataset === 'spreadsheet' ? 'invoice' : 'item'}.ts`}
                code={typesCode}
            />
            <CodeBlock
                filename={`columns/${config.dataset === 'users' ? 'userColumns' : config.dataset === 'employees' ? 'employeeColumns' : config.dataset === 'spreadsheet' ? 'invoiceColumns' : 'itemColumns'}.ts`}
                code={columnsCode}
            />
            <CodeBlock
                filename={`${config.dataset === 'users' ? 'UsuariosPage' : config.dataset === 'employees' ? 'EmpleadosPage' : config.dataset === 'spreadsheet' ? 'FacturacionPage' : 'ListaPage'}.tsx`}
                code={componentCode}
            />
        </div>
    )
}

// ─── Main Component ──────────────────────────────────────
export default function TablesShowcase() {
    const [view, setView] = useState<ViewMode>('preview')
    const [config, setConfig] = useState<BuilderConfig>(DEFAULT_CONFIG)

    const handleChange = useCallback((patch: Partial<BuilderConfig>) => {
        setConfig((prev) => ({ ...prev, ...patch }))
    }, [])

    const handleReset = useCallback(() => {
        setConfig(DEFAULT_CONFIG)
    }, [])

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.toggleBar}>
                    <button
                        className={`${styles.toggleBtn} ${view === 'preview' ? styles.toggleActive : ''}`}
                        onClick={() => setView('preview')}
                    >
                        <span className={styles.toggleIcon}><LuEye size={16} /></span>
                        Configurador
                    </button>
                    <button
                        className={`${styles.toggleBtn} ${view === 'code' ? styles.toggleActive : ''}`}
                        onClick={() => setView('code')}
                    >
                        <span className={styles.toggleIcon}><LuCode size={16} /></span>
                        Código Generado
                    </button>
                </div>
            </div>

            {view === 'preview' && (
                <div className={styles.builderLayout}>
                    <ConfiguratorPanel config={config} onChange={handleChange} onReset={handleReset} />
                    <div className={styles.previewArea}>
                        <div className={styles.previewHeader}>
                            <span className={styles.previewLabel}>Vista previa en vivo</span>
                            <span className={styles.previewComponent}>
                                {TABLE_TYPES[config.tableType].label}
                                {config.dataset !== 'none' && ` · ${DATASETS[config.dataset].label}`}
                                {config.dataset === 'none' && ' · Sin datos'}
                                {config.filters && ' + filters'}
                                {config.pagination && ' + pagination'}
                            </span>
                        </div>
                        <div className={styles.tableWrapper}>
                            <LivePreview config={config} />
                        </div>
                    </div>
                </div>
            )}

            {view === 'code' && (
                <div className={styles.builderLayout}>
                    <ConfiguratorPanel config={config} onChange={handleChange} onReset={handleReset} />
                    <div className={styles.previewArea}>
                        <div className={styles.previewHeader}>
                            <span className={styles.previewLabel}>Código generado</span>
                            <span className={styles.previewComponent}>
                                3 archivos — copia y pega en tu proyecto
                            </span>
                        </div>
                        <GeneratedCode config={config} />
                    </div>
                </div>
            )}
        </div>
    )
}
