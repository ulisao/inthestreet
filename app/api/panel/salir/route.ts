import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_PANEL } from "../cookie";

/** Bloquea de nuevo el panel: borra la cookie-puerta. Útil en un tablet compartido de cocina. */
export async function POST() {
  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(NOMBRE_COOKIE_PANEL, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return respuesta;
}
