import { useCallback, useEffect, useRef, useState } from 'react';
import { isHeadingToPanel } from '../utils/safeTriangle';

const CLOSE_DELAY_MS = 150;
const SWITCH_DELAY_MS = 300;

/**
 * Controla los menús flotantes de la barra lateral colapsada: solo uno abierto a la vez, se abre al pasar
 * el cursor (o al hacer clic / usar el teclado) y se cierra al salir de él.
 *
 * Para poder ir en diagonal desde un disparador hasta su menú sin que se abra el del disparador vecino,
 * mientras el cursor se mueva dentro del "triángulo seguro" (ver `isHeadingToPanel`) el cambio de menú
 * se retrasa; si el cursor entra al menú abierto, el cambio se cancela.
 * @returns {{ openId: string|null, anchorEl: HTMLElement|null, focusFirst: boolean,
 *   registerPanel: (node: HTMLElement|null) => void, close: Function,
 *   onTriggerEnter: Function, onTriggerLeave: Function, onTriggerClick: Function,
 *   onPanelEnter: Function, onPanelLeave: Function }}
 */
export function useFlyoutHover() {
  const [openState, setOpenState] = useState(null);
  const panelElRef = useRef(null);
  const registerPanel = useCallback((node) => {
    panelElRef.current = node;
  }, []);
  const pointerRef = useRef(null);
  const apexRef = useRef(null);
  const overTriggerRef = useRef(null);
  const overPanelRef = useRef(false);
  const openIdRef = useRef(null);
  const closeTimerRef = useRef(null);
  const switchTimerRef = useRef(null);

  const clearCloseTimer = () => clearTimeout(closeTimerRef.current);
  const clearSwitchTimer = () => clearTimeout(switchTimerRef.current);

  const open = (id, anchorEl, focusFirst = false) => {
    clearCloseTimer();
    clearSwitchTimer();
    openIdRef.current = id;
    apexRef.current = pointerRef.current;
    setOpenState({ id, anchorEl, focusFirst });
  };

  const close = useCallback(() => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(switchTimerRef.current);
    openIdRef.current = null;
    overPanelRef.current = false;
    setOpenState(null);
  }, []);

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!overPanelRef.current && overTriggerRef.current === null) close();
    }, CLOSE_DELAY_MS);
  };

  const isHeadingToOpenPanel = () => {
    const rect = panelElRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || !pointerRef.current || !apexRef.current) return false;
    return isHeadingToPanel(pointerRef.current, apexRef.current, rect);
  };

  const isOpen = openState !== null;
  useEffect(() => {
    if (!isOpen) return undefined;

    const trackPointer = (event) => {
      const point = { x: event.clientX, y: event.clientY };
      pointerRef.current = point;
      // El vértice del triángulo es la última posición del cursor sobre el disparador abierto.
      if (overTriggerRef.current === openIdRef.current) apexRef.current = point;
    };

    document.addEventListener('mousemove', trackPointer);
    return () => document.removeEventListener('mousemove', trackPointer);
  }, [isOpen]);

  useEffect(
    () => () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(switchTimerRef.current);
    },
    []
  );

  const onTriggerEnter = (id, event) => {
    const anchorEl = event.currentTarget;
    overTriggerRef.current = id;
    clearCloseTimer();

    if (openIdRef.current === null || openIdRef.current === id) {
      clearSwitchTimer();
      if (openIdRef.current !== id) open(id, anchorEl);
      return;
    }

    if (isHeadingToOpenPanel()) {
      // El cursor va hacia el menú abierto: no se cambia de grupo salvo que se quede en este disparador.
      clearSwitchTimer();
      switchTimerRef.current = setTimeout(() => {
        if (overTriggerRef.current === id && !overPanelRef.current) open(id, anchorEl);
      }, SWITCH_DELAY_MS);
      return;
    }

    open(id, anchorEl);
  };

  const onTriggerLeave = (id) => {
    if (overTriggerRef.current === id) overTriggerRef.current = null;
    clearSwitchTimer();
    scheduleClose();
  };

  // Clic o Enter/Espacio: abre el menú; con teclado (`detail === 0`) enfoca su primera opción.
  const onTriggerClick = (id, event) => open(id, event.currentTarget, event.detail === 0);

  const onPanelEnter = () => {
    overPanelRef.current = true;
    clearCloseTimer();
    clearSwitchTimer();
  };

  const onPanelLeave = () => {
    overPanelRef.current = false;
    scheduleClose();
  };

  return {
    openId: openState?.id ?? null,
    anchorEl: openState?.anchorEl ?? null,
    focusFirst: openState?.focusFirst ?? false,
    registerPanel,
    close,
    onTriggerEnter,
    onTriggerLeave,
    onTriggerClick,
    onPanelEnter,
    onPanelLeave,
  };
}
