import { createContext, useContext } from 'react';

export const ModalContext = createContext<(() => void) | null>(null);

/**
 * Id of the heading span rendered by `Modal.Header`/`Drawer.Header` when it
 * receives a `title`. The dialog root uses it for `aria-labelledby`; it is
 * null when the composed header renders no title.
 */
export const ModalTitleIdContext = createContext<string | null>(null);

export function useModalClose() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('Modal.Header/Body/Footer must be used inside <Modal> or <Drawer>');
  return ctx;
}
