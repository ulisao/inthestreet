"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { precio } from "@/lib/formato";
import type { Id } from "@/convex/_generated/dataModel";
import { FormularioOpcion } from "./FormularioOpcion";

const ETIQUETA_TIPO: Record<string, string> = {
  punto_coccion: "Punto de cocción",
  extra: "Extras",
  quitar: "Quitar",
};

export function ABMOpciones() {
  // Trae también las desactivadas, para poder volver a activarlas desde acá.
  const opciones = useQuery(api.menu.listarOpcionesTodas);
  const categorias = useQuery(api.menu.listarCategorias);
  const borrarOpcion = useMutation(api.menu.borrarOpcion);

  const [enEdicion, setEnEdicion] = useState<Id<"opciones"> | "nuevo" | null>(
    null,
  );
  const [categoriaNueva, setCategoriaNueva] = useState("");

  const agrupadas = useMemo(() => {
    if (!opciones || !categorias) return [];
    return categorias.map((categoria) => ({
      categoria,
      opciones: opciones.filter((o) => o.categoriaSlug === categoria.slug),
    }));
  }, [opciones, categorias]);

  const eliminar = async (opcionId: Id<"opciones">, nombre: string) => {
    if (!window.confirm(`¿Borrar la opción "${nombre}"? No se puede deshacer.`)) {
      return;
    }
    try {
      await borrarOpcion({ opcionId });
    } catch {
      window.alert("No se pudo borrar la opción. Probá de nuevo.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl uppercase">Opciones</h2>
        <button
          type="button"
          onClick={() => {
            setCategoriaNueva(categorias?.[0]?.slug ?? "");
            setEnEdicion("nuevo");
          }}
          className="borde-duro min-h-[44px] bg-cheddar px-4 font-display text-sm uppercase text-negro"
        >
          + Nueva opción
        </button>
      </div>

      {/* Solo el alta va acá arriba. La edición reemplaza la fila de la opción:
          si apareciera acá, editar algo del fondo parecería no hacer nada. */}
      {enEdicion === "nuevo" && categorias && (
        <FormularioOpcion
          key="nuevo"
          opcion={null}
          categoriaSlugInicial={categoriaNueva}
          categorias={categorias}
          alGuardar={() => setEnEdicion(null)}
          alCancelar={() => setEnEdicion(null)}
        />
      )}

      {(opciones === undefined || categorias === undefined) && (
        <p className="font-sans text-hueso/70">Cargando opciones…</p>
      )}

      {agrupadas.map(({ categoria, opciones: opcionesCategoria }) => (
        <div key={categoria.slug} className="flex flex-col gap-2">
          <h3 className="font-display text-lg uppercase text-hueso/80">
            {categoria.nombre}
          </h3>
          {opcionesCategoria.length === 0 && (
            <p className="text-sm text-hueso/50">Sin opciones todavía.</p>
          )}
          <ul className="flex flex-col gap-2">
            {opcionesCategoria.map((opcion) => (
              <li key={opcion._id}>
                {enEdicion === opcion._id && categorias ? (
                  <FormularioOpcion
                    opcion={opcion}
                    categoriaSlugInicial={opcion.categoriaSlug}
                    categorias={categorias}
                    alGuardar={() => setEnEdicion(null)}
                    alCancelar={() => setEnEdicion(null)}
                  />
                ) : (
                  <div className="borde-duro flex flex-wrap items-center gap-3 bg-tinta p-3 font-sans text-sm">
                    <span className="bg-celeste px-2 py-0.5 font-display text-xs uppercase text-negro">
                      {ETIQUETA_TIPO[opcion.tipo] ?? opcion.tipo}
                    </span>
                    <span className="min-w-[120px] flex-1 font-semibold">
                      {opcion.nombre}
                    </span>
                    {!opcion.activa && (
                      <span className="border-2 border-hueso/60 px-2 py-0.5 font-display text-xs uppercase text-hueso/60">
                        No se ofrece
                      </span>
                    )}
                    {opcion.precio > 0 && (
                      <span className="font-display text-cheddar">
                        {precio(opcion.precio)}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setEnEdicion(opcion._id)}
                      className="sticker min-h-[44px] px-3 font-display text-xs uppercase"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => eliminar(opcion._id, opcion.nombre)}
                      className="min-h-[44px] border-2 border-rojo px-3 font-display text-xs uppercase text-hueso"
                    >
                      Borrar
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
