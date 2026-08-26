/**
 * Esqueleto sobrio para el estado de carga: bloques planos y estáticos,
 * sin spinner ni shimmer. La única animación de toda la app es el relleno
 * del titular del hero, que no vive acá.
 */
export function EsqueletoSeguimiento() {
  return (
    <main
      className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 p-4 pb-[max(2rem,env(safe-area-inset-bottom))]"
      aria-busy="true"
    >
      <span className="sr-only">Buscando tu pedido…</span>

      <div
        className="papel-deli borde-duro flex flex-col gap-4 p-5"
        aria-hidden="true"
      >
        <div className="mx-auto h-16 w-40 bg-negro/10" />
        <div className="h-4 w-full bg-negro/10" />
        <div className="h-4 w-3/4 bg-negro/10" />
        <div className="h-4 w-2/3 bg-negro/10" />
      </div>

      <div className="borde-duro flex flex-col gap-2 bg-tinta p-5" aria-hidden="true">
        <div className="h-6 w-2/3 bg-hueso/10" />
        <div className="h-4 w-full bg-hueso/10" />
      </div>

      <div className="flex flex-col gap-3" aria-hidden="true">
        <div className="h-10 w-full bg-hueso/10" />
        <div className="h-10 w-full bg-hueso/10" />
        <div className="h-10 w-full bg-hueso/10" />
      </div>
    </main>
  );
}
