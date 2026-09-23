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
import { getHomeRoute, UNKNOWN_ROLE_ERROR } from '../utils/roleRoutes';
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

// T12: 'user' solo llega a existir con un rol que tiene una ruta de inicio
// conocida (ROLE_HOME_ROUTES). Así, fuera de este archivo, nadie necesita
// volver a validar el rol: si hay 'user', su ruta de inicio existe. Una
// sesión guardada con un rol que ya no se reconoce (por ejemplo, editada a
// mano en localStorage) se limpia aquí en silencio, sin mensaje de error,
// porque no es una acción del usuario en curso.
function getValidStoredUser() {
  if (!hasActiveSession()) return null;

  const storedUser = getStoredUser();
  if (!storedUser || !getHomeRoute(storedUser.role)) {
    clearAuthSession();
    return null;
  }

  return storedUser;
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(getValidStoredUser);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginService(email, password);

      if (!getHomeRoute(response.user?.role)) {
        // Rol que el backend devuelve pero el frontend no reconoce: se
        // trata igual que un login fallido, no se guarda la sesión.
        setError(UNKNOWN_ROLE_ERROR);
        const roleError = new Error('ROL_NO_RECONOCIDO');
        roleError.isRoleValidation = true;
        throw roleError;
      }

      saveAuthSession(response);
      setUser(buildUserFromLoginResponse(response));
      return response;
    } catch (err) {
      if (!err.isRoleValidation) {
        setError(getLoginError(err));
      }
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
