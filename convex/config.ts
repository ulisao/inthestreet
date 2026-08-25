import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import { CONFIG_INICIAL, PROMOS_INICIALES } from "./datosIniciales";

export async function obtenerConfig(ctx: { db: MutationCtx["db"] }) {
  return await ctx.db.query("config_local").first();
}

export const leerConfig = query({
  args: {},
  handler: async (ctx) => {
    const config = await ctx.db.query("config_local").first();
    // La tienda tiene que poder pintarse aunque nadie haya corrido el seed.
    return config ?? { _id: null, ...CONFIG_INICIAL };
  },
});

export const promoDeHoy = query({
  args: { diaSemana: v.number() },
  handler: async (ctx, { diaSemana }) => {
    const promos = await ctx.db
      .query("promos_dia")
      .withIndex("por_dia", (q) => q.eq("diaSemana", diaSemana))
      .collect();
    const guardada = promos.find((p) => p.activa);
    if (guardada) return guardada;
    const inicial = PROMOS_INICIALES.find(
      (p) => p.diaSemana === diaSemana && p.activa,
    );
    return inicial ? { _id: null, ...inicial } : null;
  },
});

export const listarPromos = query({
  args: {},
  handler: async (ctx) => {
    const promos = await ctx.db.query("promos_dia").collect();
    return promos.sort((a, b) => a.diaSemana - b.diaSemana);
  },
});

export const guardarPromo = mutation({
  args: {
    promoId: v.optional(v.id("promos_dia")),
    diaSemana: v.number(),
    titulo: v.string(),
    descripcion: v.string(),
    activa: v.boolean(),
  },
  handler: async (ctx, { promoId, ...datos }) => {
    if (promoId) {
      await ctx.db.patch(promoId, datos);
      return promoId;
    }
    return await ctx.db.insert("promos_dia", datos);
  },
});

export const borrarPromo = mutation({
  args: { promoId: v.id("promos_dia") },
  handler: async (ctx, { promoId }) => {
    await ctx.db.delete(promoId);
  },
});

export const guardarConfig = mutation({
  args: {
    nombre: v.optional(v.string()),
    direccion: v.optional(v.string()),
    telefono: v.optional(v.string()),
    whatsapp: v.optional(v.string()),
    instagram: v.optional(v.string()),
    aliasTransferencia: v.optional(v.string()),
    minutosBase: v.optional(v.number()),
    minutosPorPedidoEnCola: v.optional(v.number()),
    recargoDelivery: v.optional(v.number()),
    zonaDelivery: v.optional(v.string()),
    pausado: v.optional(v.boolean()),
    mensajePausa: v.optional(v.string()),
    diasAbiertos: v.optional(v.array(v.number())),
    horaApertura: v.optional(v.string()),
    horaCierre: v.optional(v.string()),
  },
  handler: async (ctx, cambios) => {
    const limpios = Object.fromEntries(
      Object.entries(cambios).filter(([, valor]) => valor !== undefined),
    );
    const config = await ctx.db.query("config_local").first();
    if (!config) {
      return await ctx.db.insert("config_local", {
        ...CONFIG_INICIAL,
        ...limpios,
      });
    }
    await ctx.db.patch(config._id, limpios);
    return config._id;
  },
});

export const alternarPausa = mutation({
  args: { pausado: v.boolean() },
  handler: async (ctx, { pausado }) => {
    const config = await ctx.db.query("config_local").first();
    if (!config) {
      return await ctx.db.insert("config_local", {
        ...CONFIG_INICIAL,
        pausado,
      });
    }
    await ctx.db.patch(config._id, { pausado });
    return config._id;
  },
});
