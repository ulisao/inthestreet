"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Categoria, Producto } from "@/types";

export function FormularioProducto({
  producto,
  categorias,
  alGuardar,
  alCancelar,
}: {
  producto: Producto | null;
  categorias: Categoria[];
  alGuardar: () => void;
  alCancelar: () => void;
}) {
  const guardarProducto = useMutation(api.menu.guardarProducto);

  const [nombre, setNombre] = useState(producto?.nombre ?? "");
  const [descripcion, setDescripcion] = useState(producto?.descripcion ?? "");
  const [precio, setPrecio] = useState(String(producto?.precio ?? ""));
  const [categoriaSlug, setCategoriaSlug] = useState(
    producto?.categoriaSlug ?? categorias[0]?.slug ?? "",
  );
  const [imagen, setImagen] = useState(producto?.imagen ?? "");
  const [disponible, setDisponible] = useState(producto?.disponible ?? true);
  const [destacado, setDestacado] = useState(producto?.destacado ?? false);
  const [orden, setOrden] = useState(String(producto?.orden ?? 0));
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
      await guardarProducto({
        productoId: producto?._id,
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        precio: precioNumero,
        categoriaSlug,
        imagen: imagen.trim() || undefined,
        disponible,
        destacado,
        orden: Number.isFinite(ordenNumero) ? ordenNumero : 0,
      });
      alGuardar();
    } catch {
      setError("No se pudo guardar el producto. Probá de nuevo.");
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
        {producto ? `Editar: ${producto.nombre}` : "Nuevo producto"}
      </h3>

      <div className="grid gap-3 sm:grid-cols-2">
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
          Precio (en pesos)
          <input
            type="number"
            min={0}
            step={1}
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          Orden en la grilla
          <input
            type="number"
            step={1}
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Descripción
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="borde-duro min-h-[80px] bg-negro px-3 py-2 text-hueso"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          URL de imagen (opcional)
          <input
            type="text"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            placeholder="https://…"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex min-h-[44px] items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={disponible}
            onChange={(e) => setDisponible(e.target.checked)}
            className="h-5 w-5"
          />
          Disponible
        </label>
        <label className="flex min-h-[44px] items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={destacado}
            onChange={(e) => setDestacado(e.target.checked)}
            className="h-5 w-5"
          />
          Destacado
        </label>
      </div>

      {error && (
        <p role="alert" className="font-semibold text-rojo">
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
