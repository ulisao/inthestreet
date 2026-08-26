import { ETIQUETA_ESTADO_PANEL } from "@/types";
import type { EstadoPedido, PedidoConItems } from "@/types";
import { Comanda } from "./Comanda";

export function ColumnaEstado({
  estado,
  pedidos,
  ahora,
  idsNuevos,
  className = "",
}: {
  estado: EstadoPedido;
  pedidos: PedidoConItems[];
  ahora: number;
  idsNuevos: Set<string>;
  className?: string;
}) {
  return (
    <section className={`flex min-h-0 flex-col ${className}`}>
      <h2 className="sticker mb-2 self-start px-3 py-1 font-display text-base uppercase">
        {ETIQUETA_ESTADO_PANEL[estado]} · {pedidos.length}
      </h2>
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pb-4 pr-1">
        {pedidos.length === 0 && (
          <p className="font-sans text-sm text-hueso/50">Sin pedidos acá.</p>
        )}
        {pedidos.map((pedido) => (
          <Comanda
            key={pedido._id}
            pedido={pedido}
            ahora={ahora}
            esNueva={idsNuevos.has(pedido._id)}
          />
        ))}
      </div>
    </section>
  );
}
