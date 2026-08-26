"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Categoria, Producto } from "@/types";
import { TarjetaProducto } from "./TarjetaProducto";
import { TitularOutline } from "./TitularOutline";

type Props = {
  categorias: Categoria[];
  productos: Producto[];
  onAbrirProducto: (producto: Producto, disparador: HTMLElement) => void;
};

const ROTACIONES = ["rot-1", "rot-2", "rot-3"] as const;

/**
 * Chips de categoría (sticker, rotados, sticky debajo del header) + secciones del menú.
 * La categoría visible se marca sola vía IntersectionObserver.
 */
export function GrillaMenu({ categorias, productos, onAbrirProducto }: Props) {
  const gruposPorCategoria = useMemo(
    () =>
      categorias
        .map((categoria) => ({
          categoria,
          items: productos.filter((p) => p.categoriaSlug === categoria.slug),
        }))
        .filter((grupo) => grupo.items.length > 0),
    [categorias, productos],
  );

  // Solo guardamos lo que el usuario eligió (chip o scroll). Cuál está activa
  // se deriva: mientras no haya elección, manda la primera categoría con items.
  // El menú llega por subscripción, así que puede estar vacío en el primer render.
  const [categoriaElegida, setCategoriaActiva] = useState("");
  const seccionesRef = useRef(new Map<string, HTMLElement>());

  const existeLaElegida = gruposPorCategoria.some(
    (grupo) => grupo.categoria.slug === categoriaElegida,
  );
  const categoriaActiva = existeLaElegida
    ? categoriaElegida
    : (gruposPorCategoria[0]?.categoria.slug ?? "");

  useEffect(() => {
    const objetivos = Array.from(seccionesRef.current.values());
    if (objetivos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        const visibles = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const primero = visibles[0];
        const slug = primero?.target.getAttribute("data-slug");
        if (slug) setCategoriaActiva(slug);
      },
      { rootMargin: "-150px 0px -65% 0px", threshold: 0 },
    );

    objetivos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [gruposPorCategoria]);

  function irACategoria(slug: string) {
    const el = seccionesRef.current.get(slug);
    if (!el) return;
    const alturaHeader = Number.parseInt(
      getComputedStyle(document.documentElement).getPropertyValue("--alto-header") || "64",
      10,
    );
    const y = el.getBoundingClientRect().top + window.scrollY - alturaHeader - 60;
    // Sin scroll suave a propósito: la única animación de la app es el relleno del titular.
    window.scrollTo(0, Math.max(0, y));
    setCategoriaActiva(slug);
  }

  if (gruposPorCategoria.length === 0) return null;

  return (
    <div>
      <nav
        aria-label="Categorías del menú"
        className="sticky z-30 border-b-2 border-tinta bg-negro"
        style={{ top: "var(--alto-header, 64px)" }}
      >
        <ul className="m-0 flex list-none gap-2 overflow-x-auto px-4 py-3 sin-scrollbar">
          {gruposPorCategoria.map(({ categoria }, indice) => (
            <li key={categoria.slug}>
              <button
                type="button"
                onClick={() => irACategoria(categoria.slug)}
                data-activo={categoriaActiva === categoria.slug ? "true" : undefined}
                className={`sticker ${ROTACIONES[indice % ROTACIONES.length]} min-h-11 shrink-0 whitespace-nowrap px-4 font-display text-sm uppercase`}
              >
                {categoria.nombre}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {gruposPorCategoria.map(({ categoria, items }) => (
        <section
          key={categoria.slug}
          data-slug={categoria.slug}
          ref={(el) => {
            if (el) seccionesRef.current.set(categoria.slug, el);
            else seccionesRef.current.delete(categoria.slug);
          }}
          className="scroll-mt-32 px-4 pb-6 pt-10"
          aria-labelledby={`titulo-${categoria.slug}`}
        >
          <TitularOutline as="h2" id={`titulo-${categoria.slug}`} className="mb-4 text-4xl sm:text-5xl">
            {categoria.nombre}
          </TitularOutline>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((producto) => (
              <TarjetaProducto
                key={producto._id}
                producto={producto}
                onAbrir={(disparador) => onAbrirProducto(producto, disparador)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
