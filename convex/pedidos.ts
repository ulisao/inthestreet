import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { estadoPedido, metodoPago, modalidad } from "./schema";
import { CONFIG_INICIAL } from "./datosIniciales";
import { estaAbierto } from "../lib/horario";

const ESTADOS_EN_COLA = ["recibido", "en_cocina"] as const;
const ESTADOS_ACTIVOS = ["recibido", "en_cocina", "listo", "en_camino"] as const;

const LETRAS = "ABCDEFGHJKLMNPQRSTUVWXYZ"; // sin I ni O: se confunden con 1 y 0

async function configOFallback(ctx: QueryCtx | MutationCtx) {
  const config = await ctx.db.query("config_local").first();
  return config ?? CONFIG_INICIAL;
}

async function contarEnCola(ctx: QueryCtx | MutationCtx) {
  const enCola = await Promise.all(
    ESTADOS_EN_COLA.map((estado) =>
      ctx.db
        .query("pedidos")
        .withIndex("por_estado", (q) => q.eq("estado", estado))
        .collect(),
    ),
  );
  return enCola.flat().length;
}

async function generarCodigo(ctx: MutationCtx) {
  for (let intento = 0; intento < 20; intento++) {
    const letra = LETRAS[Math.floor(Math.random() * LETRAS.length)];
    const numero = Math.floor(Math.random() * 90) + 10;
    const codigo = `${letra}-${numero}`;
    const existente = await ctx.db
      .query("pedidos")
      .withIndex("por_codigo", (q) => q.eq("codigo", codigo))
      .first();
    // Un código se puede reusar una vez que el pedido viejo se cerró.
    if (
      !existente ||
      existente.estado === "entregado" ||
      existente.estado === "cancelado"
    ) {
      if (!existente) return codigo;
    }
  }
  return `Z-${Date.now().toString().slice(-4)}`;
}

export const eta = query({
  args: {},
  handler: async (ctx) => {
    const config = await configOFallback(ctx);
    const enCola = await contarEnCola(ctx);
    return {
      enCola,
      // ETA honesto: base + lo que ya hay adelante. Nunca el número optimista.
      minutos: config.minutosBase + enCola * config.minutosPorPedidoEnCola,
      minutosBase: config.minutosBase,
    };
  },
});

export const porCodigo = query({
  args: { codigo: v.string() },
  handler: async (ctx, { codigo }) => {
    const pedido = await ctx.db
      .query("pedidos")
      .withIndex("por_codigo", (q) => q.eq("codigo", codigo.toUpperCase()))
      .first();
    if (!pedido) return null;

    const items = await ctx.db
      .query("items_pedido")
      .withIndex("por_pedido", (q) => q.eq("pedidoId", pedido._id))
      .collect();

    const config = await configOFallback(ctx);

    // Cuántos pedidos siguen adelante de este, ahora mismo.
    const enCola = await Promise.all(
      ESTADOS_EN_COLA.map((estado) =>
        ctx.db
          .query("pedidos")
          .withIndex("por_estado", (q) => q.eq("estado", estado))
          .collect(),
      ),
    );
    const adelante = enCola
      .flat()
      .filter((p) => p.creadoEn < pedido.creadoEn).length;

    return {
      pedido,
      items,
      adelante,
      local: {
        nombre: config.nombre,
        direccion: config.direccion,
        telefono: config.telefono,
        whatsapp: config.whatsapp,
        aliasTransferencia: config.aliasTransferencia,
      },
    };
  },
});

export const activos = query({
  args: {},
  handler: async (ctx) => {
    const porEstado = await Promise.all(
      ESTADOS_ACTIVOS.map((estado) =>
        ctx.db
          .query("pedidos")
          .withIndex("por_estado", (q) => q.eq("estado", estado))
          .collect(),
      ),
    );
    const pedidos = porEstado.flat().sort((a, b) => a.creadoEn - b.creadoEn);

    const items = await Promise.all(
      pedidos.map((p) =>
        ctx.db
          .query("items_pedido")
          .withIndex("por_pedido", (q) => q.eq("pedidoId", p._id))
          .collect(),
      ),
    );

    return pedidos.map((pedido, i) => ({ ...pedido, items: items[i] }));
  },
});

export const cerradosDeHoy = query({
  args: {},
  handler: async (ctx) => {
    const hace12h = Date.now() - 12 * 60 * 60 * 1000;
    const cerrados = await Promise.all(
      (["entregado", "cancelado"] as const).map((estado) =>
        ctx.db
          .query("pedidos")
          .withIndex("por_estado", (q) => q.eq("estado", estado))
          .collect(),
      ),
    );
    return cerrados
      .flat()
      .filter((p) => p.creadoEn > hace12h)
      .sort((a, b) => b.creadoEn - a.creadoEn);
  },
});

export const crear = mutation({
  args: {
    nombre: v.string(),
    telefono: v.string(),
    modalidad,
    direccion: v.optional(v.string()),
    referencia: v.optional(v.string()),
    metodoPago,
    pagaCon: v.optional(v.number()),
    nota: v.optional(v.string()),
    items: v.array(
      v.object({
        productoId: v.id("productos"),
        cantidad: v.number(),
        puntoCoccion: v.optional(v.string()),
        extras: v.array(v.string()),
        quitar: v.array(v.string()),
        nota: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const config = await configOFallback(ctx);

    if (config.pausado) {
      throw new Error("PAUSADO");
    }
    if (!estaAbierto(config)) {
      throw new Error("CERRADO");
    }
    if (args.items.length === 0) {
      throw new Error("CARRITO_VACIO");
    }
    if (args.modalidad === "delivery" && !args.direccion?.trim()) {
      throw new Error("FALTA_DIRECCION");
    }

    // Los precios se recalculan acá contra la base. Lo que mande el cliente
    // es solo la selección, nunca el monto.
    const opciones = await ctx.db.query("opciones").collect();
    const lineas: {
      productoId: (typeof args.items)[number]["productoId"];
      nombreProducto: string;
      categoriaSlug: string;
      precioUnitario: number;
      cantidad: number;
      puntoCoccion?: string;
      extras: { nombre: string; precio: number }[];
      quitar: string[];
      nota?: string;
      subtotal: number;
    }[] = [];

    for (const item of args.items) {
      const producto = await ctx.db.get(item.productoId);
      if (!producto) throw new Error("PRODUCTO_INEXISTENTE");
      if (!producto.disponible) {
        throw new Error(`AGOTADO:${producto.nombre}`);
      }

      const cantidad = Math.max(1, Math.min(20, Math.round(item.cantidad)));
      const extras = item.extras
        .map((nombre) =>
          opciones.find(
            (o) =>
              o.activa &&
              o.tipo === "extra" &&
              o.categoriaSlug === producto.categoriaSlug &&
              o.nombre === nombre,
          ),
        )
        .filter((o): o is NonNullable<typeof o> => Boolean(o))
        .map((o) => ({ nombre: o.nombre, precio: o.precio }));

      const quitar = item.quitar.filter((nombre) =>
        opciones.some(
          (o) =>
            o.activa &&
            o.tipo === "quitar" &&
            o.categoriaSlug === producto.categoriaSlug &&
            o.nombre === nombre,
        ),
      );

      const puntoValido = opciones.some(
        (o) =>
          o.activa &&
          o.tipo === "punto_coccion" &&
          o.categoriaSlug === producto.categoriaSlug &&
          o.nombre === item.puntoCoccion,
      );

      const precioUnitario =
        producto.precio + extras.reduce((suma, e) => suma + e.precio, 0);

      lineas.push({
        productoId: item.productoId,
        nombreProducto: producto.nombre,
        categoriaSlug: producto.categoriaSlug,
        precioUnitario,
        cantidad,
        puntoCoccion: puntoValido ? item.puntoCoccion : undefined,
        extras,
        quitar,
        nota: item.nota?.trim() || undefined,
        subtotal: precioUnitario * cantidad,
      });
    }

    const subtotal = lineas.reduce((suma, l) => suma + l.subtotal, 0);
    const recargoDelivery =
      args.modalidad === "delivery" ? config.recargoDelivery : 0;
    const total = subtotal + recargoDelivery;

    if (args.metodoPago === "efectivo" && args.pagaCon && args.pagaCon < total) {
      throw new Error("PAGA_CON_INSUFICIENTE");
    }

    const enCola = await contarEnCola(ctx);
    const codigo = await generarCodigo(ctx);

    const pedidoId = await ctx.db.insert("pedidos", {
      codigo,
      estado: "recibido",
      modalidad: args.modalidad,
      nombre: args.nombre.trim(),
      telefono: args.telefono.trim(),
      direccion: args.direccion?.trim() || undefined,
      referencia: args.referencia?.trim() || undefined,
      metodoPago: args.metodoPago,
      pagaCon: args.metodoPago === "efectivo" ? args.pagaCon : undefined,
      nota: args.nota?.trim() || undefined,
      subtotal,
      recargoDelivery,
      total,
      creadoEn: Date.now(),
      minutosEstimados:
        config.minutosBase + enCola * config.minutosPorPedidoEnCola,
      pedidosEnColaAlCrear: enCola,
    });

    for (const linea of lineas) {
      await ctx.db.insert("items_pedido", { pedidoId, ...linea });
    }

    return { codigo, pedidoId };
  },
});

export const avanzarEstado = mutation({
  args: { pedidoId: v.id("pedidos"), estado: estadoPedido },
  handler: async (ctx, { pedidoId, estado }) => {
    const pedido = await ctx.db.get(pedidoId);
    if (!pedido) throw new Error("PEDIDO_INEXISTENTE");

    const campoSello: Record<string, string> = {
      en_cocina: "enCocinaEn",
      listo: "listoEn",
      en_camino: "enCaminoEn",
      entregado: "entregadoEn",
      cancelado: "canceladoEn",
    };
    const campo = campoSello[estado];

    await ctx.db.patch(pedidoId, {
      estado,
      ...(campo ? { [campo]: Date.now() } : {}),
    });
  },
});

export const cancelar = mutation({
  args: { pedidoId: v.id("pedidos"), motivo: v.optional(v.string()) },
  handler: async (ctx, { pedidoId, motivo }) => {
    await ctx.db.patch(pedidoId, {
      estado: "cancelado",
      canceladoEn: Date.now(),
      motivoCancelacion: motivo?.trim() || undefined,
    });
  },
});
