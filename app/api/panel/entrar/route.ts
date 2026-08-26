import { NextResponse } from "next/server";
import { NOMBRE_COOKIE_PANEL, VALOR_COOKIE_PANEL } from "../cookie";

// Un mes: el tablet de cocina no debería tener que loguearse todos los días.
const DURACION_COOKIE_SEG = 60 * 60 * 24 * 30;

export async function POST(request: Request) {
  const pinEsperado = process.env.PIN_PANEL;

  if (!pinEsperado) {
    return NextResponse.json(
      {
        ok: false,
        error: "El panel no tiene PIN configurado en el servidor.",
      },
      { status: 500 },
    );
  }

  let pin: unknown;
  try {
    const cuerpo = await request.json();
    pin = cuerpo?.pin;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Pedido inválido." },
      { status: 400 },
    );
  }

  if (typeof pin !== "string" || pin.trim() !== pinEsperado) {
    return NextResponse.json(
      { ok: false, error: "PIN incorrecto. Probá de nuevo." },
      { status: 401 },
    );
  }

  const respuesta = NextResponse.json({ ok: true });
  respuesta.cookies.set(NOMBRE_COOKIE_PANEL, VALOR_COOKIE_PANEL, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACION_COOKIE_SEG,
  });
  return respuesta;
}
