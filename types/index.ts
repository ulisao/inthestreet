import type { Doc, Id } from "@/convex/_generated/dataModel";

export type EstadoPedido =
  | "recibido"
  | "en_cocina"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado";

export type Modalidad = "retiro" | "delivery";
export type MetodoPago = "efectivo" | "transferencia";
export type TipoOpcion = "punto_coccion" | "extra" | "quitar";

export type Categoria = Doc<"categorias">;
export type Producto = Doc<"productos">;
export type Opcion = Doc<"opciones">;
export type Pedido = Doc<"pedidos">;
export type ItemPedido = Doc<"items_pedido">;
export type ConfigLocal = Doc<"config_local">;
export type PromoDia = Doc<"promos_dia">;

export type ProductoId = Id<"productos">;
export type PedidoId = Id<"pedidos">;

export type OpcionElegida = {
  nombre: string;
  precio: number;
};

/** Una línea del carrito, antes de existir como `items_pedido` en Convex. */
export type ItemCarrito = {
  /** Identidad local de la línea: mismo producto con distinta config = otra línea. */
  lineaId: string;
  productoId: ProductoId;
  nombreProducto: string;
  categoriaSlug: string;
  imagen?: string;
  precioUnitario: number;
  cantidad: number;
  puntoCoccion?: string;
  extras: OpcionElegida[];
  quitar: string[];
  nota?: string;
};

export type PedidoConItems = Pedido & { items: ItemPedido[] };

export const ESTADOS_ACTIVOS: EstadoPedido[] = [
  "recibido",
  "en_cocina",
  "listo",
  "en_camino",
];

export const ETIQUETA_ESTADO: Record<EstadoPedido, string> = {
  recibido: "Ya lo pedimos",
  en_cocina: "En la plancha",
  listo: "Listo para retirar",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ETIQUETA_ESTADO_PANEL: Record<EstadoPedido, string> = {
  recibido: "Recibidos",
  en_cocina: "En cocina",
  listo: "Listos",
  en_camino: "En camino",
  entregado: "Entregados",
  cancelado: "Cancelados",
};

export const DIAS_SEMANA = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;
