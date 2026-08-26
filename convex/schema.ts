import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const estadoPedido = v.union(
  v.literal("recibido"),
  v.literal("en_cocina"),
  v.literal("listo"),
  v.literal("en_camino"),
  v.literal("entregado"),
  v.literal("cancelado"),
);

export const modalidad = v.union(v.literal("retiro"), v.literal("delivery"));

export const metodoPago = v.union(
  v.literal("efectivo"),
  v.literal("transferencia"),
);

export const tipoOpcion = v.union(
  v.literal("punto_coccion"),
  v.literal("extra"),
  v.literal("quitar"),
);

export const opcionElegida = v.object({
  nombre: v.string(),
  precio: v.number(),
});

export default defineSchema({
  categorias: defineTable({
    nombre: v.string(),
    slug: v.string(),
    orden: v.number(),
    activa: v.boolean(),
  }).index("por_slug", ["slug"]),

  productos: defineTable({
    nombre: v.string(),
    descripcion: v.string(),
    precio: v.number(),
    categoriaSlug: v.string(),
    imagen: v.optional(v.string()),
    disponible: v.boolean(),
    destacado: v.boolean(),
    orden: v.number(),
  })
    .index("por_categoria", ["categoriaSlug"])
    .index("por_disponible", ["disponible"]),

  opciones: defineTable({
    // Las opciones se enganchan por categoría, no por producto: todas las
    // hamburguesas comparten punto de cocción y extras.
    categoriaSlug: v.string(),
    tipo: tipoOpcion,
    nombre: v.string(),
    precio: v.number(),
    orden: v.number(),
    activa: v.boolean(),
  }).index("por_categoria", ["categoriaSlug"]),

  pedidos: defineTable({
    // Único dentro de un día de servicio, no para siempre: se recicla cada
    // noche. Así el pool de códigos cortos no se agota nunca.
    codigo: v.string(),
    // `YYYY-MM-DD` de la noche a la que pertenece el pedido (corte a las 6 AM).
    // Opcional solo por los pedidos creados antes de que existiera el campo:
    // todo pedido nuevo lo escribe siempre.
    diaServicio: v.optional(v.string()),
    estado: estadoPedido,
    modalidad: modalidad,
    nombre: v.string(),
    telefono: v.string(),
    direccion: v.optional(v.string()),
    referencia: v.optional(v.string()),
    metodoPago: metodoPago,
    pagaCon: v.optional(v.number()),
    nota: v.optional(v.string()),
    subtotal: v.number(),
    recargoDelivery: v.number(),
    total: v.number(),
    creadoEn: v.number(),
    // Sello de tiempo por transición, para la línea de tiempo del seguimiento.
    enCocinaEn: v.optional(v.number()),
    listoEn: v.optional(v.number()),
    enCaminoEn: v.optional(v.number()),
    entregadoEn: v.optional(v.number()),
    canceladoEn: v.optional(v.number()),
    motivoCancelacion: v.optional(v.string()),
    // Congelado al crear el pedido: el ETA prometido no se recalcula después.
    minutosEstimados: v.number(),
    pedidosEnColaAlCrear: v.number(),
  })
    .index("por_codigo", ["codigo"])
    // El que importa para buscar un pedido: el código solo desambigua dentro
    // de su noche.
    .index("por_dia_codigo", ["diaServicio", "codigo"])
    .index("por_estado", ["estado"])
    .index("por_creado", ["creadoEn"]),

  items_pedido: defineTable({
    pedidoId: v.id("pedidos"),
    productoId: v.optional(v.id("productos")),
    nombreProducto: v.string(),
    categoriaSlug: v.string(),
    precioUnitario: v.number(),
    cantidad: v.number(),
    puntoCoccion: v.optional(v.string()),
    extras: v.array(opcionElegida),
    quitar: v.array(v.string()),
    nota: v.optional(v.string()),
    subtotal: v.number(),
  }).index("por_pedido", ["pedidoId"]),

  config_local: defineTable({
    // Singleton: siempre hay exactamente una fila.
    nombre: v.string(),
    direccion: v.string(),
    telefono: v.string(),
    whatsapp: v.string(),
    instagram: v.string(),
    aliasTransferencia: v.string(),
    minutosBase: v.number(),
    minutosPorPedidoEnCola: v.number(),
    recargoDelivery: v.number(),
    zonaDelivery: v.string(),
    pausado: v.boolean(),
    mensajePausa: v.string(),
    // Días abiertos como números de JS (0 = domingo), en hora Argentina.
    diasAbiertos: v.array(v.number()),
    horaApertura: v.string(),
    horaCierre: v.string(),
  }),

  promos_dia: defineTable({
    diaSemana: v.number(),
    titulo: v.string(),
    descripcion: v.string(),
    activa: v.boolean(),
  }).index("por_dia", ["diaSemana"]),
});
