import { useId, useContext } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { FormFieldProps } from './types';
import { FormContext } from './FormContext';

/*
 * Los bordes de error para los controles envueltos vienen de Form.module.css
 * (.fieldError [data-variant]) — los controles emiten data-variant (6D.2)
 * y los overrides descendientes no se expresan seguramente como utilities.
 */
import styles from '@components/primitives/Form.module.css';

const WRAPPER_CLASSES = 'flex flex-col gap-1.5';
const DISABLED_CLASSES = 'opacity-60 pointer-events-none';

const LABEL_CLASSES = 'text-[13px] font-semibold text-heading';
const REQUIRED_CLASSES = 'text-danger-strong ml-0.5';
const INPUT_WRAP_CLASSES = 'flex flex-col';
const ERROR_TEXT_CLASSES = 'text-xs text-danger-strong';
const HELPER_TEXT_CLASSES = 'text-xs text-foreground opacity-60';

/*
 * variant="floating" preserva el comportamiento PRE-EXISTENTE exacto: el label
 * se renderiza como un overlay estático centrado sobre el control. La interacción
 * de float-up nunca funcionó con este orden del DOM (los selectores legacy
 * requerían el label DESPUÉS del control); documentado como bug conocido,
 * deliberadamente no rediseñado aquí.
 */
const FLOATING_LABEL_CLASSES =
  'absolute top-1/2 left-3 -translate-y-1/2 text-sm font-normal text-foreground opacity-50 pointer-events-none transition-[opacity,transform] duration-200 z-10';

/**
 * Wrapper presentacional de campo: label, helper, error, layout y
 * asociación accesible básica. No valida ni posee estado de valor —
 * la aplicación decide de dónde viene `error`.
 *
 * Cuando se usa dentro de <Form>, lee automáticamente error del contexto
 * por el prop `name`. El prop `error` explícito tiene prioridad.
 *
 * Contrato de accesibilidad:
 * - El label es un <label> real asociado con el control (ver controlId).
 * - Los textos helper y error se vinculan al control via aria-describedby.
 * - Mientras `error` esté seteado, el wrapper se anuncia como inválido
 *   y el texto de error es una live region assertiva.
 *
 * Resolución del id del control, en orden:
 * 1. El propio `id` del child control — gana si está presente.
 * 2. El prop explícito `controlId` — para controles compound.
 * 3. Un id auto-generado mergeado en el child control.
 */
export default function FormField({
  label,
  required = false,
  name,
  error: errorProp,
  helper,
  disabled = false,
  variant = 'default',
  children,
  className,
  controlId,
}: FormFieldProps) {
  const isFloating = variant === 'floating';
  const autoId = useId();
  const errorId = `${autoId}-error`;
  const helperId = `${autoId}-helper`;

  // Leer error del contexto del formulario (si existe)
  const formCtx = useContext(FormContext);
  const error = errorProp ?? (name && formCtx ? formCtx.errors[name] : undefined);

  // El form control que recibe la wiring de label/describedby. Solo un solo
  // child element puede ser wired automáticamente; controles compound
  // usan el prop explícito `controlId`.
  let control: ReactElement<Record<string, unknown>> | null = null;
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    const element = children as ReactElement<Record<string, unknown>>;
    if (
      typeof element.type === 'string' ||
      typeof element.type === 'function' ||
      typeof element.type === 'object'
    ) {
      control = element;
    }
  }

  const childElementId = control ? (control.props.id as string | undefined) : undefined;
  const appliedId = childElementId ?? controlId ?? autoId;
  const labelTargetId = control ? appliedId : controlId;
  const describedBy =
    [!error && helper ? helperId : undefined, error ? errorId : undefined]
      .filter(Boolean)
      .join(' ') || undefined;

  let controlNode: ReactNode = children;
  if (control) {
    const element = control as ReactElement<Record<string, unknown>>;
    controlNode = {
      ...element,
      props: {
        ...element.props,
        id: appliedId,
        'aria-describedby': element.props['aria-describedby'] ?? describedBy,
        'aria-invalid': element.props['aria-invalid'] ?? (error ? true : undefined),
      },
    };
  }

  return (
    <div
      className={`${WRAPPER_CLASSES} ${isFloating ? 'relative' : ''} ${error ? styles.fieldError : ''} ${disabled ? DISABLED_CLASSES : ''} ${className ?? ''}`}
    >
      {label &&
        (labelTargetId ? (
          <label
            className={`${isFloating ? FLOATING_LABEL_CLASSES : LABEL_CLASSES}`}
            htmlFor={labelTargetId}
          >
            {label}
            {required && <span className={REQUIRED_CLASSES}>*</span>}
          </label>
        ) : (
          // No hay control id alcanzable: mantener el label decorativo legacy.
          <span
            className={`${isFloating ? FLOATING_LABEL_CLASSES : LABEL_CLASSES}`}
            aria-hidden="true"
          >
            {label}
            {required && <span className={REQUIRED_CLASSES}>*</span>}
          </span>
        ))}
      <div className={INPUT_WRAP_CLASSES}>{controlNode}</div>
      {error && (
        <span id={errorId} className={ERROR_TEXT_CLASSES} role="alert">
          {error}
        </span>
      )}
      {!error && helper && (
        <span id={helperId} className={HELPER_TEXT_CLASSES}>
          {helper}
        </span>
      )}
    </div>
  );
}
