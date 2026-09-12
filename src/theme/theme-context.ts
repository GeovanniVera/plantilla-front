import { createContext } from 'react';
import type { TokenKey } from './tokens';

export type TokenValues = Record<TokenKey, string>;

export interface ThemeContextValue {
  tokens: TokenValues;
  setColor: (variable: TokenKey, value: string) => void;
  resetTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
