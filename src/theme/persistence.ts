import type { TokenKey } from './tokens'

// Tipo del mapa de temas guardados
export type ThemeMap = Partial<Record<TokenKey, string>>

// Interfaz del adaptador de persistencia
// Se puede reemplazar por un adaptador de API sin tocar el resto de la app
export interface ThemeStorage {
    load(): ThemeMap
    save(theme: ThemeMap): void
    reset(): void
}

// --- Adaptador por defecto: localStorage ---
const STORAGE_KEY = 'brand-theme-v1'

export const localStorageAdapter: ThemeStorage = {
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            return raw ? JSON.parse(raw) : {}
        } catch {
            return {}
        }
    },
    save(theme) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
        } catch {
            // Silently fail if localStorage is full
        }
    },
    reset() {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            // Silently fail
        }
    },
}

// --- Funciones de alto nivel (desacopladas del storage) ---

let storage: ThemeStorage = localStorageAdapter

/** Cambiar el adaptador de persistencia (ej: para API) */
export function setStorageAdapter(adapter: ThemeStorage) {
    storage = adapter
}

/** Cargar tema guardado */
export function loadTheme(): ThemeMap {
    return storage.load()
}

/** Guardar tema */
export function saveTheme(theme: ThemeMap) {
    storage.save(theme)
}

/** Restablecer valores por defecto */
export function resetTheme() {
    storage.reset()
}


