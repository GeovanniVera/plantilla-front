import { forwardRef } from 'react';
import type { RadioProps, RadioGroupProps } from '@components/forms/types';

export type { RadioProps, RadioGroupProps };

const LABEL_CLASSES = 'inline-flex items-center gap-2 cursor-pointer select-none';
const DISABLED_CLASSES = 'opacity-50 cursor-not-allowed';

const RADIO_BASE_CLASSES =
  'flex items-center justify-center size-[18px] shrink-0 rounded-full transition-[background,border-color] duration-150';

/*
 * Border width changes on check (outlined goes 2px -> 4px) are resolved
 * to one effective class set per state; the dot reuses the radio-in
 * mount animation defined in tailwind.css.
 */
const RADIO_VARIANT_CLASSES: Record<
  NonNullable<RadioProps['variant']>,
  { unchecked: string; checked: string }
> = {
  default: {
    unchecked: 'border-2 border-border-base bg-background',
    checked: 'border-2 border-accent bg-background',
  },
  filled: {
    unchecked: 'bg-surface',
    checked: 'bg-accent',
  },
  outlined: {
    unchecked: 'border-2 border-border-base bg-transparent',
    checked: 'border-4 border-accent bg-transparent',
  },
};

const RADIO_VALIDATION_CLASSES = {
  none: '',
  invalid: 'border-danger',
  valid: 'border-success',
} as const;

const INPUT_CLASSES = 'absolute size-0 opacity-0 pointer-events-none';
const TEXT_CLASSES = 'text-sm text-foreground';

const RadioShorthand = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    checked,
    onChange,
    label,
    disabled = false,
    name,
    value,
    id,
    variant = 'default',
    validationState = 'none',
    className,
  },
  ref,
) {
  const radioId = id ?? (name && value ? `radio-${name}-${value}` : undefined);
  const radioState = checked
    ? RADIO_VARIANT_CLASSES[variant].checked
    : RADIO_VARIANT_CLASSES[variant].unchecked;

  return (
    <label
      className={`${LABEL_CLASSES} ${disabled ? DISABLED_CLASSES : ''} ${className ?? ''}`}
      htmlFor={radioId}
    >
      <span
        data-variant={variant}
        data-validation={validationState}
        className={`${RADIO_BASE_CLASSES} ${radioState} ${RADIO_VALIDATION_CLASSES[validationState]}`}
      >
        {checked && <span className="bg-accent animate-radio-in size-2 rounded-full" />}
      </span>
      <input
        ref={ref}
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        name={name}
        value={value}
        id={radioId}
        className={INPUT_CLASSES}
      />
      {label && <span className={TEXT_CLASSES}>{label}</span>}
    </label>
  );
});

const Radio = Object.assign(RadioShorthand, {
  Group: RadioGroup,
});

export default Radio;

export function RadioGroup({
  value,
  onChange,
  options,
  name,
  disabled = false,
  variant = 'default',
  className,
}: RadioGroupProps) {
  return (
    <div className={`flex flex-col gap-2.5 ${className ?? ''}`} role="radiogroup">
      {options.map((opt) => (
        <Radio
          key={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          label={opt.label}
          disabled={disabled || opt.disabled}
          name={name}
          value={opt.value}
          variant={variant}
        />
      ))}
    </div>
  );
}
