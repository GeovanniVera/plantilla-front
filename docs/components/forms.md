# Forms

Sistema de formularios con useForm hook, Form component, y FormField wrapper.

## Arquitectura

```
useForm (hook) → Form (provider) → FormField (layout + validation)
     ↓
  zodSchema | validator (validación dual)
```

## useForm

### Opciones

| Prop | Tipo | Descripción |
|------|------|-------------|
| `initialValues` | `T` | Valores iniciales |
| `validator` | `(values: T) => Record<string, string> \| Promise<...>` | Validación custom |
| `zodSchema` | `ZodSchema` | Schema Zod (prioridad sobre validator) |
| `onSubmit` | `(values: T) => void \| Promise<void>` | Callback submit |
| `onReset` | `() => void` | Callback reset |

### Retorno

```typescript
{
  values, errors, touched, dirty, submitted, isSubmitting,
  setFieldValue, setFieldTouched, setFieldError,
  getFieldValue, getFieldError,
  validateField, validateForm,
  handleSubmit, reset
}
```

### Patrones

- **Validación dual**: Zod o custom. Zod tiene prioridad.
- **`dirty`**: Se deriva computacionalmente de `values !== initialValues`.
- **`submitted`**: Controla cuándo mostrar errores (no en el primer render).

### Uso

```tsx
const form = useForm({
  initialValues: { email: '', password: '' },
  zodSchema: loginSchema,
  onSubmit: (values) => login(values),
});

<Form form={form}>
  <FormField label="Email" name="email">
    <Input value={form.values.email} onChange={(v) => form.setFieldValue('email', v)} />
  </FormField>
  <FormField label="Password" name="password">
    <Input type="password" value={form.values.password} onChange={(v) => form.setFieldValue('password', v)} />
  </FormField>
  <Button type="submit">Iniciar sesión</Button>
</Form>
```

---

## Form

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `form` | `ReturnType<typeof useForm<T>>` | Instancia del hook |
| `children` | `ReactNode` | Contenido |
| `className` | `string` | Clase CSS |
| `disabled` | `boolean` | Deshabilitar todo |

### Comportamiento

- Provee `FormContext` a todos los hijos
- Renderiza `<form noValidate>` (validación por JS, no HTML)
- El `disabled` prop deshabilita todos los campos hijos

---

## FormField

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | — | Texto del label |
| `required` | `boolean` | `false` | Indicador * |
| `name` | `string` | — | Nombre del campo (auto-lee error del contexto) |
| `error` | `string` | — | Error explícito (prioridad sobre contexto) |
| `helper` | `string` | — | Texto de ayuda |
| `disabled` | `boolean` | `false` | Deshabilitado |
| `variant` | `'default' \| 'floating'` | `'default'` | Label flotante (bug conocido) |
| `controlId` | `string` | — | ID para asociación label/control |

### Accesibilidad

- `<label htmlFor>` asociado al control
- `aria-describedby` para helper y error
- `aria-invalid` cuando hay error
- Error text es `role="alert"` (live region assertiva)
- Resolución de ID: child.id > controlId > auto-generado

### Uso

```tsx
<FormField label="Email" name="email" required>
  <Input value={email} onChange={setEmail} type="email" />
</FormField>

<FormField label="Password" name="password" error={form.errors.password}>
  <Input type="password" value={password} onChange={setPassword} />
</FormField>

<FormField label="Bio" helper="Máximo 500 caracteres">
  <Textarea value={bio} onChange={setBio} />
</FormField>
```

---

## FormContext

### Interface

```typescript
{
  values, errors, touched, dirty, submitted, disabled,
  setFieldValue, setFieldTouched, setFieldError,
  getFieldValue, getFieldError
}
```

### useFormContext

```tsx
const { values, errors, setFieldValue } = useFormContext();
```

Lanza error si se usa fuera de `<Form>`.

---

## Tipos Compartidos (types.ts)

```typescript
InputVariant = 'default' | 'filled' | 'outlined'
InputSize = 'sm' | 'md'
InputValidationState = 'none' | 'invalid' | 'valid'
StartAdornmentVariant = 'plain' | 'subtle' | 'accent' | 'dark'
FormFieldVariant = 'default' | 'floating'
FieldType = 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio'
```

---

## Ejemplo Completo: Formulario de Registro

```tsx
function RegisterForm() {
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
    zodSchema: registerSchema,
    onSubmit: async (values) => {
      await register(values);
      navigate('/verify-email');
    },
  });

  return (
    <Form form={form}>
      <FormLayout columns={2}>
        <FormField label="Nombre" name="name" required>
          <Input
            value={form.values.name}
            onChange={(v) => form.setFieldValue('name', v)}
            startAdornment={<LuUser />}
          />
        </FormField>

        <FormField label="Email" name="email" required>
          <Input
            type="email"
            value={form.values.email}
            onChange={(v) => form.setFieldValue('email', v)}
          />
        </FormField>

        <FormField label="Contraseña" name="password" required>
          <Input
            type="password"
            value={form.values.password}
            onChange={(v) => form.setFieldValue('password', v)}
            showPasswordToggle
          />
        </FormField>

        <FormField label="Confirmar" name="confirmPassword" required>
          <Input
            type="password"
            value={form.values.confirmPassword}
            onChange={(v) => form.setFieldValue('confirmPassword', v)}
          />
        </FormField>
      </FormLayout>

      <Checkbox
        checked={form.values.acceptTerms}
        onChange={(v) => form.setFieldValue('acceptTerms', v)}
        label="Acepto los términos"
      />

      <Button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Registrando...' : 'Registrarse'}
      </Button>
    </Form>
  );
}
```
