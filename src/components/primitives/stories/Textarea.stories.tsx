import { useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import Textarea, { TextareaBase } from '../Textarea';
import FormField from '@components/forms/FormField';

import type { Meta, StoryObj } from '@storybook/react-vite';
import type { TextareaProps } from '@components/forms/types';

const meta: Meta<TextareaProps> = {
  title: 'Primitives/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  // Shared contract defaults so every story satisfies the controlled API.
  args: { value: '', onChange: () => {} },
};
export default meta;

export const Basic: StoryObj<TextareaProps> = {
  args: { placeholder: 'Escribe una descripción...' },
};

function RefForwardingDemo() {
  const baseRef = useRef<HTMLTextAreaElement>(null);
  const shorthandRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');

  return (
    <div className="flex w-72 flex-col gap-3">
      <TextareaBase
        ref={baseRef}
        aria-label="Base textarea nativo"
        defaultValue="Valor nativo"
        required
        maxLength={40}
        onChange={() => {}}
      />
      <button type="button" onClick={() => baseRef.current?.focus()}>
        Focus base textarea
      </button>
      <Textarea
        ref={shorthandRef}
        value={value}
        onChange={setValue}
        aria-label="Textarea de atajo"
      />
      <button type="button" onClick={() => shorthandRef.current?.focus()}>
        Focus shorthand textarea
      </button>
    </div>
  );
}

export const NativeBaseAndForwardedRef: StoryObj<TextareaProps> = {
  render: () => <RefForwardingDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const base = canvas.getByRole('textbox', {
      name: 'Base textarea nativo',
    }) as HTMLTextAreaElement;
    await expect(base.required).toBe(true);
    await expect(base.maxLength).toBe(40);
    // Uncontrolled: defaultValue flows through the native path.
    await expect(base.value).toBe('Valor nativo');

    await userEvent.click(canvas.getByRole('button', { name: 'Focus base textarea' }));
    await expect(base).toHaveFocus();
    await userEvent.type(base, ' texto');
    await expect(base.value).toBe('Valor nativo texto');

    await userEvent.click(canvas.getByRole('button', { name: 'Focus shorthand textarea' }));
    const shorthand = canvas.getByRole('textbox', {
      name: 'Textarea de atajo',
    }) as HTMLTextAreaElement;
    await expect(shorthand).toHaveFocus();
    await userEvent.type(shorthand, 'contenido');
    await expect(shorthand.value).toBe('contenido');
  },
};

export const ShorthandControlled: StoryObj<TextareaProps> = {
  render: function ShorthandControlledDemo() {
    const [value, setValue] = useState('');
    return (
      <div className="w-72">
        <Textarea
          value={value}
          onChange={setValue}
          placeholder="Escribe algo..."
          aria-label="Textarea controlado"
        />
        <output data-testid="controlled-value" className="mt-2 block text-sm">
          {value || '(vacío)'}
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByRole('textbox', {
      name: 'Textarea controlado',
    }) as HTMLTextAreaElement;
    await userEvent.type(area, 'Hola mundo');
    // The shorthand contract: onChange receives the string value.
    await expect(canvas.getByTestId('controlled-value')).toHaveTextContent('Hola mundo');
  },
};

export const Appearances: StoryObj<TextareaProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Textarea
        appearance="default"
        value="Texto"
        onChange={() => {}}
        aria-label="Textarea por defecto"
      />
      <Textarea
        appearance="filled"
        value="Texto"
        onChange={() => {}}
        aria-label="Textarea relleno"
      />
      <Textarea
        appearance="outlined"
        value="Texto"
        onChange={() => {}}
        aria-label="Textarea contorneado"
      />
      <Textarea
        variant="filled"
        value="Texto"
        onChange={() => {}}
        aria-label="Textarea alias legacy"
      />
    </div>
  ),
};

export const Sizes: StoryObj<TextareaProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Textarea size="sm" value="Pequeño" onChange={() => {}} aria-label="Textarea pequeño" />
      <Textarea size="md" value="Mediano" onChange={() => {}} aria-label="Textarea mediano" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [small, medium] = Array.from(canvasElement.querySelectorAll('textarea'));
    // Height stays ruled by rows; size modulates text density/padding only.
    await expect(getComputedStyle(small).fontSize).toBe('12px');
    await expect(getComputedStyle(medium).fontSize).toBe('14px');
    await expect(small.rows).toBe(4);
    await expect(medium.rows).toBe(4);
  },
};

export const DisabledVsReadOnly: StoryObj<TextareaProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Textarea
        value="No disponible"
        onChange={() => {}}
        disabled
        aria-label="Textarea deshabilitado"
      />
      <Textarea
        value="Solo lectura"
        onChange={() => {}}
        readOnly
        aria-label="Textarea de solo lectura"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('textbox', {
      name: 'Textarea deshabilitado',
    }) as HTMLTextAreaElement;
    await expect(disabled.disabled).toBe(true);
    expect(getComputedStyle(disabled).cursor).toBe('not-allowed');

    const readonly = canvas.getByRole('textbox', {
      name: 'Textarea de solo lectura',
    }) as HTMLTextAreaElement;
    await expect(readonly.readOnly).toBe(true);
    expect(getComputedStyle(readonly).cursor).not.toBe('not-allowed');
  },
};

export const ValidationStates: StoryObj<TextareaProps> = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <Textarea
        value=""
        onChange={() => {}}
        validationState="invalid"
        placeholder="Inválido"
        aria-label="Textarea inválido"
      />
      <Textarea
        value="Correcto"
        onChange={() => {}}
        validationState="valid"
        aria-label="Textarea válido"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [invalid, valid] = Array.from(canvasElement.querySelectorAll('textarea'));
    // aria-invalid is derived from the visual axis.
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(valid).not.toHaveAttribute('aria-invalid');
    await expect(invalid).toHaveAttribute('data-validation', 'invalid');
    // The invalid border paints through the danger token.
    await expect(getComputedStyle(invalid).borderTopColor).not.toBe(
      getComputedStyle(valid).borderTopColor,
    );
  },
};

export const NativeResize: StoryObj<TextareaProps> = {
  render: () => (
    <Textarea
      value="El usuario puede redimensionarme verticalmente."
      onChange={() => {}}
      aria-label="Textarea con resize"
    />
  ),
  play: async ({ canvasElement }) => {
    const area = canvasElement.querySelector('textarea')!;
    // resize-y is the family behavior: vertical resizing preserved.
    expect(getComputedStyle(area).resize).toBe('vertical');
  },
};

export const ErrorViaFormField: StoryObj<typeof Textarea> = {
  render: () => (
    <FormField
      label="Descripción"
      required
      error="La descripción es obligatoria"
      controlId="storybook-description"
    >
      <Textarea id="storybook-description" value="" onChange={() => {}} validationState="invalid" />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByRole('textbox', { name: /Descripción/ });

    // FormField associates the label, the error text and the invalid state.
    await expect(area).toHaveAttribute('aria-invalid', 'true');
    const describedBy = area.getAttribute('aria-describedby')!;
    await expect(describedBy).toContain('error');
    const errorNode = document.getElementById(
      describedBy.split(' ').find((id) => id.includes('error'))!,
    );
    await expect(errorNode).toHaveTextContent('La descripción es obligatoria');

    // The error bridge paints the control through data-variant.
    await expect(area).toHaveAttribute('data-variant', 'default');
  },
};
