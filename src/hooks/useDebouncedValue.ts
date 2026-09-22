import { useEffect, useState } from 'react';

/**
 * Devuelve una copia del valor que solo se actualiza tras `delay` ms sin cambios.
 *
 * Se usa para campos de búsqueda: evita disparar una request por cada tecla.
 * El debounce se cancela si el valor cambia antes de que venza el plazo.
 *
 * @param value Valor a debouncear
 * @param delay Milisegundos de espera (default 300)
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
