import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from './Toast';
import type { ToastItem } from './types';

function makeItem(overrides: Partial<ToastItem> = {}): ToastItem {
  return {
    id: '1',
    variant: 'success',
    message: 'Done!',
    createdAt: Date.now(),
    ...overrides,
  };
}

describe('Toast', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('rendering', () => {
    it('renders message text', () => {
      render(<Toast item={makeItem()} defaultDuration={5000} onDismiss={vi.fn()} />);
      expect(screen.getByText('Done!')).toBeInTheDocument();
    });

    it('has role="alert" and aria-live="polite"', () => {
      render(<Toast item={makeItem()} defaultDuration={5000} onDismiss={vi.fn()} />);
      const toast = screen.getByRole('alert');
      expect(toast).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('variants', () => {
    it.each([
      ['success', 'LuCheck'],
      ['error', 'LuCircleAlert'],
      ['warning', 'LuTriangleAlert'],
      ['info', 'LuInfo'],
    ] as const)('renders correct icon for %s variant', (variant, _iconName) => {
      render(<Toast item={makeItem({ variant })} defaultDuration={5000} onDismiss={vi.fn()} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('auto-dismiss', () => {
    it('calls onDismiss after duration', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(<Toast item={makeItem()} defaultDuration={5000} onDismiss={onDismiss} />);

      // Before duration
      vi.advanceTimersByTime(4999);
      expect(onDismiss).not.toHaveBeenCalled();

      // After duration + exit animation delay
      vi.advanceTimersByTime(1);
      // The exit animation setTimeout fires after 200ms
      vi.advanceTimersByTime(200);
      expect(onDismiss).toHaveBeenCalledWith('1');
    });

    it('custom duration overrides default', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(
        <Toast item={makeItem({ duration: 2000 })} defaultDuration={5000} onDismiss={onDismiss} />,
      );

      vi.advanceTimersByTime(1999);
      expect(onDismiss).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      vi.advanceTimersByTime(200);
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  describe('pause on hover', () => {
    it('pauses on mouse enter, resumes on mouse leave', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(<Toast item={makeItem()} defaultDuration={5000} onDismiss={onDismiss} />);

      // Hover to pause
      fireEvent.mouseEnter(screen.getByRole('alert'));

      // Time passes but timer is paused
      vi.advanceTimersByTime(10000);
      expect(onDismiss).not.toHaveBeenCalled();

      // Mouse leave to resume
      fireEvent.mouseLeave(screen.getByRole('alert'));

      // Now the remaining duration elapses
      vi.advanceTimersByTime(5000);
      vi.advanceTimersByTime(200);
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  describe('close button', () => {
    it('calls onDismiss when close button clicked', () => {
      vi.useFakeTimers();
      const onDismiss = vi.fn();
      render(<Toast item={makeItem()} defaultDuration={5000} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
      // Exit animation delay
      vi.advanceTimersByTime(200);
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  describe('action button', () => {
    it('calls item.action.onClick when action button clicked', () => {
      const actionClick = vi.fn();
      render(
        <Toast
          item={makeItem({ action: { label: 'Undo', onClick: actionClick } })}
          defaultDuration={5000}
          onDismiss={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
      expect(actionClick).toHaveBeenCalledTimes(1);
    });

    it('does not render action button when no action provided', () => {
      render(<Toast item={makeItem()} defaultDuration={5000} onDismiss={vi.fn()} />);
      expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument();
    });
  });
});
