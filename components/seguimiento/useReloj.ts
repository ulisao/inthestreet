"use client";

import { useEffect, useState } from "react";

/**
 * Único setInterval de la pantalla de seguimiento: redibuja el tiempo
 * transcurrido cada segundo. No refetchea nada — los datos del pedido
 * llegan solos por la subscripción reactiva de Convex.
 */
export function useReloj(intervaloMs = 1000) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);

  return ahora;
}
