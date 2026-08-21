import { useContext } from 'react'
import { ThemeContext } from './theme-context'

/** Hook para acceder al tema — debe usarse dentro de <ThemeProvider> */
export function useTheme() {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>')
    return ctx
}
