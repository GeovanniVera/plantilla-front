import { useState, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { defaultTokens, tokenToVar, type TokenKey } from './tokens'
import { loadTheme as loadSaved, saveTheme as saveSaved, resetTheme as resetSaved } from './persistence'
import { ThemeContext, type TokenValues } from './theme-context'

/** Convierte hex a rgb para generar variantes translúcidas */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const match = hex.replace('#', '').match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
    if (!match) return null
    return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) }
}

/** Aplica los tokens al document.documentElement.style */
function applyTokensToDOM(tokens: TokenValues) {
    const el = document.documentElement.style

    // Aplicar tokens base
    for (const [key, cssVar] of Object.entries(tokenToVar) as [TokenKey, string][]) {
        el.setProperty(cssVar, tokens[key])
    }

    // Derivar variantes translúcidas de accent
    const accentRgb = hexToRgb(tokens.accent)
    if (accentRgb) {
        el.setProperty('--accent-bg', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.1)`)
        el.setProperty('--accent-border', `rgba(${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}, 0.35)`)
    }

    // Derivar variantes translúcidas de secondary
    const secondaryRgb = hexToRgb(tokens.secondary)
    if (secondaryRgb) {
        el.setProperty('--secondary-bg', `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1)`)
    }
}

interface ThemeProviderProps {
    children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [tokens, setTokens] = useState<TokenValues>(() => {
        const saved = loadSaved()
        return { ...defaultTokens, ...saved }
    })

    // Aplicar tokens al DOM cada vez que cambien
    useEffect(() => {
        applyTokensToDOM(tokens)
    }, [tokens])

    // Persistir cuando cambien (separado del updater para evitar side effects)
    useEffect(() => {
        saveSaved(tokens)
    }, [tokens])

    const setColor = useCallback((variable: TokenKey, value: string) => {
        setTokens((prev) => ({ ...prev, [variable]: value }))
    }, [])

    const resetTheme = useCallback(() => {
        resetSaved()
        setTokens({ ...defaultTokens } as TokenValues)
    }, [])

    // Memoizar el valor del contexto para evitar re-renders innecesarios
    const value = useMemo(
        () => ({ tokens, setColor, resetTheme }),
        [tokens, setColor, resetTheme],
    )

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}
