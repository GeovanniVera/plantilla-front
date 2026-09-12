export type StatusColor = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface StatusDotProps {
  /** Color del punto */
  color: StatusColor;
  /** Texto a mostrar al lado del punto */
  label?: string;
  /** Variante de visualización */
  variant?: 'dot' | 'badge' | 'full';
  /** Tamaño */
  size?: 'sm' | 'md';
}

/*
 * Colors reuse the shared semantic status tokens (success / warning /
 * danger / info) instead of a private palette. Gray has no semantic
 * token and uses Tailwind's built-in neutral scale.
 */
const COLOR_CLASSES: Record<StatusColor, { bg: string; text: string; dot: string }> = {
  green: { bg: 'bg-success-bg', text: 'text-success-strong', dot: 'bg-success' },
  yellow: { bg: 'bg-warning-bg', text: 'text-warning-strong', dot: 'bg-warning' },
  red: { bg: 'bg-danger-bg', text: 'text-danger-strong', dot: 'bg-danger' },
  blue: { bg: 'bg-info-bg', text: 'text-info-strong', dot: 'bg-info' },
  gray: { bg: 'bg-gray-500/10', text: 'text-gray-500', dot: 'bg-gray-400' },
};

const DOT_SIZE_CLASSES = { sm: 'size-1.5', md: 'size-2' } as const;

const BADGE_SIZE_CLASSES = {
  sm: 'px-1.5 py-px text-[11px]',
  md: 'px-2 py-0.5 text-xs',
} as const;

const FULL_SIZE_CLASSES = {
  sm: 'px-2 py-px text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
} as const;

export function StatusDot({ color, label, variant = 'dot', size = 'md' }: StatusDotProps) {
  const colors = COLOR_CLASSES[color];

  if (variant === 'dot') {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className={`${DOT_SIZE_CLASSES[size]} shrink-0 rounded-full ${colors.dot}`} />
        {label && (
          <span className={`text-[13px] leading-none font-medium ${colors.text}`}>{label}</span>
        )}
      </span>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-[5px] rounded-full leading-[1.4] font-medium whitespace-nowrap ${BADGE_SIZE_CLASSES[size]} ${colors.bg} ${colors.text}`}
      >
        <span className={`size-2 shrink-0 rounded-full ${colors.dot}`} />
        {label}
      </span>
    );
  }

  // variant === 'full' — fondo coloreado
  return (
    <span
      className={`inline-block rounded-md leading-[1.4] font-medium whitespace-nowrap ${FULL_SIZE_CLASSES[size]} ${colors.bg} ${colors.text}`}
    >
      {label}
    </span>
  );
}
