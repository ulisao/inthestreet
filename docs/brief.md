# IN THE STREET — App de pedidos (spec + prompt para Claude Code)

> Versión 2 — dirección visual corregida contra el perfil real de Instagram.

---

## 0. El local

| Dato | Valor |
|---|---|
| Nombre | IN THE STREET (@inthestreet25) |
| Rubro | **Hamburguesas y lomos** — los lomos son mitad del negocio, no un extra |
| Dirección | Av. Santa Fe 627, Marcos Juárez (X2580) — *Google. Otra fuente dice 25 de Mayo 466. CONFIRMAR.* |
| Teléfono | 3472 529023 |
| Horario | **Miércoles a domingos, 19:30 a 23:00** (según bio de IG) |
| Formato | Solo takeaway — no tiene mesas. Retiro en local + delivery propio |
| Canal de pedidos actual | **Únicamente WhatsApp.** El link de la bio es un `wa.me` |
| Instagram | 5.731 seguidores con solo 16 publicaciones |

**El dato de distribución:** 5.731 seguidores en un pueblo de 31.000 habitantes. Casi 1 de cada 5 marcosjuarenses sigue la cuenta. No hace falta pauta ni SEO: el día del lanzamiento se cambia el link de la bio de `wa.me` a la app y ya está la mitad del pueblo adentro. **El único canal de adquisición que importa es ese link.**

**Lo que dicen las reseñas (3.6 con 18 opiniones):**

- El producto gusta: "riquísimas", "muy buenas". La comida no es el problema.
- El problema es **la espera**: demoras de 60 a 75 minutos cuando prometen 20. Es la queja repetida en casi todas las negativas.
- Se pierden pedidos: gente que escribe por WhatsApp, espera una hora, y el local nunca registró el pedido.
- Porciones exageradas — pan e ingredientes de más. Es identidad de marca, no un defecto a esconder.
- Regalan stickers de la marca.

**Conclusión de producto:** esta app no es un menú lindo. Es un **sistema de comandas** que reemplaza el caos de tomar pedidos por chat. Si solo muestra hamburguesas y manda un WhatsApp, no cambió nada — el pedido sigue siendo un mensaje suelto que alguien tiene que transcribir. Lo que mueve la aguja: ETA honesto, cola visible, panel de cocina y botón de pausa.

---

## 1. Dirección visual

Basada en el perfil real: logo, mural del local y placas de posteo.

### Qué es la marca

No es street food minimalista ni gourmet oscuro. Es **skate, sticker y cartoon de contorno negro grueso**. El logo es una calcomanía die-cut circular: hamburguesa dibujada arriba de una patineta, banda roja con el wordmark en script, borde blanco de sticker. El mural del local es tattoo-flash / lowbrow: líneas negras gordas, cheddar explotando, colores planos y saturados. Las placas son campo rojo pleno con titulares condensados en **outline blanco** y filetes verticales finos partiendo la imagen.

Es una marca ruidosa, dibujada a mano, de pueblo. Vamos a esa, no la limpiamos.

### Tokens de color

```
--negro     #0A0A0A   ground de la app (sus fotos ya viven sobre negro)
--rojo      #CE1126   color de impacto — hero, CTA, promo del día
--hueso     #F7F4EE   texto, bordes de sticker, superficies claras
--cheddar   #FFC629   precios, acentos, estado activo
--celeste   #22A7E0   secundario del mural — lo que salva la paleta del cliché fast-food
--lechuga   #1FA97E   estado "listo para retirar"
--tinta     #141317   bordes y divisores sobre negro
```

Rojo y amarillo juntos son el uniforme de toda cadena de hamburguesas del planeta. Lo que nos saca de ahí son tres cosas: **negro como fondo dominante** (el rojo aparece en momentos, no como campo), el **celeste del mural**, y cero degradados, cero brillos, cero 3D. Contorno negro plano, siempre.

### Tipografía

- **Display:** `Big Shoulders Display` (Google Fonts) en mayúsculas. Es la condensada atlética más cercana a sus placas. Peso 800.
- **Body:** `Inter Tight`. Callado a propósito — la foto y el titular hacen el ruido.
- **Wordmark:** **pedir el logo en SVG y usarlo.** El script de "IN THE STREET" no se imita con una fuente; queda berreta.

Sin fuente monoespaciada. Los precios van en Big Shoulders sobre `--cheddar`.

### Elemento firma: el titular en outline sobre la foto

Su gesto más propio y el que nadie más en el rubro usa: **una palabra gigante en condensada, solo contorno blanco, sin relleno, cruzando por encima de la foto del producto**. En CSS es exacto:

```css
color: transparent;
-webkit-text-stroke: 2px var(--hueso);
```

Va en el hero y en la cabecera de cada categoría. Micro-interacción única de toda la app: al tocar, la palabra se rellena de `--rojo` en 200ms. Nada más se anima.

Segundo gesto, tomado de sus placas: **filetes verticales de 1px en hueso** partiendo el hero en cuatro. Y los chips de categoría se ven como stickers die-cut — rotados 1 a 3 grados, borde hueso grueso, sombra dura, sin blur.

Textura de superficie: **papel de deli a cuadros** (aparece en su feed) como fondo del detalle del pedido. Sutil, opacidad baja.

### Lo que NO queremos

- Fondo crema con serif de alto contraste y acento terracota.
- Negro puro con un solo verde ácido.
- Layout tipo diario con hairlines y radio cero.
- Degradados, glassmorphism, sombras suaves, íconos de línea genéricos.

---

## 2. Stack

- **Next.js (App Router) + TypeScript** — PWA, mobile-first.
- **Convex** — schema, mutations y sobre todo **subscripciones reactivas**: el cliente ve cambiar el estado de su pedido en vivo y la cocina ve entrar pedidos sin refrescar.
- **Sin Clerk. Sin Mercado Pago.** No hay auth de cliente y el pago es presencial.
- **Tailwind** con los tokens de arriba como variables CSS.
- Panel de cocina detrás de un PIN en variable de entorno. No es auth real, es una puerta.

---

## 3. PROMPT MAESTRO PARA CLAUDE CODE

> Copiá desde acá abajo.

---

Sos el orquestador de un equipo de subagentes construyendo una PWA de pedidos para **IN THE STREET**, una hamburguesería de Marcos Juárez, Córdoba, Argentina.

Leé este brief completo antes de escribir una línea. Después seguí el protocolo de orquestación al pie de la letra.

### Contexto de negocio

Local de comida de calle, **solo takeaway**, abre de miércoles a domingos a la noche. Vende **hamburguesas y lomos**. Hoy toma los pedidos únicamente por WhatsApp y ahí está su problema: pedidos que se pierden en el chat y demoras de más de una hora cuando prometen veinte minutos. La app existe para arreglar eso.

**Sin autenticación.** El cliente entra, arma el pedido, completa un formulario con sus datos y confirma. **El pago es siempre presencial**: efectivo o transferencia, al retirar en el local o al recibir el delivery. No hay pasarela de pago, no hay tarjetas, no hay cuenta de usuario.

### Reglas duras (no negociables)

1. Nada de login, registro, contraseñas de cliente, OAuth ni sesiones. El identificador del pedido es un código corto (ej. `A-47`) guardado en `localStorage` para que el cliente vuelva a ver su estado.
2. Nada de integración de pagos. En el checkout el método de pago es una elección informativa: `efectivo` o `transferencia`.
3. Si elige efectivo, mostrar **"¿Con cuánto abonás?"** para calcular el vuelto. Es el dato que más le sirve al repartidor.
4. Mobile-first real. Se diseña a 390px y recién después se ensancha. Área táctil mínima 44px. El botón de confirmar queda fijo abajo, respetando `safe-area-inset-bottom`.
5. Todo en español rioplatense, con voseo. "Agregá al pedido", "Elegí tu punto", "Ya lo pedimos". Nunca "Añadir al carrito" ni "Enviar".
6. Precios en pesos argentinos, formato `$12.500` — punto de miles, sin decimales.
7. La app respeta el horario: fuera de **miércoles a domingos de 19:30 a 23:00** (hora Argentina, UTC-3) el checkout se deshabilita y muestra cuándo vuelve a abrir. No se toman pedidos con el local cerrado.
8. El link de la bio de Instagram va a apuntar acá. La app tiene que cargar rápido en 4G de pueblo y no romperse en el navegador in-app de Instagram — probalo ahí específicamente.

### Dirección visual

Aplicá exactamente los tokens, tipografías y elementos firma de la sección "Dirección visual" de arriba. No los reinterpretes ni los "mejores". Si algo no está especificado, resolvelo dentro del concepto: sticker, skate, cartoon de contorno negro grueso, rojo de impacto sobre negro.

### Protocolo de orquestación con subagentes

Trabajás en tres olas. **No arranques una ola hasta que la anterior esté cerrada.** Los contratos (schema y tokens) tienen que existir antes de que nadie escriba UI, o vas a tener cuatro agentes inventando cuatro versiones del mismo objeto.

**Regla de propiedad de archivos:** cada subagente es dueño exclusivo de sus rutas. Ninguno edita un archivo fuera de su dominio. Si necesita un cambio afuera, lo reporta al orquestador y el orquestador decide.

---

**OLA 1 — Contratos (secuencial, uno solo)**

`agente-cimientos`

- Scaffold de Next.js + TypeScript + Tailwind + Convex.
- `convex/schema.ts` con las tablas: `productos`, `categorias`, `opciones`, `pedidos`, `items_pedido`, `config_local`, `promos_dia`.
- Tokens de diseño como variables CSS en `globals.css` y `tailwind.config.ts` extendido. Tipografías con `next/font`.
- Seed con menú placeholder en **cinco categorías: Hamburguesas, Lomos, Papas, Bebidas, Combos**. El dueño lo edita después.
- Tipos TypeScript compartidos en `types/`.
- `CONTRATOS.md`: schema, tipos, tokens y estados del pedido. **Fuente de verdad para todos los demás subagentes.**

Estados del pedido: `recibido` → `en_cocina` → `listo` → `en_camino` (solo delivery) → `entregado`. Más `cancelado` como terminal.

Cerrá la ola verificando que `npm run build` pase y que el schema esté desplegado en Convex.

---

**OLA 2 — Construcción (cuatro subagentes en paralelo)**

Lanzá los cuatro a la vez. Todos leen `CONTRATOS.md` primero.

`agente-catalogo` — dueño de `app/(tienda)/` y `components/menu/`
- Home con hero: foto grande del producto más característico con el titular en outline encima y los filetes verticales. Sin carrusel.
- **Promo del día**: el local ya publica por día de la semana ("JUEVES", "VIERNES CON ESTILO"). Bloque destacado que lee `promos_dia` y muestra la del día actual.
- Grilla de menú con chips de categoría estilo sticker, sticky al scrollear.
- Ficha de producto en bottom sheet, no en página nueva.
- Personalizador: punto de cocción, extras con precio incremental, quitar ingredientes, nota libre.
- Estado agotado, manejado desde el panel.

`agente-pedido` — dueño de `components/carrito/`, `app/checkout/`, `lib/pedido/`
- Estado del carrito con Zustand, persistido en `localStorage`.
- Carrito como bottom sheet.
- Formulario de checkout: nombre, teléfono (validado formato AR), modalidad (retiro / delivery), dirección y referencia si es delivery, método de pago, "¿con cuánto abonás?" si es efectivo, nota general.
- Validación con Zod. Los errores dicen qué pasó y cómo se arregla, en la voz de la marca.
- Al confirmar: crea el pedido en Convex, genera el código corto, lo guarda en `localStorage`, redirige a `/pedido/[codigo]`.
- Recargo de delivery configurable desde `config_local`.

`agente-seguimiento` — dueño de `app/pedido/[codigo]/`
- Pantalla de estado en vivo por subscripción de Convex, sin polling.
- Detalle completo del pedido sobre papel a cuadros, con el número de pedido gigante — es lo que el cliente muestra en el mostrador.
- Línea de tiempo de estados con tiempo transcurrido real.
- ETA honesto: `config_local.minutos_base` **más** la cantidad de pedidos activos en cola. Si hay 8 adelante, el ETA lo refleja. **Nunca mostrar un ETA optimista.** Esta es la feature que arregla la peor queja del local.
- Botón de WhatsApp al local para consultar.
- Si no hay pedido en `localStorage`, input para pegar el código.

`agente-panel` — dueño de `app/panel/`
- Puerta con PIN desde variable de entorno.
- Tablero de comandas en columnas por estado, con botones para avanzar.
- Sonido y aviso visual al entrar un pedido nuevo. Sin esto la cocina no se entera.
- Cronómetro por comanda, en rojo pasados los 30 minutos.
- **Botón "Pausar pedidos"**: corta la recepción y muestra "Cocina saturada, volvemos en un rato" en la tienda. Directo contra la queja de aceptar más pedidos de los que pueden hacer.
- ABM de menú: precios, disponibilidad, alta y baja.
- ABM de promo del día, una por día de la semana.
- Ajustes: minutos base de preparación, recargo de delivery, horarios.

---

**OLA 3 — Integración (secuencial)**

`agente-pwa-qa`

- `manifest.json`, íconos, service worker (next-pwa), splash. Instalable en Android e iOS.
- Cacheo offline del menú. Sin red se ve el menú pero no se confirma pedido, con mensaje claro.
- Accesibilidad: foco de teclado visible, labels reales en cada input, contraste AA — **verificá el hueso sobre rojo y el cheddar sobre negro, que son los dos pares de riesgo** — y `prefers-reduced-motion` respetado.
- Lighthouse mobile: Performance > 90, Accesibilidad > 95.
- Metadata Open Graph: el link se va a compartir por WhatsApp e Instagram, la preview importa.
- Prueba real en el navegador in-app de Instagram.
- Recorrido end-to-end de humo: un pedido de retiro y uno de delivery, de home a entregado.

Al terminar, hacé una crítica propia: abrí la app a 390px, mirala, y sacá lo que sobra. Si algo parece decoración, va afuera.

### Cómo reportás

Al cerrar cada ola: qué se construyó, qué decisiones tomaste que no estaban en el brief, y qué quedó bloqueado esperando data real del cliente. Sin relleno.

---

## 4. Lo que falta confirmar con el dueño

Bloquea partes del desarrollo. Conseguilo antes de la Ola 2:

1. **Dirección real** — Google dice Av. Santa Fe 627, otra fuente dice 25 de Mayo 466.
2. **Menú y precios reales** de hamburguesas y lomos, con fotos.
3. **Logo en vector.** Sin el SVG del sticker no hay identidad. Es el pedido más importante de esta lista.
4. **Zona de delivery y recargo** — ¿toda Marcos Juárez? ¿precio único o por zona?
5. **Alias de transferencia** para mostrar en el checkout.
6. **Tiempo base real de preparación** — el número honesto, no el que dicen por WhatsApp.
7. **Promos por día de la semana** — cuáles son y qué días.
8. **A dónde llega el aviso del pedido nuevo** — ¿WhatsApp del local? ¿solo el panel? ¿impresora térmica más adelante?

Las fotos están cubiertas: su propio feed ya tiene material bueno de plancha y producto. Pediles los originales.

---

## 5. Alcance

Fuera de esta versión, candidatos a v2: Mercado Pago cuando quieran cobrar online, historial de pedidos por teléfono, cupones, fidelidad con los stickers que ya regalan, tracking del repartidor.

Impresora térmica en cocina: es la mejora de operación más grande después de esto. Si el panel imprime la comanda solo, el mostrador deja de transcribir a mano.
