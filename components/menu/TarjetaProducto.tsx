"use client";

import { precio } from "@/lib/formato";
import type { Producto } from "@/types";
import { FotoProducto } from "./FotoProducto";

type Props = {
  producto: Producto;
  onAbrir: (disparador: HTMLElement) => void;
};

/** Tarjeta de producto en la grilla. Agotado: opacidad baja, sello rotado, no abre la ficha. */
export function TarjetaProducto({ producto, onAbrir }: Props) {
  const agotado = !producto.disponible;

  return (
    <button
      type="button"
      disabled={agotado}
      onClick={(evento) => onAbrir(evento.currentTarget)}
      // Sin aria-label a propósito: el nombre accesible sale del contenido
      // visible del botón. Un aria-label más corto que el texto que se ve
      // rompe "Label in Name" (WCAG 2.5.3) y lo marca axe.
      className={`borde-duro flex min-h-11 flex-col overflow-hidden bg-tinta text-left ${
        agotado ? "opacity-50" : "active:translate-x-[2px] active:translate-y-[2px]"
      }`}
    >
      <div className="relative aspect-square w-full">
        <FotoProducto producto={producto} className="absolute inset-0" />
        {agotado && (
          <span
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-2 border-hueso bg-rojo px-3 py-1 font-display text-sm uppercase tracking-wider text-hueso"
          >
            Agotado
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <span className="font-display text-base uppercase leading-tight">{producto.nombre}</span>
        <span className="line-clamp-2 font-sans text-xs text-hueso/70">{producto.descripcion}</span>
        <span className="mt-auto font-display text-lg text-cheddar">{precio(producto.precio)}</span>
      </div>
    </button>
  );
}
