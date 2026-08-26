import type { Metadata } from "next";
import { EntradaSeguimiento } from "@/components/seguimiento/EntradaSeguimiento";

export const metadata: Metadata = {
  title: "Seguí tu pedido — IN THE STREET",
};

export default function PaginaPedido() {
  return <EntradaSeguimiento />;
}
