/**
 * AuditActivityItem — fila de actividad expandible.
 *
 * Colapsada: primera línea visible (ícono + acción + fecha).
 * Expandida: al hacer clic despliega todos los detalles del evento
 * (entidad, IP, dispositivo, request ID, actor y cambios before/after).
 */
import { useState } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AuditLog } from '../services/audit.service';
import { getActionLabel, describeEntity } from '../utils/audit-labels';

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
  const [expanded, setExpanded] = useState(false);
  const label = getActionLabel(log.action);
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
    <div className="bg-surface border-border-base overflow-hidden rounded-lg border">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        disabled={!hasDetails}
        aria-expanded={expanded}
        className="focus-visible:ring-accent flex w-full items-start gap-3 p-4 text-left transition-colors duration-150 hover:bg-[rgba(0,0,0,0.03)] disabled:cursor-default"
      >
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TONE_CLASSES[label.tone]}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-fg text-sm font-medium">{label.text}</p>
          <p className="text-fg-muted mt-0.5 text-xs">{formatDate(log.createdAt)}</p>
        </div>

        {hasDetails && (
          <LuChevronDown
            size={16}
            className={`text-fg-muted mt-1 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {expanded && hasDetails && (
        <div className="border-border-base border-t px-4 py-3">
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
        </div>
      )}
    </div>
  );
}
