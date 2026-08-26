# IN THE STREET — app de pedidos

PWA de pedidos para IN THE STREET (@inthestreet25), hamburguesería de Marcos
Juárez, Córdoba. Reemplaza el pedido por WhatsApp con un sistema de comandas:
el cliente arma el pedido, la cocina lo ve entrar en un panel, y el cliente
sigue el estado en vivo.

**No hay login, no hay pasarela de pago.** El pago es siempre presencial,
efectivo o transferencia. El identificador del pedido es un código corto
(`A-47`) guardado en `localStorage`.

---

## Arrancar en local

Hacen falta **dos procesos a la vez**: el backend de Convex y Next.

```bash
npm install
cp .env.example .env.local     # y completá los valores

npm run convex                 # terminal 1 — backend local en :3210
npm run dev                    # terminal 2 — app en :3000
npm run seed                   # una sola vez: carga el menú placeholder
```

`npm run convex` levanta un deployment **anónimo local** y completa
`CONVEX_DEPLOYMENT` y `NEXT_PUBLIC_CONVEX_URL` solo. Sin él corriendo, la app
carga pero no ve datos.

El panel de cocina está en `/panel`, detrás del PIN de `PIN_PANEL`.

## Verificar

```bash
npm run build          # build de producción
npx tsc --noEmit       # tipos
npx eslint app components lib convex types
```

Los tres tienen que pasar limpios antes de commitear.

---

## Cómo está armado

| Pieza | Decisión |
|---|---|
| Next.js 16 (App Router) + TypeScript | Turbopack |
| Convex | schema, mutations y **subscripciones reactivas** — el estado del pedido llega solo, sin polling |
| Tailwind v4 | configuración CSS-first en `app/globals.css`. **No hay `tailwind.config.ts` y no hay que crearlo** |
| Zustand + persist | carrito en `localStorage` |
| Zod | validación del checkout |
| Service worker | escrito a mano en `public/sw.js`. `next-pwa` no soporta Next 16 + Turbopack |

### Mapa de carpetas

```
app/(tienda)/      home, hero, menú
app/checkout/      formulario de pedido
app/pedido/        seguimiento en vivo por código
app/panel/         comandas, ABM de menú/promos, ajustes
convex/            schema, queries, mutations, seed
components/        menu/ carrito/ seguimiento/ panel/ pwa/
lib/               formato, horario, pedido/, pwa/
```

**`CONTRATOS.md` es la fuente de verdad** del schema, los tokens de diseño, los
tipos y los estados del pedido. Leelo antes de tocar nada.

### Estados del pedido

```
recibido → en_cocina → listo → en_camino (solo delivery) → entregado
```

Más `cancelado` como terminal.

---

## Detalles que no son obvios

- **El ETA no es optimista a propósito.** Es `minutosBase` más la cantidad de
  pedidos en cola. Si hay 8 adelante, el ETA lo refleja. Prometer 20 minutos y
  tardar 75 es la queja principal del local: no la reintroduzcas.
- **Sin conexión, el botón de confirmar se deshabilita.** Convex no falla cuando
  está desconectado: encola la mutation y la promesa nunca resuelve. Si no se
  corta antes, la UI se queda en "Mandando el pedido…" y la cocina nunca lo ve.
- **El service worker nunca cachea `/panel` ni `/api`.** La cocina siempre tiene
  que ver datos frescos.
- **La única animación de la app es el relleno del titular en outline.** La
  excepción deliberada es el parpadeo de la comanda nueva en el panel, que es
  una alarma operativa y tiene respaldo estático.
- **Cheddar sobre hueso no pasa contraste** (1,43:1). En las superficies
  `.papel-deli` los precios van en negro o rojo, nunca en cheddar.
- El horario del local (miércoles a domingos, 19:30 a 23:00) se edita desde
  `/panel/ajustes`, no en código. Fuera de horario el checkout se deshabilita.

---

## Poner en producción

Ver el checklist de lanzamiento. En resumen:

1. `npx convex deploy` — el deployment local anónimo **no sirve en producción**.
2. Deploy en Vercel con las variables de `.env.example` cargadas.
3. `NEXT_PUBLIC_URL_BASE` con el dominio real, o la preview del link no carga.
4. Cargar el menú real desde `/panel/menu`.
5. Cambiar el link de la bio de Instagram. Ese es el lanzamiento.
