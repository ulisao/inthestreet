"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FichaProducto } from "@/components/menu/FichaProducto";
import { GrillaMenu } from "@/components/menu/GrillaMenu";
import { Hero } from "@/components/menu/Hero";
import { PromoDelDia } from "@/components/menu/PromoDelDia";
import { ahoraEnArgentina, estadoApertura } from "@/lib/horario";
import { guardarTienda, useTiendaGuardada } from "@/lib/pwa/tiendaGuardada";
import { useEnLinea } from "@/lib/pwa/useEnLinea";
import type { Producto } from "@/types";

export default function Home() {
  const menuVivo = useQuery(api.menu.menuCompleto);
  const configViva = useQuery(api.config.leerConfig);
  const enLinea = useEnLinea();
  const guardada = useTiendaGuardada();

  // Sin red no hay websocket de Convex, así que la carta sale de la última
  // copia buena que guardamos en este navegador (lib/pwa/tiendaGuardada.ts).
  useEffect(() => {
    if (menuVivo) guardarTienda({ menu: menuVivo });
  }, [menuVivo]);
  useEffect(() => {
    if (configViva) guardarTienda({ config: configViva });
  }, [configViva]);

  const menu = menuVivo ?? guardada.menu;
  const config = configViva ?? guardada.config;
  const desdeCopiaGuardada = !menuVivo && menu !== null;

  // El día de la semana no cambia durante la sesión: alcanza con calcularlo una vez.
  const diaSemana = useMemo(() => ahoraEnArgentina().diaSemana, []);
  const promo = useQuery(api.config.promoDeHoy, { diaSemana });

  const [productoAbierto, setProductoAbierto] = useState<Producto | null>(null);
  const disparadorRef = useRef<HTMLElement | null>(null);

  function abrirProducto(producto: Producto, disparador: HTMLElement) {
    disparadorRef.current = disparador;
    setProductoAbierto(producto);
  }

  function cerrarProducto() {
    setProductoAbierto(null);
    disparadorRef.current?.focus();
    disparadorRef.current = null;
  }

  const estado = config ? estadoApertura(config) : null;
  // Sin conexión se puede armar el pedido igual: lo que no se puede es
  // confirmarlo, y eso lo frena el checkout. Acá no bloqueamos el carrito.
  const puedeAgregar = Boolean(config && !config.pausado && estado?.abierto);
  const mensajeIndisponible = !config
    ? undefined
    : config.pausado
      ? config.mensajePausa || "Estamos pausados. Volvemos en un rato."
      : estado && !estado.abierto
        ? estado.proximaApertura
        : undefined;

  const heroProducto = useMemo(() => {
    if (!menu) return null;
    const destacada = menu.productos.find(
      (p) => p.categoriaSlug === "hamburguesas" && p.destacado && p.disponible,
    );
    if (destacada) return destacada;
    const cualquierHamburguesa = menu.productos.find(
      (p) => p.categoriaSlug === "hamburguesas" && p.disponible,
    );
    return cualquierHamburguesa ?? menu.productos[0] ?? null;
  }, [menu]);

  return (
    <main className="flex-1">
      {heroProducto && (
        <Hero
          producto={heroProducto}
          onPedir={(disparador) => abrirProducto(heroProducto, disparador)}
          puedeAgregar={puedeAgregar}
        />
      )}

      {promo && <PromoDelDia promo={promo} />}

      {desdeCopiaGuardada && (
        <p
          role="status"
          className="border-b-2 border-tinta bg-tinta px-4 py-3 text-center font-sans text-sm text-hueso"
        >
          Esta es la última copia del menú que guardamos en tu teléfono. Los
          precios pueden haber cambiado.
        </p>
      )}

      {menu ? (
        <GrillaMenu
          categorias={menu.categorias}
          productos={menu.productos}
          onAbrirProducto={abrirProducto}
        />
      ) : (
        <p className="px-4 py-10 text-center font-display uppercase text-hueso/70">
          {enLinea
            ? "Cargando el menú…"
            : "Sin internet y sin copia guardada del menú. Volvé a entrar cuando tengas señal."}
        </p>
      )}

      {productoAbierto && menu && (
        <FichaProducto
          key={productoAbierto._id}
          producto={productoAbierto}
          opciones={menu.opciones}
          puedeAgregar={puedeAgregar}
          mensajeIndisponible={mensajeIndisponible}
          onCerrar={cerrarProducto}
        />
      )}
    </main>
  );
}
