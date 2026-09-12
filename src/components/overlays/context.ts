import { createContext, useContext } from 'react';

export const ModalContext = createContext<(() => void) | null>(null);

export function useModalClose() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('Modal.Header/Body/Footer must be used inside <Modal> or <Drawer>');
  return ctx;
}
