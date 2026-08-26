"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ItemCarrito } from "@/types";

/** El mismo producto con distinta configuración es otra línea del carrito. */
function armarLineaId(item: Omit<ItemCarrito, "lineaId">) {
  return [
    item.productoId,
    item.puntoCoccion ?? "",
    item.extras
      .map((e) => e.nombre)
      .sort()
      .join(","),
    [...item.quitar].sort().join(","),
    item.nota?.trim() ?? "",
  ].join("|");
}

type EstadoCarrito = {
  items: ItemCarrito[];
  abierto: boolean;
  agregar: (item: Omit<ItemCarrito, "lineaId">) => void;
  cambiarCantidad: (lineaId: string, cantidad: number) => void;
  quitarLinea: (lineaId: string) => void;
  vaciar: () => void;
  abrirCarrito: () => void;
  cerrarCarrito: () => void;
};

const useStore = create<EstadoCarrito>()(
  persist(
    (set) => ({
      items: [],
      abierto: false,

      agregar: (item) =>
        set((estado) => {
          const lineaId = armarLineaId(item);
          const existente = estado.items.find((i) => i.lineaId === lineaId);
          if (existente) {
            return {
              items: estado.items.map((i) =>
                i.lineaId === lineaId
                  ? { ...i, cantidad: Math.min(20, i.cantidad + item.cantidad) }
                  : i,
              ),
            };
          }
          return { items: [...estado.items, { ...item, lineaId }] };
        }),

      cambiarCantidad: (lineaId, cantidad) =>
        set((estado) => ({
          items:
            cantidad <= 0
              ? estado.items.filter((i) => i.lineaId !== lineaId)
              : estado.items.map((i) =>
                  i.lineaId === lineaId
                    ? { ...i, cantidad: Math.min(20, cantidad) }
                    : i,
                ),
        })),

      quitarLinea: (lineaId) =>
        set((estado) => ({
          items: estado.items.filter((i) => i.lineaId !== lineaId),
        })),

      vaciar: () => set({ items: [], abierto: false }),
      abrirCarrito: () => set({ abierto: true }),
      cerrarCarrito: () => set({ abierto: false }),
    }),
    {
      name: "its-carrito",
      partialize: (estado) => ({ items: estado.items }),
    },
  ),
);

export function useCarrito() {
  const items = useStore((e) => e.items);
  const abierto = useStore((e) => e.abierto);

  return {
    items,
    abierto,
    agregar: useStore((e) => e.agregar),
    cambiarCantidad: useStore((e) => e.cambiarCantidad),
    quitarLinea: useStore((e) => e.quitarLinea),
    vaciar: useStore((e) => e.vaciar),
    abrirCarrito: useStore((e) => e.abrirCarrito),
    cerrarCarrito: useStore((e) => e.cerrarCarrito),
    cantidadTotal: items.reduce((suma, i) => suma + i.cantidad, 0),
    subtotal: items.reduce((suma, i) => suma + i.precioUnitario * i.cantidad, 0),
  };
}

// Zustand solo engancha la API de `persist` cuando hay storage: en el servidor,
// y en un navegador con el storage bloqueado, `useStore.persist` es undefined.
function suscribirHidratacion(avisar: () => void) {
  return useStore.persist?.onFinishHydration(avisar) ?? (() => {});
}

function leerHidratado() {
  // Sin persist no hay nada que esperar: el carrito arranca vacío y ya está.
  return useStore.persist?.hasHydrated() ?? true;
}

const enElServidor = () => false;

/** El store se hidrata desde localStorage: hasta que termina, la UI del servidor y la del cliente no coinciden. */
export function useCarritoHidratado() {
  return useSyncExternalStore(
    suscribirHidratacion,
    leerHidratado,
    enElServidor,
  );
}
