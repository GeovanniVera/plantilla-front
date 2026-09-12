import { expect } from 'storybook/test';
import { CalendarRange } from '../Calendar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof CalendarRange> = {
  title: 'Data Display/Calendar/CalendarRange',
  component: CalendarRange,
  tags: ['autodocs'],
};
export default meta;

export const RangeEmpty: StoryObj<typeof CalendarRange> = {};

/** Partial range: only the start date is selected. */
export const RangePartial: StoryObj<typeof CalendarRange> = {
  args: { from: new Date() },
  play: async () => {
    // TEMP DEBUG
    const grid = document.querySelector('[class*="rdp"]');
    console.log('RDP-DUMP:', grid ? grid.parentElement?.innerHTML.slice(0, 600) : 'no rdp element');
    await expect(document.querySelectorAll('.rdp-selected').length).toBeGreaterThan(0);
    await expect(document.querySelectorAll('.rdp-range_end').length).toBe(0);
  },
};

/** Complete range: start, end and middle days are styled by rdp modifiers. */
export const RangeComplete: StoryObj<typeof CalendarRange> = {
  args: {
    from: new Date(Date.now() - 3 * 864e5),
    to: new Date(),
  },
  play: async () => {
    await expect(document.querySelectorAll('.rdp-range_start').length).toBeGreaterThan(0);
    await expect(document.querySelectorAll('.rdp-range_end').length).toBeGreaterThan(0);
  },
};

/** Clicking a day starts a new range selection (verify interactively). */
export const RangeInteraction: StoryObj<typeof CalendarRange> = {};
