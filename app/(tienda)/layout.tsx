import type { ReactNode } from "react";
import { BarraCarrito } from "@/components/carrito/BarraCarrito";
import { Carrito } from "@/components/carrito/Carrito";
import { Encabezado } from "@/components/menu/Encabezado";

/**
 * Layout de la tienda: header (logo + estado del local) arriba, el contenido de
 * `page.tsx` en el medio, y el carrito (bottom sheet + barra fija con el total)
 * de agente-pedido montado acá para que esté disponible en toda la tienda.
 */
export default function LayoutTienda({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 flex-col pb-28">
      <Encabezado />
      {children}
      <BarraCarrito />
      <Carrito />
    </div>
  );
}
