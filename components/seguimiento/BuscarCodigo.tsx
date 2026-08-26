"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { normalizarCodigo } from "./normalizarCodigo";
import { useCodigosGuardados } from "./useAlmacenPedidos";

/**
 * Input para pegar un código de pedido + lista de códigos ya guardados en
 * este navegador para elegir con un toque. Se usa en la entrada de
 * /pedido (sin código) y en el estado "no encontrado" de /pedido/[codigo].
 */
export function BuscarCodigo() {
  const router = useRouter();
  const [valor, setValor] = useState("");
  // localStorage no existe en el servidor: el hook devuelve [] hasta hidratar.
  const codigosGuardados = useCodigosGuardados();

  function buscar(evento: FormEvent) {
    evento.preventDefault();
    const normalizado = normalizarCodigo(valor);
    if (!normalizado) return;
    router.push(`/pedido/${normalizado}`);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={buscar} className="flex w-full flex-col gap-2">
        <label
          htmlFor="codigo-pedido"
          className="font-display text-sm uppercase tracking-widest"
        >
          Pegá tu código de pedido
        </label>
        <div className="flex gap-2">
          <input
            id="codigo-pedido"
            name="codigo"
            type="text"
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="A-47"
            value={valor}
            onChange={(evento) => setValor(evento.target.value.toUpperCase())}
            className="borde-duro min-h-11 flex-1 bg-negro px-3 font-display text-xl uppercase text-hueso placeholder:text-hueso/60"
          />
          <button
            type="submit"
            className="sticker min-h-11 px-4 font-display uppercase"
          >
            Buscar
          </button>
        </div>
      </form>

      {codigosGuardados.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-display text-sm uppercase tracking-widest">
            Tus pedidos guardados
          </p>
          <ul className="flex flex-wrap gap-2">
            {codigosGuardados.map((codigo) => (
              <li key={codigo}>
                <button
                  type="button"
                  onClick={() => router.push(`/pedido/${codigo}`)}
                  className="sticker min-h-11 px-4 font-display uppercase"
                >
                  {codigo}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
