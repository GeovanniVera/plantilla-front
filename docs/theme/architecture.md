# Theme Architecture

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     App Bootstrap                               │
│  <ThemeProvider>                                                │
│    │                                                            │
│    ├─ useState(() => merge(defaultTokens, loadSaved()))        │
│    │   └─ ThemeMap: { primary: '#...', secondary: '#...', ... } │
│    │                                                            │
│    ├─ useEffect #1: applyTokensToDOM(tokens)                   │
│    │   ├─ tokenToVar → setProperty per token                    │
│    │   ├─ hexToRgb → --accent-bg, --accent-border              │
│    │   ├─ hexToRgb → --secondary-bg                            │
│    │   └─ SEMANTIC_BASES.forEach:                               │
│    │       deriveSemanticPalette({base, surface, bg})           │
│    │       → 6 CSS vars per status                              │
│    │                                                            │
│    ├─ useEffect #2: saveSaved(tokens)                           │
│    │                                                            │
│    ├─ setColor(key, val) → setTokens(merge)                    │
│    └─ resetTheme() → resetSaved() + setTokens(defaults)        │
│                                                                  │
│    Context value: { tokens, setColor, resetTheme }              │
│                                                                  │
│  ┌─ Consumers ──────────────────────────────────────┐          │
│  │  useTheme() → { tokens, setColor, resetTheme }   │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Montaje del ThemeProvider                                    │
│    │                                                            │
│    ├─ loadSaved() → lee de localStorage                         │
│    │   └─ Si no existe o falla → retorna {}                     │
│    │                                                            │
│    ├─ merge(defaultTokens, saved)                               │
│    │   └─ Defaults completados con valores guardados            │
│    │                                                            │
│    └─ useState → tokens iniciales                               │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Effect #1: DOM Binding                                       │
│    │                                                            │
│    ├─ Para cada token:                                          │
│    │   document.documentElement.style.setProperty(cssVar, value)│
│    │                                                            │
│    ├─ Derivar variantes translúcidas:                           │
│    │   --accent-bg: rgba(r, g, b, 0.1)                         │
│    │   --accent-border: rgba(r, g, b, 0.35)                    │
│    │   --secondary-bg: rgba(r, g, b, 0.1)                      │
│    │                                                            │
│    └─ Generar paletas semánticas:                               │
│        SEMANTIC_BASES.forEach(status =>                         │
│          deriveSemanticPalette({ base, surface, bg })           │
│          → 6 CSS vars: base, strong, bg, line, row, solidFg    │
│        )                                                       │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Effect #2: Persistencia                                      │
│    │                                                            │
│    └─ saveTheme(tokens) → localStorage                          │
│        └─ Clave: 'brand-theme-v1'                              │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Consumer Interaction                                         │
│    │                                                            │
│    ├─ setColor('primary', '#ff0000')                            │
│    │   └─ setTokens(prev => ({ ...prev, primary: '#ff0000' })) │
│    │       └─ React re-render → Effects se re-ejecutan         │
│    │                                                            │
│    └─ resetTheme()                                              │
│        ├─ resetSaved() → localStorage.removeItem()              │
│        └─ setTokens(defaultTokens)                              │
└─────────────────────────────────────────────────────────────────┘
```

## Separación de Effects

Los effects están separados intencionalmente:

```typescript
// Effect #1: DOM binding
useEffect(() => {
  applyTokensToDOM(tokens);
}, [tokens]);

// Effect #2: Persistencia
useEffect(() => {
  saveSaved(tokens);
}, [tokens]);
```

**Razón**: Evitar side-effect chains. Si estuvieran juntos, el save podría triggerar re-renders innecesarios.

## Callbacks Memoizados

```typescript
const setColor = useCallback((variable: TokenKey, value: string) => {
  setTokens(prev => ({ ...prev, [variable]: value }));
}, []);

const resetTheme = useCallback(() => {
  resetSaved();
  setTokens({ ...defaultTokens });
}, []);

const value = useMemo(() => ({ tokens, setColor, resetTheme }), [tokens, setColor, resetTheme]);
```

**Beneficio**: Los consumers no se re-renderizan除非 el tema cambie realmente.

## Dependencias

```
ThemeProvider.tsx
├── tokens.ts          (defaultTokens, tokenToVar, TokenKey)
├── persistence.ts     (loadTheme, saveTheme, resetTheme)
├── theme-context.ts   (ThemeContext, TokenValues)
└── semantic.ts        (deriveSemanticPalette, SEMANTIC_BASES)

useTheme.ts
└── theme-context.ts   (ThemeContext)
```
