import { z } from "zod";
import { telefonoValido } from "@/lib/formato";

/**
 * El total es dinámico (depende del carrito y de si es delivery), así que el
 * esquema se arma por pedido para poder validar "¿con cuánto abonás?" contra
 * el total real en el mismo paso que el resto del formulario.
 */
export function crearEsquemaCheckout(total: number) {
  return z
    .object({
      nombre: z
        .string()
        .trim()
        .min(2, "Necesitamos tu nombre para cantarlo cuando esté listo"),
      telefono: z
        .string()
        .trim()
        .min(1, "Dejanos un teléfono para avisarte cuando esté listo")
        .refine((valor) => telefonoValido(valor), {
          message: "Ese teléfono no nos cierra, revisalo",
        }),
      modalidad: z.enum(["retiro", "delivery"]),
      direccion: z.string().trim(),
      referencia: z.string().trim(),
      metodoPago: z.enum(["efectivo", "transferencia"]),
      pagaCon: z
        .number()
        .positive("Poné un monto real para calcular el vuelto")
        .optional(),
      nota: z.string().trim(),
    })
    .superRefine((datos, ctx) => {
      if (datos.modalidad === "delivery" && datos.direccion.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["direccion"],
          message: "Sin dirección no sabemos a dónde ir",
        });
      }
      if (
        datos.metodoPago === "efectivo" &&
        datos.pagaCon != null &&
        datos.pagaCon < total
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["pagaCon"],
          message: "Con ese billete no alcanza, poné un monto que cubra el total",
        });
      }
    });
}

export type EsquemaCheckout = ReturnType<typeof crearEsquemaCheckout>;
export type DatosCheckout = z.infer<EsquemaCheckout>;

/** Estado del formulario tal cual vive en los inputs, antes de parsear con Zod. */
export type FormularioCheckout = {
  nombre: string;
  telefono: string;
  modalidad: "retiro" | "delivery";
  direccion: string;
  referencia: string;
  metodoPago: "efectivo" | "transferencia";
  pagaConTexto: string;
  nota: string;
};

export const FORMULARIO_VACIO: FormularioCheckout = {
  nombre: "",
  telefono: "",
  modalidad: "retiro",
  direccion: "",
  referencia: "",
  metodoPago: "efectivo",
  pagaConTexto: "",
  nota: "",
};

/**
 * Corre el formulario crudo contra el esquema de Zod y devuelve los errores
 * indexados por campo (el primero por campo, para no amontonar mensajes) más
 * los datos ya limpios cuando todo pasa. `pagaConTexto` se parsea acá: un
 * valor no numérico se reporta aparte porque Zod solo ve `number | undefined`.
 */
export function validarFormulario(form: FormularioCheckout, total: number) {
  const pagaConCrudo = form.pagaConTexto.trim();
  const pagaConEsInvalido =
    pagaConCrudo !== "" && Number.isNaN(Number(pagaConCrudo));

  const resultado = crearEsquemaCheckout(total).safeParse({
    nombre: form.nombre,
    telefono: form.telefono,
    modalidad: form.modalidad,
    direccion: form.modalidad === "delivery" ? form.direccion : "",
    referencia: form.referencia,
    metodoPago: form.metodoPago,
    pagaCon:
      form.metodoPago === "efectivo" && pagaConCrudo !== "" && !pagaConEsInvalido
        ? Number(pagaConCrudo)
        : undefined,
    nota: form.nota,
  });

  const errores: Record<string, string> = {};
  if (!resultado.success) {
    for (const issue of resultado.error.issues) {
      const campo = String(issue.path[0] ?? "form");
      if (!errores[campo]) errores[campo] = issue.message;
    }
  }
  if (pagaConEsInvalido) {
    errores.pagaCon = "Poné solo números para calcular el vuelto";
  }

  return {
    errores,
    datos: resultado.success && !pagaConEsInvalido ? resultado.data : null,
  };
}

/** Traduce el código seco que tira `api.pedidos.crear` a la voz de la marca. */
export function traducirErrorPedido(error: unknown): string {
  const texto = String(error);

  if (texto.includes("PAUSADO")) {
    return "La cocina cortó la recepción por un rato. Probá de nuevo en unos minutos.";
  }
  if (texto.includes("CERRADO")) {
    return "Ya cerramos por hoy. Volvé a intentar cuando abramos de nuevo.";
  }
  if (texto.includes("CARRITO_VACIO")) {
    return "Tu pedido está vacío. Volvé al menú y agregá algo antes de confirmar.";
  }
  if (texto.includes("FALTA_DIRECCION")) {
    return "Sin dirección no sabemos a dónde ir. Completala para el delivery.";
  }
  const agotado = texto.match(/AGOTADO:([^"]+)/);
  if (agotado) {
    return `Se nos acabó "${agotado[1].trim()}" justo mientras armabas el pedido. Sacalo del carrito y probá de nuevo.`;
  }
  if (texto.includes("PRODUCTO_INEXISTENTE")) {
    return "Uno de los productos ya no existe en el menú. Revisá tu carrito y volvé a intentar.";
  }
  if (texto.includes("PAGA_CON_INSUFICIENTE")) {
    return "Con ese billete no alcanza. Poné un monto mayor o igual al total.";
  }
  return "Algo se cortó al mandar el pedido. Probá de nuevo en un momento.";
}
