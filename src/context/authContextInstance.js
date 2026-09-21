import { createContext } from 'react';

// Instancia del contexto en su propio archivo: AuthContext.jsx solo debe
// exportar el componente AuthProvider (regla react-refresh/only-export-
// components del proyecto), y useAuth.js solo el hook consumidor.
export const AuthContext = createContext(null);
