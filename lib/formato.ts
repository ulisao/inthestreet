/** `12500` → `$12.500`. Punto de miles, sin decimales. */
export function precio(valor: number) {
  return `$${Math.round(valor).toLocaleString("es-AR", {
    maximumFractionDigits: 0,
  })}`;
}

/** Teléfono argentino: acepta 10 dígitos con o sin 0/15, guiones y espacios. */
export function normalizarTelefono(entrada: string) {
  let digitos = entrada.replace(/\D/g, "");

  // Prefijo país, y el 9 de móvil que va pegado atrás del 54.
  if (digitos.startsWith("54")) {
    digitos = digitos.slice(2);
    if (digitos.startsWith("9")) digitos = digitos.slice(1);
  }
  digitos = digitos.replace(/^0/, "");

  // El 15 va después de la característica (2 a 4 dígitos), no al principio:
  // 3472 15 529023 → 3472529023.
  if (digitos.length === 12) {
    for (const largoCaracteristica of [4, 3, 2]) {
      if (digitos.slice(largoCaracteristica, largoCaracteristica + 2) === "15") {
        digitos =
          digitos.slice(0, largoCaracteristica) +
          digitos.slice(largoCaracteristica + 2);
        break;
      }
    }
  }

  return digitos;
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

/** `20:45`. Reloj de 24 horas: es como se habla la hora acá. */
export function horaCorta(ts: number) {
  return new Date(ts).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  });
}
