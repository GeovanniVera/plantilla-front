import { forwardRef } from 'react';
import type { ComponentPropsWithRef } from 'react';
import type {
  TextareaProps,
  TextareaSize,
  TextareaValidationState,
  TextareaVariant,
} from '@components/forms/types';
import { classes, isAriaInvalid } from '@lib/utils';

export type { TextareaProps, TextareaSize, TextareaValidationState, TextareaVariant };

export type TextareaAppearance = TextareaVariant;

/*
 * Native <textarea> props. `size` is not a native textarea attribute, but it
 * is still omitted to keep the visual axis unambiguous, mirroring the family.
 */
type NativeTextareaProps = Omit<ComponentPropsWithRef<'textarea'>, 'size'>;

export interface TextareaBaseProps extends NativeTextareaProps {
  size?: TextareaSize;
  validationState?: TextareaValidationState;
}

const CONTROL_CLASSES =
  'block w-full min-w-0 box-border font-sans text-foreground resize-y leading-normal outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-foreground/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface read-only:bg-surface read-only:cursor-default';

/* Size modulates text density and padding; height stays ruled by `rows`. */
const SIZE_CLASSES = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
} satisfies Record<TextareaSize, string>;

const APPEARANCE_CLASSES = {
  default:
    'border border-border-base rounded-md bg-background focus:border-accent focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_var(--accent-bg)]',
  filled:
    'border-0 border-b-2 border-b-border-base rounded-t-md bg-surface focus:border-b-accent focus-visible:border-b-accent',
  outlined:
    'border-2 border-border-base rounded-[10px] bg-transparent focus:border-accent focus-visible:border-accent focus-visible:shadow-[0_0_0_1px_var(--accent)]',
} satisfies Record<TextareaAppearance, string>;

const VALIDATION_CLASSES = {
  none: '',
  invalid:
    'border-danger border-b-danger focus:border-danger focus-visible:border-danger focus-visible:shadow-[0_0_0_3px_var(--danger-bg)]',
  valid:
    'border-success border-b-success focus:border-success focus-visible:border-success focus-visible:shadow-[0_0_0_3px_var(--success-bg)]',
} satisfies Record<TextareaValidationState, string>;

/*
 * No compound pieces and no Root shell: <textarea> owns its full box. Its
 * multiline content and resize behavior leave no room for side chrome, and
 * every composition need so far (counter, actions) lives below or above the
 * control — the consumer composes that in layout, not inside the control.
 * If a real need emerges, a Root wrapper can be added without breaking this
 * surface, because the shorthand already renders the control directly.
 */
export const TextareaBase = forwardRef<HTMLTextAreaElement, TextareaBaseProps>(
  function TextareaBase(
    { className, size = 'md', validationState = 'none', 'aria-invalid': ariaInvalid, ...props },
    ref,
  ) {
    const resolvedValidation = isAriaInvalid(ariaInvalid) ? 'invalid' : validationState;

    return (
      <textarea
        {...props}
        ref={ref}
        aria-invalid={ariaInvalid ?? (resolvedValidation === 'invalid' ? true : undefined)}
        data-validation={resolvedValidation}
        data-variant="default"
        className={classes(
          CONTROL_CLASSES,
          SIZE_CLASSES[size],
          APPEARANCE_CLASSES.default,
          VALIDATION_CLASSES[resolvedValidation],
          className,
        )}
      />
    );
  },
);

const TextareaShorthand = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    value,
    onChange,
    placeholder,
    disabled = false,
    readOnly = false,
    rows = 4,
    maxLength,
    name,
    id,
    variant,
    appearance = variant ?? 'default',
    size = 'md',
    validationState = 'none',
    className,
    'aria-invalid': ariaInvalid,
    ...textareaProps
  },
  ref,
) {
  const resolvedValidation = isAriaInvalid(ariaInvalid) ? 'invalid' : validationState;

  return (
    <textarea
      {...textareaProps}
      ref={ref}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
      maxLength={maxLength}
      name={name}
      id={id}
      aria-invalid={ariaInvalid ?? (resolvedValidation === 'invalid' ? true : undefined)}
      data-validation={resolvedValidation}
      data-variant={appearance}
      className={classes(
        CONTROL_CLASSES,
        SIZE_CLASSES[size],
        APPEARANCE_CLASSES[appearance],
        VALIDATION_CLASSES[resolvedValidation],
        className,
      )}
    />
  );
});

const Textarea = Object.assign(TextareaShorthand, {
  Base: TextareaBase,
});

export default Textarea;
