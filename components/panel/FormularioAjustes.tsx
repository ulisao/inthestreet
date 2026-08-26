"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { precio } from "@/lib/formato";
import { DIAS_SEMANA } from "@/types";

export function FormularioAjustes() {
  const config = useQuery(api.config.leerConfig);
  const guardarConfig = useMutation(api.config.guardarConfig);

  // Solo cargamos los valores del server una vez: si sincronizáramos en cada
  // actualización de la query, el propio guardado (que dispara la reactividad)
  // podría pisar lo que el dueño esté tipeando a mitad de una edición.
  const inicializado = useRef(false);

  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [aliasTransferencia, setAliasTransferencia] = useState("");
  const [minutosBase, setMinutosBase] = useState("35");
  const [minutosPorPedidoEnCola, setMinutosPorPedidoEnCola] = useState("4");
  const [recargoDelivery, setRecargoDelivery] = useState("0");
  const [zonaDelivery, setZonaDelivery] = useState("");
  const [diasAbiertos, setDiasAbiertos] = useState<number[]>([]);
  const [horaApertura, setHoraApertura] = useState("19:30");
  const [horaCierre, setHoraCierre] = useState("23:00");
  const [mensajePausa, setMensajePausa] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);

  useEffect(() => {
    if (!config || inicializado.current) return;
    inicializado.current = true;
    setNombre(config.nombre);
    setDireccion(config.direccion);
    setTelefono(config.telefono);
    setWhatsapp(config.whatsapp);
    setInstagram(config.instagram);
    setAliasTransferencia(config.aliasTransferencia);
    setMinutosBase(String(config.minutosBase));
    setMinutosPorPedidoEnCola(String(config.minutosPorPedidoEnCola));
    setRecargoDelivery(String(config.recargoDelivery));
    setZonaDelivery(config.zonaDelivery);
    setDiasAbiertos(config.diasAbiertos);
    setHoraApertura(config.horaApertura);
    setHoraCierre(config.horaCierre);
    setMensajePausa(config.mensajePausa);
  }, [config]);

  const alternarDia = (dia: number) => {
    setDiasAbiertos((previo) =>
      previo.includes(dia)
        ? previo.filter((d) => d !== dia)
        : [...previo, dia].sort((a, b) => a - b),
    );
  };

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    const minutosBaseNum = Number(minutosBase);
    const minutosColaNum = Number(minutosPorPedidoEnCola);
    const recargoNum = Number(recargoDelivery);

    if (!Number.isFinite(minutosBaseNum) || minutosBaseNum < 0) {
      setError("Los minutos base tienen que ser un número válido.");
      return;
    }
    if (!Number.isFinite(minutosColaNum) || minutosColaNum < 0) {
      setError(
        "Los minutos por pedido en cola tienen que ser un número válido.",
      );
      return;
    }
    if (!Number.isFinite(recargoNum) || recargoNum < 0) {
      setError("El recargo de delivery tiene que ser un número válido.");
      return;
    }
    if (horaApertura >= horaCierre) {
      setError("La hora de apertura tiene que ser antes que la de cierre.");
      return;
    }

    setGuardando(true);
    setError(null);
    setGuardadoOk(false);
    try {
      await guardarConfig({
        nombre: nombre.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        aliasTransferencia: aliasTransferencia.trim(),
        minutosBase: minutosBaseNum,
        minutosPorPedidoEnCola: minutosColaNum,
        recargoDelivery: recargoNum,
        zonaDelivery: zonaDelivery.trim(),
        diasAbiertos,
        horaApertura,
        horaCierre,
        mensajePausa: mensajePausa.trim(),
      });
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 4000);
    } catch {
      setError("No se pudo guardar. Probá de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (config === undefined) {
    return <p className="p-4 font-sans text-hueso/70">Cargando ajustes…</p>;
  }

  const minutosBaseVista = Number(minutosBase) || 0;
  const minutosColaVista = Number(minutosPorPedidoEnCola) || 0;

  return (
    <form
      onSubmit={enviar}
      className="flex flex-1 flex-col gap-6 overflow-y-auto p-3 font-sans sm:p-4"
    >
      <h2 className="font-display text-2xl uppercase">Ajustes</h2>

      <fieldset className="borde-duro flex flex-col gap-3 bg-tinta p-4">
        <legend className="px-1 font-display text-lg uppercase text-cheddar">
          Tiempos de espera
        </legend>
        <p className="text-sm text-hueso/70">
          De acá sale el ETA que ve el cliente al pedir:{" "}
          <strong className="text-hueso">
            minutos base + pedidos en cola × minutos por pedido
          </strong>
          . Ejemplo: con 3 pedidos adelante, hoy le mostrarían{" "}
          <strong className="text-cheddar">
            {minutosBaseVista + 3 * minutosColaVista} minutos
          </strong>
          .
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Minutos base de preparación
            <input
              type="number"
              min={0}
              value={minutosBase}
              onChange={(e) => setMinutosBase(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Minutos extra por pedido en cola
            <input
              type="number"
              min={0}
              value={minutosPorPedidoEnCola}
              onChange={(e) => setMinutosPorPedidoEnCola(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="borde-duro flex flex-col gap-3 bg-tinta p-4">
        <legend className="px-1 font-display text-lg uppercase text-cheddar">
          Delivery
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Recargo de delivery
            <input
              type="number"
              min={0}
              value={recargoDelivery}
              onChange={(e) => setRecargoDelivery(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
            <span className="text-xs text-hueso/60">
              Se suma al pedido: {precio(Number(recargoDelivery) || 0)}
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Zona de delivery
            <input
              type="text"
              value={zonaDelivery}
              onChange={(e) => setZonaDelivery(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="borde-duro flex flex-col gap-3 bg-tinta p-4">
        <legend className="px-1 font-display text-lg uppercase text-cheddar">
          Horario
        </legend>
        <div className="flex flex-wrap gap-2">
          {DIAS_SEMANA.map((nombreDia, dia) => (
            <label
              key={dia}
              className="sticker flex min-h-[44px] items-center gap-2 px-3 py-2 text-sm"
              data-activo={diasAbiertos.includes(dia) ? "true" : "false"}
            >
              <input
                type="checkbox"
                checked={diasAbiertos.includes(dia)}
                onChange={() => alternarDia(dia)}
                className="h-4 w-4"
              />
              {nombreDia}
            </label>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Hora de apertura
            <input
              type="time"
              value={horaApertura}
              onChange={(e) => setHoraApertura(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Hora de cierre
            <input
              type="time"
              value={horaCierre}
              onChange={(e) => setHoraCierre(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="borde-duro flex flex-col gap-3 bg-tinta p-4">
        <legend className="px-1 font-display text-lg uppercase text-cheddar">
          Mensaje de pausa
        </legend>
        <label className="flex flex-col gap-1 text-sm">
          Se muestra en la tienda cuando pausás los pedidos
          <textarea
            value={mensajePausa}
            onChange={(e) => setMensajePausa(e.target.value)}
            className="borde-duro min-h-[70px] bg-negro px-3 py-2 text-hueso"
          />
        </label>
      </fieldset>

      <fieldset className="borde-duro flex flex-col gap-3 bg-tinta p-4">
        <legend className="px-1 font-display text-lg uppercase text-cheddar">
          Datos del local
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Nombre
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Dirección
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Teléfono
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            WhatsApp (con código de país, sin +)
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
              required
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Instagram (sin @)
            <input
              type="text"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Alias de transferencia
            <input
              type="text"
              value={aliasTransferencia}
              onChange={(e) => setAliasTransferencia(e.target.value)}
              className="borde-duro min-h-[44px] bg-negro px-3 py-2 text-hueso"
            />
          </label>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="font-semibold text-rojo">
          {error}
        </p>
      )}
      {guardadoOk && (
        <p role="status" className="font-semibold text-lechuga">
          Guardado.
        </p>
      )}

      <button
        type="submit"
        disabled={guardando}
        className="borde-duro min-h-[56px] bg-cheddar px-4 font-display text-lg uppercase text-negro disabled:opacity-60"
      >
        {guardando ? "Guardando…" : "Guardar ajustes"}
      </button>
    </form>
  );
}
