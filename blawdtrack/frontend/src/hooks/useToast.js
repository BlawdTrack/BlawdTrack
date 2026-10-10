import { useCallback, useState } from 'react';

/**
 * Estado de un aviso flotante para usarlo con `<Toast>`: `notify` lo muestra y `close` lo cierra.
 * @returns {{ toast: { open: boolean, message: string, severity: string },
 *   notify: (message: string, severity?: 'success'|'error'|'warning') => void, close: Function }}
 */
export function useToast() {
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const notify = useCallback((message, severity = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const close = useCallback(() => {
    setToast((previous) => ({ ...previous, open: false }));
  }, []);

  return { toast, notify, close };
}
