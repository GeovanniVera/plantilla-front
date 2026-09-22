import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuSearch } from 'react-icons/lu';
import ResponsiveTable from '@components/data-display/table/ResponsiveTable';
import Badge from '@components/primitives/Badge';
import Input from '@components/primitives/Input';
import Select from '@components/primitives/Select';
import Pagination from '@components/data-display/table/parts/Pagination';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useAuditLogs } from '../../features/audit/hooks/useAudit';
import { getActionFilterOptions, getActionLabel } from '../../features/audit/utils/audit-labels';
import type { AuditFilters } from '../../features/audit/services/audit.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DEFAULT_PAGE_SIZE = 10;
const FILTER_DEBOUNCE_MS = 300;

function formatDate(value: unknown): string {
  const date = new Date(value as string);
  try {
    return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
  } catch {
    return String(value ?? '');
  }
}

export default function AuditLogsPage() {
  const { t } = useTranslation();

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
  const [action, setAction] = useState('');
  const [actorId, setActorId] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');

  const debouncedActorId = useDebouncedValue(actorId, FILTER_DEBOUNCE_MS);
  const debouncedEntityType = useDebouncedValue(entityType, FILTER_DEBOUNCE_MS);
  const debouncedEntityId = useDebouncedValue(entityId, FILTER_DEBOUNCE_MS);

  // Cualquier cambio de criterio vuelve a la primera página: la página actual
  // deja de ser válida cuando cambia el conjunto de resultados.
  useEffect(() => {
    setPage(0);
  }, [action, debouncedActorId, debouncedEntityType, debouncedEntityId, size]);

  // Filtros server-side: el backend aplica `action`, `actorId`, `entityType` y
  // `entityId` (exact match) sobre TODA la tabla, no sobre la página ya recibida.
  const filters: AuditFilters = {
    action: action || undefined,
    actorId: debouncedActorId.trim() || undefined,
    entityType: debouncedEntityType.trim() || undefined,
    entityId: debouncedEntityId.trim() || undefined,
  };

  const { data, isLoading, isFetching } = useAuditLogs(page, size, filters);
  const logs = data?.content ?? [];

  const actionOptions = [
    { value: '', label: t('admin.audit.filter.allActions') },
    ...getActionFilterOptions().map((option) => ({
      value: option.value,
      label: t(option.filterKey),
    })),
  ];

  const columns = [
    {
      key: 'action',
      header: t('admin.audit.columns.action'),
      minWidth: '180px',
      render: (value: unknown) => {
        const rawAction = String(value ?? '');
        const label = getActionLabel(rawAction);
        // El badge muestra la etiqueta NEUTRA (perspectiva de evento, no de
        // actor). Para acciones sin mapeo, la etiqueta genérica no aporta: se
        // conserva el código crudo, que es el único dato diagnosticable.
        const isKnown = label.filterKey !== 'audit.actions.unknown';
        const variant =
          rawAction.includes('FAILED') || rawAction.includes('DENIED')
            ? ('danger' as const)
            : ('info' as const);
        // El código crudo sigue disponible como tooltip incluso cuando hay
        // etiqueta: un auditor nunca pierde el valor exacto del enum.
        return (
          <span title={rawAction}>
            <Badge variant={variant}>{isKnown ? t(label.filterKey) : rawAction}</Badge>
          </span>
        );
      },
    },
    {
      key: 'actorId',
      header: t('admin.audit.columns.actor'),
      minWidth: '200px',
      render: (value: unknown) => {
        const actor = String(value ?? '');
        return (
          <span className="text-fg-muted text-xs">{actor || t('admin.audit.actorSystem')}</span>
        );
      },
    },
    {
      key: 'entityType',
      header: t('admin.audit.columns.entityType'),
      minWidth: '120px',
      render: (value: unknown) => String(value ?? '—'),
    },
    {
      key: 'entityId',
      header: t('admin.audit.columns.entityId'),
      minWidth: '200px',
      render: (value: unknown) => (
        <span className="text-fg-muted text-xs">{String(value ?? '—')}</span>
      ),
    },
    {
      key: 'ipAddress',
      header: t('admin.audit.columns.ip'),
      minWidth: '120px',
      render: (value: unknown) => String(value ?? '—'),
    },
    {
      key: 'createdAt',
      header: t('admin.audit.columns.createdAt'),
      minWidth: '140px',
      render: formatDate,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-fg-muted">{t('admin.audit.loading')}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-fg text-lg font-semibold">{t('admin.audit.title')}</h2>
            <p className="text-fg-muted text-sm">
              {t('admin.audit.count', { total: data?.totalElements ?? 0 })}
            </p>
          </div>
          {isFetching && (
            <span className="text-fg-muted text-xs">{t('admin.audit.refreshing')}</span>
          )}
        </div>

        {/* Filtros server-side. No se expone `ipAddress` (el backend no lo
            soporta) ni `from`/`to` (requerirían un control de rango de fechas).
            El orden tampoco se expone: `findWithFilters` fija `createdAt DESC`
            e ignora el `sort` del Pageable. */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={action}
            onChange={setAction}
            options={actionOptions}
            aria-label={t('admin.audit.filter.actionLabel')}
            size="sm"
            className="w-full sm:w-56"
          />
          <Input
            value={actorId}
            onChange={setActorId}
            placeholder={t('admin.audit.filter.actorPlaceholder')}
            aria-label={t('admin.audit.filter.actorLabel')}
            size="sm"
            className="w-full sm:w-56"
            startAdornment={<LuSearch size={16} />}
            startAdornmentVariant="accent"
          />
          <Input
            value={entityType}
            onChange={setEntityType}
            placeholder={t('admin.audit.filter.entityTypePlaceholder')}
            aria-label={t('admin.audit.filter.entityTypeLabel')}
            size="sm"
            className="w-full sm:w-44"
          />
          <Input
            value={entityId}
            onChange={setEntityId}
            placeholder={t('admin.audit.filter.entityIdPlaceholder')}
            aria-label={t('admin.audit.filter.entityIdLabel')}
            size="sm"
            className="w-full sm:w-56"
          />
        </div>

        {/* El servidor ya filtró y paginó: la tabla no debe volver a hacerlo
            (doble paginación y filtros que solo verían la página actual). */}
        <ResponsiveTable
          columns={columns}
          data={logs}
          keyExtractor={(row) => row.id}
          filters={false}
          pagination={false}
          emptyTitle={t('admin.audit.empty.title')}
          emptyDescription={t('admin.audit.empty.description')}
        />

        <Pagination
          currentPage={page + 1}
          totalPages={data?.totalPages ?? 1}
          onPageChange={(nextPage) => setPage(nextPage - 1)}
          totalItems={data?.totalElements}
          pageSize={size}
          onPageSizeChange={setSize}
        />
      </div>
    </div>
  );
}
