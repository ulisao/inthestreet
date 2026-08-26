"use client";

import { useSyncExternalStore } from "react";
import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

/**
 * Copia local del menú y de la config del local, para que sin conexión la app
 * siga mostrando la carta.
 *
 * El service worker cachea el shell (HTML, JS, íconos); los datos viajan por
 * websocket de Convex, que sin red no existe. Así que la última respuesta buena
 * de `api.menu.menuCompleto` y de `api.config.leerConfig` se guarda acá, en
 * localStorage, y la tienda la usa como red de contención.
 *
 * Es una copia vieja a propósito y hay que decirlo en pantalla: los precios
 * pueden haber cambiado. El servidor recalcula todo al crear el pedido
 * (ver CONTRATOS §5), así que esta copia nunca decide cuánto se cobra.
 *
 * La lectura va por `useSyncExternalStore` con snapshot de servidor `null`:
 * el primer paint del cliente coincide con el HTML del servidor y no hay
 * error de hidratación ni un `setState` dentro de un efecto.
 */

const CLAVE = "its:tienda-guardada:v1";

// Los tipos salen de las propias queries y no de `types/`: `leerConfig` puede
// devolver la config sembrada o el fallback de `datosIniciales` (que no tiene
// `_creationTime`), y acá hay que aceptar las dos formas tal cual llegan.
export type MenuCompleto = FunctionReturnType<typeof api.menu.menuCompleto>;
export type ConfigDeTienda = FunctionReturnType<typeof api.config.leerConfig>;

type TiendaGuardada = {
  menu: MenuCompleto | null;
  config: ConfigDeTienda | null;
  guardadoEn: number;
};

const VACIA: TiendaGuardada = { menu: null, config: null, guardadoEn: 0 };

// `useSyncExternalStore` exige que el snapshot sea estable entre llamadas:
// si devolviéramos un `JSON.parse` nuevo en cada render, React entraría en loop.
let cacheValor: TiendaGuardada = VACIA;
let cacheJson = "";

const oyentes = new Set<() => void>();

function notificar() {
  for (const oyente of oyentes) oyente();
}

function leerCrudo(): string {
  try {
    return window.localStorage.getItem(CLAVE) ?? "";
  } catch {
    // Modo incógnito de iOS, storage lleno o bloqueado: seguimos sin copia.
    return "";
  }
}

function snapshot(): TiendaGuardada {
  const json = leerCrudo();
  if (json === cacheJson) return cacheValor;
  cacheJson = json;
  if (!json) {
    cacheValor = VACIA;
    return cacheValor;
  }
  try {
    const parseada = JSON.parse(json) as TiendaGuardada;
    cacheValor = {
      menu: parseada.menu ?? null,
      config: parseada.config ?? null,
      guardadoEn: parseada.guardadoEn ?? 0,
    };
  } catch {
    cacheValor = VACIA;
  }
  return cacheValor;
}

function snapshotServidor(): TiendaGuardada {
  return VACIA;
}

function suscribirse(oyente: () => void) {
  oyentes.add(oyente);
  window.addEventListener("storage", oyente);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", oyente);
  };
}

/** Guarda lo último bueno que llegó de Convex. Escribe solo si algo cambió. */
export function guardarTienda(parcial: {
  menu?: MenuCompleto;
  config?: ConfigDeTienda;
}) {
  const actual = snapshot();
  const siguiente: TiendaGuardada = {
    menu: parcial.menu ?? actual.menu,
    config: parcial.config ?? actual.config,
    guardadoEn: Date.now(),
  };
  // Comparamos sin el sello de tiempo: si el contenido es el mismo, no
  // reescribimos localStorage en cada render.
  const mismoContenido =
    JSON.stringify({ menu: siguiente.menu, config: siguiente.config }) ===
    JSON.stringify({ menu: actual.menu, config: actual.config });
  if (mismoContenido && actual.guardadoEn > 0) return;

  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(siguiente));
  } catch {
    return;
  }
  notificar();
}

/** La última copia guardada en este navegador. `menu`/`config` en null si no hay. */
export function useTiendaGuardada(): TiendaGuardada {
  return useSyncExternalStore(suscribirse, snapshot, snapshotServidor);
}
