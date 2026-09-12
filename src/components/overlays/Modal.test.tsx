import { render, screen, fireEvent } from '@testing-library/react'
import { Modal } from './Modal'

function ModalTest({ isOpen = true, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose ?? vi.fn()}>
      <Modal.Header title="Test Title" />
      <Modal.Body>Modal body content</Modal.Body>
      <Modal.Footer>Modal footer</Modal.Footer>
    </Modal>
  )
}

describe('Modal', () => {
  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      render(<ModalTest isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders dialog when isOpen is true', () => {
      render(<ModalTest isOpen={true} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      render(<ModalTest />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })

  describe('header', () => {
    it('renders title in header', () => {
      render(<ModalTest />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('close button calls onClose', () => {
      const onClose = vi.fn()
      render(<ModalTest onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('closing behavior', () => {
    it('Escape key calls onClose', () => {
      const onClose = vi.fn()
      render(<ModalTest onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('overlay click calls onClose', () => {
      const onClose = vi.fn()
      render(<ModalTest onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      // The overlay is the parent fixed-position div of the dialog
      fireEvent.click(dialog.parentElement!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('window content click does NOT call onClose', () => {
      const onClose = vi.fn()
      render(<ModalTest onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('composites', () => {
    it('Modal.Body renders children', () => {
      render(<ModalTest />)
      expect(screen.getByText('Modal body content')).toBeInTheDocument()
    })

    it('Modal.Footer renders children', () => {
      render(<ModalTest />)
      expect(screen.getByText('Modal footer')).toBeInTheDocument()
    })
  })
})
