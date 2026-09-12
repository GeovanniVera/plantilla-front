import { useState } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { Drawer } from '../Drawer';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Drawer> = {
  title: 'Overlays/Drawer',
  component: Drawer,
  tags: ['autodocs'],
};
export default meta;

interface DrawerDemoProps {
  width?: number;
  paragraphs?: number;
  label?: string;
  title?: string;
}

function DrawerDemo({
  width = 480,
  paragraphs = 2,
  label = 'Abrir drawer',
  title = 'Panel lateral',
}: DrawerDemoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="cursor-pointer rounded-md border px-3 py-1.5"
        onClick={() => setIsOpen(true)}
      >
        {label}
      </button>
      <Drawer isOpen={isOpen} onClose={() => setIsOpen(false)} width={width}>
        <Drawer.Header title={title} />
        <Drawer.Body>
          {Array.from({ length: paragraphs }).map((_, i) => (
            <p key={i} className="mb-3">
              Contenido {i + 1} del panel lateral para verificar scroll y espaciado.
            </p>
          ))}
        </Drawer.Body>
        <Drawer.Footer>
          <button
            className="cursor-pointer rounded-md border px-3 py-1.5"
            onClick={() => setIsOpen(false)}
          >
            Cerrar
          </button>
        </Drawer.Footer>
      </Drawer>
    </>
  );
}

export const Default: StoryObj<typeof DrawerDemo> = {
  render: () => <DrawerDemo />,
};

/** Long content must scroll inside the body instead of overflowing. */
export const LongContentScrolls: StoryObj<typeof DrawerDemo> = {
  render: () => <DrawerDemo paragraphs={40} />,
};

export const Narrow: StoryObj<typeof DrawerDemo> = {
  render: () => <DrawerDemo width={320} label="Drawer angosto" />,
};

export const CloseViaEscape: StoryObj<typeof DrawerDemo> = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir drawer'));
    const body = within(document.body);
    await expect(body.getByText('Panel lateral')).not.toBeNull();

    fireEvent.keyDown(window, { key: 'Escape' });
    await expect(body.queryByText('Contenido 1 del panel lateral')).toBeNull();
  },
};

export const CloseViaBackdrop: StoryObj<typeof DrawerDemo> = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir drawer'));

    const body = within(document.body);
    const overlays = document.querySelectorAll('.fixed.inset-0');
    fireEvent.click(overlays[overlays.length - 1]!);
    await expect(body.queryByText('Contenido 1 del panel lateral')).toBeNull();
  },
};

export const CloseViaHeaderButton: StoryObj<typeof DrawerDemo> = {
  render: () => <DrawerDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir drawer'));
    const body = within(document.body);

    // Header close button carries a descriptive title
    await userEvent.click(body.getByTitle('Cerrar'));
    await expect(body.queryByText('Contenido 1 del panel lateral')).toBeNull();
  },
};
