"use client";

import { useMemo, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { FichaProducto } from "@/components/menu/FichaProducto";
import { GrillaMenu } from "@/components/menu/GrillaMenu";
import { Hero } from "@/components/menu/Hero";
import { PromoDelDia } from "@/components/menu/PromoDelDia";
import { ahoraEnArgentina, estadoApertura } from "@/lib/horario";
import type { Producto } from "@/types";

export default function Home() {
  const menu = useQuery(api.menu.menuCompleto);
  const config = useQuery(api.config.leerConfig);
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
          mensajeIndisponible={mensajeIndisponible}
        />
      )}

      {promo && <PromoDelDia promo={promo} />}

      {menu ? (
        <GrillaMenu
          categorias={menu.categorias}
          productos={menu.productos}
          onAbrirProducto={abrirProducto}
        />
      ) : (
        <p className="px-4 py-10 text-center font-display uppercase text-hueso/70">
          Cargando el menú…
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
