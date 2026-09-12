// Tokens de color por defecto — cada token mapea a una CSS variable
export const defaultTokens = {
  primary: '#044311',
  secondary: '#044311',
  accent: '#044311',
  background: '#ffffff',
  surface: '#ffffff',
  text: '#5a5565',
  'text-h': '#1a1525',
  border: '#e4e2dc',
} as const;

export type TokenKey = keyof typeof defaultTokens;

// Mapeo de token → CSS variable name
export const tokenToVar: Record<TokenKey, string> = {
  primary: '--primary',
  secondary: '--secondary',
  accent: '--accent',
  background: '--bg',
  surface: '--code-bg',
  text: '--text',
  'text-h': '--text-h',
  border: '--border',
};
