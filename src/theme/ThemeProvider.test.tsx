import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from './ThemeProvider';
import { defaultTokens } from './tokens';
import { useTheme } from './useTheme';

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

function ThemeConsumer() {
  const { tokens, setColor, resetTheme } = useTheme();
  return (
    <>
      <output aria-label="accent color">{tokens.accent}</output>
      <button onClick={() => setColor('accent', '#123456')}>Change accent</button>
      <button onClick={resetTheme}>Reset theme</button>
    </>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));

  it('loads saved tokens, updates public state, persists it, and resets defaults', async () => {
    const user = userEvent.setup();
    localStorage.setItem('brand-theme-v1', JSON.stringify({ accent: '#abcdef' }));

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText('accent color')).toHaveTextContent('#abcdef');
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#abcdef');

    await user.click(screen.getByRole('button', { name: 'Change accent' }));
    expect(screen.getByLabelText('accent color')).toHaveTextContent('#123456');
    expect(document.documentElement.style.getPropertyValue('--accent-bg')).toBe(
      'rgba(18, 52, 86, 0.1)',
    );
    expect(JSON.parse(localStorage.getItem('brand-theme-v1') ?? '{}')).toMatchObject({
      accent: '#123456',
    });

    await user.click(screen.getByRole('button', { name: 'Reset theme' }));
    expect(screen.getByLabelText('accent color')).toHaveTextContent(defaultTokens.accent);
  });

  it('rejects useTheme outside its provider', () => {
    function InvalidConsumer() {
      useTheme();
      return null;
    }

    expect(() => render(<InvalidConsumer />)).toThrow(
      'useTheme debe usarse dentro de <ThemeProvider>',
    );
  });

  it('does not derive translucent variants from invalid color strings', () => {
    function InvalidColorConsumer() {
      const { setColor } = useTheme();
      const [changed, setChanged] = useState(false);
      if (!changed) {
        setChanged(true);
        setColor('accent', 'invalid');
        setColor('secondary', 'invalid');
      }
      return null;
    }

    render(
      <ThemeProvider>
        <InvalidColorConsumer />
      </ThemeProvider>,
    );

    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('invalid');
  });
});
