"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BuscarCodigo } from "./BuscarCodigo";
import { EsqueletoSeguimiento } from "./EsqueletoSeguimiento";
import { useUltimoCodigo } from "./useAlmacenPedidos";

/**
 * Entrada a /pedido sin código en la URL. Si el navegador ya tiene un
 * pedido guardado, redirige directo ahí. Si no, pide el código a mano.
 */
export function EntradaSeguimiento() {
  const router = useRouter();
  // null tanto en el server como en el primer paint del cliente, hasta
  // que el hook hidrata con el valor real de localStorage.
  const codigo = useUltimoCodigo();

  useEffect(() => {
    if (codigo) router.replace(`/pedido/${codigo}`);
  }, [codigo, router]);

  if (codigo) {
    // El efecto de arriba ya disparó la redirección.
    return <EsqueletoSeguimiento />;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-6 p-4 pb-[max(2rem,env(safe-area-inset-bottom))] text-center">
      <h1 className="text-3xl">Seguí tu pedido</h1>
      <p>Pegá el código que te dimos al confirmar para ver cómo va.</p>
      <BuscarCodigo />
      <Link
        href="/"
        className="flex min-h-11 items-center justify-center px-4 underline underline-offset-4"
      >
        Ver el menú
      </Link>
    </main>
  );
}
