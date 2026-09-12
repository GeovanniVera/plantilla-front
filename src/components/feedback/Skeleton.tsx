/**
 * Skeleton loading component con soporte de tema.
 *
 * Wraps react-loading-skeleton con CSS variables del design system.
 * Uso:
 *   <Skeleton width={200} height={20} />
 *   <Skeleton variant="circular" width={40} height={40} />
 *   <Skeleton variant="rectangular" height={200} />
 */
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

interface CustomSkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  count?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function CustomSkeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style,
}: CustomSkeletonProps) {
  return (
    <Skeleton
      variant={variant}
      width={width}
      height={height}
      count={count}
      className={className}
      style={{
        // Usar CSS variables del tema
        ['--base-color' as string]: 'var(--surface)',
        ['--highlight-color' as string]: 'var(--border-base)',
        borderRadius: variant === 'circular' ? '50%' : variant === 'text' ? '4px' : '8px',
        ...style,
      }}
    />
  );
}

// ─── Skeleton pre-armados ────────────────────────────────

/** Skeleton para tarjetas de contenido */
export function CardSkeleton() {
  return (
    <div className="border-border-base bg-background flex flex-col gap-3 rounded-xl border p-5">
      <CustomSkeleton variant="rectangular" width={40} height={40} style={{ borderRadius: 10 }} />
      <CustomSkeleton width="60%" height={16} />
      <CustomSkeleton width="90%" height={14} />
    </div>
  );
}

/** Skeleton para filas de tabla */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="border-border-base flex items-center gap-4 border-b px-4 py-3">
      {Array.from({ length: columns }).map((_, i) => (
        <CustomSkeleton
          key={i}
          width={i === 0 ? '15%' : i === columns - 1 ? '10%' : `${100 / columns}%`}
          height={14}
        />
      ))}
    </div>
  );
}

/** Skeleton para estadísticas */
export function StatSkeleton() {
  return (
    <div className="border-border-base bg-background flex flex-col gap-2 rounded-lg border p-4">
      <CustomSkeleton width={60} height={24} />
      <CustomSkeleton width={100} height={12} />
    </div>
  );
}

/** Skeleton para formulario */
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <CustomSkeleton width={80} height={14} />
          <CustomSkeleton height={42} />
        </div>
      ))}
      <CustomSkeleton height={44} style={{ borderRadius: 8 }} />
    </div>
  );
}
