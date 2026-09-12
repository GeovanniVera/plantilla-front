# Flujo de Datos — Semilla Tecnologica

## Flujo de autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant LoginPage as LoginPage
    participant AuthProvider as AuthProvider
    participant authApi as authApi (mock)
    participant authStorage as authStorage (localStorage)
    participant tokenManager as tokenManager (memoria)
    participant client as client.ts

    Note over U,client: Login
    U->>LoginPage: Ingresa email + password
    LoginPage->>AuthProvider: login(email, password)
    AuthProvider->>authApi: login(email, password)
    authApi->>authApi: Valida contra MOCK_USERS
    authApi-->>AuthProvider: { user, token }
    AuthProvider->>authStorage: setToken(token)
    AuthProvider->>tokenManager: set(token)
    AuthProvider-->>LoginPage: Estado actualizado
    LoginPage->>U: Redirige a /

    Note over U,client: Request autenticado
    U->>client: GET /users
    client->>tokenManager: get()
    tokenManager-->>client: token
    client->>client: Agrega header Authorization: Bearer {token}
    client->>client: fetch(url, config)
    alt 200 OK
        client-->>U: Datos
    else 401
        client->>tokenManager: clear()
        client->>U: Redirige a /login
    else 403
        client->>U: Redirige a /403
    end

    Note over U,client: Restaurar sesión al iniciar
    U->>AuthProvider: Montaje de app
    AuthProvider->>authStorage: getToken()
    alt Hay token
        AuthProvider->>tokenManager: set(token)
        AuthProvider->>authApi: me()
        alt Token válido
            authApi-->>AuthProvider: User
            AuthProvider-->>U: isAuthenticated = true
        else Token inválido
            AuthProvider->>authStorage: clear()
            AuthProvider->>tokenManager: clear()
            AuthProvider-->>U: isAuthenticated = false
        end
    else No hay token
        AuthProvider-->>U: isAuthenticated = false, isLoading = false
    end
```

## Flujo de theming

```mermaid
sequenceDiagram
    participant User as Usuario
    participant BrandColorSettings as BrandColorSettings
    participant ThemeProvider as ThemeProvider
    participant persistence as persistence.ts
    participant DOM as document.documentElement

    Note over User,DOM: Cambio de color
    User->>BrandColorSettings: Selecciona nuevo color
    BrandColorSettings->>ThemeProvider: setColor('primary', '#new')
    ThemeProvider->>ThemeProvider: setTokens(prev => {...prev, primary: '#new'})
    ThemeProvider->>DOM: applyTokensToDOM(tokens)
    Note right of DOM: --primary: #new<br/>--accent-bg: rgba(...)<br/>--success: #derived<br/>... (paletas semánticas)
    ThemeProvider->>persistence: saveTheme(tokens)
    persistence->>localStorage: setItem('brand-theme-v1', JSON.stringify(tokens))

    Note over User,DOM: Recarga de página
    User->>ThemeProvider: Montaje
    ThemeProvider->>persistence: loadTheme()
    persistence->>localStorage: getItem('brand-theme-v1')
    localStorage-->>persistence: JSON
    persistence-->>ThemeProvider: ThemeMap
    ThemeProvider->>ThemeProvider: Merge defaultTokens + saved
    ThemeProvider->>DOM: applyTokensToDOM(tokens)
```

## Flujo de paletas semánticas

```mermaid
flowchart TB
    subgraph Input
        baseHex["baseHex<br/>(ej: #22c55e para success)"]
        surfaceHex["surfaceHex<br/>(--code-bg resuelto)"]
        backgroundHex["backgroundHex<br/>(--bg resuelto)"]
    end

    subgraph "deriveSemanticPalette()"
        oklch["hexToOklch()"]
        strong["solve strong L<br/>(≥ 4.5:1 vs bg+surface)"]
        base["solve base L<br/>(≥ 3:1 vs surfaces)"]
        line["solve line mix<br/>(≥ 3:1 vs surface)"]
        row["row = ultra-soft wash"]
        solidFg["solidForeground<br/>(≥ 4.5:1 vs base & strong)"]
        bg["bg = soft tint"]
    end

    subgraph Output
        palette["SemanticPalette:<br/>base, strong, bg, line, row, solidForeground"]
    end

    baseHex --> oklch
    surfaceHex --> oklch
    backgroundHex --> oklch
    oklch --> strong
    oklch --> base
    oklch --> line
    oklch --> bg
    strong --> solidFg
    base --> solidFg
    strong --> palette
    base --> palette
    line --> palette
    row --> palette
    solidFg --> palette
    bg --> palette
```

## Flujo de protección de rutas

```mermaid
flowchart TD
    A["Usuario navega a /ajustes"] --> B{ProtectedRoute}
    B -->|isLoading=true| C["Muestra 'Verificando sesión...'"]
    B -->|!isAuthenticated| D["Navigate to /login"]
    B -->|isAuthenticated + !isVerified| E["Navigate to /verify-email"]
    B -->|isAuthenticated + isVerified| F{RequirePrivilege<br/>privilege='settings:manage'}
    F -->|isLoading=true| G["Muestra 'Verificando sesión...'"]
    F -->|!isAuthenticated| H["Navigate to /login"]
    F -->|!hasAccess| I["Navigate to /403"]
    F -->|hasAccess| J["Renderiza MainLayout + children"]
```

## Flujo del Toast system

```mermaid
sequenceDiagram
    participant AnyComponent as Cualquier Componente
    participant useToast as useToast()
    participant closure as Module-level closure
    participant ToastProvider as ToastProvider
    participant portal as Portal (document.body)
    participant DOM as DOM

    Note over AnyComponent,DOM: showToast
    AnyComponent->>useToast: toast.success('Guardado')
    useToast->>closure: toastFn.success('Guardado')
    closure->>ToastProvider: addToast('success', 'Guardado')
    ToastProvider->>ToastProvider: setState([...prev, newToast])
    ToastProvider->>portal: createPortal(Toast components)
    portal->>DOM: Render toast
    
    Note over AnyComponent,DOM: Auto-dismiss (5s)
    Toast->>Toast: useEffect timeout
    Toast->>ToastProvider: onDismiss(id)
    ToastProvider->>ToastProvider: setState(prev.filter)
    ToastProvider->>portal: createPortal(updated)
    portal->>DOM: Toast removed
```

## Flujo de DrawerStack (multi-level)

```mermaid
sequenceDiagram
    participant User as Usuario
    participant DS as DrawerStack
    participant D1 as Drawer nivel 1
    participant D2 as Drawer nivel 2

    User->>DS: openDrawer(Content1)
    DS->>D1: Render drawer 1 + overlay
    DS->>DS: Push to stack

    User->>DS: openDrawer(Content2)
    DS->>D2: Render drawer 2 + overlay
    DS->>DS: Push to stack
    Note right of D2: Animación stack-slide-forward

    User->>D2: Close (Escape o click)
    D2->>DS: Pop stack
    DS->>D2: Unmount drawer 2
    Note right of D1: Animación stack-slide-back

    User->>D1: Close
    D1->>DS: Pop stack
    DS->>D1: Unmount drawer 1
```

## Flujo del Sidebar responsive

```mermaid
flowchart TB
    A["Sidebar montado"] --> B{useMediaQuery<br/>max-width: 768px?}
    
    B -->|Desktop| C["Sidebar horizontal<br/>expandido/colapsado"]
    C --> D["toggleExpanded()"]
    D --> E["Cambiar estado expanded"]
    
    B -->|Mobile| F["Sidebar oculto"]
    F --> G["MobileBottomBar visible"]
    G --> H["Click hamburger"]
    H --> I["expanded = true"]
    I --> J["Sidebar overlay + backdrop"]
    J --> K["Navegación o click backdrop"]
    K --> L["expanded = false"]
    L --> M["Scroll restoration"]
```
