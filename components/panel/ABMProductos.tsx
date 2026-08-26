"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { precio } from "@/lib/formato";
import type { Id } from "@/convex/_generated/dataModel";
import { FormularioProducto } from "./FormularioProducto";

export function ABMProductos() {
  const productos = useQuery(api.menu.listarProductos);
  const categorias = useQuery(api.menu.listarCategorias);
  const cambiarDisponibilidad = useMutation(api.menu.cambiarDisponibilidad);
  const borrarProducto = useMutation(api.menu.borrarProducto);

  const [enEdicion, setEnEdicion] = useState<Id<"productos"> | "nuevo" | null>(
    null,
  );

  const productoEditado =
    enEdicion && enEdicion !== "nuevo"
      ? productos?.find((p) => p._id === enEdicion) ?? null
      : null;

  const alternarDisponible = async (
    productoId: Id<"productos">,
    disponibleActual: boolean,
  ) => {
    try {
      await cambiarDisponibilidad({
        productoId,
        disponible: !disponibleActual,
      });
    } catch {
      window.alert("No se pudo cambiar la disponibilidad. Probá de nuevo.");
    }
  };

  const eliminar = async (productoId: Id<"productos">, nombre: string) => {
    if (!window.confirm(`¿Borrar "${nombre}" del menú? No se puede deshacer.`)) {
      return;
    }
    try {
      await borrarProducto({ productoId });
    } catch {
      window.alert("No se pudo borrar el producto. Probá de nuevo.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl uppercase">Productos</h2>
        <button
          type="button"
          onClick={() => setEnEdicion("nuevo")}
          className="borde-duro min-h-[44px] bg-cheddar px-4 font-display text-sm uppercase text-negro"
        >
          + Nuevo producto
        </button>
      </div>

      {enEdicion !== null && categorias && (
        <FormularioProducto
          key={enEdicion === "nuevo" ? "nuevo" : productoEditado?._id}
          producto={productoEditado}
          categorias={categorias}
          alGuardar={() => setEnEdicion(null)}
          alCancelar={() => setEnEdicion(null)}
        />
      )}

      {productos === undefined && (
        <p className="font-sans text-hueso/70">Cargando productos…</p>
      )}

      <ul className="flex flex-col gap-2">
        {productos?.map((producto) => (
          <li
            key={producto._id}
            className="borde-duro flex flex-wrap items-center gap-3 bg-tinta p-3 font-sans"
          >
            <div className="min-w-[160px] flex-1">
              <p className="font-display text-lg uppercase leading-tight">
                {producto.nombre}
              </p>
              <p className="text-xs text-hueso/60">{producto.categoriaSlug}</p>
            </div>
            <span className="font-display text-lg text-cheddar">
              {precio(producto.precio)}
            </span>
            <button
              type="button"
              onClick={() => alternarDisponible(producto._id, producto.disponible)}
              className="sticker min-h-[44px] px-3 font-display text-xs uppercase"
              data-activo={producto.disponible ? "true" : "false"}
              aria-pressed={producto.disponible}
            >
              {producto.disponible ? "Disponible" : "Agotado"}
            </button>
            <button
              type="button"
              onClick={() => setEnEdicion(producto._id)}
              className="sticker min-h-[44px] px-3 font-display text-xs uppercase"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={() => eliminar(producto._id, producto.nombre)}
              className="min-h-[44px] border-2 border-rojo px-3 font-display text-xs uppercase text-rojo"
            >
              Borrar
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
