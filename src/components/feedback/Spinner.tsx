/**
 * Spinner loading component.
 *
 * Animación de carga circular con soporte de tema.
 * Basado en CSS puro, sin dependencias externas.
 *
 * Uso:
 *   <Spinner />
 *   <Spinner size="sm" />
 *   <Spinner size="lg" />
 *   <Spinner size={48} />
 *   <Spinner color="white" />  // para usar en botones con fondo accent
 */
import type { CSSProperties } from 'react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'accent' | 'white' | 'current';

interface SpinnerProps {
  size?: SpinnerSize | number;
  color?: SpinnerColor;
  className?: string;
  style?: CSSProperties;
}

const SIZE_MAP: Record<SpinnerSize, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

const COLOR_MAP: Record<SpinnerColor, string> = {
  accent: 'var(--accent)',
  white: '#fff',
  current: 'currentColor',
};

export default function Spinner({
  size = 'md',
  color = 'accent',
  className = '',
  style,
}: SpinnerProps) {
  const px = typeof size === 'number' ? size : SIZE_MAP[size];
  const outerDot = Math.max(4, px * 0.24);
  const innerDot = Math.max(3, px * 0.16);
  const margin = Math.max(2, px * 0.08);
  const spinnerColor = COLOR_MAP[color];

  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: px,
        aspectRatio: '1',
        display: 'grid',
        ...style,
      }}
      role="status"
      aria-label="Cargando"
    >
      <style>{`
                .spinner-${px}::before,
                .spinner-${px}::after {
                    content: "";
                    grid-area: 1/1;
                    --c: no-repeat radial-gradient(farthest-side, ${spinnerColor} 92%, transparent);
                    background:
                        var(--c) 50% 0,
                        var(--c) 50% 100%,
                        var(--c) 100% 50%,
                        var(--c) 0 50%;
                    background-size: ${outerDot}px ${outerDot}px;
                    animation: spinner-rotate-${px} 1s infinite;
                }
                .spinner-${px}::before {
                    margin: ${margin}px;
                    filter: hue-rotate(45deg);
                    background-size: ${innerDot}px ${innerDot}px;
                    animation-timing-function: linear;
                }
                @keyframes spinner-rotate-${px} {
                    100% { transform: rotate(.5turn); }
                }
            `}</style>
      <div
        className={`spinner-${px}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'grid',
        }}
      />
      <span className="sr-only">Cargando...</span>
    </div>
  );
}
