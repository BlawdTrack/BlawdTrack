import { useState } from 'react';
import { login as loginService } from '../services/AuthService';
import {
  saveAuthSession,
  getStoredUser,
  clearAuthSession,
  hasActiveSession,
  buildUserFromLoginResponse,
} from '../utils/authStorage';
import { getLoginError } from '../utils/authErrors';
import { AuthContext } from './authContextInstance';

// Este archivo solo exporta el componente AuthProvider a propósito, para
// que el Fast Refresh de Vite funcione correctamente (la regla
// react-refresh/only-export-components del proyecto no permite mezclar un
// componente con otro export que no sea un componente — ni siquiera el
// propio contexto).

// Antes cada componente que llamaba a un hook de auth propio tenía su
// propio estado aislado (LoginPage no se enteraba de lo que pasaba en
// App, y viceversa). Con Context, todos comparten el mismo 'user', así
// que al refrescar la página cualquier componente puede saber si ya hay
// sesión activa sin volver a pasar por el formulario.
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
      setUser(buildUserFromLoginResponse(response));
      return response;
    } catch (err) {
      setError(getLoginError(err));
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
