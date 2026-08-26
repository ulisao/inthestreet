import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NOMBRE_COOKIE_PANEL, VALOR_COOKIE_PANEL } from "@/app/api/panel/cookie";
import { PantallaPin } from "@/components/panel/PantallaPin";
import { BarraPanel } from "@/components/panel/BarraPanel";
import { ProveedorSonidoPanel } from "@/components/panel/ContextoSonido";
import "@/components/panel/panel.css";

// El panel es la cocina, no la tienda: no queremos que Google lo indexe.
export const metadata: Metadata = {
  title: "Panel de cocina — IN THE STREET",
  robots: { index: false, follow: false, nocache: true },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const autenticado =
    cookieStore.get(NOMBRE_COOKIE_PANEL)?.value === VALOR_COOKIE_PANEL;

  if (!autenticado) {
    return <PantallaPin />;
  }

  return (
    <ProveedorSonidoPanel>
      <div className="flex min-h-dvh flex-col bg-negro text-hueso">
        <BarraPanel />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </ProveedorSonidoPanel>
  );
}
