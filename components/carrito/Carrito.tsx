"use client";

import Link from "next/link";
import { useEffect, useId, useRef } from "react";
import { useCarrito, useCarritoHidratado } from "@/lib/pedido/store";
import { precio } from "@/lib/formato";
import type { ItemCarrito } from "@/types";

const SELECTOR_FOCUSABLES =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * El carrito como bottom sheet. Su apertura la controla el store
 * (`abierto` / `abrirCarrito` / `cerrarCarrito`), no estado local.
 */
export function Carrito() {
  const hidratado = useCarritoHidratado();
  const { items, abierto, cerrarCarrito, cambiarCantidad, quitarLinea, subtotal } =
    useCarrito();

  const tituloId = useId();
  const dialogoRef = useRef<HTMLDivElement>(null);
  const botonCerrarRef = useRef<HTMLButtonElement>(null);
  const activadorPrevioRef = useRef<HTMLElement | null>(null);

  // Bloquea el scroll del body, atrapa el foco y escucha Escape mientras está abierto.
  useEffect(() => {
    if (!abierto) return;

    activadorPrevioRef.current = document.activeElement as HTMLElement | null;
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    botonCerrarRef.current?.focus();

    function alTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        cerrarCarrito();
        return;
      }
      if (evento.key !== "Tab") return;

      const contenedor = dialogoRef.current;
      if (!contenedor) return;
      const focosables = Array.from(
        contenedor.querySelectorAll<HTMLElement>(SELECTOR_FOCUSABLES),
      );
      if (focosables.length === 0) return;

      const primero = focosables[0];
      const ultimo = focosables[focosables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", alTeclado);
    return () => {
      document.removeEventListener("keydown", alTeclado);
      document.body.style.overflow = overflowPrevio;
      activadorPrevioRef.current?.focus();
    };
  }, [abierto, cerrarCarrito]);

  if (!hidratado) return null;

  return (
    <div
      className={`fixed inset-0 z-50 ${abierto ? "" : "pointer-events-none"}`}
      inert={!abierto}
    >
      {/* Fondo oscuro: cierra al tocar afuera. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={cerrarCarrito}
        className={`absolute inset-0 m-0 border-0 bg-negro p-0 ${
          abierto ? "opacity-75" : "opacity-0"
        }`}
      />

      <div
        ref={dialogoRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        // Sin transición a propósito: la única animación de la app es el
        // relleno del titular en outline. Mismo criterio que FichaProducto.
        className={`absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col border-t-2 border-hueso bg-negro ${
          abierto ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex items-center justify-between border-b-2 border-tinta px-4 py-3">
          <h2 id={tituloId} className="font-display text-2xl uppercase">
            Tu pedido
          </h2>
          <button
            ref={botonCerrarRef}
            type="button"
            onClick={cerrarCarrito}
            aria-label="Cerrar el carrito"
            className="sticker grid h-11 w-11 place-items-center"
          >
            <IconoCerrar />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <p className="py-10 text-center text-hueso/70">
              Todavía no agregaste nada. Volvé al menú y elegí algo rico.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.lineaId}>
                  <LineaCarrito
                    item={item}
                    onCambiarCantidad={cambiarCantidad}
                    onQuitar={quitarLinea}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="barra-inferior flex flex-col gap-3 border-t-2 border-tinta px-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg uppercase">Subtotal</span>
              <span className="font-display text-2xl text-cheddar">
                {precio(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={cerrarCarrito}
              data-activo="true"
              className="sticker block min-h-11 py-3 text-center font-display text-lg uppercase text-hueso"
            >
              Ir al checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function LineaCarrito({
  item,
  onCambiarCantidad,
  onQuitar,
}: {
  item: ItemCarrito;
  onCambiarCantidad: (lineaId: string, cantidad: number) => void;
  onQuitar: (lineaId: string) => void;
}) {
  return (
    <div className="borde-duro flex flex-col gap-2 bg-tinta px-3 py-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg uppercase leading-tight">
            {item.nombreProducto}
          </p>
          {item.puntoCoccion && (
            <p className="text-sm text-hueso/80">Punto: {item.puntoCoccion}</p>
          )}
          {item.extras.length > 0 && (
            <p className="text-sm text-hueso/80">
              Con:{" "}
              {item.extras
                .map((extra) => `${extra.nombre} (+${precio(extra.precio)})`)
                .join(", ")}
            </p>
          )}
          {item.quitar.length > 0 && (
            <p className="text-sm text-hueso/80">
              Sin: {item.quitar.join(", ")}
            </p>
          )}
          {item.nota && (
            <p className="text-sm italic text-hueso/60">“{item.nota}”</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => onQuitar(item.lineaId)}
          aria-label={`Sacar ${item.nombreProducto} del pedido`}
          className="grid h-11 w-11 shrink-0 place-items-center text-hueso/70 active:text-rojo"
        >
          <IconoTacho />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCambiarCantidad(item.lineaId, item.cantidad - 1)}
            disabled={item.cantidad <= 1}
            aria-label="Sacar una unidad"
            className="sticker grid h-11 w-11 place-items-center font-display text-lg disabled:opacity-30"
          >
            −
          </button>
          <span
            className="w-6 text-center font-display text-lg"
            aria-live="polite"
          >
            {item.cantidad}
          </span>
          <button
            type="button"
            onClick={() => onCambiarCantidad(item.lineaId, item.cantidad + 1)}
            aria-label="Sumar una unidad"
            className="sticker grid h-11 w-11 place-items-center font-display text-lg"
          >
            +
          </button>
        </div>
        <span className="font-display text-lg text-cheddar">
          {precio(item.precioUnitario * item.cantidad)}
        </span>
      </div>
    </div>
  );
}

function IconoCerrar() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5 5l14 14M19 5L5 19" />
    </svg>
  );
}

function IconoTacho() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}
