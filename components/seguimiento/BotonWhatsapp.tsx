type LocalWhatsapp = { whatsapp: string };

export function BotonWhatsapp({
  local,
  codigo,
}: {
  local: LocalWhatsapp;
  codigo: string;
}) {
  const mensaje = encodeURIComponent(
    `Hola! Te escribo por el pedido ${codigo}, quería consultar.`,
  );
  const href = `https://wa.me/${local.whatsapp}?text=${mensaje}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="sticker flex min-h-11 items-center justify-center gap-2 px-4 py-3 text-center font-display text-lg uppercase"
    >
      Consultar por WhatsApp
    </a>
  );
}
