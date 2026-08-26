"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSonidoPanel } from "./ContextoSonido";

const ITEMS_NAV = [
  { href: "/panel", etiqueta: "Comandas" },
  { href: "/panel/historial", etiqueta: "Historial" },
  { href: "/panel/menu", etiqueta: "Menú" },
  { href: "/panel/promos", etiqueta: "Promos" },
  { href: "/panel/ajustes", etiqueta: "Ajustes" },
];

export function BarraPanel() {
  const pathname = usePathname();
  const router = useRouter();
  const config = useQuery(api.config.leerConfig);
  const alternarPausa = useMutation(api.config.alternarPausa);
  const { activo: sonidoActivo, alternar: alternarSonido } = useSonidoPanel();

  const pausado = config?.pausado ?? false;

  const alternarPausado = async () => {
    try {
      await alternarPausa({ pausado: !pausado });
    } catch {
      window.alert("No se pudo cambiar el estado de pausa. Probá de nuevo.");
    }
  };

  const bloquearPanel = async () => {
    if (!window.confirm("¿Bloquear el panel? Va a pedir el PIN de nuevo.")) return;
    try {
      await fetch("/api/panel/salir", { method: "POST" });
    } finally {
      router.refresh();
    }
  };

  return (
    <div className="sticky top-0 z-30 flex flex-col border-b-2 border-tinta bg-negro">
      {pausado && (
        <div
          role="status"
          className="border-b-2 border-tinta bg-rojo px-4 py-2 text-center font-display text-lg uppercase tracking-wide text-hueso"
        >
          Pedidos pausados — la tienda no está tomando pedidos
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4">
        <h1 className="font-display text-2xl uppercase leading-none text-hueso">
          IN THE STREET <span className="text-cheddar">· PANEL</span>
        </h1>

        <nav
          aria-label="Secciones del panel"
          className="sin-scrollbar flex flex-1 min-w-[220px] items-center gap-2 overflow-x-auto"
        >
          {ITEMS_NAV.map((item) => {
            const activa =
              item.href === "/panel"
                ? pathname === "/panel"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sticker shrink-0 px-4 py-2 font-display text-sm uppercase tracking-wide"
                data-activo={activa ? "true" : "false"}
              >
                {item.etiqueta}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={alternarSonido}
            className="sticker min-h-[44px] px-3 py-2 font-display text-sm uppercase"
            data-activo={sonidoActivo ? "true" : "false"}
            aria-pressed={sonidoActivo}
          >
            {sonidoActivo ? "Sonido: activado" : "Sonido: silenciado"}
          </button>

          <button
            type="button"
            onClick={alternarPausado}
            disabled={config === undefined}
            className="borde-duro min-h-[44px] bg-rojo px-4 py-2 font-display text-sm uppercase text-hueso disabled:opacity-60"
            data-activo={pausado ? "true" : "false"}
            aria-pressed={pausado}
          >
            {pausado ? "Reanudar pedidos" : "Pausar pedidos"}
          </button>

          <button
            type="button"
            onClick={bloquearPanel}
            className="sticker min-h-[44px] px-3 py-2 font-display text-sm uppercase"
          >
            Bloquear
          </button>
        </div>
      </div>
    </div>
  );
}
