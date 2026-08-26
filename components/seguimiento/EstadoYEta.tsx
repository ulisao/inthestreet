import type { Pedido } from "@/types";
import { ETIQUETA_ESTADO } from "@/types";
import { horaCorta, minutosTranscurridos } from "@/lib/formato";

/**
 * La feature más importante de la pantalla: nunca un ETA optimista.
 * `minutosEstimados` es la promesa congelada al crear el pedido — no se
 * recalcula acá. Si ya se pasó el tiempo prometido, se dice tal cual.
 */
export function EstadoYEta({
  pedido,
  adelante,
  ahora,
}: {
  pedido: Pedido;
  adelante: number;
  ahora: number;
}) {
  if (pedido.estado === "cancelado") {
    return (
      <section
        aria-live="polite"
        className="borde-duro flex flex-col gap-2 bg-tinta p-5"
      >
        <h2 className="text-3xl text-rojo">Pedido cancelado</h2>
        <p>
          {pedido.motivoCancelacion
            ? pedido.motivoCancelacion
            : "El local canceló este pedido. Escribinos si tenés dudas."}
        </p>
      </section>
    );
  }

  if (
    pedido.estado === "listo" ||
    pedido.estado === "en_camino" ||
    pedido.estado === "entregado"
  ) {
    const esListo = pedido.estado === "listo";
    return (
      <section
        aria-live="polite"
        className="borde-duro flex flex-col gap-1 bg-tinta p-5"
      >
        <h2 className={esListo ? "text-3xl text-lechuga" : "text-3xl"}>
          {ETIQUETA_ESTADO[pedido.estado]}
        </h2>
        {esListo && <p>Pasá a buscarlo cuando quieras, ya está listo.</p>}
        {pedido.estado === "en_camino" && <p>Ya salió para tu dirección.</p>}
        {pedido.estado === "entregado" && <p>Que lo disfrutes.</p>}
      </section>
    );
  }

  // recibido | en_cocina: acá vive el ETA.
  const horaEstimadaTs = pedido.creadoEn + pedido.minutosEstimados * 60_000;
  const minutosPasados = minutosTranscurridos(pedido.creadoEn, ahora);
  const atrasado = minutosPasados > pedido.minutosEstimados;

  return (
    <section
      aria-live="polite"
      className="borde-duro flex flex-col gap-2 bg-tinta p-5"
    >
      <h2 className="text-3xl text-cheddar">{ETIQUETA_ESTADO[pedido.estado]}</h2>
      <p>
        {adelante <= 0
          ? "Sos el próximo: no hay nadie más adelante tuyo."
          : `Hay ${adelante} pedido${adelante === 1 ? "" : "s"} adelante tuyo.`}
      </p>
      {atrasado ? (
        <p>
          Estamos demorados, ya casi sale. Calculábamos que salía cerca de las{" "}
          {horaCorta(horaEstimadaTs)}.
        </p>
      ) : (
        <p>Calculá que sale cerca de las {horaCorta(horaEstimadaTs)}.</p>
      )}
    </section>
  );
}
