import { useId } from 'react';
import { InputBase } from '@components/primitives/Input';

const NUMBER_FILTER_CLASSES = 'p-3 flex flex-col gap-2.5';
const NUMBER_ROW_CLASSES = 'flex items-center gap-2';
const NUMBER_LABEL_CLASSES = 'text-xs text-foreground min-w-[80px] shrink-0';
const NUMBER_HINT_CLASSES = 'text-[11px] text-foreground opacity-50 m-0 text-center';

interface NumberFilterContentProps {
  range?: { min?: number; max?: number };
  onChange: (range: { min?: number; max?: number }) => void;
}

/**
 * Contenido del filtro numérico (mayor/menor que).
 * Muestra dos inputs de número para definir un rango.
 */
export function NumberFilterContent({ range, onChange }: NumberFilterContentProps) {
  const inputId = useId();

  return (
    <div className={NUMBER_FILTER_CLASSES}>
      <div className={NUMBER_ROW_CLASSES}>
        <label htmlFor={`${inputId}-min`} className={NUMBER_LABEL_CLASSES}>
          Mayor que
        </label>
        <InputBase
          id={`${inputId}-min`}
          type="number"
          size="sm"
          className="bg-surface flex-1"
          placeholder="Mínimo"
          value={range?.min ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : Number(e.target.value);
            onChange({ ...range, min: val });
          }}
        />
      </div>
      <div className={NUMBER_ROW_CLASSES}>
        <label htmlFor={`${inputId}-max`} className={NUMBER_LABEL_CLASSES}>
          Menor que
        </label>
        <InputBase
          id={`${inputId}-max`}
          type="number"
          size="sm"
          className="bg-surface flex-1"
          placeholder="Máximo"
          value={range?.max ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : Number(e.target.value);
            onChange({ ...range, max: val });
          }}
        />
      </div>
      <p className={NUMBER_HINT_CLASSES}>Deja vacío para no aplicar límite.</p>
    </div>
  );
}
