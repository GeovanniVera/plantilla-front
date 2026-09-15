import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import type { CalendarEvent, CalendarSubComponentProps, EventColor } from './types';
import { getCalendarDays, groupEventsByDay } from './calendarHelpers';

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];

const WEEKDAYS_ROW_CLASSES = 'grid grid-cols-7 border-b border-border-base';
const WEEKDAY_CLASSES =
  'py-2.5 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground opacity-45 text-left';

const GRID_CLASSES = 'grid grid-cols-7';

const DAY_NUMBER_CLASSES =
  'day-number text-[13px] font-semibold text-foreground mb-1 w-[26px] h-[26px] flex items-center justify-center rounded-full';
const DAY_NUMBER_TODAY_CLASSES = 'bg-accent text-white';

const EVENTS_CONTAINER_CLASSES = 'flex flex-col gap-0.5';

const PILL_BASE_CLASSES =
  'flex items-center justify-between gap-1 px-1.5 py-[3px] rounded-sm text-[11px] cursor-grab transition-all duration-150 border border-transparent hover:translate-x-px hover:border-current active:cursor-grabbing active:opacity-70';
const PILL_DRAGGING_CLASSES = 'opacity-40';
const PILL_TITLE_BASE_CLASSES =
  'font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px]';
const PILL_TIME_CLASSES = 'font-medium opacity-70 whitespace-nowrap text-[10px]';

const OVERFLOW_CLASSES =
  'flex items-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold text-foreground opacity-50 cursor-pointer transition-opacity duration-150 hover:opacity-80 hover:bg-surface';

/* Colores de pills de eventos — literales locales deliberados (.12 tint + strong text),
 * NO design tokens (decisión fase 6B). */
const PILL_COLORS: Record<EventColor, string> = {
  blue: 'bg-[rgba(59,130,246,0.12)] text-[#2563eb]',
  green: 'bg-[rgba(34,197,94,0.12)] text-[#16a34a]',
  purple: 'bg-[rgba(139,92,246,0.12)] text-[#7c3aed]',
  pink: 'bg-[rgba(236,72,153,0.12)] text-[#db2777]',
  yellow: 'bg-[rgba(245,158,11,0.12)] text-[#d97706]',
  red: 'bg-[rgba(239,68,68,0.12)] text-[#dc2626]',
  gray: 'bg-[rgba(107,114,128,0.12)] text-[#6b7280]',
};

/* Los estados de celda tienen precedencia real (dragOver > today > outside > normal),
 * resueltos aquí en lugar de depender del orden del stylesheet. */
function cellClasses(isOutside: boolean, isTodayDate: boolean, isDragTarget: boolean) {
  const state = isDragTarget
    ? 'bg-accent-subtle outline-2 outline-dashed outline-accent -outline-offset-2'
    : isTodayDate
      ? 'bg-accent-subtle hover:bg-accent-subtle'
      : isOutside
        ? 'bg-transparent'
        : 'hover:bg-surface';
  return [
    'relative min-h-[100px] p-2 border-r border-b border-border-base transition-colors duration-100 [&:nth-child(7n)]:border-r-0',
    state,
    isOutside ? '[&_.day-number]:opacity-25' : '',
  ]
    .filter(Boolean)
    .join(' ');
}

interface CalendarGridProps extends CalendarSubComponentProps {
  dragEvent: CalendarEvent | null;
  dragOverDate: Date | null;
  onDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  onDragOver: (e: React.DragEvent, date: Date) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onDragEnd: () => void;
}

/**
 * Vista de grilla desktop (7 columnas) del calendario.
 * Muestra días del mes con pills de eventos y soporte drag & drop.
 */
export function CalendarGrid({
  events,
  currentMonth,
  dragEvent,
  dragOverDate,
  onEventClick,
  onMoreClick,
  onDayClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: CalendarGridProps) {
  const calendarDays = getCalendarDays(currentMonth);
  const eventsByDay = groupEventsByDay(events);

  const renderPill = (event: CalendarEvent) => {
    return (
      <div
        key={event.id}
        className={[
          PILL_BASE_CLASSES,
          PILL_COLORS[event.color || 'blue'],
          dragEvent?.id === event.id && PILL_DRAGGING_CLASSES,
        ]
          .filter(Boolean)
          .join(' ')}
        draggable
        onDragStart={(e) => onDragStart(e, event)}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick?.(event);
        }}
        title={`${event.title}${event.start ? ` — ${format(event.start, 'HH:mm')}` : ''}`}
      >
        <span className={PILL_TITLE_BASE_CLASSES}>{event.title}</span>
        {event.start && !event.allDay && (
          <span className={PILL_TIME_CLASSES}>{format(event.start, 'h:mm a')}</span>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Headers de días de la semana */}
      <div className={WEEKDAYS_ROW_CLASSES}>
        {WEEKDAYS.map((day) => (
          <div key={day} className={WEEKDAY_CLASSES}>
            {day}
          </div>
        ))}
      </div>

      {/* Grilla de días */}
      <div className={GRID_CLASSES}>
        {calendarDays.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay.get(dayKey) || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);
          const isDragTarget = dragOverDate && isSameDay(dragOverDate, day);

          return (
            <div
              key={dayKey}
              className={cellClasses(!isCurrentMonth, isTodayDate, !!isDragTarget)}
              onDragOver={(e) => onDragOver(e, day)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, day)}
              onClick={() => onDayClick?.(day, dayEvents)}
            >
              <div
                className={`${DAY_NUMBER_CLASSES} ${isTodayDate ? DAY_NUMBER_TODAY_CLASSES : ''}`}
              >
                {format(day, 'd')}
              </div>
              <div className={EVENTS_CONTAINER_CLASSES}>
                {dayEvents.slice(0, 3).map((evt) => renderPill(evt))}
                {dayEvents.length > 3 && (
                  <div
                    className={OVERFLOW_CLASSES}
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoreClick?.(dayEvents, day);
                    }}
                  >
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
