/**
 * Aviso sonoro de pedido nuevo, generado con Web Audio API — sin archivos de
 * audio, así no depende de la red.
 *
 * Los navegadores bloquean el audio hasta que hay una interacción real del
 * usuario. `desbloquearAudio` hay que llamarla desde un gesto (tap/click):
 * el ingreso al panel por PIN es ese gesto.
 */

let contexto: AudioContext | null = null;

type VentanaConWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function obtenerConstructor(): typeof AudioContext | null {
  if (typeof window === "undefined") return null;
  // `AudioContext` es una var global (no una propiedad de Window en los tipos
  // de TS), así que la referenciamos directo; solo el prefijo webkit necesita cast.
  if (typeof AudioContext !== "undefined") return AudioContext;
  const ventana = window as VentanaConWebkitAudio;
  return ventana.webkitAudioContext ?? null;
}

/** Crea (o reanuda) el AudioContext compartido. Llamar desde un gesto del usuario. */
export function desbloquearAudio() {
  const Constructor = obtenerConstructor();
  if (!Constructor) return;

  if (!contexto) {
    try {
      contexto = new Constructor();
    } catch {
      contexto = null;
      return;
    }
  }

  if (contexto.state === "suspended") {
    contexto.resume().catch(() => {});
  }
}

function tono(
  ctx: AudioContext,
  frecuencia: number,
  inicioSeg: number,
  duracionSeg: number,
) {
  const oscilador = ctx.createOscillator();
  const ganancia = ctx.createGain();

  oscilador.type = "sine";
  oscilador.frequency.value = frecuencia;

  const inicio = ctx.currentTime + inicioSeg;
  ganancia.gain.setValueAtTime(0, inicio);
  ganancia.gain.linearRampToValueAtTime(0.4, inicio + 0.015);
  ganancia.gain.linearRampToValueAtTime(0, inicio + duracionSeg);

  oscilador.connect(ganancia);
  ganancia.connect(ctx.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + duracionSeg + 0.03);
}

/** Dos tonos cortos ascendentes: el aviso de "entró un pedido nuevo". */
export function reproducirAvisoPedidoNuevo() {
  desbloquearAudio();
  if (!contexto) return;
  tono(contexto, 640, 0, 0.16);
  tono(contexto, 920, 0.18, 0.2);
}
