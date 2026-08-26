"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { EstadoPedido } from "@/types";
import { useSonidoPanel } from "./ContextoSonido";
import { ColumnaEstado } from "./ColumnaEstado";

const ESTADOS_COLUMNA: EstadoPedido[] = [
  "recibido",
  "en_cocina",
  "listo",
  "en_camino",
];

// Cuánto se queda marcada una comanda como "nueva" (flash + sticker).
const DURACION_AVISO_MS = 15_000;

/** true en pantallas angostas (celular en vertical): ahí no entran 4 columnas. */
function useAngosto() {
  const [angosto, setAngosto] = useState(false);
  useEffect(() => {
    const medio = window.matchMedia("(max-width: 767px)");
    const actualizar = () => setAngosto(medio.matches);
    actualizar();
    medio.addEventListener("change", actualizar);
    return () => medio.removeEventListener("change", actualizar);
  }, []);
  return angosto;
}

export function TableroComandas() {
  const pedidos = useQuery(api.pedidos.activos);
  const { avisarPedidoNuevo } = useSonidoPanel();
  const angosto = useAngosto();

  const [ahora, setAhora] = useState(() => Date.now());
  const [idsNuevos, setIdsNuevos] = useState<Set<string>>(new Set());
  const [anuncio, setAnuncio] = useState("");
  const [columnaActiva, setColumnaActiva] = useState<EstadoPedido>("recibido");
  const idsConocidos = useRef<Set<string> | null>(null);

  // Cronómetro: un solo reloj compartido por todas las comandas.
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Detecta pedidos nuevos comparando contra la carga anterior. La primera
  // entrega de la query no dispara aviso: ahí "todos son nuevos".
  useEffect(() => {
    if (pedidos === undefined) return;
    const idsActuales = new Set(pedidos.map((p) => p._id));

    if (idsConocidos.current === null) {
      idsConocidos.current = idsActuales;
      return;
    }

    const recienLlegados = pedidos.filter(
      (p) => !idsConocidos.current!.has(p._id),
    );

    if (recienLlegados.length > 0) {
      avisarPedidoNuevo();
      setAnuncio(
        recienLlegados.length === 1
          ? `Pedido nuevo: ${recienLlegados[0].codigo}`
          : `${recienLlegados.length} pedidos nuevos`,
      );
      setIdsNuevos((previo) => {
        const copia = new Set(previo);
        recienLlegados.forEach((p) => copia.add(p._id));
        return copia;
      });
      recienLlegados.forEach((p) => {
        setTimeout(() => {
          setIdsNuevos((previo) => {
            if (!previo.has(p._id)) return previo;
            const copia = new Set(previo);
            copia.delete(p._id);
            return copia;
          });
        }, DURACION_AVISO_MS);
      });
    }

    idsConocidos.current = idsActuales;
  }, [pedidos, avisarPedidoNuevo]);

  const porEstado = (estado: EstadoPedido) =>
    (pedidos ?? []).filter((p) => p.estado === estado);

  return (
    <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
      {/* Zona donde entran los pedidos nuevos: la anunciamos aparte para que
          no dependa de qué columna/tab esté visible. */}
      <div aria-live="assertive" className="sr-only">
        {anuncio}
      </div>

      {pedidos === undefined && (
        <p className="font-sans text-hueso/70">Cargando comandas…</p>
      )}

      {pedidos !== undefined && pedidos.length === 0 && (
        <p className="font-display text-2xl uppercase text-hueso/60">
          No hay pedidos activos.
        </p>
      )}

      {pedidos !== undefined && pedidos.length > 0 && angosto && (
        <>
          <div
            role="tablist"
            aria-label="Estado de las comandas"
            className="sin-scrollbar mb-3 flex gap-2 overflow-x-auto"
          >
            {ESTADOS_COLUMNA.map((estado) => (
              <button
                key={estado}
                type="button"
                role="tab"
                aria-selected={columnaActiva === estado}
                onClick={() => setColumnaActiva(estado)}
                className="sticker shrink-0 px-4 py-2 font-display text-sm uppercase"
                data-activo={columnaActiva === estado ? "true" : "false"}
              >
                {estado === "recibido" && "Recibidos"}
                {estado === "en_cocina" && "En cocina"}
                {estado === "listo" && "Listos"}
                {estado === "en_camino" && "En camino"} · {porEstado(estado).length}
              </button>
            ))}
          </div>
          <ColumnaEstado
            estado={columnaActiva}
            pedidos={porEstado(columnaActiva)}
            ahora={ahora}
            idsNuevos={idsNuevos}
            className="flex-1"
          />
        </>
      )}

      {pedidos !== undefined && pedidos.length > 0 && !angosto && (
        <div className="grid flex-1 grid-cols-4 gap-4">
          {ESTADOS_COLUMNA.map((estado) => (
            <ColumnaEstado
              key={estado}
              estado={estado}
              pedidos={porEstado(estado)}
              ahora={ahora}
              idsNuevos={idsNuevos}
            />
          ))}
        </div>
      )}
    </div>
  );
}
