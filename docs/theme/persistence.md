# Persistencia del tema

`persistence.ts` implementa la persistencia del tema con **strategy pattern**: una interfaz `ThemeStorage` define el contrato y las funciones de alto nivel (`loadTheme`, `saveTheme`, `resetTheme`) quedan desacopladas de la implementación concreta, que se intercambia vía `setStorageAdapter`.

## Interfaz `ThemeStorage`

```ts
export type ThemeMap = Partial<Record<TokenKey, string>>;

export interface ThemeStorage {
  load(): ThemeMap;
  save(theme: ThemeMap): void;
  reset(): void;
}
```

- `load()` retorna el mapa de tokens guardado (puede ser parcial: el merge con los defaults ocurre en `ThemeProvider`).
- `save(theme)` persiste el mapa completo.
- `reset()` elimina el tema guardado.

## Adaptador por defecto: `localStorageAdapter`

```ts
export const localStorageAdapter: ThemeStorage;
```

| Aspecto | Valor |
|---|---|
| Clave de storage | `brand-theme-v1` |
| Formato | JSON (`JSON.stringify` / `JSON.parse`) |
| Manejo de errores | `try/catch` silencioso en los tres métodos |

- `load()` retorna `{}` si no hay datos o el JSON es inválido.
- `save()` falla silenciosamente si `localStorage` está lleno.
- `reset()` falla silenciosamente si el storage no está disponible.

El `try/catch` silencioso garantiza que una falla de persistencia nunca rompa el flujo de la aplicación.

## Funciones de alto nivel

Todas operan sobre una variable de módulo (`storage`) inicializada con `localStorageAdapter`:

| Función | Comportamiento |
|---|---|
| `loadTheme(): ThemeMap` | Delega en `storage.load()` |
| `saveTheme(theme: ThemeMap): void` | Delega en `storage.save(theme)` |
| `resetTheme(): void` | Delega en `storage.reset()` |
| `setStorageAdapter(adapter: ThemeStorage): void` | Reemplaza el adaptador activo |

```ts
// Ejemplo: cambiar a un adaptador de API sin tocar el resto de la app
setStorageAdapter({
  load: () => fetchThemeFromApi(),
  save: (theme) => postThemeToApi(theme),
  reset: () => clearThemeOnApi(),
});
```

## Nota: strategy pattern de un solo adaptador

Hoy solo existe una estrategia real (`localStorageAdapter`); `setStorageAdapter` está listo para un adaptador de API pero **no hay endpoint de theme** — la configuración `settings.brand` es cliente-solo. Intercambiar el adaptador no requiere cambios en `ThemeProvider`, que consume únicamente las funciones de alto nivel.

## Consumo desde `ThemeProvider`

`ThemeProvider` importa las funciones de alto nivel con alias:

- init: `loadTheme` (como `loadSaved`) → merge `{...defaultTokens, ...saved}`
- persistir: `saveTheme` (como `saveSaved`) en cada cambio de `tokens`
- reset: `resetTheme` (como `resetSaved`) dentro de la API del contexto

Detalle del flujo en [architecture.md](./architecture.md).

## Referencias

- Tipo `TokenKey` (fuente del mapa parcial): [tokens.md](./tokens.md)