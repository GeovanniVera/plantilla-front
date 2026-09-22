import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { LuChevronLeft, LuChevronRight, LuSearch, LuPlus } from 'react-icons/lu';
import { useIsMobile } from '@hooks/useIsMobile';

const HEADER_CLASSES =
  'flex items-center justify-between px-5 py-4 border-b border-border-base gap-4 flex-wrap';
const HEADER_LEFT_CLASSES = 'flex items-center gap-4';
const DATE_BLOCK_CLASSES =
  'flex flex-col items-center justify-center w-[52px] h-[52px] rounded-lg bg-accent text-white shrink-0';
const DATE_BLOCK_DAY_CLASSES = 'text-xl font-bold leading-none';
const DATE_BLOCK_MONTH_CLASSES = 'text-[9px] font-semibold uppercase tracking-[0.05em] opacity-85';
const HEADER_TITLE_CLASSES = 'flex flex-col gap-0.5';
const MONTH_TITLE_CLASSES = 'text-lg font-bold text-heading leading-[1.2]';
const MONTH_RANGE_CLASSES = 'text-xs text-foreground opacity-50';
const WEEK_BADGE_CLASSES =
  'inline-flex items-center px-2 py-0.5 rounded-sm bg-surface border border-border-base text-[11px] font-semibold text-foreground opacity-60';
const HEADER_RIGHT_CLASSES = 'flex items-center gap-2';

const NAV_BTN_CLASSES =
  'flex items-center justify-center size-8 rounded-md border border-border-base bg-background text-foreground cursor-pointer transition-colors duration-150 hover:bg-surface hover:border-accent-line';
const NAV_BTN_TEXT_CLASSES =
  'flex items-center gap-1 px-3 py-1.5 rounded-md border border-border-base bg-background text-foreground text-xs font-medium font-sans cursor-pointer transition-colors duration-150 hover:bg-surface hover:border-accent-line';
const ADD_BTN_CLASSES =
  'flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent text-white text-[13px] font-semibold font-sans cursor-pointer transition-[opacity,transform] duration-150 hover:opacity-90 hover:-translate-y-px';

interface CalendarHeaderProps {
  currentMonth: Date;
  displayDate: Date;
  weekNum: number;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
  onAddEvent?: () => void;
}

/**
 * Header del calendario con navegación de meses, badge de semana y botón de agregar evento.
 * Se adapta a móvil ocultando elementos no esenciales.
 */
export function CalendarHeader({
  currentMonth,
  displayDate,
  weekNum,
  goToPrevMonth,
  goToNextMonth,
  goToToday,
  onAddEvent,
}: CalendarHeaderProps) {
  const isMobile = useIsMobile();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  return (
    <div className={HEADER_CLASSES}>
      <div className={HEADER_LEFT_CLASSES}>
        <div className={DATE_BLOCK_CLASSES}>
          <span className={DATE_BLOCK_DAY_CLASSES}>{format(displayDate, 'dd')}</span>
          <span className={DATE_BLOCK_MONTH_CLASSES}>
            {format(displayDate, 'MMM', { locale: es })}
          </span>
        </div>
        <div className={HEADER_TITLE_CLASSES}>
          <span className={MONTH_TITLE_CLASSES}>
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </span>
          <span className={MONTH_RANGE_CLASSES}>
            {format(monthStart, 'd MMM', { locale: es })} –{' '}
            {format(monthEnd, 'd MMM yyyy', { locale: es })}
          </span>
        </div>
        {!isMobile && <span className={WEEK_BADGE_CLASSES}>Week {weekNum}</span>}
      </div>
      <div className={HEADER_RIGHT_CLASSES}>
        {!isMobile && (
          <button className={NAV_BTN_CLASSES} title="Buscar">
            <LuSearch size={15} />
          </button>
        )}
        <button className={NAV_BTN_CLASSES} onClick={goToPrevMonth} title="Mes anterior">
          <LuChevronLeft size={16} />
        </button>
        <button className={NAV_BTN_TEXT_CLASSES} onClick={goToToday}>
          Hoy
        </button>
        <button className={NAV_BTN_CLASSES} onClick={goToNextMonth} title="Mes siguiente">
          <LuChevronRight size={16} />
        </button>
        <button className={ADD_BTN_CLASSES} onClick={onAddEvent}>
          <LuPlus size={16} />
          {isMobile ? 'Add' : 'Add event'}
        </button>
      </div>
    </div>
  );
}
