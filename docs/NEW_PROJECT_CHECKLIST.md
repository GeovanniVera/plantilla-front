# Checklist para Nuevo Proyecto

## 1. Configuración inicial

- [ ] Clonar template
- [ ] Renombrar proyecto en `package.json` (name, description)
- [ ] Crear `.env` desde `.env.example`
- [ ] Configurar `VITE_API_BASE` según backend
- [ ] Ejecutar `npm install`

## 2. Configurar auth

- [ ] Verificar endpoints de auth en `.env`
- [ ] Configurar MSW handlers para tests
- [ ] Ajustar tipos de `AuthResponse` según backend
- [ ] Configurar campos de registro (nombre, email, password)

## 3. Configurar temas

- [ ] Definir colores en `src/theme/tokens.ts`
- [ ] Ajustar colores semánticos en `src/theme/semantic.ts`
- [ ] Verificar contraste con `ContrastChecker`
- [ ] Configurar sidebar según necesidades

## 4. Configurar i18n

- [ ] Revisar strings en `src/lib/i18n/locales/es.json`
- [ ] Agregar traducciones para módulos nuevos
- [ ] Configurar idiomas disponibles

## 5. Configurar rutas

- [ ] Definir rutas en `src/routes/`
- [ ] Configurar permisos por ruta (RequirePrivilege)
- [ ] Agregar rutas de error (403, 404, 500)

## 6. Configurar componentes

- [ ] Revisar primitives existentes
- [ ] Crear componentes específicos del dominio
- [ ] Agregar stories para componentes nuevos

## 7. Configurar testing

- [ ] Verificar que `npm run test` pasa
- [ ] Agregar MSW handlers para endpoints nuevos
- [ ] Crear tests para servicios y hooks
- [ ] Verificar coverage mínimo (70%)

## 8. Configurar CI/CD

- [ ] Verificar workflow de GitHub Actions
- [ ] Configurar variables de entorno en CI
- [ ] Verificar que build pasa en CI

## 9. Documentación

- [ ] Actualizar README.md
- [ ] Documentar decisiones arquitectónicas
- [ ] Documentar endpoints de API
