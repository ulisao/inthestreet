"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { precio } from "@/lib/formato";
import { useCarrito } from "@/lib/pedido/store";
import type { Opcion, Producto } from "@/types";
import { FotoProducto } from "./FotoProducto";

type Props = {
  producto: Producto;
  opciones: Opcion[];
  puedeAgregar: boolean;
  mensajeIndisponible?: string;
  onCerrar: () => void;
};

const NOTA_MAXIMA = 140;

/**
 * Bottom sheet del producto: personalizador completo. Se desliza desde abajo,
 * fondo oscuro, cierra con tap afuera / X / Escape. Bloquea el scroll del body,
 * atrapa el foco adentro y lo devuelve al elemento que la abrió al cerrar.
 */
export function FichaProducto({
  producto,
  opciones,
  puedeAgregar,
  mensajeIndisponible,
  onCerrar,
}: Props) {
  const { agregar } = useCarrito();
  const tituloId = useId();
  const notaId = useId();
  const puntoLegendId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  // El personalizador arranca de cero en cada apertura: quien renderiza la
  // ficha le pasa `key={producto._id}`, así cambiar de producto la remonta.
  const [puntoCoccion, setPuntoCoccion] = useState<string | undefined>(
    () =>
      opciones.find(
        (o) =>
          o.tipo === "punto_coccion" && o.categoriaSlug === producto.categoriaSlug,
      )?.nombre,
  );
  const [extras, setExtras] = useState<string[]>([]);
  const [quitar, setQuitar] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [cantidad, setCantidad] = useState(1);

  const puntosCoccion = useMemo(
    () =>
      opciones.filter(
        (o) => o.tipo === "punto_coccion" && o.categoriaSlug === producto.categoriaSlug,
      ),
    [opciones, producto.categoriaSlug],
  );
  const opcionesExtra = useMemo(
    () => opciones.filter((o) => o.tipo === "extra" && o.categoriaSlug === producto.categoriaSlug),
    [opciones, producto.categoriaSlug],
  );
  const opcionesQuitar = useMemo(
    () => opciones.filter((o) => o.tipo === "quitar" && o.categoriaSlug === producto.categoriaSlug),
    [opciones, producto.categoriaSlug],
  );

  // Scroll lock mientras el sheet está abierto.
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  // Foco inicial en el botón de cerrar.
  useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  // Escape para cerrar + trampa de foco (Tab / Shift+Tab no se escapan del sheet).
  useEffect(() => {
    function alTeclado(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        onCerrar();
        return;
      }
      if (evento.key !== "Tab" || !sheetRef.current) return;

      const focables = sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focables.length === 0) return;
      const primero = focables[0];
      const ultimo = focables[focables.length - 1];

      if (evento.shiftKey && document.activeElement === primero) {
        evento.preventDefault();
        ultimo.focus();
      } else if (!evento.shiftKey && document.activeElement === ultimo) {
        evento.preventDefault();
        primero.focus();
      }
    }
    document.addEventListener("keydown", alTeclado);
    return () => document.removeEventListener("keydown", alTeclado);
  }, [onCerrar]);

  function alternarExtra(nombre: string) {
    setExtras((previo) => (previo.includes(nombre) ? previo.filter((n) => n !== nombre) : [...previo, nombre]));
  }

  function alternarQuitar(nombre: string) {
    setQuitar((previo) => (previo.includes(nombre) ? previo.filter((n) => n !== nombre) : [...previo, nombre]));
  }

  const precioExtras = opcionesExtra
    .filter((o) => extras.includes(o.nombre))
    .reduce((suma, o) => suma + o.precio, 0);
  const precioUnitario = producto.precio + precioExtras;
  const totalLinea = precioUnitario * cantidad;

  function confirmar() {
    if (!puedeAgregar) return;
    agregar({
      productoId: producto._id,
      nombreProducto: producto.nombre,
      categoriaSlug: producto.categoriaSlug,
      imagen: producto.imagen,
      precioUnitario,
      cantidad,
      puntoCoccion,
      extras: opcionesExtra
        .filter((o) => extras.includes(o.nombre))
        .map((o) => ({ nombre: o.nombre, precio: o.precio })),
      quitar,
      nota: nota.trim() || undefined,
    });
    onCerrar();
  }

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center">
      <button type="button" aria-label="Cerrar" onClick={onCerrar} className="absolute inset-0 bg-negro/80" />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="borde-duro relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border-t-2 border-tinta bg-negro"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b-2 border-tinta bg-negro px-4 py-3">
          <h2 id={tituloId} className="pr-8 font-display text-2xl uppercase leading-tight">
            {producto.nombre}
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar ficha del producto"
            className="sticker grid h-11 w-11 shrink-0 place-items-center font-display text-lg"
          >
            ×
          </button>
        </div>

        <div className="relative aspect-video w-full">
          <FotoProducto producto={producto} className="absolute inset-0" />
        </div>

        <div className="flex flex-col gap-6 px-4 py-4">
          <div>
            <p className="font-sans text-sm text-hueso/80">{producto.descripcion}</p>
            <p className="mt-2 font-display text-2xl text-cheddar">{precio(producto.precio)}</p>
          </div>

          {puntosCoccion.length > 0 && (
            <fieldset>
              <legend id={puntoLegendId} className="mb-2 font-display text-sm uppercase tracking-wide">
                Elegí tu punto
              </legend>
              <div role="radiogroup" aria-labelledby={puntoLegendId} className="flex flex-wrap gap-2">
                {puntosCoccion.map((opcion) => (
                  <button
                    key={opcion._id}
                    type="button"
                    role="radio"
                    aria-checked={puntoCoccion === opcion.nombre}
                    data-activo={puntoCoccion === opcion.nombre ? "true" : undefined}
                    onClick={() => setPuntoCoccion(opcion.nombre)}
                    className="sticker min-h-11 px-4 font-sans text-sm"
                  >
                    {opcion.nombre}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {opcionesExtra.length > 0 && (
            <fieldset>
              <legend className="mb-2 font-display text-sm uppercase tracking-wide">Sumale extras</legend>
              <div className="flex flex-col gap-2">
                {opcionesExtra.map((opcion) => {
                  const marcado = extras.includes(opcion.nombre);
                  return (
                    <label
                      key={opcion._id}
                      className="borde-duro flex min-h-11 items-center justify-between gap-3 bg-tinta px-3 py-2.5"
                    >
                      <span className="flex items-center gap-2 font-sans text-sm">
                        <input
                          type="checkbox"
                          checked={marcado}
                          onChange={() => alternarExtra(opcion.nombre)}
                          className="h-5 w-5 accent-cheddar"
                        />
                        {opcion.nombre}
                      </span>
                      <span className="font-display text-sm text-cheddar">+{precio(opcion.precio)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {opcionesQuitar.length > 0 && (
            <fieldset>
              <legend className="mb-2 font-display text-sm uppercase tracking-wide">
                Sacale lo que no te gusta
              </legend>
              <div className="flex flex-wrap gap-2">
                {opcionesQuitar.map((opcion) => {
                  const marcado = quitar.includes(opcion.nombre);
                  return (
                    <button
                      key={opcion._id}
                      type="button"
                      aria-pressed={marcado}
                      data-activo={marcado ? "true" : undefined}
                      onClick={() => alternarQuitar(opcion.nombre)}
                      className="sticker min-h-11 px-4 font-sans text-sm"
                    >
                      Sin {opcion.nombre.toLowerCase()}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor={notaId} className="mb-2 block font-display text-sm uppercase tracking-wide">
              Alguna nota para la cocina
            </label>
            <textarea
              id={notaId}
              value={nota}
              maxLength={NOTA_MAXIMA}
              onChange={(evento) => setNota(evento.target.value)}
              placeholder="Ej: cortala al medio, sin sal..."
              rows={2}
              className="w-full resize-none borde-duro bg-tinta px-3 py-2 font-sans text-sm text-hueso placeholder:text-hueso/50"
            />
            <p className="mt-1 text-right text-xs text-hueso/50">
              {nota.length}/{NOTA_MAXIMA}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display text-sm uppercase tracking-wide">Cantidad</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                disabled={cantidad <= 1}
                aria-label="Restar una unidad"
                className="sticker grid h-11 w-11 place-items-center font-display text-xl disabled:opacity-40"
              >
                −
              </button>
              <span className="w-8 text-center font-display text-xl" aria-live="polite">
                {cantidad}
              </span>
              <button
                type="button"
                onClick={() => setCantidad((c) => Math.min(20, c + 1))}
                disabled={cantidad >= 20}
                aria-label="Sumar una unidad"
                className="sticker grid h-11 w-11 place-items-center font-display text-xl disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="barra-inferior sticky bottom-0 border-t-2 border-tinta bg-negro px-4 py-3">
          {!puedeAgregar && mensajeIndisponible && (
            <p role="status" className="mb-2 text-center font-sans text-sm text-rojo">
              {mensajeIndisponible}
            </p>
          )}
          <button
            type="button"
            onClick={confirmar}
            disabled={!puedeAgregar}
            className="min-h-14 w-full border-2 border-hueso bg-rojo font-display text-lg uppercase text-hueso disabled:bg-tinta disabled:opacity-40"
          >
            {puedeAgregar ? `Agregá al pedido — ${precio(totalLinea)}` : "No estamos recibiendo pedidos"}
          </button>
        </div>
      </div>
    </div>
  );
}
