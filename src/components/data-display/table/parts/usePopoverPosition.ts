import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook para calcular la posición de un popover relativa al viewport.
 * Maneja scroll, resize y flips verticales/horizontales cuando se sale de pantalla.
 *
 * @param isOpen - Si el popover está abierto
 * @returns Estilos CSS para posicionar el popover
 */
export function usePopoverPosition(isOpen: boolean) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calcula la posición del popover relativa al botón trigger
  const updatePosition = useCallback(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
      });
    }
  }, []);

  // Actualiza posición al abrir y al hacer scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, updatePosition]);

  // Cierra al hacer click fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        // Se cierra desde el componente padre
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Cierra con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Se cierra desde el componente padre
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Ajusta posición si el popover se sale de la pantalla
  const popoverStyle: React.CSSProperties = useMemo(() => {
    if (!isOpen) return { display: 'none' };

    const style: React.CSSProperties = {
      position: 'fixed',
      top: position.top,
      left: position.left,
      zIndex: 9999,
    };

    // Si se sale por la derecha, alinear a la derecha del botón
    if (position.left + 240 > window.innerWidth) {
      style.left = 'auto';
      style.right = window.innerWidth - position.left;
    }

    // Si se sale por abajo, mostrar hacia arriba
    if (position.top + 300 > window.innerHeight) {
      style.top = 'auto';
      if (buttonRef.current) {
        style.bottom = window.innerHeight - buttonRef.current.getBoundingClientRect().top + 6;
      }
    }

    return style;
  }, [isOpen, position]);

  return { popoverRef, buttonRef, popoverStyle };
}
