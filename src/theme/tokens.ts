// Tokens de color por defecto — cada token mapea a una CSS variable
export const defaultTokens = {
    primary:    '#0d9488',
    secondary:  '#6366f1',
    accent:     '#0d9488',
    background: '#f6f5f1',
    surface:    '#edecea',
    text:       '#5a5565',
    'text-h':   '#1a1525',
    border:     '#e4e2dc',
} as const

export type TokenKey = keyof typeof defaultTokens

// Mapeo de token → CSS variable name
export const tokenToVar: Record<TokenKey, string> = {
    primary:    '--primary',
    secondary:  '--secondary',
    accent:     '--accent',
    background: '--bg',
    surface:    '--code-bg',
    text:       '--text',
    'text-h':   '--text-h',
    border:     '--border',
}
