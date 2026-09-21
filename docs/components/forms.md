# Forms (`src/components/forms/`)

Orquestación de formularios: hook de estado con validación, contenedor con contexto, wrapper de campo accesible y utilidades. Los contratos de props de los controles primitivos (`InputProps`, `SelectProps`, etc.) también viven en `forms/types.ts` como single source of truth (ver [primitives.md](primitives.md)).

## Barrel (`forms/index.ts`)

Exporta: `Form`, `FormField`, `PasswordRequirements`, `useForm`, `useFormContext` + tipos (`UseFormOptions`, `FormValidator`, `ZodSchema`, `FormContextValue`, `FormFieldProps`, `FormFieldVariant`, `InputVariant`, `FieldType`, `FieldConfig`, `PasswordRequirementsProps`).

**No exporta** `CheckboxSearchList` (deep import: `@components/forms/CheckboxSearchList`).

## useForm

Hook de estado de formulario con validación.

```ts
useForm<T>({
  initialValues: T,
  validator?: (values: T) => Record<string, string> | Promise<Record<string, string>>,
  zodSchema?: { parse: (data: unknown) => unknown },
  onSubmit?: (values: T) => void | Promise<void>,
  onReset?: () => void,
})
```

Retorna:

| Miembro | Tipo | Descripción |
|---|---|---|
| `values` | `T` | Valores actuales |
| `errors` | `Record<string, string>` | Errores por campo |
| `touched` | `Record<string, boolean>` | Campos tocados |
| `dirty` | `boolean` | `true` si algún valor difiere del inicial |
| `submitted` | `boolean` | `true` tras el primer submit |
| `isSubmitting` | `boolean` | En progreso durante `onSubmit` |
| `setFieldValue(name, value)` | `(string, unknown) => void` | Actualiza un valor |
| `setFieldTouched(name)` | `(string) => void` | Marca campo como tocado |
| `setFieldError(name, error)` | `(string, string) => void` | Error manual |
| `getFieldValue(name)` | `(string) => unknown` | Lee un valor |
| `getFieldError(name)` | `(string) => string \| undefined` | Lee un error |
| `validateField(name)` | `(string) => Promise<string \| undefined>` | Valida un campo |
| `validateForm()` | `() => Promise<boolean>` | Valida todo; `true` si es válido |
| `handleSubmit(e?)` | `(e?: React.FormEvent) => Promise<void>` | Valida y ejecuta `onSubmit` |
| `reset()` | `() => void` | Restaura `initialValues` y ejecuta `onReset` |

Reglas de validación:

- **Prioridad Zod > validator custom**: si `zodSchema` existe, se usa su `.parse()` como adapter; los `issues[]` se convierten a errores con `issue.path.join('.')` como clave. Si no hay `zodSchema`, se usa `validator`. Sin ninguno, no hay validación.
- `handleSubmit` marca `submitted`, valida todo y solo llama `onSubmit` si es válido.

## Form

Contenedor que provee el `FormContext` y el `<form>` real.

| Prop | Tipo | Descripción |
|---|---|---|
| `form` | `ReturnType<typeof useForm<T>>` | Resultado del hook |
| `children` | `ReactNode` | Contenido |
| `className` | `string` | Clase adicional |
| `disabled` | `boolean` | Deshabilita todo el formulario (se propaga por contexto) |

Renderiza `<form noValidate onSubmit={form.handleSubmit}>` y publica en el contexto los valores, errores, touched, dirty, submitted, `disabled` y los setters/getters del hook. `FormField` dentro de él lee error/touched automáticamente por `name`.

```tsx
const form = useForm({
  initialValues: { name: '', email: '' },
  zodSchema: userSchema,
  onSubmit: async (values) => createUser(values),
});

<Form form={form}>
  <FormField label="Nombre" name="name">
    <Input value={form.values.name} onChange={(v) => form.setFieldValue('name', v)} />
  </FormField>
  <Button type="submit" disabled={form.isSubmitting}>Guardar</Button>
</Form>
```

## FormField

Wrapper presentacional de campo: label, helper, error, layout y asociación accesible. No valida ni posee estado propio — de dónde viene `error` lo decide la aplicación.

| Prop | Tipo | Descripción |
|---|---|---|
| `label` | `string` | Texto del label |
| `required` | `boolean` | Marca `*` |
| `name` | `string` | Clave del campo; dentro de `<Form>` lee `error`/`touched` del contexto |
| `error` | `string` | Error explícito; **gana al error del contexto** |
| `helper` | `string` | Texto de ayuda |
| `disabled` | `boolean` | Atenúa el wrapper |
| `variant` | `'default' \| 'floating'` | Ver deuda abajo |
| `controlId` | `string` | Id del control para asociación del label; necesario solo para controles compound (cuando el input visible no es el hijo directo) |
| `children` | `ReactNode` | El control |

Wiring accesible automático (solo para un hijo directo elemento):

1. Inyecta `id` al child (el propio `id` del child gana; luego `controlId`; luego un id auto-generado).
2. Asocia el label real (`<label htmlFor=...>`).
3. Vincula helper y error vía `aria-describedby`.
4. Aplica `aria-invalid` cuando hay error.
5. El texto de error se renderiza con `role="alert"` (live region assertiva).

Cuando hay error, el wrapper aplica `styles.fieldError` de `Form.module.css`, que pinta bordes rojos sobre cualquier control envuelto vía `[data-variant]` (ver [primitives.md](primitives.md)).

> ⚠️ **Deuda conocida — `variant="floating"` roto por diseño**: el label se renderiza como overlay estático centrado sobre el control. La interacción de float-up nunca funcionó con este orden del DOM (los selectores legacy requerían el label DESPUÉS del control). Es un bug conocido, deliberadamente no rediseñado.

## FormContext / useFormContext

- `FormContext`: contexto con default `null`.
- `useFormContext()`: lanza error fuera de `<Form>` (`'useFormContext debe usarse dentro de un <Form>'`).

```tsx
const { setFieldError, getFieldValue } = useFormContext();
```

## CheckboxSearchList (deep import)

Lista de checkboxes con filtro de búsqueda. No está exportada por el barrel.

| Prop | Tipo | Default | Descripción |
|---|---|---|---|
| `options` | `{ id: string; label: string; description?: string }[]` | — | Opciones |
| `selected` | `Set<string>` | — | Ids seleccionados |
| `onToggle` | `(id: string) => void` | — | Toggle de un id |
| `searchPlaceholder` | `string` | `'Buscar...'` | Placeholder del input |
| `emptyMessage` | `string` | `'Sin opciones'` | Sin opciones en `options` |
| `noResultsMessage` | `string` | `'Sin resultados'` | Búsqueda sin coincidencias |
| `maxHeightClass` | `string` | `'max-h-64'` | Altura máxima del área de scroll |

Filtra por `label` y `description` (case-insensitive). Útil para permisos, roles o cualquier lista seleccionable.

## PasswordRequirements

Checklist en vivo de los requisitos de contraseña, reutilizable por cualquier formulario donde la contraseña se cree o cambie. Renderiza la política compartida `PASSWORD_REQUIREMENTS` de `src/lib/validation/password.ts` y marca cada fila como cumplida o no según el `value` actual.

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `string` | Valor actual del campo de contraseña |

```tsx
<PasswordRequirements value={password} />
```

- Cada fila lleva `data-testid="password-requirement-<id>"` y `data-passed="true|false"` (ids: `minLength`, `uppercase`, `lowercase`, `symbol`).
- Las etiquetas y el título salen de claves i18n `auth.passwordPolicy.*`.
- El máximo de longitud se valida en `validatePassword`, pero no se lista como fila (no es accionable).
- Lo usan `RegisterPage` y `ResetPasswordPage`.

## Contratos en `forms/types.ts`

Además de los contratos de primitives (`InputProps`, `TextareaProps`, `SelectProps` + `SelectOption`, `CheckboxProps`, `RadioProps`, `RadioGroupProps`, `FormFieldProps` y sus vocabularios `InputType`, `InputSize`, `StartAdornmentVariant`, `InputValidationState`, `FormFieldVariant`...), define el modelo serializable del form builder:

- `FieldType`: `'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio'`.
- `FieldIcon`: `'none' | 'search' | 'mail' | 'user'` — identificadores serializables de ícono para el addon inicial (el builder no guarda ReactNodes).
- `FieldConfig`: configuración de campo serializable (type, label, placeholder, required, validaciones, `options?: string[]`, `layoutSpan?: 1|2|3`, `startIcon`, `startAdornmentVariant`, `showPasswordToggle`).

También define `FormLayoutProps` (consumido por [layout.md](layout.md) y re-exportado por su barrel).

## Gotchas

- `FormField` solo hace wiring accesible automático a **un hijo directo** elemento; controles compound requieren `controlId`.
- `CheckboxSearchList` no está en el barrel de forms (deep import).
- El error explícito (`error`) siempre gana al error del contexto.
- `useFormContext` lanza si se usa fuera de `<Form>`.