# Respuestas a "PREGUNTAS PARA BACKEND DE FRONTEND.MD"

Van en el mismo orden. Donde hubo un fix, ya está en producción — no hace falta esperar a un deploy.

---

## 1. Límites de regiones — CORREGIDO

Tenían razón. Los números correctos ya están corregidos en `/searches/limits` y en la validación de `POST/PATCH /searches/`:

| Plan | Perfiles | Regiones |
|---|---|---|
| Paid — 7 días | 1 | **1** |
| Paid — 15 días | 1 | **1** |
| Paid — 1 mes | 2 | **2** |
| Paid — 3 meses | 2 | **2** |

Actualicen el texto de las tarjetas de precios a estos números. La tabla del documento anterior (`BACKEND_CHANGES_2_FOR_FRONTEND.md`) tenía 2/5, eso ya no aplica.

**Plan gratuito:** confirmado, se queda en 1 región y 0 puestos extra — sin cambios, es el comportamiento de siempre.

---

## 2. Límite de Company Watch — confirmado, no varía por horizonte

`paid` usa **5** para cualquier horizonte (7d/15d/1m/3m) — no varía como perfiles/regiones. Ya estaba así implementado, solo faltaba confirmarlo.

Sobre exponerlo en `/searches/limits`: tiene sentido, pero ese endpoint vive en el router de `searches`, no en el de `company-watches` — lo natural sería agregar `GET /company-watches/limits` (mismo patrón) en vez de mezclarlo ahí. Avisen si lo quieren y lo agrego.

---

## 3. Comprar un pase corto con uno largo activo — RESUELTO

Trazado directo del código: si comprás un pase nuevo mientras uno viejo sigue activo, **sí, `plan_horizon` pasa a ser el del pase nuevo** — no hay lógica que conserve el horizonte "más generoso". En tu ejemplo (3 meses con 20 días restantes + compra de 7 días):

- `plan_ends_at` queda en 27 días (20 + 7) — correcto, no se pierde tiempo pagado.
- `plan_horizon` pasa a `"7d"`.
- Los límites bajan a los de `7d` (1 perfil, 1 región) — el sistema **no** desactiva ni recorta automáticamente los perfiles/regiones que quedaron por encima del nuevo límite. Quedan guardados y corriendo, pero cualquier intento de editarlos choca con el límite nuevo.

**Para que puedan advertir antes de cobrar sin hardcodear números** (que fue justo la causa del bug de la pregunta 1), agregué:

```
GET /searches/limits/horizons
```

Sin auth. Devuelve los límites de **los 4 horizontes**, no solo el del plan actual:

```json
{
  "7d":  { "max_profiles": 1, "max_locations_per_profile": 1, "max_job_titles_per_profile": 5 },
  "15d": { "max_profiles": 1, "max_locations_per_profile": 1, "max_job_titles_per_profile": 5 },
  "1m":  { "max_profiles": 2, "max_locations_per_profile": 2, "max_job_titles_per_profile": 5 },
  "3m":  { "max_profiles": 2, "max_locations_per_profile": 2, "max_job_titles_per_profile": 5 }
}
```

Flujo sugerido antes de llamar a `POST /billing/checkout`:
1. Traer este catálogo + `GET /searches/` (perfiles actuales del usuario, ya lo tienen).
2. Si el usuario va a comprar un horizonte cuyos límites son menores a lo que ya tiene creado (ej. tiene 2 perfiles activos y va a comprar `7d`, que solo permite 1), mostrar la advertencia antes de redirigir a Stripe.
3. El backend no bloquea la compra en este caso — la decisión de avisar u obligar a limpiar antes es del frontend, con esta info ya disponible sin adivinar ni duplicar los números.

---

## 4. Qué pasa con los datos por encima del límite gratuito al vencer

- **Se desactivan TODOS los perfiles** (`is_active: false`), no solo los que sobran — es un corte total, no un recorte al límite de free. Ya lo cubre `BACKEND_CHANGES_2_FOR_FRONTEND.md` punto 1.
- Las regiones **no se recortan** — quedan guardadas tal cual en el perfil (ya inactivo), no se pierden ni se bloquea solo la edición del campo `locations`; el perfil completo queda pausado.
- Si el usuario intenta **guardar** algo que excede el límite (ya sea por count de ubicaciones o por reactivar con datos de más):
  - Código de ubicación inválido (no existe en `/searches/regions`) → **422**, con el mensaje `"Ubicación(es) inválida(s): X. Usa GET /searches/regions."` dentro de `detail[0].msg`.
  - Cantidad de regiones/perfiles por encima del límite del plan actual → **403**, con `detail` como string plano: `"Tu plan Free permite máximo 1 locación(es)."` — no es la estructura de validación de Pydantic, es un `HTTPException` directo.

Son dos formatos de error distintos según la causa — el 422 viene de Pydantic (lista de errores), el 403 viene de un chequeo manual (string simple). Hay que manejarlos por separado si quieren mensajes específicos.

---

## 5. Editar un perfil legacy con texto libre sin cambiarlo

Confirmado: el validador no distingue "cambió" de "no cambió" — si `locations` viene en el `PATCH` con cualquier valor que no sea un código válido (aunque sea exactamente el mismo texto que ya estaba guardado), se rechaza con 422. Su workaround del lado del frontend (bloquear el guardado y pedir reemplazar) es correcto y necesario hoy.

No hay ninguna migración planeada de perfiles legacy a códigos — se quedan con su texto libre indefinidamente, funcionando para scraping pero sin poder editarse (en el campo `locations`) hasta que el usuario los recree con regiones nuevas.

---

## 6. `display_name` — AGREGADO

Se decidió: el nombre vive en nuestra base, no en Supabase. Ya está:

- `PATCH /users/me` acepta `display_name` (junto a `whatsapp_number`/`timezone`, como antes).
- `GET /users/me` devuelve `display_name` (`null` si nunca se seteó).
- `GET /admin/users` también lo incluye por fila.

Sin restricciones de longitud ni validación de formato por ahora — si quieren un máximo de caracteres, avisen y lo agrego al schema.

---

## 7. Endpoint de admin — confirmado + una advertencia

- `?plan=paid&horizon=1m` es correcto.
- `days` y `horizon` son **independientes** — no hay "gana uno sobre el otro" porque controlan campos distintos: `days` fija `plan_ends_at`, `horizon` fija `plan_horizon`. **Ojo con esto:** si mandan `horizon` solo, sin `days`, `plan_horizon` cambia pero `plan_ends_at` **no se toca** — puede quedar desincronizado (ej. horizonte "1m" con una fecha de vencimiento que no corresponde a 30 días). Para asignar un pase manual completo, siempre manden ambos: `?plan=paid&horizon=1m&days=30`.
- `pro` y `premium` siguen siendo valores aceptados por la API — el backend no bloquea asignarlos, la decisión de ocultarlos en la UI del admin (excepto para cuentas que ya los tienen) es suya y no requiere ningún cambio de nuestro lado.

---

## 8. `GET /admin/users` — tipado agregado, campos confirmados

Ya devuelve `plan_horizon` y `plan_ends_at` por usuario, y ahora tiene `response_model` (antes no lo tenía, por eso el schema salía vacío en OpenAPI). Debería verse tipado correctamente en `/docs` ahora.

---

## 9. `subscription_status` en pases prepagados

Valores reales que puede tomar:
- **Mientras el pase está vigente:** `"active"` (o, en el raro caso de que Stripe marque el checkout como "no requiere pago", `"trialing"` — no debería pasarles en la práctica con estos precios).
- **Al vencer de forma natural:** `"canceled"`.
- **Usuario que nunca compró nada, recién registrado:** `"trial"` (el trial gratuito de 15 días al firmarse, no confundir con el `"trialing"` de Stripe).

**Advertencia real:** si su pantalla de ajustes muestra alerta roja cuando `subscription_status !== "active"`, van a mostrar esa alerta tanto a un usuario free recién registrado (`"trial"`) como a uno cuyo pase venció normalmente (`"canceled"`) — ninguno de los dos es un error, son estados esperados. Sugiero: solo tratar como "problema real" el valor `"past_due"` (eso sí es un fallo de cobro en una suscripción legacy pro/premium), y tratar `"trial"`/`"canceled"`/`null` como neutros, apoyándose en `plan` (¿es free o paid?) para decidir qué mensaje mostrar, no en `subscription_status` solo.

---

## 10. Portal de Stripe para pases prepagados

Decisión pendiente de confirmar con el dueño del producto — les aviso en cuanto la tenga. Técnicamente el portal de Stripe sí puede mostrar el historial de facturas/recibos aunque la suscripción no se vaya a renovar, así que hay un caso razonable para ofrecerlo también a `paid`, no soy yo quien deba decidirlo solo.

---

## 11. CORS — CORREGIDO

Ya no hace falta agregar puertos a mano. Cambié la whitelist para aceptar **cualquier puerto** de `localhost`/`127.0.0.1` (vía regex), mientras que producción sigue con los dominios explícitos de siempre. 3100, 5173, o cualquier otro puerto de desarrollo ya deberían funcionar sin más cambios de este lado.

---

## 12. Catálogo de regiones — confirmado

Correcto, Ontario con 6 regiones, sin auth, tal como está documentado.

Sobre fecha para más provincias: es una decisión de roadmap del producto, no técnica — la arquitectura ya soporta agregar cualquier provincia sin cambios de código (es solo agregar datos), así que en cuanto haya una fecha se las paso. Mientras tanto, el ajuste del texto del acordeón para que no se vea vacío con una sola provincia es buena idea de su lado, no requiere nada de nuestra API.
