import { format, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CalendarEvent, CalendarSubComponentProps } from './types';
import { getCalendarDays, groupEventsByDay } from './calendarHelpers';

const MOBILE_LIST_CLASSES = 'flex flex-col';

const MOBILE_DAY_HEADER_CLASSES = 'flex items-center justify-between mb-2';
const MOBILE_DAY_LEFT_CLASSES = 'flex items-center gap-2';
const MOBILE_DAY_NUM_CLASSES =
  'text-lg font-bold text-heading w-8 h-8 flex items-center justify-center rounded-md';
const MOBILE_DAY_NUM_TODAY_CLASSES = 'bg-accent text-white';
const MOBILE_DAY_NAME_CLASSES = 'text-[13px] font-medium text-foreground opacity-60 capitalize';
const MOBILE_DAY_COUNT_CLASSES =
  'text-[11px] font-semibold text-foreground opacity-40 bg-surface px-2 py-0.5 rounded-[10px]';
const MOBILE_EVENTS_CLASSES = 'flex flex-col gap-1 pl-1';

const PILL_BASE_CLASSES =
  'flex items-center justify-between gap-1 px-1.5 py-[3px] rounded-sm text-[11px] cursor-grab transition-all duration-150 border border-transparent hover:translate-x-px hover:border-current active:cursor-grabbing active:opacity-70';
const PILL_DRAGGING_CLASSES = 'opacity-40';
const PILL_TITLE_BASE_CLASSES =
  'font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-none';
const PILL_TIME_CLASSES = 'font-medium opacity-70 whitespace-nowrap text-[10px]';

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

function mobileDayClasses(isTodayDate: boolean, isDragTarget: boolean) {
  const state = isDragTarget
    ? 'bg-accent-subtle outline-2 outline-dashed outline-accent -outline-offset-2'
    : isTodayDate
      ? 'bg-accent-subtle'
      : 'hover:bg-surface';
  return `px-4 py-3 border-b border-border-base transition-colors duration-100 ${state}`;
}

import type { EventColor } from './types';

interface CalendarListProps extends CalendarSubComponentProps {
  dragEvent: CalendarEvent | null;
  dragOverDate: Date | null;
  onDragStart: (e: React.DragEvent, event: CalendarEvent) => void;
  onDragOver: (e: React.DragEvent, date: Date) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, date: Date) => void;
  onDragEnd: () => void;
}

/**
 * Vista de lista vertical para móvil del calendario.
 * Muestra solo días del mes actual que tengan eventos, más hoy.
 */
export function CalendarList({
  events,
  currentMonth,
  dragEvent,
  dragOverDate,
  onEventClick,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: CalendarListProps) {
  const calendarDays = getCalendarDays(currentMonth);
  const eventsByDay = groupEventsByDay(events);

  // Solo mostrar días del mes actual que tengan eventos, + hoy
  const daysInMonth = calendarDays.filter((d) => isSameMonth(d, currentMonth));

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
    <div className={MOBILE_LIST_CLASSES}>
      {daysInMonth.map((day) => {
        const dayKey = format(day, 'yyyy-MM-dd');
        const dayEvents = eventsByDay.get(dayKey) || [];
        const isTodayDate = isToday(day);
        const isDragTarget = dragOverDate && isSameDay(dragOverDate, day);

        return (
          <div
            key={dayKey}
            className={mobileDayClasses(isTodayDate, !!isDragTarget)}
            onDragOver={(e) => onDragOver(e, day)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, day)}
          >
            {/* Day header */}
            <div className={MOBILE_DAY_HEADER_CLASSES}>
              <div className={MOBILE_DAY_LEFT_CLASSES}>
                <span
                  className={[MOBILE_DAY_NUM_CLASSES, isTodayDate && MOBILE_DAY_NUM_TODAY_CLASSES]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {format(day, 'd')}
                </span>
                <span className={MOBILE_DAY_NAME_CLASSES}>
                  {format(day, 'EEE', { locale: es })}
                </span>
              </div>
              {dayEvents.length > 0 && (
                <span className={MOBILE_DAY_COUNT_CLASSES}>{dayEvents.length}</span>
              )}
            </div>

            {/* Events */}
            {dayEvents.length > 0 && (
              <div className={MOBILE_EVENTS_CLASSES}>{dayEvents.map((evt) => renderPill(evt))}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
