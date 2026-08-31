# Dudas del frontend sobre billing por horizonte + regiones

Actualizado después de leer `RESPUESTA PARA FRONTEND DE BACKEND.md`. Las 12 preguntas originales
están respondidas y ya aplicamos todo lo que implicaban del lado del frontend, así que quedaron
fuera de este documento para no pedir lo mismo dos veces. Abajo va solo lo que sigue abierto.

---

## 0. BLOQUEANTE: nadie puede pagar — `No such customer` en el checkout

Al comprar cualquier pase, `POST /api/v1/billing/checkout` responde con:

```
Error creando sesión de pago: No such customer: 'cus_UICyGqjvSW0qDS'
```

Ese texto no existe en el frontend, es el `detail` que devuelven ustedes, y el mensaje es de Stripe,
no de su código: ese `customer` no existe en la cuenta ni en el modo al que apunta la API key con la
que están firmando ahora mismo. El ID sí está guardado en su base, así que el cliente se creó en
algún momento con otras credenciales. Las tres causas posibles, en orden de probabilidad:

1. **Cambio de modo test ↔ live.** Los `cus_...` son por modo: un cliente creado con `sk_test_...` no
   existe con `sk_live_...` ni al revés. Es lo que suele pasar al pasar a producción.
2. **Cambio de cuenta de Stripe** (claves de otra cuenta u otra organización).
3. **El cliente se borró** desde el dashboard de Stripe y el ID quedó huérfano en la base.

Se confirma en un minuto: busquen `cus_UICyGqjvSW0qDS` en el dashboard de Stripe y alternen el
interruptor de modo test/live. Si aparece en test y la API corre en live (o al revés), es la causa 1.

**Por qué es urgente:** si fue un cambio de modo o de cuenta, esto no afecta a un usuario, afecta a
**todos los que ya tengan `stripe_customer_id` guardado**, es decir a todas las cuentas creadas antes
del cambio. Ninguna puede pagar. Y `POST /billing/portal` falla por el mismo camino, así que "Gestionar
suscripción" también está roto para esas cuentas.

Lo que pedimos:

- **Ahora:** limpiar (`NULL`) el `stripe_customer_id` de las cuentas cuyo cliente no exista en el modo
  actual, para que el próximo checkout cree uno nuevo. Con reusar el ID por email en la cuenta correcta
  también sirve.
- **Para que no vuelva a pasar:** capturar el `InvalidRequestError` de Stripe cuando el mensaje es
  `No such customer`, crear el cliente de nuevo, guardar el ID nuevo y seguir con la sesión, en vez de
  propagar el error. Aplica igual en `/billing/checkout` y en `/billing/portal`. Stripe recomienda
  justamente esto para ID que quedan obsoletos.

Una nota sobre el formato del error: ese `detail` llegaba tal cual a la pantalla del usuario, con el
`cus_...` incluido. Ya lo cambiamos: solo mostramos el `detail` en 403 y 422, que según su documento
son los que traen mensajes escritos para el usuario; cualquier otro estado muestra un texto genérico y
el detalle queda en la consola. Así que no cuenten con que el `detail` de un 500 lo lea el usuario.

- ¿Confirman en qué modo (test o live) está corriendo la API en producción? Lo preguntamos porque el
  frontend no tiene clave de Stripe y no podemos verificarlo desde aquí.

---

## Lo que aplicamos con sus respuestas

- **Límites de regiones (1/1/2/2):** corregidos en el texto de precios, del banner del dashboard y
  del onboarding. Y con `GET /searches/limits/horizons` dejamos de escribir los números a mano: la
  línea de cada tarjeta se arma con lo que responde ese endpoint, así que ese tipo de bug no puede
  repetirse. Gracias por agregarlo, era exactamente lo que hacía falta.
- **Advertencia antes de cobrar un pase más corto:** implementada con el flujo que sugirieron. Al
  hacer clic en comprar pedimos el catálogo de horizontes y los perfiles del usuario, y si el pase
  elegido permite menos de lo que ya tiene, sale un diálogo con los números concretos antes de
  redirigir a Stripe. No bloqueamos la compra, solo avisamos.
- **Formatos de error 403 y 422:** los manejamos por separado. Aquí encontramos un bug nuestro
  bastante feo: tratábamos 401 y 403 como el mismo caso, así que un usuario que excediera su límite
  habría terminado en la pantalla de login en vez de leer el mensaje. Ya está separado.
- **Company Watch:** el límite de `paid` pasó de 3 a 5.
- **Admin:** ahora mandamos siempre `horizon` y `days` juntos, para evitar el desfase que advirtieron.
- **`subscription_status`:** solo `past_due` se pinta como problema. `trial`, `canceled` y `null` son
  neutros, y el mensaje se decide por `plan`, como recomendaron.
- **Perfiles legacy con texto libre:** seguimos bloqueando el guardado y pidiendo reemplazar.
- **Acordeón de regiones:** no hizo falta tocar nada, la primera provincia se abre sola, así que con
  Ontario solo ya se ven sus 6 regiones y no queda vacío.

---

## 1. ¿`plan_ends_at` se conserva después de que vence el pase?

Es la duda que más nos afecta. La tabla del documento dice que `plan_ends_at` es `null` "si es free",
pero también dice que al vencer el pase el usuario pasa a `free`. Las dos cosas juntas implicarían
que justo cuando más lo necesitamos —para explicar por qué se pausaron los perfiles— el campo ya
viene vacío.

- Cuando el pase vence y el plan baja a `free`, ¿`plan_ends_at` sigue trayendo la fecha en que
  venció, o se limpia a `null`?

Mientras se aclare, el aviso de "tu pase venció, pausamos tus búsquedas" se muestra si el plan es
`free` y hay perfiles pausados **y además** (a) `plan_ends_at` está en el pasado, o (b) algún perfil
excede los límites del plan free, que solo puede pasar si se creó con un pase activo. Si el campo se
conserva, sobra la heurística (b) y el aviso es exacto.

---

## 2. Formato de fecha en los campos de tipo datetime

Algunos campos de fecha llegan sin marcador de zona horaria (por ejemplo `2026-08-30 15:04:05` en vez
de `2026-08-30T15:04:05Z`). Un string así lo interpreta el navegador como hora local, no UTC, y en
zonas negativas como la nuestra (UTC-4) el resultado queda en el futuro: por eso "última búsqueda"
mostraba un guion en vez de la hora. Ya se corrigió en el frontend asumiendo UTC cuando no viene
zona, pero es un parche sobre algo que se arregla mejor en el origen.

- ¿Se puede serializar todos los datetime con sufijo `Z` (o con offset explícito)? Aplica a
  `plan_ends_at`, `updated_at`, `sent_at` y `ran_at`.

---

## 3. Tope del 99% en el porcentaje de afinidad

Ya mostramos `score_percentage` / `match_score_percentage` y quitamos el puntaje crudo de la interfaz.
Dos detalles menores:

- ¿El porcentaje puede venir `null` en algún caso (por ejemplo un empleo viejo sin recalcular)? Hoy
  mostramos un guion si llega `null` y el badge se pinta en gris.
- Los umbrales de color del badge quedaron en 75% (verde) y 50% (ámbar), tomando la calibración del
  documento. Si esa curva se recalibra, avisen para mover los cortes.

---

## 4. ¿Quién llena `display_name` al registrarse?

Gracias por agregarlo. Queda un hueco: el registro ocurre contra Supabase, y el nombre que escribe el
usuario se guarda en el metadata de Supabase, no en su base. Entonces `GET /users/me` devuelve
`display_name: null` para todas las cuentas existentes y también para las nuevas.

- ¿Pueden sembrar `display_name` desde el metadata de Supabase al crear el usuario en su base?

Mientras tanto el frontend lee el nombre de la API y, si viene vacío, cae al metadata de Supabase, y
además prellena ese valor en el formulario de ajustes para que se persista la primera vez que el
usuario guarde. Funciona, pero es un parche: si lo siembran ustedes, se puede quitar.

Sobre el largo máximo que ofrecieron: sí, pónganle un tope de 60 caracteres para que no rompa los
encabezados de la interfaz.

---

## 5. Sí a `GET /company-watches/limits`

Confirmado el 5 para cualquier horizonte, gracias. Y sí, nos interesa el endpoint que propusieron en
su router propio: hoy el límite de Company Watch está escrito a mano en el frontend
(`free: 1, paid: 5, pro: 3, premium: 5`), que es justo lo que el documento original pedía evitar. Con
ese endpoint lo leemos igual que los límites de búsqueda y deja de haber números duplicados.

---

## Esperando respuesta suya, sin nada pendiente de nuestro lado

- **Portal de Stripe para pases prepagados:** quedaron en confirmarlo con el dueño del producto. Hoy
  el botón "Gestionar suscripción" solo aparece para las cuentas legacy `pro`/`premium`. Si deciden
  ofrecerlo también a `paid` para descargar facturas, lo mostramos.
- **Más provincias en el catálogo de regiones:** cuando haya fecha nos avisan. El selector aguanta
  cualquier número sin cambios de código.
