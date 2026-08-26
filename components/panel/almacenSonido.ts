/**
 * Fuente de verdad del mute de sonido del panel: localStorage, expuesto como
 * external store para `useSyncExternalStore` (evita el flash/mismatch de
 * leer localStorage en un efecto durante el render inicial en el server).
 */

const CLAVE_LOCALSTORAGE = "panel-sonido-activo";

const escuchas = new Set<() => void>();

function notificar() {
  escuchas.forEach((escucha) => escucha());
}

export function suscribirSonido(escucha: () => void) {
  escuchas.add(escucha);
  const alCambiarStorage = (evento: StorageEvent) => {
    if (evento.key === CLAVE_LOCALSTORAGE || evento.key === null) escucha();
  };
  window.addEventListener("storage", alCambiarStorage);
  return () => {
    escuchas.delete(escucha);
    window.removeEventListener("storage", alCambiarStorage);
  };
}

/** Solo se llama del lado del cliente (después de hidratar). */
export function obtenerSonidoActivo(): boolean {
  try {
    const guardado = window.localStorage.getItem(CLAVE_LOCALSTORAGE);
    return guardado === null ? true : guardado === "1";
  } catch {
    return true;
  }
}

/** Snapshot del server: siempre el default, así no hay mismatch de hidratación. */
export function obtenerSonidoActivoServidor(): boolean {
  return true;
}

export function guardarSonidoActivo(valor: boolean) {
  try {
    window.localStorage.setItem(CLAVE_LOCALSTORAGE, valor ? "1" : "0");
  } catch {
    // localStorage no disponible (modo privado, etc.): igual notificamos.
  }
  notificar();
}
