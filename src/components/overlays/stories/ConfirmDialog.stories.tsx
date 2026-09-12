import { expect, fn, userEvent, within } from 'storybook/test';
import { ConfirmDialog } from '../ConfirmDialog';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ConfirmDialog> = {
  title: 'Overlays/ConfirmDialog',
  component: ConfirmDialog,
  tags: ['autodocs'],
  args: {
    isOpen: true,
    onClose: fn(),
    onConfirm: fn(),
    title: 'Eliminar elemento',
    message: 'Esta acción no se puede deshacer. ¿Deseas continuar?',
  },
};
export default meta;

export const Default: StoryObj<typeof ConfirmDialog> = {};

export const Destructive: StoryObj<typeof ConfirmDialog> = {
  args: { variant: 'destructive', title: 'Eliminar proyecto', confirmLabel: 'Sí, eliminar' },
};

export const Warning: StoryObj<typeof ConfirmDialog> = {
  args: { variant: 'warning', title: 'Cambios sin guardar', confirmLabel: 'Descartar' },
};

export const Info: StoryObj<typeof ConfirmDialog> = {
  args: { variant: 'info', title: 'Nueva versión disponible', confirmLabel: 'Actualizar' },
};

/** Confirm fires onConfirm + onClose; Cancel fires only onClose. */
export const ConfirmAndCancelCallbacks: StoryObj<typeof ConfirmDialog> = {
  args: { ...meta.args },
  play: async () => {
    const body = within(document.body);

    // Cancel: dialog closes without confirming
    await userEvent.click(body.getByText('Cancelar'));
    await expect(meta.args!.onClose as unknown as ReturnType<typeof fn>).toHaveBeenCalled();
    await expect(meta.args!.onConfirm as unknown as ReturnType<typeof fn>).not.toHaveBeenCalled();
  },
};

export const ConfirmCallbackFires: StoryObj<typeof ConfirmDialog> = {
  args: { ...meta.args },
  play: async () => {
    const body = within(document.body);
    await userEvent.click(body.getByText('Confirmar'));
    await expect(meta.args!.onConfirm as unknown as ReturnType<typeof fn>).toHaveBeenCalledTimes(1);
  },
};

export const KeyboardAccessible: StoryObj<typeof ConfirmDialog> = {
  args: { ...meta.args },
  play: async () => {
    const body = within(document.body);
    await expect(body.getAllByRole('dialog').length).toBeGreaterThan(0);
    await expect(body.getByText('Cancelar')).toBeInTheDocument();
    await expect(body.getByText('Confirmar')).toBeInTheDocument();
  },
};
