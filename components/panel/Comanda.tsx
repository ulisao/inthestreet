"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { precio, minutosTranscurridos, horaCorta } from "@/lib/formato";
import type { EstadoPedido, PedidoConItems } from "@/types";

const SECUENCIA_RETIRO: EstadoPedido[] = [
  "recibido",
  "en_cocina",
  "listo",
  "entregado",
];

const SECUENCIA_DELIVERY: EstadoPedido[] = [
  "recibido",
  "en_cocina",
  "listo",
  "en_camino",
  "entregado",
];

const ETIQUETA_BOTON_AVANZAR: Record<EstadoPedido, string> = {
  recibido: "Pasar a en cocina",
  en_cocina: "Marcar listo",
  listo: "Marcar en camino",
  en_camino: "Marcar entregado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

function siguienteEstado(pedido: PedidoConItems): EstadoPedido | null {
  const secuencia =
    pedido.modalidad === "delivery" ? SECUENCIA_DELIVERY : SECUENCIA_RETIRO;
  const indice = secuencia.indexOf(pedido.estado);
  if (indice === -1 || indice === secuencia.length - 1) return null;
  // "listo" en retiro salta directo a entregado: no ofrecemos en_camino nunca.
  return secuencia[indice + 1];
}

export function Comanda({
  pedido,
  ahora,
  esNueva,
}: {
  pedido: PedidoConItems;
  ahora: number;
  esNueva: boolean;
}) {
  const avanzarEstado = useMutation(api.pedidos.avanzarEstado);
  const cancelar = useMutation(api.pedidos.cancelar);
  const [enCurso, setEnCurso] = useState(false);

  const minutos = minutosTranscurridos(pedido.creadoEn, ahora);
  const vencido = minutos >= 30;
  const siguiente = siguienteEstado(pedido);

  const avanzar = async () => {
    if (!siguiente || enCurso) return;
    setEnCurso(true);
    try {
      await avanzarEstado({ pedidoId: pedido._id, estado: siguiente });
    } catch {
      window.alert("No se pudo actualizar el estado. Probá de nuevo.");
    } finally {
      setEnCurso(false);
    }
  };

  const cancelarPedido = async () => {
    if (enCurso) return;
    const confirmado = window.confirm(
      `¿Cancelar el pedido ${pedido.codigo}? No se puede deshacer.`,
    );
    if (!confirmado) return;
    setEnCurso(true);
    try {
      await cancelar({ pedidoId: pedido._id });
    } catch {
      window.alert("No se pudo cancelar el pedido. Probá de nuevo.");
    } finally {
      setEnCurso(false);
    }
  };

  const vuelto =
    pedido.metodoPago === "efectivo" && pedido.pagaCon != null
      ? pedido.pagaCon - pedido.total
      : null;

  return (
    <article
      className={`borde-duro relative flex flex-col gap-3 bg-tinta p-4 ${
        esNueva ? "panel-comanda--nueva" : ""
      } ${vencido ? "panel-comanda--vencida" : ""}`}
    >
      {esNueva && (
        <span
          className="sticker rot-2 absolute -left-3 -top-4 bg-rojo px-3 py-1 font-display text-sm uppercase text-hueso"
          data-activo="true"
        >
          Nuevo
        </span>
      )}

      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-5xl leading-none text-hueso">
            {pedido.codigo}
          </p>
          <p className="mt-1 font-sans text-sm text-hueso/70">
            Pedido a las {horaCorta(pedido.creadoEn)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className="px-3 py-1 font-display text-sm uppercase text-negro"
            style={{
              backgroundColor:
                pedido.modalidad === "delivery"
                  ? "var(--cheddar)"
                  : "var(--celeste)",
            }}
          >
            {pedido.modalidad === "delivery" ? "Delivery" : "Retiro"}
          </span>
          <p
            className={`font-display text-2xl ${
              vencido ? "text-rojo" : "text-hueso"
            }`}
            aria-label={`${minutos} minutos transcurridos`}
          >
            {minutos} min
          </p>
        </div>
      </header>

      <div className="font-sans text-sm">
        <p className="font-semibold">{pedido.nombre}</p>
        <a href={`tel:${pedido.telefono}`} className="text-hueso/80 underline">
          {pedido.telefono}
        </a>
      </div>

      {pedido.modalidad === "delivery" && (
        <div className="border-2 border-tinta bg-negro/40 p-2 font-sans text-sm">
          <p className="font-semibold uppercase text-celeste">Dirección</p>
          <p>{pedido.direccion}</p>
          {pedido.referencia && (
            <p className="text-hueso/80">Ref: {pedido.referencia}</p>
          )}
        </div>
      )}

      {pedido.nota && (
        <p className="bg-rojo px-3 py-2 font-sans text-sm font-semibold text-hueso">
          Nota del pedido: {pedido.nota}
        </p>
      )}

      <ul className="flex flex-col gap-2 border-y-2 border-tinta py-2 font-sans text-sm">
        {pedido.items.map((item) => (
          <li key={item._id}>
            <p className="font-display text-lg uppercase leading-tight text-hueso">
              {item.cantidad}× {item.nombreProducto}
            </p>
            {item.puntoCoccion && (
              <p className="text-hueso/80">Punto: {item.puntoCoccion}</p>
            )}
            {item.extras.length > 0 && (
              <p className="text-hueso/80">
                + Extras:{" "}
                {item.extras
                  .map((extra) =>
                    extra.precio > 0
                      ? `${extra.nombre} (${precio(extra.precio)})`
                      : extra.nombre,
                  )
                  .join(", ")}
              </p>
            )}
            {item.quitar.length > 0 && (
              <p className="text-hueso/80">Sin: {item.quitar.join(", ")}</p>
            )}
            {item.nota && (
              <p className="mt-1 inline-block bg-cheddar px-2 py-1 font-semibold text-negro">
                Nota: {item.nota}
              </p>
            )}
          </li>
        ))}
      </ul>

      <div className="font-sans text-sm">
        <p className="flex items-center justify-between">
          <span>Total</span>
          <span className="font-display text-xl text-cheddar">
            {precio(pedido.total)}
          </span>
        </p>
        <p className="text-hueso/80">
          {pedido.metodoPago === "efectivo" ? "Efectivo" : "Transferencia"}
        </p>
        {vuelto !== null && (
          <p className="mt-1 bg-cheddar px-3 py-2 font-display text-lg text-negro">
            Paga con {precio(pedido.pagaCon ?? 0)} · Vuelto {precio(vuelto)}
          </p>
        )}
      </div>

      <div className="mt-1 flex flex-col gap-2">
        {siguiente && (
          <button
            type="button"
            onClick={avanzar}
            disabled={enCurso}
            className="panel-boton-avanzar borde-duro bg-lechuga font-display text-lg uppercase text-negro disabled:opacity-60"
          >
            {ETIQUETA_BOTON_AVANZAR[pedido.estado]}
          </button>
        )}
        <button
          type="button"
          onClick={cancelarPedido}
          disabled={enCurso}
          className="panel-boton-cancelar border-2 border-rojo font-display text-sm uppercase text-hueso disabled:opacity-60"
        >
          Cancelar pedido
        </button>
      </div>
    </article>
  );
}
