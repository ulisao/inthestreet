/** `12500` → `$12.500`. Punto de miles, sin decimales. */
export function precio(valor: number) {
  return `$${Math.round(valor).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;
}

/** Teléfono argentino: acepta 10 dígitos con o sin 0/15, guiones y espacios. */
export function normalizarTelefono(entrada: string) {
  return entrada.replace(/\D/g, "").replace(/^0/, "").replace(/^54/, "");
}

export function telefonoValido(entrada: string) {
  const limpio = normalizarTelefono(entrada);
  return limpio.length >= 10 && limpio.length <= 11;
}

export function minutosTranscurridos(desde: number, hasta = Date.now()) {
  return Math.max(0, Math.floor((hasta - desde) / 60_000));
}

export function textoTranscurrido(desde: number, hasta = Date.now()) {
  const min = minutosTranscurridos(desde, hasta);
  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  if (resto === 0) return `hace ${horas} h`;
  return `hace ${horas} h ${resto} min`;
}

export function horaCorta(ts: number) {
  return new Date(ts).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
