import ResponsiveTable from '@components/data-display/table/ResponsiveTable';
import Badge from '@components/primitives/Badge';
import { useAuditLogs } from '../../features/audit/hooks/useAudit';
import type { AuditLog } from '../../features/audit/services/audit.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatDate(value: unknown): string {
  const date = new Date(value as string);
  try {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return String(value ?? '');
  }
}

export default function AuditLogsPage() {
  const { data, isLoading } = useAuditLogs(0, 10);
  const logs = data?.content ?? [];

  const columns = [
    {
      key: 'action',
      header: 'Acción',
      minWidth: '180px',
      filterType: 'text' as const,
      render: (value: unknown) => {
        const action = String(value ?? '');
        const variant =
          action.includes('FAILED') || action.includes('DENIED')
            ? ('danger' as const)
            : ('info' as const);
        return <Badge variant={variant}>{action}</Badge>;
      },
    },
    {
      key: 'actorId',
      header: 'Actor',
      minWidth: '200px',
      filterType: 'text' as const,
      render: (value: unknown) => {
        const actor = String(value ?? '');
        return actor ? (
          <span className="text-fg-muted text-xs">{actor}</span>
        ) : (
          <span className="text-fg-muted text-xs">system</span>
        );
      },
    },
    {
      key: 'entityType',
      header: 'Entidad',
      minWidth: '120px',
      filterType: 'text' as const,
      render: (value: unknown) => String(value ?? '—'),
    },
    {
      key: 'entityId',
      header: 'ID Entidad',
      minWidth: '200px',
      filterType: 'text' as const,
      render: (value: unknown) => (
        <span className="text-fg-muted text-xs">{String(value ?? '—')}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP',
      minWidth: '120px',
      filterType: 'text' as const,
      render: (value: unknown) => String(value ?? '—'),
    },
    {
      key: 'createdAt',
      header: 'Fecha',
      minWidth: '140px',
      filterType: 'text' as const,
      render: formatDate,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">Cargando auditoría...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-4">
        <div>
          <h2 className="text-fg text-lg font-semibold">Auditoría</h2>
          <p className="text-fg-muted text-sm">
            {data?.totalElements ?? 0} eventos registrados (solo lectura)
          </p>
        </div>

        <ResponsiveTable
          columns={columns}
          data={logs}
          keyExtractor={(row) => row.id}
          filters={true}
          pagination={true}
          pageSize={10}
          emptyTitle="Sin eventos"
          emptyDescription="No se encontraron eventos de auditoría con los filtros aplicados."
        />
      </div>
    </div>
  );
}
