import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays } from 'date-fns';
import type { CalendarEvent } from './types';

/**
 * Genera la matriz de días para mostrar en el calendario.
 * Incluye los días del mes anterior y siguiente para completar las semanas.
 *
 * @param currentMonth - Mes actual del calendario
 * @returns Array de fechas para mostrar en la grilla
 */
export function getCalendarDays(currentMonth: Date): Date[] {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let day = calStart;
  while (day <= calEnd) {
    days.push(day);
    day = addDays(day, 1);
  }
  return days;
}

/**
 * Agrupa eventos por día (key: yyyy-MM-dd).
 * Retorna un Map para acceso rápido O(1) por fecha.
 *
 * @param events - Lista de eventos del calendario
 * @returns Map con clave fecha → array de eventos
 */
export function groupEventsByDay(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();
  events.forEach((evt) => {
    const key = format(evt.start, 'yyyy-MM-dd');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(evt);
  });
  return map;
}
