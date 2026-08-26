"use client";

import { useEffect } from "react";

/**
 * Registra /sw.js. Va montado en el layout raíz, así el service worker toma
 * scope "/" y la app queda instalable en Android e iOS.
 *
 * El registro se hace después del `load` a propósito: durante la carga inicial
 * el ancho de banda es para el menú, no para precachear. En 4G de pueblo eso
 * se nota.
 *
 * En desarrollo no se registra nada: un service worker cacheando el shell de
 * Turbopack sirve chunks viejos y hace perder media tarde.
 */
export function RegistroServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Sin service worker la app funciona igual, solo pierde el modo offline.
      });
    };

    if (document.readyState === "complete") {
      registrar();
      return;
    }
    window.addEventListener("load", registrar);
    return () => window.removeEventListener("load", registrar);
  }, []);

  return null;
}
