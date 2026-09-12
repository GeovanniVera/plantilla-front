/** Colores disponibles para las pills de eventos */
export type EventColor = 'blue' | 'green' | 'purple' | 'pink' | 'yellow' | 'red' | 'gray';

/** Evento del calendario */
export interface CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end?: Date;
  allDay?: boolean;
  color?: EventColor;
  meta?: Record<string, unknown>;
}

/** Props del componente CalendarView */
export interface CalendarViewProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  onAddEvent?: () => void;
  /** Click en celda de día (sin evento específico) */
  onDayClick?: (date: Date, events: CalendarEvent[]) => void;
  /** Click en "+N más" */
  onMoreClick?: (events: CalendarEvent[], date: Date) => void;
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

/** Props compartidas para los sub-componentes del calendario */
export interface CalendarSubComponentProps {
  events: CalendarEvent[];
  currentMonth: Date;
  selectedDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  onAddEvent?: () => void;
  onDayClick?: (date: Date, events: CalendarEvent[]) => void;
  onMoreClick?: (events: CalendarEvent[], date: Date) => void;
  onDateSelect?: (date: Date) => void;
}
