"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { desbloquearAudio } from "./audio";

const LARGO_MAXIMO = 8;
const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Puerta con PIN del panel. No es autenticación real: el gesto de tocar
 * "Entrar" es también el momento en que desbloqueamos el AudioContext, para
 * que el aviso sonoro de pedido nuevo pueda sonar más tarde sin otra interacción.
 */
export function PantallaPin() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const agregarDigito = (digito: string) => {
    setError(null);
    setPin((previo) => (previo.length >= LARGO_MAXIMO ? previo : previo + digito));
  };

  const borrarUltimo = () => {
    setError(null);
    setPin((previo) => previo.slice(0, -1));
  };

  const limpiar = () => {
    setError(null);
    setPin("");
  };

  const entrar = useCallback(
    async (pinAEnviar: string) => {
      // Gesto del usuario: aprovechamos para crear/desbloquear el audio.
      desbloquearAudio();

      if (!pinAEnviar.trim()) {
        setError("Ingresá el PIN de la cocina.");
        return;
      }

      setEnviando(true);
      setError(null);
      try {
        const respuesta = await fetch("/api/panel/entrar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin: pinAEnviar }),
        });
        const datos = await respuesta.json().catch(() => null);

        if (!respuesta.ok || !datos?.ok) {
          setError(datos?.error ?? "PIN incorrecto. Probá de nuevo.");
          setPin("");
          return;
        }

        // Re-renderiza el layout server de /panel, que ahora va a ver la cookie.
        router.refresh();
      } catch {
        setError("No se pudo conectar. Revisá la red e intentá de nuevo.");
      } finally {
        setEnviando(false);
      }
    },
    [router],
  );

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 bg-negro px-6 py-10 text-hueso">
      <div className="text-center">
        <h1 className="titular-outline titular-outline-grueso text-6xl leading-none">
          PANEL
        </h1>
        <p className="mt-3 font-sans text-base text-hueso/80">
          Ingresá el PIN de la cocina para entrar
        </p>
      </div>

      <form
        onSubmit={(evento) => {
          evento.preventDefault();
          entrar(pin);
        }}
        className="flex w-full max-w-xs flex-col items-stretch gap-4"
      >
        <div>
          <label htmlFor="pin-panel" className="sr-only">
            PIN del panel
          </label>
          <input
            id="pin-panel"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            autoFocus
            value={pin}
            onChange={(evento) => {
              setError(null);
              setPin(evento.target.value.replace(/\D/g, "").slice(0, LARGO_MAXIMO));
            }}
            className="borde-duro w-full bg-tinta py-4 text-center font-display text-4xl tracking-[0.4em] text-hueso"
            placeholder="••••"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {TECLAS.map((tecla) => (
            <button
              key={tecla}
              type="button"
              onClick={() => agregarDigito(tecla)}
              className="sticker panel-boton-teclado font-display text-3xl"
            >
              {tecla}
            </button>
          ))}
          <button
            type="button"
            onClick={limpiar}
            className="sticker panel-boton-teclado font-display text-sm uppercase"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => agregarDigito("0")}
            className="sticker panel-boton-teclado font-display text-3xl"
          >
            0
          </button>
          <button
            type="button"
            onClick={borrarUltimo}
            className="sticker panel-boton-teclado font-display text-sm uppercase"
          >
            Borrar
          </button>
        </div>

        {error && (
          <p role="alert" className="text-center font-sans font-semibold text-rojo">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="borde-duro panel-boton-teclado bg-cheddar font-display text-xl uppercase text-negro disabled:opacity-60"
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
