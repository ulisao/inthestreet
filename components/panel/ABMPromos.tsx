"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { DIAS_SEMANA } from "@/types";
import type { Id } from "@/convex/_generated/dataModel";

function FormularioPromo({
  diaSemana,
  promoId,
  tituloInicial,
  descripcionInicial,
  activaInicial,
  alTerminar,
}: {
  diaSemana: number;
  promoId?: Id<"promos_dia">;
  tituloInicial: string;
  descripcionInicial: string;
  activaInicial: boolean;
  alTerminar: () => void;
}) {
  const guardarPromo = useMutation(api.config.guardarPromo);
  const [titulo, setTitulo] = useState(tituloInicial);
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [activa, setActiva] = useState(activaInicial);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!titulo.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await guardarPromo({
        promoId,
        diaSemana,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        activa,
      });
      alTerminar();
    } catch {
      setError("No se pudo guardar la promo. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <form
      onSubmit={enviar}
      className="borde-duro flex flex-col gap-3 bg-tinta p-4 font-sans"
    >
      <label className="flex flex-col gap-1 text-sm">
        Título (va en mayúsculas, así se publica siempre)
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value.toUpperCase())}
          className="borde-duro min-h-[44px] bg-negro px-3 py-2 font-display uppercase text-hueso"
          placeholder="VIERNES CON ESTILO"
          required
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        Descripción
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="borde-duro min-h-[70px] bg-negro px-3 py-2 text-hueso"
          placeholder="Qué incluye, hasta cuándo, condiciones…"
        />
      </label>

      <label className="flex min-h-[44px] items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={activa}
          onChange={(e) => setActiva(e.target.checked)}
          className="h-5 w-5"
        />
        Activa (se muestra en la tienda ese día)
      </label>

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
          onClick={alTerminar}
          className="min-h-[48px] border-2 border-tinta px-4 font-display text-sm uppercase text-hueso/80"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function ABMPromos() {
  const promos = useQuery(api.config.listarPromos);
  const borrarPromo = useMutation(api.config.borrarPromo);
  const [diaEnEdicion, setDiaEnEdicion] = useState<number | null>(null);

  const eliminar = async (promoId: Id<"promos_dia">, titulo: string) => {
    if (!window.confirm(`¿Borrar la promo "${titulo}"? No se puede deshacer.`)) {
      return;
    }
    try {
      await borrarPromo({ promoId });
    } catch {
      window.alert("No se pudo borrar la promo. Probá de nuevo.");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
      <h2 className="font-display text-2xl uppercase">Promo del día</h2>
      <p className="text-sm text-hueso/70">
        Una promo por día de la semana. El título se publica en mayúsculas,
        como ya lo hacen en Instagram.
      </p>

      {promos === undefined && (
        <p className="font-sans text-hueso/70">Cargando promos…</p>
      )}

      {promos !== undefined && (
        <ul className="flex flex-col gap-3">
          {DIAS_SEMANA.map((nombreDia, diaSemana) => {
            const promo = promos.find((p) => p.diaSemana === diaSemana);

            if (diaEnEdicion === diaSemana) {
              return (
                <li key={diaSemana}>
                  <h3 className="mb-2 font-display text-lg uppercase text-hueso/80">
                    {nombreDia}
                  </h3>
                  <FormularioPromo
                    diaSemana={diaSemana}
                    promoId={promo?._id}
                    tituloInicial={promo?.titulo ?? ""}
                    descripcionInicial={promo?.descripcion ?? ""}
                    activaInicial={promo?.activa ?? true}
                    alTerminar={() => setDiaEnEdicion(null)}
                  />
                </li>
              );
            }

            return (
              <li
                key={diaSemana}
                className="borde-duro flex flex-wrap items-center gap-3 bg-tinta p-3 font-sans"
              >
                <span className="w-28 shrink-0 font-display text-sm uppercase text-hueso/60">
                  {nombreDia}
                </span>
                <div className="min-w-[160px] flex-1">
                  {promo ? (
                    <>
                      <p className="font-display text-lg uppercase leading-tight text-cheddar">
                        {promo.titulo}
                      </p>
                      {promo.descripcion && (
                        <p className="text-sm text-hueso/70">
                          {promo.descripcion}
                        </p>
                      )}
                      {!promo.activa && (
                        <p className="text-xs uppercase text-rojo">Inactiva</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-hueso/50">Sin promo cargada.</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDiaEnEdicion(diaSemana)}
                  className="sticker min-h-[44px] px-3 font-display text-xs uppercase"
                >
                  {promo ? "Editar" : "Agregar"}
                </button>
                {promo && (
                  <button
                    type="button"
                    onClick={() => eliminar(promo._id, promo.titulo)}
                    className="min-h-[44px] border-2 border-rojo px-3 font-display text-xs uppercase text-rojo"
                  >
                    Borrar
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
