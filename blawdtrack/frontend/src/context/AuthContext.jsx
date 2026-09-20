import React, { createContext, useContext, useState } from 'react';
import { login as loginService } from '../services/AuthService';
import {
  saveAuthSession,
  getStoredUser,
  clearAuthSession,
  hasActiveSession,
} from '../utils/authStorage';

// Reemplaza a hooks/useAuth.js. Antes cada componente que llamaba a
// useAuth() tenía su propio estado aislado (LoginPage no se enteraba de lo
// que pasaba en App, y viceversa). Con Context, todos comparten el mismo
// 'user', así que al refrescar la página cualquier componente puede saber
// si ya hay sesión activa sin volver a pasar por el formulario.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(() => (hasActiveSession() ? getStoredUser() : null));

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginService(email, password);
      saveAuthSession(response);
      setUser(response.user);
      return response;
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const backendCode = err.response?.data?.code;
      setError({
        message: backendMessage || 'No se pudo iniciar sesión. Intente de nuevo.',
        severity: backendCode === 'CUENTA_INACTIVA' ? 'warning' : 'error',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
  };

  const resetError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, resetError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un <AuthProvider>');
  }
  return context;
}
