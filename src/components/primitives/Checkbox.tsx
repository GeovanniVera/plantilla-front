import { forwardRef, useCallback } from 'react';
import { LuCheck, LuMinus } from 'react-icons/lu';
import type { ComponentPropsWithRef } from 'react';
import type { CheckboxProps, CheckboxSize, CheckboxValidationState } from '@components/forms/types';

export type { CheckboxProps, CheckboxSize, CheckboxValidationState };

type NativeCheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'size' | 'type'>;

/*
 * Close to the metal: a real <input type="checkbox"> with family tokens via
 * accent-color. Native semantics (Space toggle, Tab, form participation) come
 * from the element itself; no custom chrome, no business logic.
 */
export const CheckboxBase = forwardRef<
  HTMLInputElement,
  NativeCheckboxProps & { size?: CheckboxSize }
>(function CheckboxBase({ className, size = 'md', ...props }, ref) {
  return (
    <input
      {...props}
      ref={ref}
      type="checkbox"
      data-checkbox-size={size}
      className={`accent-accent size-4 shrink-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ''}`}
    />
  );
});

const LABEL_CLASSES = 'inline-flex items-center gap-2 cursor-pointer select-none';
const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed';

const BOX_BASE_CLASSES =
  'flex items-center justify-center shrink-0 text-white transition-[background,border-color,box-shadow,transform] duration-150 peer-focus-visible:outline-2 peer-focus-visible:outline-accent peer-focus-visible:outline-offset-2';

const BOX_SIZE_CLASSES = {
  sm: 'size-4 rounded-[4px]',
  md: 'size-[18px] rounded-[5px]',
} satisfies Record<CheckboxSize, string>;

/*
 * One effective class set per state (no competing utilities). The checked
 * look is driven by the native input through peer-checked:, so CSS — not a
 * React ternary — mirrors the DOM state.
 */
const BOX_STATE_CLASSES = {
  unchecked: 'border-2 border-border-base bg-background',
  checked: 'border-accent border-2 bg-accent',
  indeterminate: 'border-accent border-2 bg-accent',
} as const;

const INPUT_CLASSES =
  'peer absolute size-0 opacity-0 pointer-events-none disabled:cursor-not-allowed';

const TEXT_CLASSES = 'text-sm text-foreground';

const BOX_VALIDATION_CLASSES = {
  none: '',
  invalid: 'border-danger',
  valid: '',
} satisfies Record<CheckboxValidationState, string>;

const CheckboxShorthand = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    checked,
    onChange,
    label,
    disabled = false,
    required,
    indeterminate = false,
    size = 'md',
    validationState = 'none',
    name,
    id,
    className,
    'aria-invalid': ariaInvalid,
    ...inputProps
  },
  ref,
) {
  /*
   * `indeterminate` is not an HTML attribute: it only exists as a DOM
   * property on the element. A merged ref callback sets it on every render
   * while preserving the consumer's own ref access.
   */
  const setIndeterminate = useCallback(
    (node: HTMLInputElement | null) => {
      if (!node) return;
      node.indeterminate = indeterminate;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [indeterminate, ref],
  );

  const checkboxId = id ?? (name ? `checkbox-${name}` : undefined);
  const state: keyof typeof BOX_STATE_CLASSES = indeterminate
    ? 'indeterminate'
    : checked
      ? 'checked'
      : 'unchecked';

  return (
    <label
      className={`${LABEL_CLASSES} ${disabled ? DISABLED_CLASSES : ''} ${className ?? ''}`}
      htmlFor={checkboxId}
    >
      <input
        {...inputProps}
        ref={setIndeterminate}
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        disabled={disabled}
        required={required}
        aria-invalid={ariaInvalid ?? (validationState === 'invalid' ? true : undefined)}
        data-checkbox-state={state}
        className={INPUT_CLASSES}
      />
      <span
        aria-hidden="true"
        className={`${BOX_BASE_CLASSES} ${BOX_SIZE_CLASSES[size]} ${BOX_STATE_CLASSES[state]} ${BOX_VALIDATION_CLASSES[validationState]}`}
      >
        {indeterminate ? (
          <LuMinus size={12} strokeWidth={3} />
        ) : (
          checked && <LuCheck size={12} strokeWidth={3} />
        )}
      </span>
      {label && <span className={TEXT_CLASSES}>{label}</span>}
    </label>
  );
});

const Checkbox = Object.assign(CheckboxShorthand, {
  Base: CheckboxBase,
});

export default Checkbox;
