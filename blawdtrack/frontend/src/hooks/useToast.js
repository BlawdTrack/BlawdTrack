import { useCallback, useState } from 'react';

/**
 * Estado de un aviso flotante para usarlo con `<Toast>`: `notify` lo muestra y `close` lo cierra. Si se pasa
 * `initial` ({ message, severity }), el aviso ya está abierto al montar (por ejemplo, el que deja otra pantalla).
 * @returns {{ toast: { open: boolean, message: string, severity: string },
 *   notify: (message: string, severity?: 'success'|'error'|'warning') => void, close: Function }}
 */
export function useToast(initial = null) {
  const [toast, setToast] = useState(() =>
    initial ? { open: true, message: initial.message, severity: initial.severity ?? 'success' } : { open: false, message: '', severity: 'success' }
  );

  const notify = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const close = useCallback(() => {
    setToast((previous) => ({ ...previous, open: false }));
  }, []);

  return { toast, notify, close };
}
