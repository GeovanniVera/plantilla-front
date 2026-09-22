import { useState } from 'react';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import { Modal } from '../Modal';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Modal> = {
  title: 'Overlays/Modal',
  component: Modal,
  tags: ['autodocs'],
};
export default meta;

// ─── Interactive wrapper ──────────────────────────────────
interface ModalDemoProps {
  width?: number;
  maxHeight?: string;
  paragraphs?: number;
  label?: string;
}

function ModalDemo({ width, maxHeight, paragraphs = 2, label = 'Abrir modal' }: ModalDemoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="cursor-pointer rounded-md border px-3 py-1.5"
        onClick={() => setIsOpen(true)}
      >
        {label}
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} width={width} maxHeight={maxHeight}>
        <Modal.Header title="Modal de ejemplo" />
        <Modal.Body>
          {Array.from({ length: paragraphs }).map((_, i) => (
            <p key={i} className="mb-3">
              Párrafo {i + 1}: contenido de ejemplo para verificar el comportamiento del cuerpo con
              scroll y el espaciado interno del modal.
            </p>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="cursor-pointer rounded-md border px-3 py-1.5"
            onClick={() => setIsOpen(false)}
          >
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

// ─── Stories ──────────────────────────────────────────────
const meta_story: StoryObj<typeof ModalDemo> = {};

export const Default: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo />,
};

export const LongContentScrolls: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo paragraphs={30} maxHeight="50vh" />,
};

export const Wide: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo width={760} label="Abrir modal ancho" />,
};

/** Regression coverage for the compound header close button. */
export const CloseViaHeaderButton: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir modal'));

    // Portal mounts on document.body
    const body = within(document.body);
    const closeBtn = body.getByTitle('Cerrar');
    await expect(closeBtn).toBeInTheDocument();

    await userEvent.click(closeBtn);
    await expect(body.queryByRole('dialog')).toBeNull();
    await expect(within(document.body).queryByTitle('Cerrar')).toBeNull();
  },
};

/** Escape closes the modal. */
export const CloseViaEscape: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir modal'));

    const body = within(document.body);
    await expect(fireEvent.keyDown(window, { key: 'Escape' })).toBe(true);
    await expect(body.queryByRole('dialog')).toBeNull();
  },
};

/** Clicking the backdrop (not the window) closes the modal. */
export const CloseViaBackdrop: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir modal'));

    const body = within(document.body);
    await expect(body.getByRole('dialog')).not.toBeNull();

    // The backdrop is a transparent sibling button behind the dialog; it is the
    // click target that triggers onClose, not the overlay element itself.
    const backdrop = body.getByRole('button', { name: 'Close' });
    await userEvent.click(backdrop);
    await expect(body.queryByRole('dialog')).toBeNull();
  },
};

/** Accessibility: role=dialog present while open. */
export const DialogRole: StoryObj<typeof ModalDemo> = {
  ...meta_story,
  render: () => <ModalDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Abrir modal'));
    const body = within(document.body);
    await expect(body.getAllByRole('dialog').length).toBeGreaterThan(0);
  },
};
