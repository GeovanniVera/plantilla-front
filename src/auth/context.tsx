import { createContext } from 'react';
import type { AuthContextValue } from './types';

/**
 * Contexto de autenticación.
 * Se usa internamente por AuthProvider y el hook useAuth.
 * No acceder directamente — usar useAuth() en su lugar.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
