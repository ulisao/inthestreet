import { TitularOutline } from "./TitularOutline";

type Promo = {
  titulo: string;
  descripcion: string;
};

/**
 * Campo rojo pleno, titular en outline blanco: exactamente el gesto de sus "placas".
 * `interactivo={false}` en el titular a propósito: el relleno de la micro-interacción
 * es rojo, y sobre un fondo rojo pleno ese relleno se volvería invisible.
 */
export function PromoDelDia({ promo }: { promo: Promo }) {
  return (
    <section
      aria-label="Promo del día"
      className="relative overflow-hidden border-y-2 border-tinta bg-rojo px-4 py-8"
    >
      <div className="filetes" />
      <p className="mb-2 font-display text-xs uppercase tracking-[0.2em] text-hueso">
        Promo de hoy
      </p>
      <TitularOutline as="h2" grueso interactivo={false} className="mb-3 text-4xl sm:text-6xl">
        {promo.titulo}
      </TitularOutline>
      <p className="max-w-prose font-sans text-hueso">{promo.descripcion}</p>
    </section>
  );
}
