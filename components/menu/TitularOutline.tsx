"use client";

import { useState } from "react";
import type { ReactNode } from "react";

type Etiqueta = "h1" | "h2" | "h3" | "span";

type Props = {
  children: ReactNode;
  /** Elemento HTML a renderizar. Por defecto h2 (cabecera de categoría). */
  as?: Etiqueta;
  /** Stroke de 3px en vez de 2px. */
  grueso?: boolean;
  /**
   * Micro-interacción única de la app: se rellena de rojo al tocar/enfocar.
   * Desactivala quien la usa sobre campo rojo pleno (el relleno rojo se volvería invisible).
   */
  interactivo?: boolean;
  className?: string;
  id?: string;
};

/**
 * Elemento firma de la marca: palabra gigante en contorno hueso, sin relleno.
 * Al tocarla (o enfocarla con teclado) se rellena de rojo en 200ms — la única
 * animación de toda la app. El fill/blur lo resuelve `.titular-outline` en globals.css,
 * acá solo manejamos el estado `data-relleno`.
 */
export function TitularOutline({
  children,
  as = "h2",
  grueso = false,
  interactivo = true,
  className = "",
  id,
}: Props) {
  const [relleno, setRelleno] = useState(false);
  const Tag = as;
  const clase = `titular-outline${grueso ? " titular-outline-grueso" : ""}${
    className ? ` ${className}` : ""
  }`;

  if (!interactivo) {
    return (
      <Tag id={id} className={clase}>
        {children}
      </Tag>
    );
  }

  return (
    <Tag
      id={id}
      tabIndex={0}
      className={clase}
      data-relleno={relleno ? "true" : undefined}
      onPointerDown={() => setRelleno(true)}
      onPointerUp={() => setRelleno(false)}
      onPointerLeave={() => setRelleno(false)}
      onPointerCancel={() => setRelleno(false)}
      onFocus={() => setRelleno(true)}
      onBlur={() => setRelleno(false)}
    >
      {children}
    </Tag>
  );
}
