"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCarrito, useCarritoHidratado } from "@/lib/pedido/store";
import { guardarCodigo } from "@/lib/pedido/codigoGuardado";
import { precio } from "@/lib/formato";
import { estadoApertura } from "@/lib/horario";
import {
  FORMULARIO_VACIO,
  traducirErrorPedido,
  validarFormulario,
  type FormularioCheckout,
} from "@/lib/pedido/validacion";

function claseCampo(conError: boolean) {
  return `w-full min-h-11 border-2 bg-tinta px-3 py-3 text-hueso placeholder:text-hueso/40 focus-visible:outline-cheddar ${
    conError ? "border-rojo" : "border-hueso"
  }`;
}

export default function PaginaCheckout() {
  const hidratado = useCarritoHidratado();
  const { items, subtotal, vaciar } = useCarrito();

  const config = useQuery(api.config.leerConfig);
  const eta = useQuery(api.pedidos.eta);
  const crearPedido = useMutation(api.pedidos.crear);
  const router = useRouter();

  const [form, setForm] = useState<FormularioCheckout>(FORMULARIO_VACIO);
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [intentoEnvio, setIntentoEnvio] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const recargoDelivery =
    form.modalidad === "delivery" ? (config?.recargoDelivery ?? 0) : 0;
  const total = subtotal + recargoDelivery;

  const estado = config ? estadoApertura(config) : null;
  const localCerrado = !config || config.pausado || !estado?.abierto;

  const pagaConCrudo = form.pagaConTexto.trim();
  const pagaConNumero = pagaConCrudo === "" ? null : Number(pagaConCrudo);
  const pagaConValido = pagaConNumero !== null && !Number.isNaN(pagaConNumero);
  const vuelto = pagaConValido ? pagaConNumero! - total : null;

  function actualizarCampo<K extends keyof FormularioCheckout>(
    campo: K,
    valor: FormularioCheckout[K],
  ) {
    const siguiente = { ...form, [campo]: valor };
    setForm(siguiente);
    // Una vez que el campo ya mostró un error, revalidamos en vivo para que
    // se pueda corregir sin necesitar otro blur.
    if (intentoEnvio || tocado[campo as string]) {
      const { errores: nuevosErrores } = validarFormulario(siguiente, total);
      setErrores(nuevosErrores);
    }
  }

  function marcarTocado(campo: string) {
    setTocado((previo) => ({ ...previo, [campo]: true }));
    const { errores: nuevosErrores } = validarFormulario(form, total);
    setErrores(nuevosErrores);
  }

  function errorVisible(campo: string) {
    return intentoEnvio || tocado[campo] ? errores[campo] : undefined;
  }

  async function copiarAlias() {
    if (!config) return;
    try {
      await navigator.clipboard.writeText(config.aliasTransferencia);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Sin permiso de portapapeles: el alias ya está visible en pantalla.
    }
  }

  async function alConfirmar(evento: FormEvent) {
    evento.preventDefault();
    setIntentoEnvio(true);
    setErrorGeneral(null);

    const { errores: erroresValidacion, datos } = validarFormulario(form, total);
    setErrores(erroresValidacion);
    if (!datos || !config || localCerrado || enviando) return;

    setEnviando(true);
    try {
      const resultado = await crearPedido({
        nombre: datos.nombre,
        telefono: datos.telefono,
        modalidad: datos.modalidad,
        direccion: datos.modalidad === "delivery" ? datos.direccion : undefined,
        referencia:
          datos.modalidad === "delivery" ? datos.referencia || undefined : undefined,
        metodoPago: datos.metodoPago,
        pagaCon: datos.metodoPago === "efectivo" ? datos.pagaCon : undefined,
        nota: datos.nota || undefined,
        items: items.map((item) => ({
          productoId: item.productoId,
          cantidad: item.cantidad,
          puntoCoccion: item.puntoCoccion,
          extras: item.extras.map((extra) => extra.nombre),
          quitar: item.quitar,
          nota: item.nota,
        })),
      });

      guardarCodigo(resultado.codigo);
      vaciar();
      router.push(`/pedido/${resultado.codigo}`);
    } catch (error) {
      setErrorGeneral(traducirErrorPedido(error));
      setEnviando(false);
    }
  }

  if (!hidratado) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-4">
        <p className="text-hueso/70">Cargando tu pedido…</p>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl">Tu carrito está vacío</h1>
        <p className="text-hueso/70">
          Todavía no agregaste nada para pedir. Volvé al menú y armá tu pedido.
        </p>
        <Link
          href="/"
          className="sticker min-h-11 px-6 py-3 font-display text-lg uppercase"
          data-activo="true"
        >
          Ver el menú
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-40 pt-4">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm text-hueso/70 underline">
          ‹ Volver al menú
        </Link>
      </div>

      <h1 className="text-3xl">Confirmá tu pedido</h1>

      {config && localCerrado && (
        <div className="borde-duro bg-rojo px-4 py-3">
          <p className="font-display text-lg uppercase text-hueso">
            {config.pausado ? "Estamos pausados" : "Estamos cerrados"}
          </p>
          <p className="mt-1 text-sm text-hueso">
            {config.pausado ? config.mensajePausa : estado?.proximaApertura}
          </p>
          <p className="mt-2 text-sm text-hueso/80">
            Podés dejar el pedido armado, pero todavía no lo vamos a poder confirmar.
          </p>
        </div>
      )}

      {/* Resumen del pedido */}
      <section className="borde-duro papel-deli flex flex-col gap-3 px-4 py-4">
        <h2 className="text-xl">Tu pedido</h2>
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.lineaId} className="flex items-start justify-between gap-2 text-sm">
              <div>
                <p className="font-display text-base uppercase leading-tight">
                  {item.cantidad} × {item.nombreProducto}
                </p>
                {item.puntoCoccion && (
                  <p className="text-negro/70">Punto: {item.puntoCoccion}</p>
                )}
                {item.extras.length > 0 && (
                  <p className="text-negro/70">
                    Con:{" "}
                    {item.extras
                      .map((extra) => `${extra.nombre} (+${precio(extra.precio)})`)
                      .join(", ")}
                  </p>
                )}
                {item.quitar.length > 0 && (
                  <p className="text-negro/70">Sin: {item.quitar.join(", ")}</p>
                )}
                {item.nota && <p className="italic text-negro/60">“{item.nota}”</p>}
              </div>
              <span className="shrink-0 font-display text-rojo">
                {precio(item.precioUnitario * item.cantidad)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-1 border-t-2 border-negro/15 pt-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{precio(subtotal)}</span>
          </div>
          {form.modalidad === "delivery" && (
            <div className="flex justify-between">
              <span>Delivery</span>
              <span>{precio(recargoDelivery)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg">
            <span className="font-display uppercase">Total</span>
            <span className="font-display text-rojo">{precio(total)}</span>
          </div>
        </div>

        <p className="text-sm text-negro/70">
          {eta === undefined
            ? "Calculando cuánto tarda…"
            : eta.enCola === 0
              ? `Ahora no hay nadie adelante, calculá unos ${eta.minutos} minutos.`
              : `Ahora hay ${eta.enCola} pedido${eta.enCola === 1 ? "" : "s"} adelante, calculá unos ${eta.minutos} minutos.`}
        </p>
      </section>

      {/* Formulario */}
      <form id="form-checkout" noValidate onSubmit={alConfirmar} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="nombre" className="text-sm font-display uppercase tracking-wide">
            Nombre
          </label>
          <input
            id="nombre"
            type="text"
            autoComplete="name"
            value={form.nombre}
            onChange={(e) => actualizarCampo("nombre", e.target.value)}
            onBlur={() => marcarTocado("nombre")}
            aria-invalid={errorVisible("nombre") ? true : undefined}
            aria-describedby={errorVisible("nombre") ? "nombre-error" : undefined}
            placeholder="¿Cómo te llamamos?"
            className={claseCampo(Boolean(errorVisible("nombre")))}
          />
          {errorVisible("nombre") && (
            <p id="nombre-error" role="alert" className="text-sm font-semibold text-rojo">
              {errores.nombre}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="telefono" className="text-sm font-display uppercase tracking-wide">
            Teléfono
          </label>
          <input
            id="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.telefono}
            onChange={(e) => actualizarCampo("telefono", e.target.value)}
            onBlur={() => marcarTocado("telefono")}
            aria-invalid={errorVisible("telefono") ? true : undefined}
            aria-describedby={errorVisible("telefono") ? "telefono-error" : undefined}
            placeholder="Para avisarte cuando esté listo"
            className={claseCampo(Boolean(errorVisible("telefono")))}
          />
          {errorVisible("telefono") && (
            <p id="telefono-error" role="alert" className="text-sm font-semibold text-rojo">
              {errores.telefono}
            </p>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-display uppercase tracking-wide">Modalidad</legend>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => actualizarCampo("modalidad", "retiro")}
              aria-pressed={form.modalidad === "retiro"}
              data-activo={form.modalidad === "retiro" ? "true" : undefined}
              className="sticker min-h-11 py-3 font-display uppercase"
            >
              Retiro en el local
            </button>
            <button
              type="button"
              onClick={() => actualizarCampo("modalidad", "delivery")}
              aria-pressed={form.modalidad === "delivery"}
              data-activo={form.modalidad === "delivery" ? "true" : undefined}
              className="sticker min-h-11 py-3 font-display uppercase"
            >
              Delivery
            </button>
          </div>
        </fieldset>

        {form.modalidad === "delivery" && (
          <>
            <div className="flex flex-col gap-1">
              <label htmlFor="direccion" className="text-sm font-display uppercase tracking-wide">
                Dirección
              </label>
              <input
                id="direccion"
                type="text"
                autoComplete="street-address"
                value={form.direccion}
                onChange={(e) => actualizarCampo("direccion", e.target.value)}
                onBlur={() => marcarTocado("direccion")}
                aria-invalid={errorVisible("direccion") ? true : undefined}
                aria-describedby={errorVisible("direccion") ? "direccion-error" : undefined}
                placeholder="Calle, número y localidad"
                className={claseCampo(Boolean(errorVisible("direccion")))}
              />
              {errorVisible("direccion") && (
                <p id="direccion-error" role="alert" className="text-sm font-semibold text-rojo">
                  {errores.direccion}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="referencia" className="text-sm font-display uppercase tracking-wide">
                Referencia (opcional)
              </label>
              <input
                id="referencia"
                type="text"
                value={form.referencia}
                onChange={(e) => actualizarCampo("referencia", e.target.value)}
                placeholder='Ej: "entre San Martín y Belgrano, casa con reja verde"'
                className={claseCampo(false)}
              />
            </div>
          </>
        )}

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-display uppercase tracking-wide">Método de pago</legend>
          <p className="text-sm text-hueso/60">
            Se paga en persona, al retirar o al recibir. Acá solo nos decís cómo.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => actualizarCampo("metodoPago", "efectivo")}
              aria-pressed={form.metodoPago === "efectivo"}
              data-activo={form.metodoPago === "efectivo" ? "true" : undefined}
              className="sticker min-h-11 py-3 font-display uppercase"
            >
              Efectivo
            </button>
            <button
              type="button"
              onClick={() => actualizarCampo("metodoPago", "transferencia")}
              aria-pressed={form.metodoPago === "transferencia"}
              data-activo={form.metodoPago === "transferencia" ? "true" : undefined}
              className="sticker min-h-11 py-3 font-display uppercase"
            >
              Transferencia
            </button>
          </div>
        </fieldset>

        {form.metodoPago === "transferencia" && (
          <div className="borde-duro bg-tinta flex flex-col gap-2 px-4 py-3">
            <p className="text-sm text-hueso/80">
              Transferí a este alias y mostrá el comprobante al retirar o al recibir el
              pedido. No se cobra nada desde acá.
            </p>
            <div className="flex items-center justify-between gap-2 border-2 border-hueso px-3 py-2">
              <span className="break-all font-display text-lg text-cheddar">
                {config ? config.aliasTransferencia : "Cargando…"}
              </span>
              <button
                type="button"
                onClick={copiarAlias}
                disabled={!config}
                className="sticker min-h-11 shrink-0 px-3 text-sm font-display uppercase"
              >
                {copiado ? "Copiado" : "Copiar"}
              </button>
            </div>
          </div>
        )}

        {form.metodoPago === "efectivo" && (
          <div className="borde-duro bg-tinta flex flex-col gap-2 px-4 py-3">
            <label htmlFor="pagaCon" className="text-base font-display uppercase">
              ¿Con cuánto abonás?
            </label>
            <p className="text-sm text-hueso/70">
              Así el repartidor sale con el vuelto justo. Si todavía no sabés, dejalo en
              blanco.
            </p>
            <input
              id="pagaCon"
              type="number"
              inputMode="decimal"
              min={0}
              step="100"
              value={form.pagaConTexto}
              onChange={(e) => actualizarCampo("pagaConTexto", e.target.value)}
              aria-describedby="pagaCon-ayuda"
              placeholder="Ej: 20000"
              className={claseCampo(pagaConCrudo !== "" && vuelto !== null && vuelto < 0)}
            />
            <div id="pagaCon-ayuda" aria-live="polite">
              {pagaConCrudo !== "" && !pagaConValido && (
                <p className="text-sm font-semibold text-rojo">
                  Poné solo números para calcular el vuelto.
                </p>
              )}
              {vuelto !== null &&
                (vuelto >= 0 ? (
                  <p className="font-display text-lg text-cheddar">
                    Vuelto: {precio(vuelto)}
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-rojo">
                    Con ese billete no alcanza. Faltan {precio(Math.abs(vuelto))}.
                  </p>
                ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label htmlFor="nota" className="text-sm font-display uppercase tracking-wide">
            Nota general (opcional)
          </label>
          <textarea
            id="nota"
            rows={3}
            value={form.nota}
            onChange={(e) => actualizarCampo("nota", e.target.value)}
            placeholder="Algo más que tengamos que saber sobre tu pedido"
            className={claseCampo(false)}
          />
        </div>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-20 barra-inferior bg-negro px-4 pt-3">
        {errorGeneral && (
          <p role="alert" className="mb-2 text-sm font-semibold text-rojo">
            {errorGeneral}
          </p>
        )}
        <button
          type="submit"
          form="form-checkout"
          disabled={enviando || localCerrado}
          data-activo="true"
          className="sticker min-h-11 w-full py-3 font-display text-lg uppercase disabled:opacity-40"
        >
          {enviando
            ? "Mandando el pedido…"
            : localCerrado
              ? `Cerrado por ahora · ${precio(total)}`
              : `Confirmar pedido · ${precio(total)}`}
        </button>
      </div>
    </main>
  );
}
