import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Inter_Tight } from "next/font/google";
import { ProveedorConvex } from "@/components/ProveedorConvex";
import { AvisoSinConexion } from "@/components/pwa/AvisoSinConexion";
import { RegistroServiceWorker } from "@/components/pwa/RegistroServiceWorker";
import "./globals.css";

// Google renombró "Big Shoulders Display" a "Big Shoulders".
const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: ["600", "800"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

const URL_BASE = process.env.NEXT_PUBLIC_URL_BASE ?? "https://inthestreet.app";

export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title: "IN THE STREET — Hamburguesas y lomos en Marcos Juárez",
  description:
    "Pedí online y seguí tu pedido en vivo. Hamburguesas y lomos, retiro por el local o delivery en todo Marcos Juárez.",
  applicationName: "IN THE STREET",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "IN THE STREET",
  },
  openGraph: {
    type: "website",
    locale: "es_AR",
    // El link de la bio de Instagram apunta a la home: sin og:url, WhatsApp
    // arma la preview con la URL cruda que le pegaron.
    url: "/",
    siteName: "IN THE STREET",
    title: "IN THE STREET — Pedí online",
    description:
      "Hamburguesas y lomos en Marcos Juárez. Pedí sin WhatsApp y seguí tu pedido en vivo.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "IN THE STREET" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "IN THE STREET — Pedí online",
    description: "Hamburguesas y lomos en Marcos Juárez.",
    images: ["/og.png"],
  },
  icons: {
    // El .ico vive en /public y no en app/: el pipeline de imágenes de
    // Turbopack no decodifica ICO con payload PNG, y como archivo estático
    // no necesita pasar por ahí. Los navegadores modernos usan el SVG.
    icon: [
      { url: "/icono.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/icono-180.png",
  },
  other: {
    // Next 16 emite el `mobile-web-app-capable` moderno. iOS todavía se guía
    // por el prefijado, y sin él "Agregar a inicio" abre en Safari con barra
    // de direcciones en vez de standalone.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${bigShoulders.variable} ${interTight.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-negro text-hueso">
        <RegistroServiceWorker />
        <AvisoSinConexion />
        <ProveedorConvex>{children}</ProveedorConvex>
      </body>
    </html>
  );
}
