import { useAuth } from './useAuth';
import { canDeletePackages } from '../utils/packagePermissions';

/**
 * ¿El usuario autenticado puede eliminar paquetes? Aplica `canDeletePackages` al rol de la sesión.
 * @returns {boolean}
 */
export function useCanDeletePackages() {
  const { user } = useAuth();
  return canDeletePackages(user?.role);
}
