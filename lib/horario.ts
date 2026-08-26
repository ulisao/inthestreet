/** Argentina no tiene horario de verano: el offset es fijo. */
const OFFSET_ARGENTINA_MIN = -180;

/** A qué hora arranca un nuevo día de servicio. Ver `diaServicio`. */
const CORTE_DIA_SERVICIO_H = 6;

export type HorarioLocal = {
  diasAbiertos: number[];
  horaApertura: string;
  horaCierre: string;
};

export type EstadoApertura = {
  abierto: boolean;
  /** Texto listo para mostrar cuando está cerrado. */
  proximaApertura: string;
};

const DIAS = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function aMinutos(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/** Convierte un timestamp UTC a partes de calendario en hora Argentina. */
export function ahoraEnArgentina(ts: number = Date.now()) {
  const desplazado = new Date(ts + OFFSET_ARGENTINA_MIN * 60_000);
  return {
    diaSemana: desplazado.getUTCDay(),
    minutosDelDia: desplazado.getUTCHours() * 60 + desplazado.getUTCMinutes(),
    hora: desplazado.getUTCHours(),
    minuto: desplazado.getUTCMinutes(),
  };
}

/**
 * "Día de servicio" en formato `YYYY-MM-DD`: la noche de trabajo, no el día
 * del calendario. El corte va a las 6 de la mañana para que un pedido
 * entregado a la 1 AM siga perteneciendo a la noche que arrancó a las 19:30.
 *
 * Es lo que hace que los códigos de pedido no se agoten nunca: solo tienen que
 * ser únicos dentro de una noche, así que se reciclan todos los días.
 */
export function diaServicio(ts: number = Date.now()) {
  const desplazado = new Date(
    ts + OFFSET_ARGENTINA_MIN * 60_000 - CORTE_DIA_SERVICIO_H * 3_600_000,
  );
  const anio = desplazado.getUTCFullYear();
  const mes = String(desplazado.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(desplazado.getUTCDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function estaAbierto(horario: HorarioLocal, ts: number = Date.now()) {
  const { diaSemana, minutosDelDia } = ahoraEnArgentina(ts);
  if (!horario.diasAbiertos.includes(diaSemana)) return false;
  return (
    minutosDelDia >= aMinutos(horario.horaApertura) &&
    minutosDelDia < aMinutos(horario.horaCierre)
  );
}

export function estadoApertura(
  horario: HorarioLocal,
  ts: number = Date.now(),
): EstadoApertura {
  if (estaAbierto(horario, ts)) {
    return { abierto: true, proximaApertura: "" };
  }

  const { diaSemana, minutosDelDia } = ahoraEnArgentina(ts);
  const apertura = aMinutos(horario.horaApertura);

  if (horario.diasAbiertos.includes(diaSemana) && minutosDelDia < apertura) {
    return {
      abierto: false,
      proximaApertura: `Abrimos hoy a las ${horario.horaApertura}`,
    };
  }

  for (let salto = 1; salto <= 7; salto++) {
    const dia = (diaSemana + salto) % 7;
    if (horario.diasAbiertos.includes(dia)) {
      const cuando = salto === 1 ? "mañana" : `el ${DIAS[dia]}`;
      return {
        abierto: false,
        proximaApertura: `Abrimos ${cuando} a las ${horario.horaApertura}`,
      };
    }
  }

  return { abierto: false, proximaApertura: "Consultanos por WhatsApp" };
}

export function textoDiasAbiertos(diasAbiertos: number[]) {
  if (diasAbiertos.length === 0) return "Cerrado";
  const ordenados = [...diasAbiertos].sort((a, b) => {
    // Semana que arranca el lunes, para leerlo como lo lee la gente.
    const norm = (d: number) => (d === 0 ? 7 : d);
    return norm(a) - norm(b);
  });
  const nombres = ordenados.map((d) => DIAS[d]);
  if (nombres.length === 1) return nombres[0];
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}
