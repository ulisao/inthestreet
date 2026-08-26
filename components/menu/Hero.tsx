"use client";

import { precio } from "@/lib/formato";
import type { Producto } from "@/types";
import { FotoProducto } from "./FotoProducto";
import { TitularOutline } from "./TitularOutline";

type Props = {
  producto: Producto;
  onPedir: (disparador: HTMLElement) => void;
  /** false si el local está pausado o fuera de horario: el hero igual deja mirar el menú. */
  puedeAgregar: boolean;
};

/** Hero: la foto más grande de la app, el titular en outline y los filetes verticales. Sin carrusel. */
export function Hero({ producto, onPedir, puedeAgregar }: Props) {
  return (
    <section className="relative w-full overflow-hidden border-b-2 border-tinta aspect-4/5 sm:aspect-video">
      <FotoProducto producto={producto} className="absolute inset-0" />
      <div className="filetes" />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-4 sm:p-8">
        <TitularOutline as="h1" grueso className="text-[22vw] leading-[0.85] sm:text-8xl">
          STREET
        </TitularOutline>
        <div className="flex flex-wrap items-center gap-3">
          <span className="sticker rot-2 px-3 py-2 font-display text-sm uppercase">
            {producto.nombre}
          </span>
          {/* El precio va sobre campo negro y no suelto sobre la foto: cheddar
              contra una foto clara (o contra el placeholder amarillo) queda
              ilegible. Sobre tinta da 11,8:1. */}
          <span className="sticker rot-1 px-3 py-2 font-display text-2xl leading-none text-cheddar">
            {precio(producto.precio)}
          </span>
        </div>
        <button
          type="button"
          onClick={(evento) => onPedir(evento.currentTarget)}
          className="sticker rot-1 min-h-11 px-5 py-3 font-display text-sm uppercase"
        >
          {puedeAgregar ? "Pedila ahora" : "Ver el menú"}
        </button>
      </div>
    </section>
  );
}
