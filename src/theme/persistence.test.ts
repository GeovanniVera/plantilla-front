import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  localStorageAdapter,
  setStorageAdapter,
  loadTheme,
  saveTheme,
  resetTheme,
  type ThemeStorage,
} from './persistence';

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

describe('localStorageAdapter', () => {
  beforeEach(() => vi.stubGlobal('localStorage', memoryStorage()));

  it('loads an empty theme when no value is stored', () => {
    expect(localStorageAdapter.load()).toEqual({});
  });

  it('saves and loads a theme', () => {
    localStorageAdapter.save({ primary: '#ff0000', accent: '#00ff00' });
    expect(localStorageAdapter.load()).toEqual({ primary: '#ff0000', accent: '#00ff00' });
  });

  it('resets the stored theme', () => {
    localStorageAdapter.save({ primary: '#ff0000' });
    localStorageAdapter.reset();
    expect(localStorageAdapter.load()).toEqual({});
  });

  it('returns an empty theme for malformed storage data', () => {
    localStorage.setItem('brand-theme-v1', '{invalid');
    expect(localStorageAdapter.load()).toEqual({});
  });

  it('silently handles storage failures', () => {
    const getItem = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(localStorageAdapter.load()).toEqual({});
    getItem.mockRestore();

    const setItem = vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('full');
    });
    expect(() => localStorageAdapter.save({ primary: '#ff0000' })).not.toThrow();
    setItem.mockRestore();

    vi.spyOn(localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => localStorageAdapter.reset()).not.toThrow();
  });
});

describe('setStorageAdapter', () => {
  afterEach(() => setStorageAdapter(localStorageAdapter));

  it('allows switching storage adapter', () => {
    const mockAdapter: ThemeStorage = {
      load: vi.fn(() => ({ primary: '#mock' })),
      save: vi.fn(),
      reset: vi.fn(),
    };
    setStorageAdapter(mockAdapter);
    const result = loadTheme();
    expect(mockAdapter.load).toHaveBeenCalled();
    expect(result).toEqual({ primary: '#mock' });
  });

  it('uses the adapter for save', () => {
    const mockAdapter: ThemeStorage = {
      load: vi.fn(() => ({})),
      save: vi.fn(),
      reset: vi.fn(),
    };
    setStorageAdapter(mockAdapter);
    saveTheme({ accent: '#123456' });
    expect(mockAdapter.save).toHaveBeenCalledWith({ accent: '#123456' });
  });

  it('uses the adapter for reset', () => {
    const mockAdapter: ThemeStorage = {
      load: vi.fn(() => ({})),
      save: vi.fn(),
      reset: vi.fn(),
    };
    setStorageAdapter(mockAdapter);
    resetTheme();
    expect(mockAdapter.reset).toHaveBeenCalled();
  });
});

describe('high-level functions', () => {
  afterEach(() => setStorageAdapter(localStorageAdapter));

  it('loadTheme returns data from adapter', () => {
    const mockAdapter: ThemeStorage = {
      load: vi.fn(() => ({ accent: '#aaa' })),
      save: vi.fn(),
      reset: vi.fn(),
    };
    setStorageAdapter(mockAdapter);
    expect(loadTheme()).toEqual({ accent: '#aaa' });
  });
});
