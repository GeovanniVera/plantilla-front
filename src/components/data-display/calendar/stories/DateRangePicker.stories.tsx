import { expect, within } from 'storybook/test';
import { DateRangePicker } from '../Calendar';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof DateRangePicker> = {
  title: 'Data Display/Calendar/DateRangePicker',
  component: DateRangePicker,
  tags: ['autodocs'],
};
export default meta;

export const Default: StoryObj<typeof DateRangePicker> = {};

export const WithPartialRange: StoryObj<typeof DateRangePicker> = {
  args: { from: new Date() },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    // Partial range renders with the ellipsis suffix
    await expect(/— \.\.\./.test(within(canvasElement).getByRole('button').textContent ?? '')).toBe(
      true,
    );
  },
};

export const WithCompleteRange: StoryObj<typeof DateRangePicker> = {
  args: {
    from: new Date(Date.now() - 4 * 864e5),
    to: new Date(),
  },
};
