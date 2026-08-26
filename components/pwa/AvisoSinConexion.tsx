"use client";

import { useEnLinea } from "@/lib/pwa/useEnLinea";

/**
 * Franja honesta cuando se cortó internet. No es fija: ocupa lugar arriba de
 * todo y se va con el scroll, así no le come 40px de alto permanentes a una
 * pantalla de 390px.
 *
 * Dice las dos cosas que importan y nada más: que se puede seguir mirando el
 * menú, y que el pedido no sale hasta que vuelva la señal.
 */
export function AvisoSinConexion() {
  const enLinea = useEnLinea();
  if (enLinea) return null;

  return (
    <p
      role="status"
      className="border-b-2 border-tinta bg-rojo px-4 py-2 text-center font-display text-sm uppercase tracking-wide text-hueso"
    >
      Sin internet: mirá el menú tranquilo, pero el pedido no sale hasta que
      vuelva la señal
    </p>
  );
}
