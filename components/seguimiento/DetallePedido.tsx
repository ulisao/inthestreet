import type { ConfigLocal, ItemPedido, Pedido } from "@/types";
import { precio } from "@/lib/formato";

type LocalPedido = Pick<
  ConfigLocal,
  "nombre" | "direccion" | "telefono" | "whatsapp" | "aliasTransferencia"
>;

/**
 * La comanda: código gigante arriba de todo, items con su configuración,
 * totales, forma de pago y entrega. Sobre `.papel-deli` — superficie clara,
 * así que todo el texto va en negro (heredado de la clase), nunca hueso ni
 * cheddar acá: cheddar sobre este fondo claro es un par de bajo contraste.
 */
export function DetallePedido({
  pedido,
  items,
  local,
}: {
  pedido: Pedido;
  items: ItemPedido[];
  local: LocalPedido;
}) {
  return (
    <section
      className="papel-deli borde-duro flex flex-col gap-4 p-5"
      aria-label="Detalle del pedido"
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-xs uppercase tracking-widest">
          Mostrá este número en el mostrador
        </p>
        <h1 className="text-[clamp(3.5rem,16vw,5.5rem)] leading-none">
          <span className="sr-only">Pedido </span>
          {pedido.codigo}
        </h1>
        <p className="text-sm">A nombre de {pedido.nombre}</p>
      </div>

      <div className="flex flex-col gap-3 border-t-2 border-negro/15 pt-4">
        {items.map((item) => (
          <div key={item._id} className="flex flex-col gap-0.5">
            <div className="flex justify-between gap-3 font-display text-base">
              <span>
                {item.cantidad}× {item.nombreProducto}
                {item.puntoCoccion ? ` · ${item.puntoCoccion}` : ""}
              </span>
              <span className="shrink-0">{precio(item.subtotal)}</span>
            </div>
            {item.extras.length > 0 && (
              <p className="text-sm">
                + {item.extras.map((extra) => extra.nombre).join(", ")}
              </p>
            )}
            {item.quitar.length > 0 && (
              <p className="text-sm">Sin {item.quitar.join(", ")}</p>
            )}
            {item.nota && <p className="text-sm italic">&quot;{item.nota}&quot;</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 border-t-2 border-negro/15 pt-4">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{precio(pedido.subtotal)}</span>
        </div>
        {pedido.modalidad === "delivery" && (
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>{precio(pedido.recargoDelivery)}</span>
          </div>
        )}
        <div className="flex justify-between pt-1 font-display text-2xl">
          <span>Total</span>
          <span>{precio(pedido.total)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t-2 border-negro/15 pt-4 text-sm">
        <p>
          Pago:{" "}
          <span className="font-display">
            {pedido.metodoPago === "efectivo" ? "Efectivo" : "Transferencia"}
          </span>
        </p>
        {pedido.metodoPago === "efectivo" && pedido.pagaCon !== undefined && (
          <p>
            Paga con {precio(pedido.pagaCon)} · Vuelto{" "}
            {precio(pedido.pagaCon - pedido.total)}
          </p>
        )}
        {pedido.metodoPago === "transferencia" && (
          <p>
            Alias:{" "}
            <span className="font-display">{local.aliasTransferencia}</span>
          </p>
        )}
      </div>

      {pedido.modalidad === "delivery" && (
        <div className="border-t-2 border-negro/15 pt-4 text-sm">
          <p className="mb-1 text-xs uppercase tracking-widest">Entrega</p>
          <p>{pedido.direccion}</p>
          {pedido.referencia && <p>{pedido.referencia}</p>}
        </div>
      )}

      {pedido.nota && (
        <div className="border-t-2 border-negro/15 pt-4 text-sm">
          <p className="mb-1 text-xs uppercase tracking-widest">Nota</p>
          <p>{pedido.nota}</p>
        </div>
      )}
    </section>
  );
}
