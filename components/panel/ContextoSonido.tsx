"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
import { desbloquearAudio, reproducirAvisoPedidoNuevo } from "./audio";
import {
  guardarSonidoActivo,
  obtenerSonidoActivo,
  obtenerSonidoActivoServidor,
  suscribirSonido,
} from "./almacenSonido";

type ContextoSonidoPanel = {
  activo: boolean;
  alternar: () => void;
  avisarPedidoNuevo: () => void;
};

const Contexto = createContext<ContextoSonidoPanel | null>(null);

/**
 * Guarda si el sonido está activo (persistido en localStorage, por tablet) y
 * expone `avisarPedidoNuevo` para que el tablero llame cuando entra una comanda.
 * Vive arriba del árbol del panel para que la barra superior (el toggle) y el
 * tablero (quien dispara el aviso) compartan el mismo estado.
 */
export function ProveedorSonidoPanel({
  children,
}: {
  children: React.ReactNode;
}) {
  const activo = useSyncExternalStore(
    suscribirSonido,
    obtenerSonidoActivo,
    obtenerSonidoActivoServidor,
  );

  const alternar = useCallback(() => {
    const siguiente = !obtenerSonidoActivo();
    guardarSonidoActivo(siguiente);
    if (siguiente) desbloquearAudio();
  }, []);

  const avisarPedidoNuevo = useCallback(() => {
    if (obtenerSonidoActivo()) reproducirAvisoPedidoNuevo();
  }, []);

  return (
    <Contexto.Provider value={{ activo, alternar, avisarPedidoNuevo }}>
      {children}
    </Contexto.Provider>
  );
}

export function useSonidoPanel() {
  const ctx = useContext(Contexto);
  if (!ctx) {
    throw new Error("useSonidoPanel debe usarse dentro de <ProveedorSonidoPanel>");
  }
  return ctx;
}
