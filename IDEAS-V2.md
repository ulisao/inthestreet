# IDEAS PARA LA 2.0 — IN THE STREET

Lo que quedó afuera de la primera versión a propósito, con lo que ya sabemos de
cada cosa: qué implica, qué toca del código actual y qué hay que decidir antes
de empezar. **Nada de esto está construido.**

Orden sugerido de ataque al final del archivo.

---

## 1. Impresora térmica en la cocina

**La mejora de operación más grande después de la app.** Hoy el panel muestra la
comanda en pantalla y alguien la lee. Con impresora, la comanda sale sola en
papel apenas entra el pedido y el mostrador deja de transcribir a mano.

### Por qué importa acá
El problema original del local no es la comida, es que los pedidos se pierden.
La pantalla ya lo arregla en parte, pero depende de que alguien la mire. El
papel no depende de nadie: aparece.

### Las tres formas de hacerlo, de menos a más laburo

**a) Impresora de red (ESC/POS por TCP)**
La más limpia. Una impresora térmica con puerto Ethernet o WiFi en la red del
local, y un proceso que le manda los bytes ESC/POS directamente al puerto 9100.

- El navegador **no puede** abrir sockets TCP: esto no sale desde la web.
- Hace falta algo corriendo en el local: una Raspberry Pi, o la misma tablet con
  una app chica, suscrito a `api.pedidos.activos` de Convex.
- Ventaja: imprime aunque nadie toque nada, y sobrevive a que se cierre el navegador.
- Es el camino que elegiría.

**b) WebUSB / WebSerial desde el navegador**
La tablet se conecta por cable a la impresora y el navegador le manda ESC/POS.

- Solo Chrome/Edge de escritorio y Android. **iOS no lo soporta**: si la cocina
  usa un iPad, este camino no existe.
- Requiere que el usuario autorice el dispositivo a mano cada sesión.
- Cero infraestructura extra, pero frágil.

**c) Imprimir el HTML con `window.print()`**
Un CSS de impresión con el ancho del ticket (58 u 80 mm) y listo.

- Funciona en cualquier lado y es casi gratis de implementar.
- Pero abre el diálogo de impresión: alguien tiene que apretar "Imprimir" en
  cada pedido, que es justo lo que queremos evitar.
- Sirve como parche del día uno mientras se arma (a).

### Qué hay que decidir antes
- Qué impresora tienen o van a comprar, y si es de red o USB. **El modelo
  cambia todo el diseño.** Preguntar antes de cotizar.
- Ancho del papel: 58 mm o 80 mm.
- ¿Imprime automático al entrar el pedido, o con un botón "Reimprimir"? Lo ideal
  es automático + botón de reimpresión para cuando se traba el papel.
- ¿Imprime también el ticket del cliente, o solo la comanda de cocina?

### Qué toca del código actual
- Nada del schema. La comanda ya tiene todos los datos.
- `components/panel/Comanda.tsx` como fuente del contenido a imprimir.
- Si va por (a): repo o servicio nuevo, más un campo en `config_local` para la
  IP de la impresora.

---

## 2. Sistema de fidelidad

**Ojo: esto arrastra login, que es la regla dura que la v1 no tiene.** Es la
decisión más grande de toda la 2.0 y conviene tomarla con los ojos abiertos.

### La oportunidad
Ya regalan stickers de la marca. Convertirlos en puntos es natural: la mecánica
de coleccionar ya existe en la cabeza del cliente y no hay que explicarla.

### Por qué obliga a identificar al cliente
Los puntos tienen que sobrevivir al navegador. Hoy todo vive en `localStorage`,
que se borra solo — y en el navegador de Instagram se borra más todavía. Sin una
identidad estable, el saldo de puntos se evapora y el programa pierde toda
credibilidad el primer mes.

### Opciones, de menos a más fricción

**a) Solo el teléfono, sin contraseña**
El teléfono ya se pide en el checkout. Los puntos se acumulan contra ese número.
Para consultar el saldo, se pone el teléfono.

- Fricción cero: no cambia nada del flujo actual.
- **No es seguro**: cualquiera que sepa tu teléfono ve y gasta tus puntos.
- Alcanza si el canje es presencial y lo valida el local ("¿sos vos?").

**b) Teléfono + código por WhatsApp (OTP)**
Se manda un código de 6 dígitos por WhatsApp y con eso se abre sesión.

- Es el estándar de la región y la gente ya lo entiende.
- Requiere WhatsApp Business API o un proveedor de SMS: **tiene costo por
  mensaje** y hay que sumarlo al costo mensual.
- Es la opción que recomendaría si el programa va en serio.

**c) Login completo con email y contraseña**
Descartada. Nadie crea una cuenta para pedir una hamburguesa en un pueblo, y
suma un formulario más entre el hambre y el pedido.

### Qué hay que decidir antes
- **La mecánica**: ¿un sello por pedido y el décimo gratis? ¿puntos por peso
  gastado? Lo simple gana: el cliente tiene que poder explicarlo en una frase.
- ¿El canje es automático en la app o lo aplica el local a mano?
- ¿Los puntos vencen? (Contablemente conviene que sí.)
- ¿Qué pasa con los stickers físicos que ya regalan? ¿Conviven o los reemplaza?

### Qué toca del código actual
- Tablas nuevas: `clientes`, `movimientos_puntos`.
- `pedidos` necesita un `clienteId` opcional.
- Auth de verdad, con sesiones. Hoy no hay nada de eso: es el cambio
  arquitectónico más grande de la lista.
- El checkout suma un paso, y ese paso puede bajar la conversión. Medirlo.

**Beneficio lateral importante:** una vez que hay identidad, el problema del
`localStorage` que se borra en el navegador de Instagram desaparece solo. El
historial del cliente pasa a vivir en el servidor.

---

## 3. Historial completo de ventas

Hoy el panel solo muestra los pedidos cerrados de las últimas 12 horas
(`api.pedidos.cerradosDeHoy`). Los datos históricos **están todos en la base**,
nadie los borra: lo que falta es la pantalla para leerlos.

Eso es una buena noticia: es de las cosas más baratas de la lista, porque no hay
que capturar nada nuevo.

### Qué mostrar
- **Cierre del día**: cuántos pedidos, cuánto se facturó, cuánto fue efectivo y
  cuánto transferencia. Es lo que el dueño quiere ver cuando baja la persiana.
- **Ranking de productos**: qué se vende y qué no. Sirve para podar el menú.
- **Retiro vs delivery**: la proporción real, para dimensionar el reparto.
- **Tiempos reales de preparación**: ya están los sellos de tiempo por
  transición (`enCocinaEn`, `listoEn`, `entregadoEn`). Se puede calcular cuánto
  tardan de verdad y **comparar contra el ETA que se prometió**. Es la métrica
  más valiosa del sistema: mide exactamente el problema que la app vino a
  arreglar, y les deja ajustar `minutosBase` con datos en vez de intuición.
- **Curva por hora**: a qué hora entra el pico, para saber cuándo reforzar.
- Exportar a CSV para el contador.

### Qué hay que decidir antes
- ¿Hasta cuándo se guardan los pedidos? Definir una política de retención
  (¿12 meses?) y si se archivan o se borran.
- ¿Quién ve los números de facturación? Hoy el panel tiene un solo PIN para
  todos. Si el dueño no quiere que los empleados vean la caja, hace falta
  separar roles, y eso es otro laburo.
- ¿Alcanza con verlo en pantalla o quieren un resumen diario por WhatsApp?

### Qué toca del código actual
- Queries nuevas en `convex/pedidos.ts` agregando por rango de fechas. Ojo con
  traer todo a memoria: hay que paginar o pre-agregar por día.
- Una sección nueva en `app/panel/`.
- Probablemente un índice nuevo por `diaServicio`, que ya existe como campo
  desde que los códigos pasaron a reciclarse por noche.
- Si se agrega el corte por rol, toca la puerta del panel entera.

---

## 4. Lo demás que quedó anotado

| Idea | Nota |
|---|---|
| **Mercado Pago** | Cuando quieran cobrar online. Hoy el pago presencial funciona bien y no tiene comisión: no lo agregues sin que lo pidan. Cambia el flujo de estados (hay que manejar pago pendiente, aprobado y rechazado). |
| **Cupones y descuentos** | Simple de agregar, y encaja con las promos por día que ya existen. Definir si son por código, por monto mínimo o por producto. |
| **Seguimiento del repartidor en el mapa** | El más caro y el de menor retorno en un pueblo donde el delivery tarda 8 minutos. Requiere que el repartidor lleve una app corriendo. Lo dejaría para el final. |
| **Notificaciones push** | Avisarle al cliente que su pedido está listo, sin que tenga la pantalla abierta. En Android anda bien; en iOS solo si instalaron la PWA. Barato comparado con el resto y mejora la experiencia real. |
| **Pedido programado** | "Lo quiero para las 21:30". Ayuda a aplanar el pico de las 20:00, que es cuando se les satura la cocina. |
| **Varias sucursales** | Solo si abren otro local. Hoy `config_local` es una sola fila y todo el modelo asume un local único. |

---

## Deuda técnica pendiente de la v1

Anotada acá para que no se pierda. El detalle está en el checklist de lanzamiento.

- **Sin límite de pedidos por persona.** Sin login ni captcha, alguien puede
  mandar 50 pedidos falsos y tapar la cocina. Hoy la única defensa es el botón
  de pausar. Se arregla solo si llega el login del punto 2.
- **La sombra del sticker no se ve sobre fondo negro** (`3px 3px 0 negro` sobre
  negro). Cosmético, pero el efecto die-cut se pierde.
- **El navegador in-app de Instagram puede borrar el `localStorage`** y hacer
  perder el carrito y el código del pedido. Ver las mitigaciones aplicadas.

> Los códigos de pedido **ya no son deuda**: pasaron a ser únicos por día de
> servicio y se reciclan cada noche, así que el pool no se agota nunca.

---

## Por dónde arrancaría

1. **Historial de ventas.** Lo más barato de todo (los datos ya están) y le da
   al dueño algo que va a mirar todos los días. Genera confianza en el sistema.
2. **Impresora térmica.** El mayor impacto operativo por peso invertido.
3. **Notificaciones push.** Barata y mejora la experiencia sin tocar el modelo.
4. **Fidelidad.** La más cara y la que más cambia la arquitectura. Recién cuando
   la operación esté aceitada y haya volumen que valga la pena fidelizar.
