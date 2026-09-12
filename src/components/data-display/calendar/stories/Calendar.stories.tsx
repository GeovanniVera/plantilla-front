import { expect, fireEvent } from 'storybook/test';
import { Calendar } from '../Calendar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Calendar> = {
  title: 'Data Display/Calendar/Calendar',
  component: Calendar,
  tags: ['autodocs'],
};
export default meta;

export const Default: StoryObj<typeof Calendar> = {};

/** A pre-selected date renders highlighted via the rdp-selected state. */
export const SelectedDate: StoryObj<typeof Calendar> = {
  args: { selected: new Date() },
  play: async () => {
    await expect(document.querySelectorAll('.rdp-selected').length).toBeGreaterThan(0);
  },
};

/** Days outside [minDate, maxDate] are disabled (opacity + not clickable). */
export const WithBounds: StoryObj<typeof Calendar> = {
  args: {
    minDate: new Date(Date.now() - 7 * 864e5),
    maxDate: new Date(Date.now() + 7 * 864e5),
  },
  play: async () => {
    const disabled = document.querySelectorAll('.rdp-day_button[disabled]');
    await expect(disabled.length).toBeGreaterThan(0);
  },
};

/** Clicking the next-month nav button updates the caption label. */
export const MonthNavigation: StoryObj<typeof Calendar> = {
  play: async () => {
    const before = document.querySelector('.rdp-month_caption')?.textContent;
    const nextBtn = document.querySelector<HTMLButtonElement>('.rdp-button_next');
    await expect(nextBtn).toBeTruthy();

    fireEvent.click(nextBtn!);
    const after = document.querySelector('.rdp-month_caption')?.textContent;
    await expect(after).not.toBe(before);
  },
};
