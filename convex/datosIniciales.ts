/**
 * Datos placeholder. Todo lo de acá está pendiente de confirmación con el dueño
 * (sección 4 del brief) y se edita después desde el panel sin tocar código.
 */

export const CONFIG_INICIAL = {
  nombre: "IN THE STREET",
  direccion: "Av. Santa Fe 627, Marcos Juárez (X2580)",
  telefono: "3472 529023",
  whatsapp: "5493472529023",
  instagram: "inthestreet25",
  aliasTransferencia: "inthestreet.mj",
  // El número honesto, no el que dicen por WhatsApp.
  minutosBase: 35,
  minutosPorPedidoEnCola: 4,
  recargoDelivery: 1500,
  zonaDelivery: "Todo Marcos Juárez",
  pausado: false,
  mensajePausa: "Cocina saturada, volvemos en un rato",
  // 3 = miércoles ... 0 = domingo
  diasAbiertos: [3, 4, 5, 6, 0],
  horaApertura: "19:30",
  horaCierre: "23:00",
};

export const CATEGORIAS_INICIALES = [
  { nombre: "Hamburguesas", slug: "hamburguesas", orden: 1, activa: true },
  { nombre: "Lomos", slug: "lomos", orden: 2, activa: true },
  { nombre: "Papas", slug: "papas", orden: 3, activa: true },
  { nombre: "Bebidas", slug: "bebidas", orden: 4, activa: true },
  { nombre: "Combos", slug: "combos", orden: 5, activa: true },
];

export const PRODUCTOS_INICIALES = [
  {
    nombre: "In The Street",
    descripcion:
      "Doble medallón de 120g, cheddar fundido, panceta crocante, cebolla caramelizada y salsa de la casa. La que nos hizo conocidos.",
    precio: 15500,
    categoriaSlug: "hamburguesas",
    disponible: true,
    destacado: true,
    orden: 1,
  },
  {
    nombre: "Clásica",
    descripcion:
      "Medallón de 120g, cheddar, lechuga, tomate y mayonesa de la casa en pan de papa.",
    precio: 11800,
    categoriaSlug: "hamburguesas",
    disponible: true,
    destacado: false,
    orden: 2,
  },
  {
    nombre: "Cheddar Bomba",
    descripcion:
      "Triple cheddar derretido arriba de doble medallón. Sin verdura, sin vueltas.",
    precio: 16200,
    categoriaSlug: "hamburguesas",
    disponible: true,
    destacado: false,
    orden: 3,
  },
  {
    nombre: "La Picante",
    descripcion:
      "Medallón de 120g, cheddar, jalapeños, cebolla morada y salsa picante casera.",
    precio: 14200,
    categoriaSlug: "hamburguesas",
    disponible: true,
    destacado: false,
    orden: 4,
  },
  {
    nombre: "Veggie de Garbanzo",
    descripcion:
      "Medallón de garbanzo y especias, queso, rúcula, tomate y alioli.",
    precio: 12900,
    categoriaSlug: "hamburguesas",
    disponible: true,
    destacado: false,
    orden: 5,
  },
  {
    nombre: "Lomo Completo",
    descripcion:
      "Lomo de ternera, jamón, queso, huevo frito, lechuga, tomate y mayonesa. El de siempre, bien cargado.",
    precio: 17800,
    categoriaSlug: "lomos",
    disponible: true,
    destacado: true,
    orden: 6,
  },
  {
    nombre: "Lomo Simple",
    descripcion: "Lomo de ternera, queso, lechuga y tomate en pan de mignón.",
    precio: 14500,
    categoriaSlug: "lomos",
    disponible: true,
    destacado: false,
    orden: 7,
  },
  {
    nombre: "Lomo de Pollo",
    descripcion:
      "Pechuga a la plancha, queso, panceta, lechuga, tomate y alioli.",
    precio: 15200,
    categoriaSlug: "lomos",
    disponible: true,
    destacado: false,
    orden: 8,
  },
  {
    nombre: "Lomo Árabe",
    descripcion:
      "Lomo de ternera en pan árabe con cebolla, tomate, lechuga y salsa blanca.",
    precio: 16400,
    categoriaSlug: "lomos",
    disponible: true,
    destacado: false,
    orden: 9,
  },
  {
    nombre: "Papas Comunes",
    descripcion: "Porción grande de papas bastón con sal marina.",
    precio: 6500,
    categoriaSlug: "papas",
    disponible: true,
    destacado: false,
    orden: 10,
  },
  {
    nombre: "Papas Cheddar y Panceta",
    descripcion: "Papas bastón con cheddar fundido, panceta y verdeo.",
    precio: 9800,
    categoriaSlug: "papas",
    disponible: true,
    destacado: true,
    orden: 11,
  },
  {
    nombre: "Papas Street",
    descripcion:
      "Papas con cheddar, carne desmenuzada, cebolla morada y salsa de la casa.",
    precio: 11500,
    categoriaSlug: "papas",
    disponible: true,
    destacado: false,
    orden: 12,
  },
  {
    nombre: "Coca-Cola 500ml",
    descripcion: "Botella retornable bien fría.",
    precio: 2800,
    categoriaSlug: "bebidas",
    disponible: true,
    destacado: false,
    orden: 13,
  },
  {
    nombre: "Coca-Cola Zero 500ml",
    descripcion: "Botella retornable bien fría.",
    precio: 2800,
    categoriaSlug: "bebidas",
    disponible: true,
    destacado: false,
    orden: 14,
  },
  {
    nombre: "Agua Saborizada 500ml",
    descripcion: "Pomelo o manzana, según lo que haya.",
    precio: 2400,
    categoriaSlug: "bebidas",
    disponible: true,
    destacado: false,
    orden: 15,
  },
  {
    nombre: "Cerveza Artesanal 473ml",
    descripcion: "Lata de rubia de la zona.",
    precio: 4600,
    categoriaSlug: "bebidas",
    disponible: true,
    destacado: false,
    orden: 16,
  },
  {
    nombre: "Combo In The Street",
    descripcion:
      "Hamburguesa In The Street + papas comunes + bebida a elección.",
    precio: 22500,
    categoriaSlug: "combos",
    disponible: true,
    destacado: true,
    orden: 17,
  },
  {
    nombre: "Combo Lomo",
    descripcion: "Lomo completo + papas comunes + bebida a elección.",
    precio: 24800,
    categoriaSlug: "combos",
    disponible: true,
    destacado: false,
    orden: 18,
  },
  {
    nombre: "Combo Para Dos",
    descripcion:
      "Dos clásicas + papas cheddar y panceta + dos bebidas. Para compartir sin pelear.",
    precio: 36900,
    categoriaSlug: "combos",
    disponible: true,
    destacado: false,
    orden: 19,
  },
];

export const OPCIONES_INICIALES = [
  { categoriaSlug: "hamburguesas", tipo: "punto_coccion" as const, nombre: "Jugosa", precio: 0, orden: 1, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "punto_coccion" as const, nombre: "A punto", precio: 0, orden: 2, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "punto_coccion" as const, nombre: "Bien cocida", precio: 0, orden: 3, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "extra" as const, nombre: "Medallón extra", precio: 4200, orden: 4, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "extra" as const, nombre: "Cheddar extra", precio: 1400, orden: 5, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "extra" as const, nombre: "Panceta", precio: 2200, orden: 6, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "extra" as const, nombre: "Huevo frito", precio: 1200, orden: 7, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "extra" as const, nombre: "Jalapeños", precio: 900, orden: 8, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "quitar" as const, nombre: "Lechuga", precio: 0, orden: 9, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "quitar" as const, nombre: "Tomate", precio: 0, orden: 10, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "quitar" as const, nombre: "Cebolla", precio: 0, orden: 11, activa: true },
  { categoriaSlug: "hamburguesas", tipo: "quitar" as const, nombre: "Salsa de la casa", precio: 0, orden: 12, activa: true },

  { categoriaSlug: "lomos", tipo: "punto_coccion" as const, nombre: "A punto", precio: 0, orden: 1, activa: true },
  { categoriaSlug: "lomos", tipo: "punto_coccion" as const, nombre: "Bien cocido", precio: 0, orden: 2, activa: true },
  { categoriaSlug: "lomos", tipo: "extra" as const, nombre: "Queso extra", precio: 1400, orden: 3, activa: true },
  { categoriaSlug: "lomos", tipo: "extra" as const, nombre: "Huevo frito", precio: 1200, orden: 4, activa: true },
  { categoriaSlug: "lomos", tipo: "extra" as const, nombre: "Panceta", precio: 2200, orden: 5, activa: true },
  { categoriaSlug: "lomos", tipo: "quitar" as const, nombre: "Lechuga", precio: 0, orden: 6, activa: true },
  { categoriaSlug: "lomos", tipo: "quitar" as const, nombre: "Tomate", precio: 0, orden: 7, activa: true },
  { categoriaSlug: "lomos", tipo: "quitar" as const, nombre: "Mayonesa", precio: 0, orden: 8, activa: true },

  { categoriaSlug: "papas", tipo: "extra" as const, nombre: "Cheddar extra", precio: 1400, orden: 1, activa: true },
  { categoriaSlug: "papas", tipo: "extra" as const, nombre: "Panceta", precio: 2200, orden: 2, activa: true },

  { categoriaSlug: "combos", tipo: "punto_coccion" as const, nombre: "Jugosa", precio: 0, orden: 1, activa: true },
  { categoriaSlug: "combos", tipo: "punto_coccion" as const, nombre: "A punto", precio: 0, orden: 2, activa: true },
  { categoriaSlug: "combos", tipo: "punto_coccion" as const, nombre: "Bien cocida", precio: 0, orden: 3, activa: true },
  { categoriaSlug: "combos", tipo: "extra" as const, nombre: "Medallón extra", precio: 4200, orden: 4, activa: true },
  { categoriaSlug: "combos", tipo: "extra" as const, nombre: "Cheddar extra", precio: 1400, orden: 5, activa: true },
];

export const PROMOS_INICIALES = [
  {
    diaSemana: 3,
    titulo: "MIÉRCOLES DE CLÁSICA",
    descripcion: "Clásica + papas comunes a $15.900. Solo retiro por el local.",
    activa: true,
  },
  {
    diaSemana: 4,
    titulo: "JUEVES",
    descripcion: "2x1 en Clásica. De 19:30 a 21:00 o hasta agotar stock.",
    activa: true,
  },
  {
    diaSemana: 5,
    titulo: "VIERNES CON ESTILO",
    descripcion: "Combo In The Street + cerveza artesanal a $25.900.",
    activa: true,
  },
  {
    diaSemana: 6,
    titulo: "SÁBADO DE LOMO",
    descripcion: "Lomo completo con papas a $21.500.",
    activa: true,
  },
  {
    diaSemana: 0,
    titulo: "DOMINGO PARA DOS",
    descripcion: "Combo Para Dos a $32.900. Ideal para cerrar el finde.",
    activa: true,
  },
];
