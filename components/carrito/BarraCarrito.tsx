"use client";

import { useCarrito, useCarritoHidratado } from "@/lib/pedido/store";
import { precio } from "@/lib/formato";

/**
 * Barra fija abajo con el resumen del carrito. Vive en toda la tienda y abre
 * el bottom sheet de <Carrito /> al tocarla. No se renderiza si no hay items,
 * ni antes de que el store termine de hidratarse desde localStorage.
 */
export function BarraCarrito() {
  const hidratado = useCarritoHidratado();
  const { cantidadTotal, subtotal, abrirCarrito } = useCarrito();

  if (!hidratado || cantidadTotal === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 barra-inferior px-3 pt-3 bg-negro">
      <button
        type="button"
        onClick={abrirCarrito}
        aria-haspopup="dialog"
        className="sticker w-full min-h-11 flex items-center justify-between gap-3 px-4 py-3"
      >
        <span className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid place-items-center w-7 h-7 rounded-full bg-cheddar text-negro font-display text-sm leading-none"
          >
            {cantidadTotal}
          </span>
          <span className="font-display uppercase text-base tracking-wide">
            Ver pedido
          </span>
        </span>
        <span className="font-display text-cheddar text-xl">
          {precio(subtotal)}
        </span>
      </button>
    </div>
  );
}
