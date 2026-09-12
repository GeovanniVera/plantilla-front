import { describe, it, expect, beforeEach } from 'vitest'
import { authStorage } from './token-store'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

const sessionStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
    get length() { return Object.keys(store).length },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true })
Object.defineProperty(globalThis, 'sessionStorage', { value: sessionStorageMock, writable: true })

describe('authStorage', () => {
  beforeEach(() => {
    authStorage.clearAll()
  })

  it('sets and gets token from localStorage (remember=true)', () => {
    authStorage.setToken('test-token', undefined, true)
    expect(authStorage.getToken(true)).toBe('test-token')
  })

  it('sets and gets token from sessionStorage (remember=false)', () => {
    authStorage.setToken('test-token', undefined, false)
    expect(authStorage.getToken(false)).toBe('test-token')
    expect(authStorage.getToken(true)).toBeNull()
  })

  it('sets token with expiresIn', () => {
    authStorage.setToken('test-token', 3600, true)
    expect(authStorage.getToken(true)).toBe('test-token')
    expect(authStorage.getExpiresAt(true)).toBeGreaterThan(Date.now())
  })

  it('isExpired returns false when no expiresAt', () => {
    authStorage.setToken('test-token', undefined, true)
    expect(authStorage.isExpired(true)).toBe(false)
  })

  it('isExpired returns false when token not expired', () => {
    authStorage.setToken('test-token', 3600, true)
    expect(authStorage.isExpired(true)).toBe(false)
  })

  it('isExpired returns true when token expired', () => {
    authStorage.setToken('test-token', undefined, true)
    authStorage.setExpiresAt(Date.now() - 1000, true)
    expect(authStorage.isExpired(true)).toBe(true)
  })

  it('clear removes tokens from specified storage', () => {
    authStorage.setToken('test-token', 3600, true)
    authStorage.setRefreshToken('refresh-token', true)
    authStorage.clear(true)
    expect(authStorage.getToken(true)).toBeNull()
    expect(authStorage.getRefreshToken(true)).toBeNull()
    expect(authStorage.getExpiresAt(true)).toBeNull()
  })

  it('clearAll removes from both storages', () => {
    authStorage.setToken('local-token', undefined, true)
    authStorage.setToken('session-token', undefined, false)
    authStorage.clearAll()
    expect(authStorage.getToken(true)).toBeNull()
    expect(authStorage.getToken(false)).toBeNull()
  })

  it('sets and gets refresh token', () => {
    authStorage.setRefreshToken('refresh-token', true)
    expect(authStorage.getRefreshToken(true)).toBe('refresh-token')
  })
})
