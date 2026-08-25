import { internalMutation, mutation } from "./_generated/server";
import {
  CATEGORIAS_INICIALES,
  CONFIG_INICIAL,
  OPCIONES_INICIALES,
  PRODUCTOS_INICIALES,
  PROMOS_INICIALES,
} from "./datosIniciales";
import type { MutationCtx } from "./_generated/server";

async function sembrar(ctx: MutationCtx) {
  const yaHayConfig = await ctx.db.query("config_local").first();
  if (yaHayConfig) {
    return { sembrado: false, motivo: "Ya había datos, no se tocó nada." };
  }

  await ctx.db.insert("config_local", CONFIG_INICIAL);
  for (const categoria of CATEGORIAS_INICIALES) {
    await ctx.db.insert("categorias", categoria);
  }
  for (const producto of PRODUCTOS_INICIALES) {
    await ctx.db.insert("productos", producto);
  }
  for (const opcion of OPCIONES_INICIALES) {
    await ctx.db.insert("opciones", opcion);
  }
  for (const promo of PROMOS_INICIALES) {
    await ctx.db.insert("promos_dia", promo);
  }

  return {
    sembrado: true,
    productos: PRODUCTOS_INICIALES.length,
    opciones: OPCIONES_INICIALES.length,
    promos: PROMOS_INICIALES.length,
  };
}

export const correrSeed = mutation({
  args: {},
  handler: sembrar,
});

export const correrSeedInterno = internalMutation({
  args: {},
  handler: sembrar,
});
