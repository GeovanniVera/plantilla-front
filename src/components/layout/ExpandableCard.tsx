/**
 * ExpandableCard — card shell whose header is a real disclosure button and
 * whose body is revealed conditionally.
 *
 * Collapsed: only `summary` (plus the optional `leading` visual) is visible.
 * Expanded: `children` renders inside a top-bordered container.
 *
 * Zero domain knowledge: consumers own the content and the toggle label.
 * `AuditActivityItem` is the reference consumer.
 */
import { useState, type ReactNode } from 'react';
import { LuChevronDown } from 'react-icons/lu';

export interface ExpandableCardProps {
  /** Always-visible content (the collapsed line). */
  summary: ReactNode;
  /** Content revealed when the card is expanded. */
  children?: ReactNode;
  /** Optional visual before the summary (e.g. an icon badge). */
  leading?: ReactNode;
  /** Force whether the card can expand. Defaults to whether body content exists. */
  expandable?: boolean;
  /** Initial expanded state. Defaults to false. */
  defaultExpanded?: boolean;
  /** Extra classes for the root element. */
  className?: string;
  /** Accessible label for the toggle when the summary alone is not descriptive. */
  toggleLabel?: string;
  /**
   * When false the header renders as a static container (no button, no
   * chevron). Defaults to true so non-expandable content does not expose a
   * disabled control.
   */
  interactive?: boolean;
}

const ROOT_CLASSES = 'bg-surface border-border-base overflow-hidden rounded-lg border';
const HEADER_BUTTON_CLASSES =
  'focus-visible:ring-accent flex w-full items-start gap-3 p-4 text-left transition-colors duration-150 hover:bg-[rgba(0,0,0,0.03)] disabled:cursor-default';
const HEADER_STATIC_CLASSES = 'flex w-full items-start gap-3 p-4 text-left';
const SUMMARY_CLASSES = 'min-w-0 flex-1';
const CHEVRON_CLASSES = 'text-fg-muted mt-1 shrink-0 transition-transform duration-200';
const BODY_CLASSES = 'border-border-base border-t px-4 py-3';

export default function ExpandableCard({
  summary,
  children,
  leading,
  expandable,
  defaultExpanded = false,
  className,
  toggleLabel,
  interactive = true,
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasBody = children !== undefined && children !== null && children !== false;
  const canExpand = expandable ?? hasBody;

  const rootClassName = [ROOT_CLASSES, className].filter(Boolean).join(' ');

  const headerContent = (
    <>
      {leading}

      <div className={SUMMARY_CLASSES}>{summary}</div>

      {interactive && canExpand && (
        <LuChevronDown size={16} className={`${CHEVRON_CLASSES} ${expanded ? 'rotate-180' : ''}`} />
      )}
    </>
  );

  if (!interactive) {
    return (
      <div className={rootClassName}>
        <div className={HEADER_STATIC_CLASSES}>{headerContent}</div>
      </div>
    );
  }

  return (
    <div className={rootClassName}>
      <button
        type="button"
        onClick={() => setExpanded((previous) => !previous)}
        disabled={!canExpand}
        aria-expanded={expanded}
        aria-label={toggleLabel}
        className={HEADER_BUTTON_CLASSES}
      >
        {headerContent}
      </button>

      {expanded && canExpand && <div className={BODY_CLASSES}>{children}</div>}
    </div>
  );
}
