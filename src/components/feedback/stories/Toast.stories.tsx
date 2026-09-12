import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ToastProvider } from '../ToastProvider';
import { useToast } from '../useToast';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ToastItem, ToastPosition } from '../types';

// ─── Demo harness: provider + trigger button ──────────────
interface ToastDemoProps {
  variant?: ToastItem['variant'];
  position?: ToastPosition;
  message?: string;
  duration?: number;
  count?: number;
}

function ToastDemo({
  variant = 'success',
  position = 'top-right',
  message = 'Guardado correctamente',
  duration = 5000,
  count = 1,
}: ToastDemoProps) {
  function Trigger() {
    const toast = useToast();
    return (
      <button
        className="cursor-pointer rounded-md border px-3 py-1.5"
        onClick={() => {
          for (let i = 0; i < count; i++) {
            const suffix = count > 1 ? ` #${i + 1}` : '';
            toast[variant](`${message}${suffix}`);
          }
        }}
      >
        Lanzar toast
      </button>
    );
  }

  return (
    <ToastProvider position={position} defaultDuration={duration}>
      <div className="p-6">
        <Trigger />
      </div>
    </ToastProvider>
  );
}

const meta: Meta<ToastDemoProps> = {
  title: 'Feedback/Toast',
  tags: ['autodocs'],
};
export default meta;

// ─── Semantic variants ────────────────────────────────────
export const Success: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'success', message: 'Guardado correctamente' },
};

export const Error: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'error', message: 'Error al guardar los cambios' },
};

export const Warning: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'warning', message: 'Quedan pocos créditos' },
};

export const Info: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'info', message: 'Hay una nueva versión disponible' },
};

/** Long content wraps inside the toast body instead of breaking layout. */
export const LongContent: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: {
    variant: 'info',
    message:
      'Mensaje largo para verificar el comportamiento de wrapping del cuerpo del toast cuando el texto excede el ancho máximo del contenedor.',
  },
};

// ─── Positions ────────────────────────────────────────────
export const TopCenter: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'success', position: 'top-center' },
};

export const BottomRight: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'success', position: 'bottom-right' },
};

export const BottomCenter: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'success', position: 'bottom-center' },
};

/** maxVisible = 3 by default; extra toasts queue until slots free up. */
export const MultipleToasts: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'success', count: 5, duration: 15000 },
};

// ─── Interaction ──────────────────────────────────────────
/** Toast appears via the semantic API and closes through its close button. */
export const OpenAndDismissManually: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'error', message: 'Error intencional de prueba' },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Lanzar toast'));

    const body = within(document.body);
    const alert = await body.findByRole('alert');
    await expect(alert.textContent).toContain('Error intencional de prueba');

    await userEvent.click(body.getByTitle('Cerrar'));
    // Exit animation runs 200ms before unmount
    await waitFor(() => expect(body.queryByRole('alert')).toBeNull());
  },
};

/** Auto-close honors defaultDuration. */
export const AutoClosesAfterDuration: StoryObj<ToastDemoProps> = {
  render: (args) => <ToastDemo {...args} />,
  args: { variant: 'success', duration: 800, message: 'Se cierra solo' },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Lanzar toast'));

    const body = within(document.body);
    await expect(await body.findByRole('alert')).toBeTruthy();
    await expect(
      new Promise<string>((resolve) =>
        setTimeout(() => resolve(body.queryByRole('alert') ? 'visible' : 'gone'), 1400),
      ),
    ).resolves.toBe('gone');
  },
};
