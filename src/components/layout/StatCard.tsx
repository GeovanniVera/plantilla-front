import type { IconType } from 'react-icons';

export interface StatCardProps {
  /** Valor numérico a mostrar */
  value: number;
  /** Label descriptivo (se muestra en mayúsculas) */
  label: string;
  /**
   * Color de acento (borde superior + ícono). Acepta cualquier color CSS,
   * incluida una variable del tema (ej. `var(--info)`). Por defecto sigue el
   * accent del tema.
   */
  accent?: string;
  /** Componente ícono de react-icons (ej: LuTriangleAlert) */
  icon?: IconType;
}

/**
 * Tarjeta de estadísticas estilo dashboard corporativo.
 * Diseño minimalista con borde superior de color, ícono en caja y número destacado.
 *
 * @example
 * <StatCard value={25} label="Total" icon={LuCalendar} />
 * <StatCard value={5} label="Disponibles" icon={LuCheck} accent="var(--info)" />
 */
export function StatCard({ value, label, accent = 'var(--accent)', icon: Icon }: StatCardProps) {
  /* --accent-color / --icon-bg son variables inline por instancia: el accent es
   * un color CSS cualquiera y su default sigue el tema. El fondo suave del icono
   * se deriva con color-mix porque pegarle el sufijo alpha a un hex
   * (`${accent}12`) no funciona cuando el accent es una variable CSS. */
  return (
    <div
      className={STAT_CARD_CLASSES}
      style={
        {
          '--accent-color': accent,
          '--icon-bg': `color-mix(in srgb, ${accent} 12%, transparent)`,
        } as React.CSSProperties
      }
    >
      {Icon && (
        <div className={ICON_BOX_CLASSES}>
          <Icon size={20} />
        </div>
      )}
      <div className={VALUE_CLASSES}>{value}</div>
      <div className={LABEL_CLASSES}>{label}</div>
    </div>
  );
}

export interface StatCardGroupProps {
  children: React.ReactNode;
}

/**
 * Grid responsivo para agrupar StatCards.
 * Se adapta automáticamente: 4 columnas en desktop, 2 en tablet, 1 en móvil.
 */
export function StatCardGroup({ children }: StatCardGroupProps) {
  return <div className={STAT_GROUP_CLASSES}>{children}</div>;
}

/* ─── Styling ────────────────────────────────────────────── */
const STAT_CARD_CLASSES =
  'relative flex flex-col gap-3 p-6 bg-background border border-border-base border-t-4 border-t-(--accent-color) rounded-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-[transform,box-shadow] duration-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.06),0_4px_10px_rgba(0,0,0,0.03)]';

const ICON_BOX_CLASSES =
  'flex items-center justify-center size-10 rounded-[10px] bg-(--icon-bg) text-(--accent-color) shrink-0';

const VALUE_CLASSES =
  'text-[32px] font-bold leading-none text-heading tabular-nums tracking-[-0.02em]';

const LABEL_CLASSES =
  'text-xs font-semibold uppercase tracking-[0.08em] text-foreground opacity-60 leading-none';

const STAT_GROUP_CLASSES = 'grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-6';
