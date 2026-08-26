import type { EstadoPedido, Pedido } from "@/types";
import { ETIQUETA_ESTADO } from "@/types";
import { horaCorta, textoTranscurrido } from "@/lib/formato";

const PASOS_RETIRO: EstadoPedido[] = ["recibido", "en_cocina", "listo", "entregado"];
const PASOS_DELIVERY: EstadoPedido[] = [
  "recibido",
  "en_cocina",
  "listo",
  "en_camino",
  "entregado",
];

function selloDe(pedido: Pedido, estado: EstadoPedido): number | undefined {
  switch (estado) {
    case "recibido":
      return pedido.creadoEn;
    case "en_cocina":
      return pedido.enCocinaEn;
    case "listo":
      return pedido.listoEn;
    case "en_camino":
      return pedido.enCaminoEn;
    case "entregado":
      return pedido.entregadoEn;
    default:
      return undefined;
  }
}

/**
 * recibido → en_cocina → listo → en_camino (solo delivery) → entregado.
 * Si se canceló, la línea se corta en el último paso con sello y se
 * reemplaza el resto por el aviso de cancelación.
 */
export function LineaTiempo({ pedido, ahora }: { pedido: Pedido; ahora: number }) {
  const pasos = pedido.modalidad === "delivery" ? PASOS_DELIVERY : PASOS_RETIRO;
  const cancelado = pedido.estado === "cancelado";
  const indiceActual = cancelado ? -1 : pasos.indexOf(pedido.estado);
  const indiceCorte = cancelado
    ? pasos.reduce(
        (ultimo, paso, i) => (selloDe(pedido, paso) !== undefined ? i : ultimo),
        0,
      )
    : -1;

  return (
    <ol className="flex flex-col" aria-label="Estado del pedido">
      {pasos.map((paso, i) => {
        if (cancelado && i > indiceCorte) return null;

        const completado = !cancelado && i < indiceActual;
        const actual = !cancelado && i === indiceActual;
        const futuro = !cancelado && i > indiceActual;
        const sello = selloDe(pedido, paso);
        const esListo = paso === "listo";

        const colorEtiqueta = esListo && (actual || completado)
          ? "text-lechuga"
          : actual
            ? "text-cheddar"
            : "";

        const colorMarcador = actual
          ? esListo
            ? "border-lechuga bg-lechuga"
            : "border-cheddar bg-cheddar"
          : completado
            ? esListo
              ? "border-lechuga bg-lechuga"
              : "border-hueso bg-hueso"
            : "border-tinta bg-negro";

        return (
          <li
            key={paso}
            aria-current={actual ? "step" : undefined}
            className={`flex gap-3 border-l-2 py-2 pl-4 ${
              futuro ? "border-tinta opacity-40" : "border-hueso"
            }`}
          >
            <span
              className={`-ml-[1.4rem] mt-1.5 h-3 w-3 shrink-0 border-2 ${colorMarcador}`}
              aria-hidden="true"
            />
            <div className="flex flex-col">
              <span className={`font-display text-lg uppercase ${colorEtiqueta}`}>
                {ETIQUETA_ESTADO[paso]}
              </span>
              {sello !== undefined && (
                <span className="text-sm text-hueso/70">
                  {horaCorta(sello)} · {textoTranscurrido(sello, ahora)}
                </span>
              )}
            </div>
          </li>
        );
      })}

      {cancelado && (
        <li className="flex gap-3 border-l-2 border-rojo py-2 pl-4">
          <span
            className="-ml-[1.4rem] mt-1.5 h-3 w-3 shrink-0 border-2 border-rojo bg-rojo"
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span className="font-display text-lg uppercase">Cancelado</span>
            {pedido.canceladoEn !== undefined && (
              <span className="text-sm text-hueso/70">
                {horaCorta(pedido.canceladoEn)} ·{" "}
                {textoTranscurrido(pedido.canceladoEn, ahora)}
              </span>
            )}
            {pedido.motivoCancelacion && (
              <span className="text-sm">{pedido.motivoCancelacion}</span>
            )}
          </div>
        </li>
      )}
    </ol>
  );
}
