"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { guardarCodigo } from "@/lib/pedido/codigoGuardado";
import { armarReferencia, leerReferencia } from "@/lib/pedido/referencia";
import { useReloj } from "./useReloj";
import { EsqueletoSeguimiento } from "./EsqueletoSeguimiento";
import { PedidoNoEncontrado } from "./PedidoNoEncontrado";
import { DetallePedido } from "./DetallePedido";
import { EstadoYEta } from "./EstadoYEta";
import { LineaTiempo } from "./LineaTiempo";
import { BotonWhatsapp } from "./BotonWhatsapp";

/**
 * Pantalla de estado en vivo. Todo sale de una subscripción reactiva de
 * Convex — sin polling. El único intervalo es el reloj de 1s que redibuja
 * el tiempo transcurrido, no que refetchea datos.
 */
export function PantallaSeguimiento({ codigo }: { codigo: string }) {
  // `codigo` puede venir como referencia completa (`A-47-260826`) o como el
  // código corto suelto, si el cliente lo pegó a mano.
  const referencia = leerReferencia(codigo);
  const datos = useQuery(
    api.pedidos.porCodigo,
    referencia
      ? { codigo: referencia.codigo, diaServicio: referencia.diaServicio }
      : "skip",
  );
  const ahora = useReloj();

  const pedidoEncontrado = datos?.pedido;
  useEffect(() => {
    if (pedidoEncontrado?.diaServicio) {
      guardarCodigo(
        armarReferencia(pedidoEncontrado.codigo, pedidoEncontrado.diaServicio),
      );
    }
  }, [pedidoEncontrado?.codigo, pedidoEncontrado?.diaServicio]);

  if (!referencia) {
    return <PedidoNoEncontrado codigoBuscado={codigo.toUpperCase()} />;
  }

  if (datos === undefined) {
    return <EsqueletoSeguimiento />;
  }

  if (datos === null) {
    return <PedidoNoEncontrado codigoBuscado={referencia.codigo} />;
  }

  const { pedido, items, adelante, local } = datos;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-4 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <DetallePedido pedido={pedido} items={items} local={local} />
      <EstadoYEta pedido={pedido} adelante={adelante} ahora={ahora} />
      <LineaTiempo pedido={pedido} ahora={ahora} />
      <BotonWhatsapp local={local} codigo={pedido.codigo} />
      <Link
        href="/"
        className="flex min-h-11 items-center justify-center px-4 text-center text-sm underline underline-offset-4"
      >
        Volver al menú
      </Link>
    </main>
  );
}
