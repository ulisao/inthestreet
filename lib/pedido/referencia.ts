/**
 * El código corto (`A-47`) es único solo dentro de una noche: se recicla todos
 * los días para que el pool no se agote nunca. Eso lo vuelve ambiguo entre
 * noches, así que el link y el localStorage guardan una **referencia**, que es
 * el código más el día de servicio: `A-47-260826`.
 *
 * La cocina y el cliente siguen hablando del código corto. La referencia solo
 * existe para que un link viejo nunca muestre el pedido de otra persona.
 */

/** `("A-47", "2026-08-26")` → `"A-47-260826"` */
export function armarReferencia(codigo: string, diaServicio: string) {
  const [anio, mes, dia] = diaServicio.split("-");
  return `${codigo}-${anio.slice(2)}${mes}${dia}`;
}

export type Referencia = {
  codigo: string;
  /** Ausente cuando el cliente pegó el código corto suelto: se resuelve contra hoy. */
  diaServicio?: string;
};

/**
 * Acepta las dos formas y tolera minúsculas, espacios y guiones de más:
 * - `"A-47-260826"` → código y día explícitos, sirve para siempre
 * - `"A-47"` · `"a47"` → solo el código, se resuelve contra la noche de hoy
 */
export function leerReferencia(entrada: string): Referencia | null {
  const limpio = entrada.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (limpio.length < 2) return null;

  // Con día: letra(s) + 2 dígitos de código + 6 de fecha.
  const conDia = limpio.match(/^([A-Z]+)(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (conDia) {
    const [, letras, numero, anio, mes, dia] = conDia;
    return {
      codigo: `${letras}-${numero}`,
      diaServicio: `20${anio}-${mes}-${dia}`,
    };
  }

  const soloCodigo = limpio.match(/^([A-Z]+)(\d+)$/);
  if (soloCodigo) {
    const [, letras, numero] = soloCodigo;
    return { codigo: `${letras}-${numero}` };
  }

  return null;
}
