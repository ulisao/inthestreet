"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { precio, horaCorta } from "@/lib/formato";

export function Historial() {
  const pedidos = useQuery(api.pedidos.cerradosDeHoy);

  return (
    <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
      <h2 className="font-display text-2xl uppercase text-hueso">
        Historial de las últimas 12 horas
      </h2>

      {pedidos === undefined && (
        <p className="font-sans text-hueso/70">Cargando historial…</p>
      )}

      {pedidos !== undefined && pedidos.length === 0 && (
        <p className="font-sans text-hueso/60">
          Todavía no hay pedidos entregados ni cancelados hoy.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {pedidos?.map((pedido) => (
          <li
            key={pedido._id}
            className="borde-duro flex flex-wrap items-center gap-x-4 gap-y-1 bg-tinta px-3 py-2 font-sans text-sm"
          >
            <span className="font-display text-xl text-hueso">
              {pedido.codigo}
            </span>
            <span
              className="px-2 py-0.5 font-display text-xs uppercase text-negro"
              style={{
                backgroundColor:
                  pedido.estado === "cancelado" ? "var(--rojo)" : "var(--lechuga)",
                color: pedido.estado === "cancelado" ? "var(--hueso)" : "var(--negro)",
              }}
            >
              {pedido.estado === "cancelado" ? "Cancelado" : "Entregado"}
            </span>
            <span
              className="px-2 py-0.5 font-display text-xs uppercase text-negro"
              style={{
                backgroundColor:
                  pedido.modalidad === "delivery" ? "var(--cheddar)" : "var(--celeste)",
              }}
            >
              {pedido.modalidad === "delivery" ? "Delivery" : "Retiro"}
            </span>
            <span className="text-hueso/70">{horaCorta(pedido.creadoEn)}</span>
            <span className="font-semibold">{pedido.nombre}</span>
            <span className="ml-auto font-display text-lg text-cheddar">
              {precio(pedido.total)}
            </span>
            {pedido.estado === "cancelado" && pedido.motivoCancelacion && (
              <span className="w-full text-hueso/70">
                Motivo: {pedido.motivoCancelacion}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
