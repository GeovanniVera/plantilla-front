import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuFilter } from 'react-icons/lu';
import { useMyAuditLogs } from '../../features/audit/hooks/useAudit';
import AuditActivityItem from '../../features/audit/components/AuditActivityItem';
import { getActionFilterOptions } from '../../features/audit/utils/audit-labels';
import Select from '@components/primitives/Select';
import Pagination from '@components/data-display/table/parts/Pagination';

const PAGE_SIZE = 5;

export default function MiActividadPage() {
  const { t } = useTranslation();
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);

  /* Opción real (seleccionable) para volver a "todos", no placeholder
   * disabled: el placeholder no permite re-seleccionar una vez filtrado. */
  const eventOptions = [
    { value: '', label: t('audit.filter.all') },
    ...getActionFilterOptions().map((option) => ({
      value: option.value,
      label: t(option.filterKey),
    })),
  ];

  const { data, isLoading, isFetching } = useMyAuditLogs(
    page,
    PAGE_SIZE,
    action ? { action } : undefined,
  );
  const logs = data?.content ?? [];

  const handleActionChange = (value: string) => {
    setAction(value);
    setPage(0);
  };

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

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={action}
            onChange={handleActionChange}
            options={eventOptions}
            size="sm"
            className="w-full sm:w-64"
            startAdornment={<LuFilter size={16} />}
            startAdornmentVariant="accent"
          />
          {isFetching && <span className="text-fg-muted text-xs">Cargando...</span>}
        </div>

        {logs.length === 0 ? (
          <div className="bg-surface border-border-base flex flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
            <p className="text-fg text-sm font-medium">
              {action ? 'Sin resultados para este filtro' : 'Sin actividad registrada'}
            </p>
            <p className="text-fg-muted mt-1 text-xs">
              {action
                ? 'Probá con otro tipo de evento.'
                : 'Cuando realices acciones de seguridad, aparecerán aquí.'}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {logs.map((log) => (
                <AuditActivityItem key={log.id} log={log} />
              ))}
            </div>

            <Pagination
              currentPage={page + 1}
              totalPages={data?.totalPages ?? 1}
              onPageChange={(p) => setPage(p - 1)}
              totalItems={data?.totalElements}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </div>
    </div>
  );
}
