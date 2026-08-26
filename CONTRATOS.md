# CONTRATOS — IN THE STREET

Fuente de verdad para todos los subagentes. **No modifiques este archivo.** Si necesitás
un cambio en el schema, los tokens o los tipos, reportalo al orquestador.

---

## 1. Stack real instalado

| Pieza | Versión / decisión |
|---|---|
| Next.js | 16.3.3, App Router, TypeScript |
| React | 19.2.8 |
| Tailwind | **v4** — configuración CSS-first en `app/globals.css` con `@theme inline`. **No existe `tailwind.config.ts` y no hay que crearlo.** |
| Convex | deployment **local anónimo** (`CONVEX_AGENT_MODE=anonymous npx convex dev`) en `http://127.0.0.1:3210` |
| Estado del carrito | Zustand + `persist` en `localStorage` |
| Validación | Zod |
| Fuentes | `next/font/google` — `Big_Shoulders` (600, 800) e `Inter_Tight`. Google renombró "Big Shoulders Display" a "Big Shoulders": el import es `Big_Shoulders`. |

Comandos:

```bash
npm run dev            # Next en :3000 (necesita el backend Convex corriendo)
npm run convex         # backend Convex local en :3210
npm run seed           # carga el menú placeholder (no pisa datos existentes)
npm run build
```

---

## 2. Tokens de diseño

Definidos como variables CSS en `:root` y expuestos a Tailwind vía `@theme inline`.
**Usá las clases de Tailwind, no los hex sueltos.**

| Token | Hex | Clase Tailwind | Uso |
|---|---|---|---|
| `--negro` | `#0A0A0A` | `bg-negro` `text-negro` | ground dominante de toda la app |
| `--rojo` | `#CE1126` | `bg-rojo` `text-rojo` | impacto: hero, CTA, promo del día |
| `--hueso` | `#F7F4EE` | `bg-hueso` `text-hueso` | texto, bordes de sticker, superficies claras |
| `--cheddar` | `#FFC629` | `bg-cheddar` `text-cheddar` | precios, acentos, estado activo, foco |
| `--celeste` | `#22A7E0` | `bg-celeste` `text-celeste` | secundario del mural |
| `--lechuga` | `#1FA97E` | `bg-lechuga` `text-lechuga` | estado "listo para retirar" |
| `--tinta` | `#141317` | `bg-tinta` `border-tinta` | bordes y divisores sobre negro |

Tipografía: `font-display` (Big Shoulders, mayúsculas, 800) · `font-sans` (Inter Tight).
Los precios van en `font-display` sobre `text-cheddar`. **No hay monoespaciada.**

### Clases de componente ya escritas en `globals.css`

| Clase | Qué hace |
|---|---|
| `.titular-outline` | Elemento firma: palabra en contorno hueso sin relleno. Con `data-relleno="true"` se rellena de rojo en 200ms. Agregá `.titular-outline-grueso` para stroke de 3px. |
| `.filetes` | Filetes verticales de 1px en hueso partiendo el contenedor en cuatro. Va en un div absoluto sobre el hero. |
| `.sticker` | Chip die-cut: borde hueso 2px, sombra dura, sin blur. `data-activo="true"` lo pinta rojo. |
| `.papel-deli` | Fondo de papel a cuadros. Superficie clara: el texto va en negro. |
| `.borde-duro` | Borde 2px tinta + sombra dura 4px. Para tarjetas. |
| `.barra-inferior` | `padding-bottom: max(1rem, env(safe-area-inset-bottom))`. Obligatorio en la barra fija. |
| `.rot-1` `.rot-2` `.rot-3` | Rotaciones de sticker (-1.5°, 1.5°, -2.5°). |
| `.sin-scrollbar` | Oculta la scrollbar en carruseles horizontales de chips. |

`prefers-reduced-motion` ya está neutralizado globalmente. **No agregues animaciones más allá
del relleno del titular.** Cero degradados, cero glassmorphism, cero sombras suaves.

---

## 3. Schema de Convex (`convex/schema.ts`)

### `categorias`
`nombre: string` · `slug: string` · `orden: number` · `activa: boolean`
Índice: `por_slug`. Slugs sembrados: `hamburguesas`, `lomos`, `papas`, `bebidas`, `combos`.

### `productos`
`nombre` · `descripcion` · `precio: number` · `categoriaSlug: string` · `imagen?: string`
· `disponible: boolean` · `destacado: boolean` · `orden: number`
Índices: `por_categoria`, `por_disponible`.

### `opciones`
**Se enganchan por categoría, no por producto.** Todas las hamburguesas comparten punto de
cocción y extras.
`categoriaSlug: string` · `tipo: "punto_coccion" | "extra" | "quitar"` · `nombre: string`
· `precio: number` · `orden: number` · `activa: boolean`
Índice: `por_categoria`.

### `pedidos`
`codigo: string` (ej. `A-47`) · `estado` · `modalidad: "retiro" | "delivery"` · `nombre`
· `telefono` · `direccion?` · `referencia?` · `metodoPago: "efectivo" | "transferencia"`
· `pagaCon?: number` · `nota?` · `subtotal` · `recargoDelivery` · `total` · `creadoEn: number`
· `enCocinaEn?` `listoEn?` `enCaminoEn?` `entregadoEn?` `canceladoEn?` (sellos de tiempo)
· `motivoCancelacion?` · `minutosEstimados: number` · `pedidosEnColaAlCrear: number`
Índices: `por_codigo`, `por_estado`, `por_creado`.

`minutosEstimados` se **congela al crear el pedido**. No se recalcula después: la promesa que
se le hizo al cliente no cambia.

### `items_pedido`
`pedidoId: Id<"pedidos">` · `productoId?` · `nombreProducto` · `categoriaSlug`
· `precioUnitario` · `cantidad` · `puntoCoccion?` · `extras: {nombre, precio}[]`
· `quitar: string[]` · `nota?` · `subtotal`
Índice: `por_pedido`.

### `config_local` (singleton, una sola fila)
`nombre` · `direccion` · `telefono` · `whatsapp` · `instagram` · `aliasTransferencia`
· `minutosBase: number` · `minutosPorPedidoEnCola: number` · `recargoDelivery: number`
· `zonaDelivery` · `pausado: boolean` · `mensajePausa` · `diasAbiertos: number[]`
· `horaApertura: string` · `horaCierre: string`

`diasAbiertos` usa números de JS: `0` = domingo. Sembrado: `[3,4,5,6,0]` (miércoles a domingo).

### `promos_dia`
`diaSemana: number` · `titulo` · `descripcion` · `activa: boolean`. Índice: `por_dia`.

---

## 4. Estados del pedido

```
recibido → en_cocina → listo → en_camino (solo delivery) → entregado
                                                cancelado (terminal, desde cualquiera)
```

En retiro, `listo` es el estado final antes de `entregado`; `en_camino` no aplica.

Etiquetas de cara al cliente (exportadas en `types/index.ts` como `ETIQUETA_ESTADO`):

| Estado | Cliente | Panel |
|---|---|---|
| `recibido` | "Ya lo pedimos" | Recibidos |
| `en_cocina` | "En la plancha" | En cocina |
| `listo` | "Listo para retirar" | Listos |
| `en_camino` | "En camino" | En camino |
| `entregado` | "Entregado" | Entregados |
| `cancelado` | "Cancelado" | Cancelados |

---

## 5. API de Convex

### Queries

| Función | Args | Devuelve |
|---|---|---|
| `api.menu.menuCompleto` | — | `{ categorias, productos, opciones }` ya ordenados y filtrados por activo. **Usá esta, no las tres sueltas.** |
| `api.menu.listarProductos` | — | todos los productos, incluso no disponibles (para el panel) |
| `api.menu.listarCategorias` | — | categorías activas |
| `api.menu.listarOpciones` | — | opciones activas |
| `api.menu.listarOpcionesTodas` | — | todas, incluidas las desactivadas (para el ABM del panel) |
| `api.config.leerConfig` | — | `config_local`, con fallback a los valores iniciales si nadie corrió el seed |
| `api.config.promoDeHoy` | `{ diaSemana: number }` | la promo del día o `null` |
| `api.config.listarPromos` | — | todas las promos, ordenadas por día |
| `api.pedidos.eta` | — | `{ enCola, minutos, minutosBase }` — **el ETA honesto** |
| `api.pedidos.porCodigo` | `{ codigo: string }` | `{ pedido, items, adelante, local } \| null` |
| `api.pedidos.activos` | — | pedidos en estado activo **con sus `items` embebidos**, ordenados por `creadoEn` |
| `api.pedidos.cerradosDeHoy` | — | entregados y cancelados de las últimas 12 h |

### Mutations

| Función | Args | Notas |
|---|---|---|
| `api.pedidos.crear` | `{ nombre, telefono, modalidad, direccion?, referencia?, metodoPago, pagaCon?, nota?, items: [{ productoId, cantidad, puntoCoccion?, extras: string[], quitar: string[], nota? }] }` | Devuelve `{ codigo, pedidoId }`. **Los precios se recalculan en el servidor.** El cliente manda solo la selección. |
| `api.pedidos.avanzarEstado` | `{ pedidoId, estado }` | Sella el timestamp correspondiente |
| `api.pedidos.cancelar` | `{ pedidoId, motivo? }` | |
| `api.config.guardarConfig` | todos los campos opcionales | Patch parcial; crea la fila si no existe |
| `api.config.alternarPausa` | `{ pausado: boolean }` | |
| `api.config.guardarPromo` | `{ promoId?, diaSemana, titulo, descripcion, activa }` | |
| `api.config.borrarPromo` | `{ promoId }` | |
| `api.menu.guardarProducto` | `{ productoId?, nombre, descripcion, precio, categoriaSlug, imagen?, disponible, destacado, orden }` | |
| `api.menu.borrarProducto` | `{ productoId }` | |
| `api.menu.cambiarDisponibilidad` | `{ productoId, disponible }` | |
| `api.menu.guardarOpcion` / `api.menu.borrarOpcion` | | |
| `api.seed.correrSeed` | — | Idempotente: no hace nada si ya hay config |

### Errores que tira `api.pedidos.crear`

El mensaje del `Error` es un código seco. **Traducilo a la voz de la marca en la UI.**

| Código | Significado |
|---|---|
| `PAUSADO` | La cocina cortó la recepción |
| `CERRADO` | Fuera del horario de atención |
| `CARRITO_VACIO` | |
| `FALTA_DIRECCION` | Delivery sin dirección |
| `AGOTADO:<nombre>` | Ese producto se agotó mientras armaba el pedido |
| `PRODUCTO_INEXISTENTE` | |
| `PAGA_CON_INSUFICIENTE` | El "¿con cuánto abonás?" es menor al total |

Convex envuelve el mensaje, así que buscalo con `String(error).includes("PAUSADO")`.

---

## 6. Tipos compartidos (`types/index.ts`)

```ts
EstadoPedido, Modalidad, MetodoPago, TipoOpcion
Categoria, Producto, Opcion, Pedido, ItemPedido, ConfigLocal, PromoDia
ProductoId, PedidoId
OpcionElegida    // { nombre, precio }
ItemCarrito      // línea del carrito, antes de existir en Convex
PedidoConItems
ESTADOS_ACTIVOS, ETIQUETA_ESTADO, ETIQUETA_ESTADO_PANEL, DIAS_SEMANA
```

`ItemCarrito` tiene `lineaId`: el mismo producto con distinta configuración es otra línea.
Generalo concatenando `productoId + puntoCoccion + extras ordenados + quitar ordenados + nota`.

---

## 7. Helpers compartidos (`lib/`)

### `lib/formato.ts`
- `precio(valor: number): string` — `12500` → `$12.500`. **Usala siempre, nunca formatees a mano.**
- `normalizarTelefono(entrada)` / `telefonoValido(entrada)` — 10 u 11 dígitos, tolera `+54`, el `9` de móvil, el `0` de larga distancia, el `15` (que va **después** de la característica) y guiones/paréntesis/espacios. El checkout guarda el teléfono **normalizado**, no lo que tipeó el cliente.
- `minutosTranscurridos(desde, hasta?)` · `textoTranscurrido(desde)` → `"hace 12 min"`
- `horaCorta(ts)` → `"20:45"` en hora Argentina

### `lib/horario.ts`
- `estaAbierto(horario, ts?)` — `horario` es `{ diasAbiertos, horaApertura, horaCierre }`
- `estadoApertura(horario, ts?)` → `{ abierto, proximaApertura }` con el texto listo para mostrar
- `ahoraEnArgentina(ts?)` → `{ diaSemana, minutosDelDia, hora, minuto }` — **usalo para `promoDeHoy`**
- `textoDiasAbiertos(dias)` → `"miércoles, jueves, viernes, sábado y domingo"`

Offset fijo UTC-3. Argentina no tiene horario de verano.

---

## 8. Propiedad de archivos — Ola 2

Cada subagente es **dueño exclusivo** de sus rutas. Nadie edita fuera de su dominio.

| Subagente | Rutas propias |
|---|---|
| `agente-catalogo` | `app/(tienda)/`, `components/menu/` |
| `agente-pedido` | `components/carrito/`, `app/checkout/`, `lib/pedido/` |
| `agente-seguimiento` | `app/pedido/[codigo]/`, `components/seguimiento/` |
| `agente-panel` | `app/panel/`, `components/panel/`, `app/api/panel/` |

**Congelado para todos:** `convex/`, `types/`, `lib/formato.ts`, `lib/horario.ts`,
`app/globals.css`, `app/layout.tsx`, `components/ProveedorConvex.tsx`, `CONTRATOS.md`.

### Contrato entre catálogo y pedido

El store del carrito **ya está escrito y congelado** en `lib/pedido/store.ts`. Nadie lo reescribe.

```ts
// lib/pedido/store.ts  — CONGELADO
useCarrito(): {
  items: ItemCarrito[]
  agregar(item: Omit<ItemCarrito, "lineaId">): void   // el lineaId se calcula solo
  cambiarCantidad(lineaId: string, cantidad: number): void
  quitarLinea(lineaId: string): void
  vaciar(): void
  cantidadTotal: number
  subtotal: number
  abierto: boolean
  abrirCarrito(): void
  cerrarCarrito(): void
}

useCarritoHidratado(): boolean
// El store se hidrata desde localStorage. Hasta que devuelva true, no pintes
// cantidades ni totales o Next tira error de hidratación.

// lib/pedido/codigoGuardado.ts  — CONGELADO
leerCodigos(): string[]        // del más nuevo al más viejo, máximo 10
guardarCodigo(codigo: string): void
ultimoCodigo(): string | null
```

`agente-catalogo` importa `useCarrito` y llama `agregar` desde el bottom sheet del producto.
`agente-pedido` es dueño del componente `<Carrito />` y de la barra fija inferior con el total,
y los exporta desde `components/carrito/`.
`agente-catalogo` los renderiza en el layout de `app/(tienda)/`.

---

## 9. Reglas duras que no se negocian

1. **Sin login, sin registro, sin sesiones.** El identificador es el código corto en `localStorage`.
2. **Sin integración de pagos.** `efectivo` o `transferencia` es una elección informativa.
3. Si elige efectivo → **"¿Con cuánto abonás?"** para calcular el vuelto.
4. **Mobile-first real**: se diseña a 390px. Área táctil mínima **44px**. Botón de confirmar fijo
   abajo con `.barra-inferior`.
5. **Español rioplatense con voseo.** "Agregá al pedido", "Elegí tu punto", "Ya lo pedimos".
   Nunca "Añadir al carrito", nunca "Enviar".
6. Precios con `precio()` de `lib/formato.ts`.
7. Fuera de horario o con la cocina pausada: **el checkout se deshabilita** y muestra cuándo vuelve.
8. Tiene que cargar rápido en 4G y no romperse en el navegador in-app de Instagram.

---

## 10. Datos placeholder pendientes de confirmar

Todo lo de `convex/datosIniciales.ts` es inventado y se edita desde el panel sin tocar código:

- Dirección: **Av. Santa Fe 627** (se eligió la fuente de Google)
- Menú y precios: 19 productos placeholder en las cinco categorías
- Logo: `public/logo.svg` es un placeholder dibujado a mano. **Falta el vector real.**
- Delivery: precio único **$1.500**, toda Marcos Juárez
- Alias de transferencia: `inthestreet.mj`
- Tiempo base: **35 minutos** + 4 min por pedido en cola
- Promos: una por día de miércoles a domingo
- Aviso de pedido nuevo: **solo el panel**, con sonido. Impresora térmica queda para v2.
