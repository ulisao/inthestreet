/**
 * Tolera que el código se pegue en minúscula o sin guión.
 * "a47" · "a-47" · "A47" · " A-47 " → "A-47"
 */
export function normalizarCodigo(entrada: string): string {
  const limpio = entrada
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  if (limpio.length <= 1) return limpio;
  return `${limpio.slice(0, 1)}-${limpio.slice(1)}`;
}
