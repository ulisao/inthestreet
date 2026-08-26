"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Categoria, Opcion, TipoOpcion } from "@/types";

const TIPOS: { valor: TipoOpcion; etiqueta: string }[] = [
  { valor: "punto_coccion", etiqueta: "Punto de cocción" },
  { valor: "extra", etiqueta: "Extra (con precio)" },
  { valor: "quitar", etiqueta: "Ingrediente a quitar" },
];

export function FormularioOpcion({
  opcion,
  categoriaSlugInicial,
  categorias,
  alGuardar,
  alCancelar,
}: {
  opcion: Opcion | null;
  categoriaSlugInicial: string;
  categorias: Categoria[];
  alGuardar: () => void;
  alCancelar: () => void;
}) {
  const guardarOpcion = useMutation(api.menu.guardarOpcion);

  const [categoriaSlug, setCategoriaSlug] = useState(
    opcion?.categoriaSlug ?? categoriaSlugInicial ?? categorias[0]?.slug ?? "",
  );
  const [tipo, setTipo] = useState<TipoOpcion>(opcion?.tipo ?? "extra");
  const [nombre, setNombre] = useState(opcion?.nombre ?? "");
  const [precio, setPrecio] = useState(String(opcion?.precio ?? 0));
  const [orden, setOrden] = useState(String(opcion?.orden ?? 0));
  const [activa, setActiva] = useState(opcion?.activa ?? true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const precioNumero = Number(precio);
    const ordenNumero = Number(orden);

    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!Number.isFinite(precioNumero) || precioNumero < 0) {
      setError("El precio tiene que ser un número válido.");
      return;
    }
    if (!categoriaSlug) {
      setError("Elegí una categoría.");
      return;
    }

    setGuardando(true);
    setError(null);
    try {
      await guardarOpcion({
        opcionId: opcion?._id,
        categoriaSlug,
        tipo,
        nombre: nombre.trim(),
        precio: precioNumero,
        orden: Number.isFinite(ordenNumero) ? ordenNumero : 0,
        activa,
      });
      alGuardar();
    } catch {
      setError("No se pudo guardar la opción. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={enviar}
      className="borde-duro flex flex-col gap-3 bg-tinta p-4 font-sans"
    >
      <h3 className="font-display text-xl uppercase">
        {opcion ? `Editar opción: ${opcion.nombre}` : "Nueva opción"}
      </h3>
      <p className="text-xs text-hueso/60">
        Las opciones se enganchan por categoría: todos los productos de esa
        categoría la comparten.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          Categoría
          <select
            value={categoriaSlug}
            onChange={(e) => setCategoriaSlug(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            required
          >
            {categorias.map((categoria) => (
              <option key={categoria.slug} value={categoria.slug}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Tipo
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoOpcion)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            required
          >
            {TIPOS.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.etiqueta}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Precio extra (0 si no suma)
          <input
            type="number"
            min={0}
            step={1}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Orden
          <input
            type="number"
            step={1}
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
          />
        </label>
      </div>

      <label className="flex min-h-[44px] items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={activa}
          onChange={(e) => setActiva(e.target.checked)}
          className="h-5 w-5"
        />
        Activa
      </label>
      <p className="text-xs text-hueso/60">
        Si la desmarcás, deja de ofrecerse en la tienda pero sigue listada acá
        para que la puedas volver a activar cuando quieras.
      </p>

      {error && (
        <p role="alert" className="border-2 border-hueso bg-rojo px-3 py-2 font-semibold text-hueso">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={guardando}
          className="borde-duro min-h-[48px] flex-1 bg-cheddar px-4 font-display text-sm uppercase text-negro disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={alCancelar}
          className="min-h-[48px] border-2 border-tinta px-4 font-display text-sm uppercase text-hueso/80"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
