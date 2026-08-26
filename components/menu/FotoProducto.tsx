/**
 * Todavía no tenemos fotos reales del local. Este componente genera un placeholder
 * digno y determinístico: mismo producto (categoría + nombre) siempre da el mismo
 * campo de color y el mismo ícono plano de contorno negro grueso, estilo sticker.
 * El día que llegue `producto.imagen` desde el panel, esta misma pieza la muestra
 * y el placeholder deja de calcularse.
 */

type ProductoFoto = {
  nombre: string;
  categoriaSlug: string;
  imagen?: string;
};

type Props = {
  producto: ProductoFoto;
  className?: string;
};

const CAMPOS = ["var(--rojo)", "var(--cheddar)", "var(--celeste)", "var(--lechuga)"] as const;

/** Hash determinístico simple (djb2-ish). Mismo texto, mismo número, siempre. */
function hashTexto(texto: string) {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) {
    h = (h * 33) ^ texto.charCodeAt(i);
  }
  return Math.abs(h);
}

function IconoHamburguesa() {
  return (
    <g stroke="var(--negro)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M22 46 Q60 14 98 46 Z" fill="var(--cheddar)" />
      <circle cx="46" cy="30" r="2.4" fill="var(--negro)" stroke="none" />
      <circle cx="60" cy="24" r="2.4" fill="var(--negro)" stroke="none" />
      <circle cx="74" cy="30" r="2.4" fill="var(--negro)" stroke="none" />
      <path
        d="M20 50 q10 9 20 0 q10 9 20 0 q10 9 20 0 q10 9 18 0 L98 58 L22 58 Z"
        fill="var(--lechuga)"
      />
      <rect x="20" y="60" width="80" height="16" rx="6" fill="var(--tinta)" />
      <path
        d="M22 80 h76 q4 0 4 8 t-8 8 H26 q-8 0 -8 -8 t4 -8 Z"
        fill="var(--cheddar)"
      />
    </g>
  );
}

function IconoLomo() {
  return (
    <g stroke="var(--negro)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <rect x="12" y="46" width="96" height="28" rx="14" fill="var(--cheddar)" />
      <rect x="20" y="52" width="80" height="7" fill="var(--lechuga)" />
      <rect x="20" y="62" width="80" height="6" fill="var(--tinta)" />
    </g>
  );
}

function IconoPapas() {
  return (
    <g stroke="var(--negro)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M34 54 L86 54 L78 102 L42 102 Z" fill="var(--hueso)" />
      <rect
        x="40"
        y="20"
        width="9"
        height="42"
        rx="3"
        fill="var(--cheddar)"
        transform="rotate(-8 44 41)"
      />
      <rect x="55" y="14" width="9" height="48" rx="3" fill="var(--cheddar)" />
      <rect
        x="70"
        y="20"
        width="9"
        height="42"
        rx="3"
        fill="var(--cheddar)"
        transform="rotate(8 75 41)"
      />
    </g>
  );
}

function IconoBebida() {
  return (
    <g stroke="var(--negro)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M36 34 L84 34 L76 102 L44 102 Z" fill="var(--hueso)" />
      <ellipse cx="60" cy="34" rx="24" ry="7" fill="var(--celeste)" />
      <line x1="64" y1="8" x2="72" y2="34" />
    </g>
  );
}

function IconoCombo() {
  return (
    <g stroke="var(--negro)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <path d="M28 40 L92 40 L100 104 L20 104 Z" fill="var(--hueso)" />
      <path d="M28 40 L36 18 L84 18 L92 40 Z" fill="var(--hueso)" />
      <line x1="46" y1="40" x2="42" y2="18" />
      <line x1="74" y1="40" x2="78" y2="18" />
      <circle cx="60" cy="70" r="14" fill="var(--rojo)" />
    </g>
  );
}

function IconoGenerico() {
  return (
    <g stroke="var(--negro)" strokeWidth={4} strokeLinejoin="round" strokeLinecap="round">
      <circle cx="60" cy="60" r="38" fill="var(--hueso)" />
      <path
        d="M60 30 L69 51 L92 51 L73 65 L80 90 L60 75 L40 90 L47 65 L28 51 L51 51 Z"
        fill="var(--cheddar)"
      />
    </g>
  );
}

const ICONOS = {
  hamburguesas: IconoHamburguesa,
  lomos: IconoLomo,
  papas: IconoPapas,
  bebidas: IconoBebida,
  combos: IconoCombo,
} as const;

export function FotoProducto({ producto, className = "" }: Props) {
  if (producto.imagen) {
    // eslint-disable-next-line @next/next/no-img-element -- asset local, no hace falta el pipeline de next/image.
    return <img src={producto.imagen} alt="" className={`w-full h-full object-cover ${className}`} />;
  }

  const semilla = hashTexto(`${producto.categoriaSlug}:${producto.nombre}`);
  const campo = CAMPOS[semilla % CAMPOS.length];
  const rotacion = (semilla % 7) - 3; // entre -3 y 3 grados: nunca perfectamente derecho.
  const Icono = ICONOS[producto.categoriaSlug as keyof typeof ICONOS] ?? IconoGenerico;

  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden ${className}`}
      style={{
        backgroundColor: campo,
        // Rayado plano a 45°, sin degradado real: son bandas duras (mismo truco que .filetes).
        backgroundImage:
          "repeating-linear-gradient(45deg, color-mix(in srgb, var(--negro) 14%, transparent) 0 3px, transparent 3px 18px)",
      }}
    >
      <svg viewBox="0 0 120 120" className="absolute inset-0 h-full w-full p-5" style={{ transform: `rotate(${rotacion}deg)` }}>
        <Icono />
      </svg>
    </div>
  );
}
