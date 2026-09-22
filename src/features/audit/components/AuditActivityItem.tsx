/**
 * AuditActivityItem — fila de actividad expandible.
 *
 * Colapsada: primera línea visible (ícono + acción + fecha).
 * Expandida: al hacer clic despliega todos los detalles del evento
 * (entidad, IP, dispositivo, request ID, actor y cambios before/after).
 */
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ExpandableCard from '@components/layout/ExpandableCard';
import type { AuditLog } from '../services/audit.service';
import { getActionLabel, getActionTitle, describeEntity } from '../utils/audit-labels';

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

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

interface DetailRow {
  label: string;
  value: string;
}

/* ─── Cambios before → after ─────────────────────────────── */
function ChangesDiff({
  before,
  after,
}: {
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}) {
  const keys = Array.from(new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]));
  if (keys.length === 0) return null;

  return (
    <div className="bg-background border-border-base mt-3 rounded-md border p-3">
      <p className="text-fg-muted mb-2 text-xs font-semibold tracking-wide uppercase">Cambios</p>
      <dl className="space-y-1.5">
        {keys.map((key) => {
          const prev = before?.[key];
          const next = after?.[key];
          const removed = prev !== undefined && next === undefined;
          const added = prev === undefined && next !== undefined;

          return (
            <div
              key={key}
              className="text-fg-muted flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs"
            >
              <dt className="font-medium">{key}:</dt>
              {prev !== undefined && (
                <dd className={removed ? 'line-through' : ''}>{formatValue(prev)}</dd>
              )}
              {prev !== undefined && next !== undefined && <dd>→</dd>}
              {next !== undefined && (
                <dd className={added ? 'text-success-strong font-medium' : 'text-fg'}>
                  {formatValue(next)}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/* ─── Item ───────────────────────────────────────────────── */
interface AuditActivityItemProps {
  log: AuditLog;
}

export default function AuditActivityItem({ log }: AuditActivityItemProps) {
  const { t } = useTranslation();
  const label = getActionLabel(log.action);
  const title = getActionTitle(log, t);
  const Icon = label.icon;
  const entity = describeEntity(log.entityType, log.entityId);

  const details: DetailRow[] = [];
  if (entity) details.push({ label: 'Entidad', value: entity });
  if (log.ipAddress) details.push({ label: 'IP', value: log.ipAddress });
  if (log.userAgent) details.push({ label: 'Dispositivo', value: log.userAgent });
  if (log.requestId) details.push({ label: 'Request ID', value: log.requestId });
  if (log.actorId) details.push({ label: 'Actor', value: log.actorId });

  const hasDetails = details.length > 0 || Boolean(log.before) || Boolean(log.after);

  return (
    <ExpandableCard
      expandable={hasDetails}
      leading={
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[label.tone]}`}
        >
          <Icon size={16} />
        </div>
      }
      summary={
        <>
          <p className="text-fg text-sm font-medium">{title}</p>
          <p className="text-fg-muted mt-0.5 text-xs">{formatDate(log.createdAt)}</p>
        </>
      }
    >
      {details.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {details.map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-fg-muted text-[11px] font-semibold tracking-wide uppercase">
                {row.label}
              </dt>
              <dd className="text-fg text-xs break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(log.before || log.after) && <ChangesDiff before={log.before} after={log.after} />}
    </ExpandableCard>
  );
}
