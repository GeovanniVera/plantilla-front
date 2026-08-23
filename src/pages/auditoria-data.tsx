import type { Column } from '../components/ui/Table/types'
import { StatusDot } from '../components/ui/StatusDot'

// ─── Types ──────────────────────────────────────────
export interface AuditLog {
    id: number
    timestamp: string
    user: string
    action: string
    resource: string
    ip: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    reviewed: boolean
}

// ─── Mock Data ──────────────────────────────────────
export const auditLogs: AuditLog[] = [
    { id: 1,  timestamp: '2026-08-22 09:15:32', user: 'admin@semilla.mx',   action: 'LOGIN',          resource: '/auth',          ip: '192.168.1.100',  severity: 'low',      reviewed: true },
    { id: 2,  timestamp: '2026-08-22 09:17:45', user: 'admin@semilla.mx',   action: 'DELETE_USER',    resource: '/api/users/42',  ip: '192.168.1.100',  severity: 'high',     reviewed: true },
    { id: 3,  timestamp: '2026-08-22 09:20:11', user: 'unknown',            action: 'LOGIN_FAIL',     resource: '/auth',          ip: '203.0.113.45',   severity: 'critical', reviewed: false },
    { id: 4,  timestamp: '2026-08-22 09:20:13', user: 'unknown',            action: 'LOGIN_FAIL',     resource: '/auth',          ip: '203.0.113.45',   severity: 'critical', reviewed: false },
    { id: 5,  timestamp: '2026-08-22 09:20:15', user: 'unknown',            action: 'LOGIN_FAIL',     resource: '/auth',          ip: '203.0.113.45',   severity: 'critical', reviewed: false },
    { id: 6,  timestamp: '2026-08-22 09:22:00', user: 'maria@semilla.mx',   action: 'UPDATE_PROFILE', resource: '/api/users/15',  ip: '192.168.1.105',  severity: 'low',      reviewed: true },
    { id: 7,  timestamp: '2026-08-22 09:30:00', user: 'carlos@semilla.mx',  action: 'EXPORT_DATA',    resource: '/api/reports',   ip: '192.168.1.110',  severity: 'medium',   reviewed: false },
    { id: 8,  timestamp: '2026-08-22 09:45:00', user: 'admin@semilla.mx',   action: 'CONFIG_CHANGE',  resource: '/api/settings',  ip: '192.168.1.100',  severity: 'high',     reviewed: true },
    { id: 9,  timestamp: '2026-08-22 10:00:00', user: 'ana@semilla.mx',     action: 'CREATE_POST',    resource: '/api/posts',     ip: '192.168.1.120',  severity: 'low',      reviewed: true },
    { id: 10, timestamp: '2026-08-22 10:15:00', user: 'unknown',            action: 'SQL_INJECT',     resource: '/api/search',    ip: '198.51.100.77',  severity: 'critical', reviewed: false },
    { id: 11, timestamp: '2026-08-22 10:30:00', user: 'luis@semilla.mx',    action: 'LOGIN',          resource: '/auth',          ip: '192.168.1.115',  severity: 'low',      reviewed: true },
    { id: 12, timestamp: '2026-08-22 10:45:00', user: 'diego@semilla.mx',   action: 'UPDATE_ROLE',    resource: '/api/users/8',   ip: '192.168.1.130',  severity: 'high',     reviewed: false },
    { id: 13, timestamp: '2026-08-22 11:00:00', user: 'admin@semilla.mx',   action: 'BACKUP',         resource: '/api/backup',    ip: '192.168.1.100',  severity: 'medium',   reviewed: true },
    { id: 14, timestamp: '2026-08-22 11:15:00', user: 'unknown',            action: 'XSS_ATTEMPT',    resource: '/api/comments',  ip: '198.51.100.99',  severity: 'critical', reviewed: false },
    { id: 15, timestamp: '2026-08-22 11:30:00', user: 'valentina@semilla.mx', action: 'DELETE_POST',  resource: '/api/posts/127', ip: '192.168.1.140',  severity: 'medium',   reviewed: false },
    { id: 16, timestamp: '2026-08-22 11:45:00', user: 'admin@semilla.mx',   action: 'LOGIN',          resource: '/auth',          ip: '192.168.1.100',  severity: 'low',      reviewed: true },
    { id: 17, timestamp: '2026-08-22 12:00:00', user: 'unknown',            action: 'BRUTE_FORCE',    resource: '/auth',          ip: '203.0.113.99',   severity: 'critical', reviewed: false },
    { id: 18, timestamp: '2026-08-22 12:00:02', user: 'unknown',            action: 'BRUTE_FORCE',    resource: '/auth',          ip: '203.0.113.99',   severity: 'critical', reviewed: false },
    { id: 19, timestamp: '2026-08-22 12:00:04', user: 'unknown',            action: 'BRUTE_FORCE',    resource: '/auth',          ip: '203.0.113.99',   severity: 'critical', reviewed: false },
    { id: 20, timestamp: '2026-08-22 12:15:00', user: 'sofia@semilla.mx',   action: 'CREATE_USER',    resource: '/api/users',     ip: '192.168.1.105',  severity: 'medium',   reviewed: true },
]

// ─── Columnas ───────────────────────────────────────
const SEVERITY_COLORS: Record<AuditLog['severity'], 'red' | 'yellow' | 'blue' | 'gray'> = {
    critical: 'red',
    high: 'yellow',
    medium: 'blue',
    low: 'gray',
}

const SEVERITY_LABELS: Record<AuditLog['severity'], string> = {
    critical: 'Crítico',
    high: 'Alto',
    medium: 'Medio',
    low: 'Bajo',
}

export const auditColumns: Column<AuditLog>[] = [
    {
        key: 'timestamp',
        header: 'Fecha/Hora',
        minWidth: '160px',
        filterType: 'text',
    },
    {
        key: 'user',
        header: 'Usuario',
        minWidth: '180px',
        filterType: 'select',
        filterOptions: [...new Set(auditLogs.map((l) => l.user))].sort(),
    },
    {
        key: 'action',
        header: 'Acción',
        minWidth: '140px',
        align: 'center',
        filterType: 'select',
        filterOptions: [...new Set(auditLogs.map((l) => l.action))].sort(),
    },
    {
        key: 'resource',
        header: 'Recurso',
        minWidth: '160px',
    },
    {
        key: 'ip',
        header: 'IP',
        minWidth: '140px',
    },
    {
        key: 'severity',
        header: 'Severidad',
        width: '110px',
        align: 'center',
        filterType: 'select',
        filterOptions: ['critical', 'high', 'medium', 'low'],
        render: (value) => {
            const severity = value as AuditLog['severity']
            return (
                <StatusDot
                    color={SEVERITY_COLORS[severity]}
                    label={SEVERITY_LABELS[severity]}
                    variant="dot"
                />
            )
        },
    },
    {
        key: 'reviewed',
        header: 'Revisado',
        width: '100px',
        align: 'center',
        filterType: 'boolean',
        render: (value) => (
            <StatusDot
                color={value === 'true' ? 'green' : 'red'}
                label={value === 'true' ? 'Sí' : 'No'}
                variant="dot"
            />
        ),
    },
]
