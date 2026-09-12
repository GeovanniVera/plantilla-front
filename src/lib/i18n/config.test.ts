import { describe, it, expect } from 'vitest'
import '../i18n/config'
import i18n from '../i18n/config'
import { getErrorMessage, getErrorKey } from './errors'

describe('i18n config', () => {
  it('defaults to Spanish', () => {
    expect(i18n.language).toBe('es')
  })

  it('has Spanish translations for all auth keys', () => {
    expect(i18n.t('auth.login.title')).toBe('Iniciar sesión')
    expect(i18n.t('auth.register.title')).toBe('Registrarse')
    expect(i18n.t('auth.forgotPassword.title')).toBe('Recuperar contraseña')
    expect(i18n.t('auth.resetPassword.title')).toBe('Nueva contraseña')
  })

  it('has Spanish translations for all error keys', () => {
    expect(i18n.t('errors.network')).toBe('Error de conexión con el servidor')
    expect(i18n.t('errors.unauthorized')).toBe('Tu sesión expiró. Iniciá sesión nuevamente.')
    expect(i18n.t('errors.forbidden')).toBe('No tenés permisos para acceder a esta sección.')
    expect(i18n.t('errors.notFound')).toBe('La página que buscás no existe o fue movida.')
  })

  it('can switch to English', () => {
    void i18n.changeLanguage('en')
    expect(i18n.t('auth.login.title')).toBe('Sign In')
    expect(i18n.t('errors.network')).toBe('Connection error. Check your internet.')
    void i18n.changeLanguage('es')
  })
})

describe('getErrorMessage', () => {
  it('maps UNAUTHORIZED to Spanish message', () => {
    const msg = getErrorMessage('UNAUTHORIZED')
    expect(msg).toBe('Tu sesión expiró. Iniciá sesión nuevamente.')
  })

  it('maps NETWORK_ERROR to Spanish message', () => {
    const msg = getErrorMessage('NETWORK_ERROR')
    expect(msg).toBe('Error de conexión con el servidor')
  })

  it('maps FORBIDDEN to Spanish message', () => {
    const msg = getErrorMessage('FORBIDDEN')
    expect(msg).toBe('No tenés permisos para acceder a esta sección.')
  })

  it('maps unknown code to fallback', () => {
    const msg = getErrorMessage('UNKNOWN')
    expect(msg).toBe('Ocurrió un error inesperado. Intentá de nuevo.')
  })
})

describe('getErrorKey', () => {
  it('returns translation key for known codes', () => {
    expect(getErrorKey('NETWORK_ERROR')).toBe('errors.network')
    expect(getErrorKey('UNAUTHORIZED')).toBe('errors.unauthorized')
    expect(getErrorKey('FORBIDDEN')).toBe('errors.forbidden')
  })

  it('returns fallback key for unknown codes', () => {
    expect(getErrorKey('UNKNOWN')).toBe('errors.unknown')
  })
})
