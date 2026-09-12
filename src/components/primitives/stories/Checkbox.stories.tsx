import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import Checkbox, { CheckboxBase } from '../Checkbox';
import FormField from '@components/forms/FormField';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CheckboxProps } from '@components/forms/types';

const meta: Meta<CheckboxProps> = {
  title: 'Primitives/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  // Shared contract defaults so every story satisfies the controlled API.
  args: { checked: false, onChange: () => {} },
};
export default meta;

export const Basic: StoryObj<CheckboxProps> = {
  args: { label: 'Acepto los términos' },
};

function BaseAndRefDemo() {
  const baseRef = useRef<HTMLInputElement>(null);
  const [baseChecked, setBaseChecked] = useState(false);
  const [value, setValue] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <CheckboxBase
        ref={baseRef}
        aria-label="Base checkbox nativo"
        checked={baseChecked}
        onChange={(event) => setBaseChecked(event.target.checked)}
        required
        value="terms-v1"
      />
      <output data-testid="base-state">{baseChecked ? 'checked' : 'unchecked'}</output>
      <button type="button" onClick={() => baseRef.current?.focus()}>
        Focus base checkbox
      </button>
      <Checkbox checked={value} onChange={setValue} label="Checkbox de atajo" name="shorthand" />
      <button type="button" onClick={() => setValue((v) => !v)}>
        Toggle desde fuera
      </button>
    </div>
  );
}

export const NativeBaseAndForwardedRef: StoryObj<CheckboxProps> = {
  render: () => <BaseAndRefDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const base = canvas.getByRole('checkbox', { name: 'Base checkbox nativo' }) as HTMLInputElement;
    await expect(base.required).toBe(true);
    await expect(base.value).toBe('terms-v1');

    await userEvent.click(canvas.getByRole('button', { name: 'Focus base checkbox' }));
    await expect(base).toHaveFocus();
    // Native Space toggle on the real input.
    await userEvent.keyboard(' ');
    await expect(base.checked).toBe(true);
    await expect(canvas.getByTestId('base-state')).toHaveTextContent('checked');

    // External control of the shorthand.
    await userEvent.click(canvas.getByRole('button', { name: 'Toggle desde fuera' }));
    const shorthand = canvas.getByRole('checkbox', {
      name: 'Checkbox de atajo',
    }) as HTMLInputElement;
    await expect(shorthand.checked).toBe(true);
  },
};

export const ShorthandControlled: StoryObj<CheckboxProps> = {
  render: function ShorthandControlledDemo() {
    const [checked, setChecked] = useState(false);
    return (
      <div>
        <Checkbox
          checked={checked}
          onChange={setChecked}
          label="Suscribirme al boletín"
          name="newsletter"
        />
        <output data-testid="controlled-state" className="mt-2 block text-sm">
          {checked ? 'checked' : 'unchecked'}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', {
      name: 'Suscribirme al boletín',
    }) as HTMLInputElement;
    // Click on the label toggles the native input (label association).
    await userEvent.click(canvas.getByText('Suscribirme al boletín'));
    await expect(box.checked).toBe(true);
    await expect(canvas.getByTestId('controlled-state')).toHaveTextContent('checked');
    // data-checkbox-state is on the input, not the visual span.
    await expect(box).toHaveAttribute('data-checkbox-state', 'checked');
  },
};

export const KeyboardInteraction: StoryObj<CheckboxProps> = {
  render: function KeyboardDemo() {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={setChecked} label="Navegable con teclado" name="keyboard" />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Navegable con teclado' }) as HTMLInputElement;
    // Click the label to toggle the checkbox.
    await userEvent.click(canvas.getByText('Navegable con teclado'));
    await expect(box.checked).toBe(true);
    // Click again to uncheck.
    await userEvent.click(canvas.getByText('Navegable con teclado'));
    await expect(box.checked).toBe(false);
  },
};

export const Disabled: StoryObj<CheckboxProps> = {
  render: () => (
    <Checkbox checked onChange={() => {}} label="No disponible" disabled name="disabled" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'No disponible' }) as HTMLInputElement;
    await expect(box.disabled).toBe(true);
    // The label wrapper gets DISABLED_CLASSES which includes cursor-not-allowed.
    const label = box.closest('label')!;
    expect(label.className).toContain('cursor-not-allowed');
  },
};

export const Indeterminate: StoryObj<CheckboxProps> = {
  render: function IndeterminateDemo() {
    const [checked, setChecked] = useState(false);
    return (
      <div>
        <Checkbox
          checked={checked}
          onChange={setChecked}
          indeterminate
          label="Seleccionar todo"
          name="select-all"
        />
        <output data-testid="indeterminate-note" className="mt-2 block text-sm">
          {checked ? 'checked' : 'mixed (indeterminate)'}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: 'Seleccionar todo' }) as HTMLInputElement;
    // The real DOM property, not a visual simulation.
    await expect(box.indeterminate).toBe(true);
    // Click the label, not the input (input has pointer-events-none).
    await userEvent.click(canvas.getByText('Seleccionar todo'));
    // Clicking an indeterminate checkbox checks it and clears the property.
    await expect(box.indeterminate).toBe(false);
    await expect(box.checked).toBe(true);
    await expect(canvas.getByTestId('indeterminate-note')).toHaveTextContent('checked');
  },
};

export const ValidationStates: StoryObj<CheckboxProps> = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox
        checked={false}
        onChange={() => {}}
        label="Inválido"
        validationState="invalid"
        name="invalid"
      />
      <Checkbox checked onChange={() => {}} label="Válido" validationState="valid" name="valid" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [invalid] = Array.from(canvasElement.querySelectorAll('input[type="checkbox"]'));
    // aria-invalid is derived from the visual axis.
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
  },
};

export const WithFormField: StoryObj<CheckboxProps> = {
  render: () => (
    <FormField
      label="Aceptación"
      required
      error="Debes aceptar los términos"
      controlId="storybook-terms"
    >
      <Checkbox
        id="storybook-terms"
        checked={false}
        onChange={() => {}}
        validationState="invalid"
        name="terms"
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const box = canvas.getByRole('checkbox', { name: /Aceptación/ });
    // FormField associates the label, the error text and the invalid state.
    await expect(box).toHaveAttribute('aria-invalid', 'true');
    const describedBy = box.getAttribute('aria-describedby')!;
    await expect(describedBy).toContain('error');
    const errorNode = document.getElementById(
      describedBy.split(' ').find((id) => id.includes('error'))!,
    );
    await expect(errorNode).toHaveTextContent('Debes aceptar los términos');
  },
};
