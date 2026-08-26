const CLAVE = "its-pedidos";

/** Códigos de pedido que hizo este navegador, del más nuevo al más viejo. */
export function leerCodigos(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return [];
    const datos = JSON.parse(crudo);
    return Array.isArray(datos) ? datos.filter((c) => typeof c === "string") : [];
  } catch {
    return [];
  }
}

export function guardarCodigo(codigo: string) {
  if (typeof window === "undefined") return;
  try {
    const previos = leerCodigos().filter((c) => c !== codigo);
    window.localStorage.setItem(
      CLAVE,
      JSON.stringify([codigo, ...previos].slice(0, 10)),
    );
  } catch {
    // Modo privado o storage lleno: el cliente todavía tiene el código en pantalla.
  }
}

export function ultimoCodigo(): string | null {
  return leerCodigos()[0] ?? null;
}
