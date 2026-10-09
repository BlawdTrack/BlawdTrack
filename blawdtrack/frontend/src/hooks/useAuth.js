import { useContext } from 'react';
import { AuthContext } from '../context/authContextInstance';

/**
 * Acceso al contexto de autenticación (ver `AuthProvider`).
 * @returns {{ user: object|null, login: Function, logout: Function, loading: boolean,
 *   error: object|null, resetError: Function, expireSession: Function }}
 * @throws {Error} Si se usa fuera de un `<AuthProvider>`.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
