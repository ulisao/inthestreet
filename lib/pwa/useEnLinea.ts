"use client";

import { useSyncExternalStore } from "react";

/**
 * ¿Hay conexión? Se lee con `useSyncExternalStore` y no con un efecto que hace
 * setState: el snapshot del servidor es siempre `true`, así el primer paint
 * coincide con el HTML del servidor y no hay error de hidratación.
 *
 * `navigator.onLine` miente para arriba (dice `true` con wifi sin salida), así
 * que sirve para detectar el corte pero no para prometer que hay red. Todo lo
 * que dependa de esto tiene que fallar hacia el lado seguro.
 */
function suscribirse(notificar: () => void) {
  window.addEventListener("online", notificar);
  window.addEventListener("offline", notificar);
  return () => {
    window.removeEventListener("online", notificar);
    window.removeEventListener("offline", notificar);
  };
}

function snapshot() {
  return navigator.onLine;
}

function snapshotServidor() {
  return true;
}

export function useEnLinea(): boolean {
  return useSyncExternalStore(suscribirse, snapshot, snapshotServidor);
}
