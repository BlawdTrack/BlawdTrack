/** ¿Los dos conjuntos tienen exactamente los mismos elementos? */
export const sameSet = (left, right) => (
  left.size === right.size && [...left].every((value) => right.has(value))
);

/** Iniciales (hasta dos) de un nombre completo, para el avatar. */
export const getInitials = (name) => name
  .trim()
  .split(/\s+/)
  .slice(0, 2)
  .map((part) => part[0])
  .join('')
  .toUpperCase();

/** Mensaje en español para un error de la API de permisos; el 404 trae "Usuario no existente". */
export const getRequestError = (error, fallback) => {
  const status = error.response?.status;
  if (status === 401) return 'Tu sesión expiró. Inicia sesión nuevamente para continuar.';
  if (status === 403) {
    return 'No tienes permiso para modificar los permisos de este usuario, o su rol no admite cambios.';
  }
  if (status === 404) return error.response?.data?.message || 'Usuario no existente';
  if (status === 400) return 'Revisa el tipo y el número de documento ingresados.';
  return error.message || fallback;
};
