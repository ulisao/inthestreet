import Link from "next/link";
import { BuscarCodigo } from "./BuscarCodigo";

export function PedidoNoEncontrado({ codigoBuscado }: { codigoBuscado: string }) {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-6 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
      <h1 className="text-3xl">No encontramos ese pedido</h1>
      <p>
        No hay ningún pedido con el código{" "}
        <span className="font-display text-cheddar">{codigoBuscado || "—"}</span>.
        Fijate que esté bien escrito o probá con otro.
      </p>
      <BuscarCodigo />
      <Link
        href="/"
        className="flex min-h-11 items-center justify-center px-4 underline underline-offset-4"
      >
        Volver al menú
      </Link>
    </main>
  );
}
