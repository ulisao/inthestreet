"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { guardarCodigo } from "@/lib/pedido/codigoGuardado";
import { normalizarCodigo } from "./normalizarCodigo";
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
  const codigoNormalizado = normalizarCodigo(codigo);
  const datos = useQuery(api.pedidos.porCodigo, { codigo: codigoNormalizado });
  const ahora = useReloj();

  const codigoEncontrado = datos?.pedido?.codigo;
  useEffect(() => {
    if (codigoEncontrado) guardarCodigo(codigoEncontrado);
  }, [codigoEncontrado]);

  if (datos === undefined) {
    return <EsqueletoSeguimiento />;
  }

  if (datos === null) {
    return <PedidoNoEncontrado codigoBuscado={codigoNormalizado} />;
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
