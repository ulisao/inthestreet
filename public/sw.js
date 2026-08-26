/*
 * Service worker de IN THE STREET, escrito a mano.
 *
 * No usamos next-pwa: está sin mantenimiento y asume Webpack, y este proyecto
 * corre Next 16 con Turbopack.
 *
 * Qué hace y qué NO hace, en orden de importancia:
 *
 * 1. NUNCA toca una mutación. Solo intercepta GET. Un pedido que no llega a la
 *    cocina es exactamente el bug que esta app vino a arreglar: acá no se encola
 *    nada "para después" ni se finge que se mandó.
 * 2. NUNCA cachea /panel ni /api. La cocina siempre ve datos frescos.
 * 3. NUNCA toca Convex: es otro origen y además viaja por websocket, así que ni
 *    siquiera pasa por acá. El guard de origen lo deja explícito igual.
 * 4. Sí cachea el shell y los estáticos, para que sin red se pueda mirar el menú.
 *    Los datos del menú los guarda el cliente aparte (lib/pwa/tiendaGuardada.ts):
 *    el service worker solo se ocupa de que la app arranque.
 */

const VERSION = "v1";
const CACHE_SHELL = `its-shell-${VERSION}`;
const CACHE_ESTATICOS = `its-estaticos-${VERSION}`;
const CACHES_VIGENTES = new Set([CACHE_SHELL, CACHE_ESTATICOS]);

/** Documentos que precacheamos para que la app abra sin red. */
const SHELL = ["/", "/checkout", "/pedido"];

/** Archivos de /public que valen la pena tener siempre a mano. */
const ESTATICOS_PROPIOS = new Set([
  "/manifest.webmanifest",
  "/icono.svg",
  "/logo.svg",
  "/icono-192.png",
  "/icono-512.png",
  "/icono-180.png",
  "/icono-maskable-512.png",
]);

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    (async () => {
      const shell = await caches.open(CACHE_SHELL);
      const estaticos = await caches.open(CACHE_ESTATICOS);
      // Uno por uno y tolerante a fallos: si un archivo no está, el install
      // no se cae entero y la app igual queda instalable.
      await Promise.allSettled([
        ...SHELL.map((ruta) => shell.add(new Request(ruta, { cache: "reload" }))),
        ...[...ESTATICOS_PROPIOS].map((ruta) =>
          estaticos.add(new Request(ruta, { cache: "reload" })),
        ),
      ]);
    })(),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    (async () => {
      const nombres = await caches.keys();
      await Promise.all(
        nombres
          .filter((nombre) => nombre.startsWith("its-") && !CACHES_VIGENTES.has(nombre))
          .map((nombre) => caches.delete(nombre)),
      );
      await self.clients.claim();
    })(),
  );
});

/** true si esta request no tiene que pasar nunca por el caché. */
function esIntocable(request, url) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return true;
  if (url.pathname.startsWith("/panel")) return true;
  if (url.pathname.startsWith("/api/")) return true;
  // Payloads RSC del App Router: si se sirven de un caché viejo, el router
  // de Next se desincroniza del HTML. Van siempre a la red.
  if (url.searchParams.has("_rsc")) return true;
  if (request.headers.get("RSC")) return true;
  return false;
}

function esEstatico(url) {
  return (
    url.pathname.startsWith("/_next/static/") || ESTATICOS_PROPIOS.has(url.pathname)
  );
}

/** Navegación: primero la red, y si no hay, lo último que guardamos. */
async function primeroLaRed(request) {
  const cache = await caches.open(CACHE_SHELL);
  try {
    const respuesta = await fetch(request);
    if (respuesta.ok) cache.put(request, respuesta.clone());
    return respuesta;
  } catch (error) {
    const guardada = await cache.match(request, { ignoreSearch: true });
    if (guardada) return guardada;
    // Última red: la home. Es la pantalla que el brief pide que funcione sin
    // conexión, y el aviso de "estás sin internet" ya lo muestra la app.
    const home = await cache.match("/");
    if (home) return home;
    throw error;
  }
}

/** Estáticos hasheados por Next: si están, se sirven del caché sin preguntar. */
async function primeroElCache(request) {
  const cache = await caches.open(CACHE_ESTATICOS);
  const guardada = await cache.match(request);
  if (guardada) return guardada;

  const respuesta = await fetch(request);
  if (respuesta.ok) cache.put(request, respuesta.clone());
  return respuesta;
}

self.addEventListener("fetch", (evento) => {
  const { request } = evento;
  const url = new URL(request.url);

  if (esIntocable(request, url)) return;

  if (request.mode === "navigate") {
    evento.respondWith(primeroLaRed(request));
    return;
  }

  if (esEstatico(url)) {
    evento.respondWith(primeroElCache(request));
  }
  // Todo lo demás (imágenes remotas, etc.) sigue de largo a la red.
});
