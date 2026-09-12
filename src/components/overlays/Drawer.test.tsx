import { render, screen, fireEvent } from '@testing-library/react'
import { Drawer } from './Drawer'

function DrawerTest({ isOpen = true, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <Drawer isOpen={isOpen} onClose={onClose ?? vi.fn()}>
      <Drawer.Header title="Test Title" />
      <Drawer.Body>Drawer body content</Drawer.Body>
      <Drawer.Footer>Drawer footer</Drawer.Footer>
    </Drawer>
  )
}

describe('Drawer', () => {
  describe('visibility', () => {
    it('renders nothing when isOpen is false', () => {
      render(<DrawerTest isOpen={false} />)
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('renders dialog when isOpen is true', () => {
      render(<DrawerTest isOpen={true} />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has role="dialog" and aria-modal="true"', () => {
      render(<DrawerTest />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })
  })

  describe('header', () => {
    it('renders title in header', () => {
      render(<DrawerTest />)
      expect(screen.getByText('Test Title')).toBeInTheDocument()
    })

    it('close button calls onClose', () => {
      const onClose = vi.fn()
      render(<DrawerTest onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: /cerrar/i }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('closing behavior', () => {
    it('Escape key calls onClose', () => {
      const onClose = vi.fn()
      render(<DrawerTest onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('overlay click calls onClose', () => {
      const onClose = vi.fn()
      render(<DrawerTest onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog.parentElement!)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('window content click does NOT call onClose', () => {
      const onClose = vi.fn()
      render(<DrawerTest onClose={onClose} />)
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  describe('composites', () => {
    it('Drawer.Body renders children', () => {
      render(<DrawerTest />)
      expect(screen.getByText('Drawer body content')).toBeInTheDocument()
    })

    it('Drawer.Footer renders children', () => {
      render(<DrawerTest />)
      expect(screen.getByText('Drawer footer')).toBeInTheDocument()
    })
  })
})
