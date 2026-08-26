"use client";

import { useSyncExternalStore } from "react";
import { leerCodigos, ultimoCodigo } from "@/lib/pedido/codigoGuardado";

/**
 * Lectura segura para hidratación de `lib/pedido/codigoGuardado.ts`
 * (localStorage). El snapshot del servidor siempre es vacío/null; apenas
 * hidrata, React sincroniza con el valor real del navegador. Evita el
 * flash de contenido incorrecto sin recurrir a un efecto que hace setState.
 */

let cacheCodigos: string[] = [];
let cacheCodigosJson = "";

function snapshotCodigos(): string[] {
  const actuales = leerCodigos();
  const json = JSON.stringify(actuales);
  if (json !== cacheCodigosJson) {
    cacheCodigosJson = json;
    cacheCodigos = actuales;
  }
  return cacheCodigos;
}

function snapshotCodigosServidor(): string[] {
  return [];
}

function suscribirse(notificar: () => void) {
  window.addEventListener("storage", notificar);
  return () => window.removeEventListener("storage", notificar);
}

/** Todos los códigos guardados en este navegador, del más nuevo al más viejo. */
export function useCodigosGuardados(): string[] {
  return useSyncExternalStore(suscribirse, snapshotCodigos, snapshotCodigosServidor);
}

/** El último código guardado, o `null` si este navegador no tiene ninguno. */
export function useUltimoCodigo(): string | null {
  return useSyncExternalStore(suscribirse, ultimoCodigo, () => null);
}
