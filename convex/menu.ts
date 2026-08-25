import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { tipoOpcion } from "./schema";

export const listarCategorias = query({
  args: {},
  handler: async (ctx) => {
    const categorias = await ctx.db.query("categorias").collect();
    return categorias
      .filter((c) => c.activa)
      .sort((a, b) => a.orden - b.orden);
  },
});

export const listarProductos = query({
  args: {},
  handler: async (ctx) => {
    const productos = await ctx.db.query("productos").collect();
    return productos.sort((a, b) => a.orden - b.orden);
  },
});

export const listarOpciones = query({
  args: {},
  handler: async (ctx) => {
    const opciones = await ctx.db.query("opciones").collect();
    return opciones
      .filter((o) => o.activa)
      .sort((a, b) => a.orden - b.orden);
  },
});

/** Todo lo que la tienda necesita para pintarse, en una sola subscripción. */
export const menuCompleto = query({
  args: {},
  handler: async (ctx) => {
    const [categorias, productos, opciones] = await Promise.all([
      ctx.db.query("categorias").collect(),
      ctx.db.query("productos").collect(),
      ctx.db.query("opciones").collect(),
    ]);

    return {
      categorias: categorias
        .filter((c) => c.activa)
        .sort((a, b) => a.orden - b.orden),
      productos: productos.sort((a, b) => a.orden - b.orden),
      opciones: opciones
        .filter((o) => o.activa)
        .sort((a, b) => a.orden - b.orden),
    };
  },
});

export const cambiarDisponibilidad = mutation({
  args: { productoId: v.id("productos"), disponible: v.boolean() },
  handler: async (ctx, { productoId, disponible }) => {
    await ctx.db.patch(productoId, { disponible });
  },
});

export const guardarProducto = mutation({
  args: {
    productoId: v.optional(v.id("productos")),
    nombre: v.string(),
    descripcion: v.string(),
    precio: v.number(),
    categoriaSlug: v.string(),
    imagen: v.optional(v.string()),
    disponible: v.boolean(),
    destacado: v.boolean(),
    orden: v.number(),
  },
  handler: async (ctx, { productoId, ...datos }) => {
    if (productoId) {
      await ctx.db.patch(productoId, datos);
      return productoId;
    }
    return await ctx.db.insert("productos", datos);
  },
});

export const borrarProducto = mutation({
  args: { productoId: v.id("productos") },
  handler: async (ctx, { productoId }) => {
    await ctx.db.delete(productoId);
  },
});

export const guardarOpcion = mutation({
  args: {
    opcionId: v.optional(v.id("opciones")),
    categoriaSlug: v.string(),
    tipo: tipoOpcion,
    nombre: v.string(),
    precio: v.number(),
    orden: v.number(),
    activa: v.boolean(),
  },
  handler: async (ctx, { opcionId, ...datos }) => {
    if (opcionId) {
      await ctx.db.patch(opcionId, datos);
      return opcionId;
    }
    return await ctx.db.insert("opciones", datos);
  },
});

export const borrarOpcion = mutation({
  args: { opcionId: v.id("opciones") },
  handler: async (ctx, { opcionId }) => {
    await ctx.db.delete(opcionId);
  },
});
