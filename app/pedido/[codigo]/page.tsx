import type { Metadata } from "next";
import { PantallaSeguimiento } from "@/components/seguimiento/PantallaSeguimiento";

type ParametrosPagina = {
  params: Promise<{ codigo: string }>;
};

export async function generateMetadata({
  params,
}: ParametrosPagina): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Pedido ${codigo.toUpperCase()} — IN THE STREET`,
  };
}

export default async function PaginaPedidoConCodigo({
  params,
}: ParametrosPagina) {
  const { codigo } = await params;
  return <PantallaSeguimiento codigo={codigo} />;
}
