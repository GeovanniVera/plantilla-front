import { useState, useCallback } from 'react';
import { addMonths, subMonths, getISOWeek } from 'date-fns';
import { useIsMobile } from '@hooks/useIsMobile';
import type { CalendarEvent, CalendarViewProps } from './types';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarList } from './CalendarList';

// Re-exportar tipos para consumidores externos
export type { CalendarEvent, CalendarViewProps, EventColor } from './types';

const ROOT_CLASSES = 'bg-background border border-border-base rounded-[16px] overflow-hidden';

/**
 * Calendario interactivo con vista desktop (grilla) y móvil (lista vertical).
 * Soporta drag & drop de eventos, navegación de meses y callbacks para interacción.
 */
export function CalendarView({
  events = [],
  onEventClick,
  onEventDrop,
  onAddEvent,
  onDayClick,
  onMoreClick,
  selectedDate,
  onDateSelect,
}: CalendarViewProps) {
  const isMobile = useIsMobile();
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [dragEvent, setDragEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);

  const today = new Date();

  // Navegación
  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect?.(new Date());
  };

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, event: CalendarEvent) => {
    setDragEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(event.id));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(date);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverDate(null), []);

  const handleDrop = useCallback(
    (e: React.DragEvent, date: Date) => {
      e.preventDefault();
      if (dragEvent && onEventDrop) onEventDrop(dragEvent, date);
      setDragEvent(null);
      setDragOverDate(null);
    },
    [dragEvent, onEventDrop],
  );

  const handleDragEnd = useCallback(() => {
    setDragEvent(null);
    setDragOverDate(null);
  }, []);

  // Header data
  const displayDate = selectedDate || today;
  const weekNum = getISOWeek(displayDate);

  const subProps = {
    events,
    currentMonth,
    selectedDate,
    onEventClick,
    onDayClick,
    onMoreClick,
    dragEvent,
    dragOverDate,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
  };

  return (
    <div className={ROOT_CLASSES}>
      <CalendarHeader
        currentMonth={currentMonth}
        displayDate={displayDate}
        weekNum={weekNum}
        goToPrevMonth={goToPrevMonth}
        goToNextMonth={goToNextMonth}
        goToToday={goToToday}
        onAddEvent={onAddEvent}
      />
      {isMobile ? <CalendarList {...subProps} /> : <CalendarGrid {...subProps} />}
    </div>
  );
}
