"use client";

import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { estadoApertura } from "@/lib/horario";

/**
 * Header de la tienda: logo chico a la izquierda, estado del local a la derecha.
 * Cuando está cerrado o pausado, una franja roja arriba con el motivo.
 * Mide su propia altura y la publica como `--alto-header` en el `:root` para que
 * la barra de categorías (GrillaMenu) sepa exactamente debajo de dónde pegarse,
 * sin que agente-catalogo tenga que acoplar layout.tsx y page.tsx a mano.
 */
export function Encabezado() {
  const config = useQuery(api.config.leerConfig);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const actualizarAltura = () => {
      document.documentElement.style.setProperty("--alto-header", `${el.offsetHeight}px`);
    };
    actualizarAltura();

    const observador = new ResizeObserver(actualizarAltura);
    observador.observe(el);
    return () => observador.disconnect();
  }, [config]);

  if (!config) {
    return (
      <header ref={headerRef} className="sticky top-0 z-40 bg-negro border-b-2 border-tinta">
        <div className="flex h-16 items-center justify-between px-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="IN THE STREET" className="h-11 w-11" />
        </div>
      </header>
    );
  }

  const estado = estadoApertura(config);
  const pausado = config.pausado;
  const cerradoOPausado = pausado || !estado.abierto;
  const textoFranja = pausado
    ? config.mensajePausa || "Cocina saturada, volvemos en un rato"
    : !estado.abierto
      ? estado.proximaApertura
      : "";
  const etiquetaEstado = pausado ? "Pausado" : estado.abierto ? "Abierto" : "Cerrado";

  return (
    <header ref={headerRef} className="sticky top-0 z-40 bg-negro border-b-2 border-tinta">
      {cerradoOPausado && textoFranja && (
        <div
          role="status"
          className="border-b-2 border-tinta bg-rojo px-4 py-2 text-center font-display text-sm uppercase tracking-wide text-hueso"
        >
          {textoFranja}
        </div>
      )}
      <div className="flex h-16 items-center justify-between gap-3 px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="IN THE STREET" className="h-11 w-11 shrink-0" />
        {/* El chip solo aparece cuando NO hay franja. Con franja decían lo
            mismo dos veces y se comían 105px del alto en un teléfono de 390. */}
        {!cerradoOPausado && (
          <span
            role="status"
            aria-live="polite"
            className="sticker grid min-h-11 place-items-center bg-lechuga px-3 py-1.5 font-display text-xs uppercase tracking-wide text-negro"
          >
            {etiquetaEstado}
          </span>
        )}
      </div>
    </header>
  );
}
