import { addDays } from 'date-fns';
import { CalendarView } from '../CalendarView';

import type { Meta, StoryObj } from '@storybook/react-vite';

const today = new Date();

const meta: Meta<typeof CalendarView> = {
  title: 'Data Display/Calendar/CalendarView',
  component: CalendarView,
  tags: ['autodocs'],
};
export default meta;

export const Default: StoryObj<typeof CalendarView> = {};

/** Several events across different days and category colors. */
export const WithEvents: StoryObj<typeof CalendarView> = {
  args: {
    events: [
      { id: 1, title: 'Revisión semanal', start: addDays(today, 0), color: 'blue' },
      { id: 2, title: 'Cierre de mes', start: addDays(today, 2), color: 'purple' },
      {
        id: 3,
        title: 'Entrega de proyecto',
        start: addDays(today, 4),
        color: 'green',
        allDay: true,
      },
      { id: 4, title: 'Auditoría interna', start: addDays(today, -3), color: 'pink' },
      { id: 5, title: 'Backup', start: addDays(today, 9), color: 'yellow' },
      { id: 6, title: 'Mantenimiento', start: addDays(today, 11), color: 'red' },
      { id: 7, title: 'Sin categoría', start: addDays(today, 13), color: 'gray' },
    ],
  },
};

/** Today's cell is highlighted; four events on one day trigger the "+N más" overflow. */
export const TodayWithOverflow: StoryObj<typeof CalendarView> = {
  args: {
    events: Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      title: `Evento ${i + 1}`,
      start: today,
      color: (['blue', 'green', 'purple', 'pink'] as const)[i % 4],
    })),
  },
};

/** Drag-and-drop between cells is enabled when onEventDrop is provided. */
export const Draggable: StoryObj<typeof CalendarView> = {
  args: {
    events: [{ id: 1, title: 'Arrastrable', start: today, color: 'blue' }],
    onEventClick: undefined,
    onEventDrop: () => {},
    onDayClick: () => {},
  },
};
