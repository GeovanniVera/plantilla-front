import { useAuditLogs } from '../../features/audit/hooks/useAudit';
import { getActionLabel, describeEntity } from '../../features/audit/utils/audit-labels';
import type { AuditLog } from '../../features/audit/services/audit.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const TONE_CLASSES: Record<string, string> = {
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger-strong',
  warning: 'bg-warning-bg text-warning-strong',
  info: 'bg-info-bg text-info-strong',
  neutral: 'bg-accent-subtle text-accent',
};

function formatDate(value: string): string {
  try {
    return format(new Date(value), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });
  } catch {
    return value;
  }
}

export default function MiActividadPage() {
  const { data, isLoading } = useAuditLogs(0, 50);
  const logs = data?.content ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">Cargando tu actividad...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, width: '100%', margin: '0 auto' }}>
      <div className="space-y-6">
        <div>
          <h2 className="text-fg text-lg font-semibold">Mi actividad</h2>
          <p className="text-fg-muted text-sm">
            Registro de los eventos de seguridad relacionados con tu cuenta.
          </p>
        </div>

        {logs.length === 0 ? (
          <div className="bg-surface border-border-base flex flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
            <p className="text-fg text-sm font-medium">Sin actividad registrada</p>
            <p className="text-fg-muted mt-1 text-xs">
              Cuando realices acciones de seguridad, aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log: AuditLog) => {
              const label = getActionLabel(log.action);
              const Icon = label.icon;
              const entity = describeEntity(log.entityType, log.entityId);

              return (
                <div
                  key={log.id}
                  className="bg-surface border-border-base flex items-start gap-3 rounded-lg border p-4"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[label.tone]}`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-fg text-sm font-medium">{label.text}</p>
                    <p className="text-fg-muted mt-0.5 text-xs">{formatDate(log.createdAt)}</p>
                    {entity && <p className="text-fg-muted mt-0.5 text-xs">{entity}</p>}
                    {log.ipAddress && (
                      <p className="text-fg-muted mt-0.5 text-xs">Desde la IP {log.ipAddress}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
