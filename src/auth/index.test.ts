import { describe, it, expect } from 'vitest'
import * as auth from './index'

describe('auth barrel exports', () => {
  it('exports AuthProvider', () => {
    expect(auth.AuthProvider).toBeDefined()
  })

  it('exports useAuth', () => {
    expect(auth.useAuth).toBeDefined()
  })

  it('exports useHasPrivilege', () => {
    expect(auth.useHasPrivilege).toBeDefined()
  })

  it('exports useHasAnyPrivilege', () => {
    expect(auth.useHasAnyPrivilege).toBeDefined()
  })

  it('exports useHasRole', () => {
    expect(auth.useHasRole).toBeDefined()
  })

  it('exports ProtectedRoute', () => {
    expect(auth.ProtectedRoute).toBeDefined()
  })

  it('exports RequirePrivilege', () => {
    expect(auth.RequirePrivilege).toBeDefined()
  })

  it('exports RequireRole', () => {
    expect(auth.RequireRole).toBeDefined()
  })

  it('exports GuestOnly', () => {
    expect(auth.GuestOnly).toBeDefined()
  })

  it('exports RequireVerification', () => {
    expect(auth.RequireVerification).toBeDefined()
  })
})
