import type { Metadata } from "next";
import { PantallaSeguimiento } from "@/components/seguimiento/PantallaSeguimiento";
import { leerReferencia } from "@/lib/pedido/referencia";

type ParametrosPagina = {
  params: Promise<{ codigo: string }>;
};

export async function generateMetadata({
  params,
}: ParametrosPagina): Promise<Metadata> {
  const { codigo } = await params;
  // El link lleva la referencia con el día adentro; el título muestra solo el
  // código corto, que es el que el cliente reconoce.
  const corto = leerReferencia(codigo)?.codigo ?? codigo.toUpperCase();
  return {
    title: `Pedido ${corto} — IN THE STREET`,
  };
}

export default async function PaginaPedidoConCodigo({
  params,
}: ParametrosPagina) {
  const { codigo } = await params;
  return <PantallaSeguimiento codigo={codigo} />;
}
