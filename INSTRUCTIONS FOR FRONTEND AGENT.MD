# Cambios de backend: Billing por horizonte fijo + Regiones de búsqueda

Documento para el agente/dev de frontend. Cubre dos cambios de API relacionados:
1. Suscripciones pasan de mensual recurrente indefinido a **pases prepagados de duración fija**.
2. `locations` en una búsqueda pasa de texto libre a **códigos de región/provincia preestablecidos**.

Todos los endpoints están bajo el prefijo `/api/v1`.

---

## 1. Billing — pases de horizonte fijo

### Modelo nuevo

Ya no se vende "Pro" / "Premium" como planes separados. Ahora hay **un solo tier pagado** (`plan: "paid"`), vendido en 4 duraciones:

| Horizonte | Código | Precio | Duración |
|---|---|---|---|
| 7 días  | `7d`  | $5  | 7 días |
| 15 días | `15d` | $9  | 15 días |
| 1 mes   | `1m`  | $15 | 30 días |
| 3 meses | `3m`  | $45 | 90 días |

El pase **no se renueva solo** — al vencer, el usuario baja automáticamente a `plan: "free"` y debe comprar uno nuevo. No hay cobro recurrente ni sorpresas de facturación.

> Nota: usuarios que ya estaban suscritos a Pro/Premium (mensual recurrente) antes de este cambio siguen funcionando exactamente igual hasta que cancelen — `plan` puede seguir devolviendo `"pro"` o `"premium"` para esas cuentas legacy. El frontend debe tratar `"pro"`, `"premium"` y `"paid"` como "tiene acceso pagado" en cualquier lugar donde solo verificabas `plan !== "free"`.

### Endpoint: iniciar compra

```
POST /billing/checkout?horizon=<7d|15d|1m|3m>
Authorization: Bearer <jwt>
```

Respuesta:
```json
{ "url": "https://checkout.stripe.com/...", "upgraded": false }
```

El frontend redirige al usuario a `url` (Stripe Checkout hospedado). Ya no existe el flujo de "upgrade inline sin redirect" que existía antes para cambiar entre Pro/Premium — al haber un solo tier, **toda compra pasa por Checkout**, incluso si el usuario ya tiene un pase activo (comprar uno nuevo cancela el viejo en Stripe y extiende el tiempo restante, todo transparente para el usuario — no requiere lógica especial en el frontend, solo llamar al mismo endpoint).

Success/cancel redirige a:
- `{SITE_URL}/dashboard/billing/success`
- `{SITE_URL}/dashboard/billing/cancel`

### Endpoint: portal de gestión (sin cambios)

```
POST /billing/portal
Authorization: Bearer <jwt>
```
Igual que antes — devuelve `{ "url": "..." }` al Stripe Billing Portal.

### Campos nuevos en el usuario / `GET /users/me`

| Campo | Tipo | Descripción |
|---|---|---|
| `plan` | `"free" \| "pro" \| "premium" \| "paid"` | `"paid"` es el nuevo tier único; pro/premium son legacy |
| `plan_ends_at` | ISO datetime o `null` | Cuándo vence el pase actual. `null` si es free o legacy sin fecha |
| `plan_horizon` | `"7d" \| "15d" \| "1m" \| "3m" \| null` | Solo tiene valor si `plan === "paid"`. Determina límites de búsqueda (ver tabla abajo) |

Usar `plan_ends_at` para mostrar un contador ("tu pase vence en X días") y ofrecer renovar antes de que expire.

---

## 2. Regiones — reemplaza el input de ciudad libre

### Endpoint: catálogo de opciones (sin auth)

```
GET /searches/regions
```

Respuesta (árbol provincia → regiones → ciudades):
```json
{
  "ON": {
    "code": "ON",
    "name": "Ontario",
    "regions": [
      {
        "code": "ON:GTA",
        "name": "Greater Toronto Area (GTA)",
        "cities": ["Toronto, ON", "Mississauga, ON", "Brampton, ON", "Vaughan, ON", "Markham, ON", "Richmond Hill, ON", "Oakville, ON", "Burlington, ON"]
      },
      {
        "code": "ON:NIAGARA",
        "name": "Niagara Region",
        "cities": ["Niagara Falls, ON", "St. Catharines, ON", "Welland, ON", "Thorold, ON", "Niagara-on-the-Lake, ON", "Fort Erie, ON", "Port Colborne, ON", "Grimsby, ON"]
      },
      { "code": "ON:HAMILTON", "name": "Hamilton Region", "cities": [...] },
      { "code": "ON:WATERLOO",  "name": "Waterloo Region (Kitchener-Waterloo)", "cities": [...] },
      { "code": "ON:OTTAWA",    "name": "Ottawa Region", "cities": [...] },
      { "code": "ON:LONDON",    "name": "London Region", "cities": [...] }
    ]
  }
}
```

Por ahora solo hay datos para Ontario — se agregarán más provincias con la misma forma más adelante, sin cambio de contrato.

**Usar este endpoint para armar el selector.** Sugerencia de UI: un dropdown/checklist por provincia, con la provincia completa como una opción ("Ontario — toda la provincia") y cada región como opciones adicionales debajo, mostrando las ciudades como tooltip/subtexto (el campo `cities` ya viene armado para eso).

### Cómo se usa el código al crear/editar una búsqueda

`locations` en `POST /searches/` y `PATCH /searches/{id}` ahora es una lista de **códigos**, no texto libre:

```json
{
  "locations": ["ON:NIAGARA"]
}
```

- `"ON"` → busca por **toda la provincia** como un solo término (no se expande a ciudades — más barato/rápido).
- `"ON:NIAGARA"` → busca por **cada ciudad** de esa región.
- Se pueden combinar varias: `["ON:GTA", "ON:NIAGARA"]` — búsqueda en ambas regiones a la vez.
- **Ya no se acepta texto libre.** Si el frontend manda un string que no es un código válido (ej. `"Toronto"` a secas, o cualquier cosa fuera del catálogo de `/searches/regions`), la API responde:

```json
// 422 Unprocessable Entity
{
  "detail": [
    {
      "loc": ["body", "locations"],
      "msg": "Value error, Ubicación(es) inválida(s): Toronto. Usa GET /searches/regions.",
      "type": "value_error"
    }
  ]
}
```

> Configuraciones de búsqueda creadas **antes** de este cambio siguen con su texto libre viejo guardado y siguen funcionando sin tocarlas — este requisito de código válido solo aplica a creaciones/ediciones nuevas.

---

## 3. Límites por plan — `GET /searches/limits`

```
GET /searches/limits
Authorization: Bearer <jwt>
```

Respuesta:
```json
{
  "plan": "paid",
  "plan_horizon": "7d",
  "max_profiles": 1,
  "max_job_titles_per_profile": 5,
  "max_locations_per_profile": 2,
  "business_hours_only_enforced": false
}
```

`plan_horizon` viene `null` si el plan no es `"paid"` (free/pro/premium no tienen horizonte).

### Tabla completa de límites

| Plan | Perfiles (SearchConfig) | Títulos extra | Regiones/provincias |
|---|---|---|---|
| Free | 1 | 0 | 1 |
| Pro (legacy) | 2 | 3 | 3 |
| Premium (legacy) | 3 | 5 | 5 |
| **Paid — 7 días** | **1** | 5 | **2** |
| **Paid — 15 días** | **1** | 5 | **2** |
| **Paid — 1 mes** | **2** | 5 | 5 |
| **Paid — 3 meses** | **2** | 5 | 5 |

"Regiones/provincias" es el conteo de entradas en `locations` — cada código (`"ON"` o `"ON:NIAGARA"`) cuenta como 1, sin importar cuántas ciudades incluya la región. El frontend debe usar `max_locations_per_profile` de `/searches/limits` para capar cuántos códigos puede seleccionar el usuario en el selector de regiones — **no hardcodear estos números**, ya que dependen del horizonte comprado.

---

## Resumen de endpoints tocados/nuevos

| Método | Endpoint | Cambio |
|---|---|---|
| `POST` | `/billing/checkout` | Param `plan` → `horizon` (`7d`/`15d`/`1m`/`3m`). Ya no hay upgrade inline. |
| `GET` | `/searches/regions` | **Nuevo.** Catálogo de provincias/regiones/ciudades, sin auth. |
| `GET` | `/searches/limits` | Agrega `plan_horizon` a la respuesta. |
| `POST` | `/searches/` | `locations` ahora exige códigos válidos (422 si no). |
| `PATCH` | `/searches/{id}` | Igual — `locations` exige códigos válidos si se incluye en el body. |
| `GET` | `/users/me` | Agrega `plan_ends_at` y `plan_horizon` (ya existían `plan`/`subscription_status`). |


# Cambios de backend (parte 2): pausa automática al vencer + score como % de afinidad

Continuación de `BACKEND_CHANGES_FOR_FRONTEND.md`. Dos cambios nuevos, sin relación entre sí.

---

## 1. Al vencer un pase pagado, se pausan TODOS los perfiles de búsqueda

Antes, cuando un pase expiraba, el usuario bajaba a `plan: "free"` pero sus `SearchConfig` seguían corriendo tal cual (con los límites que tenía en el plan pagado, sin recortarse). Ahora **se detienen por completo**: cuando el plan cae a `"free"` por vencimiento natural (no por acción manual de un admin), el backend pone `is_active: false` en **todos** los perfiles de búsqueda del usuario, automáticamente.

Esto pasa en 3 momentos posibles (todos convergen al mismo resultado):
- El webhook de Stripe que cancela la suscripción al llegar al día del vencimiento.
- Un evento de sincronización de suscripción que detecta el mismo estado.
- Un job de respaldo que corre cada hora por si el webhook no llegó.

### Qué implica para el frontend

- Si el usuario tenía perfiles activos y su pase vence, la próxima vez que el frontend pida `GET /searches/` va a ver esos perfiles con `is_active: false` — **sin que el usuario haya hecho nada**. No es un bug ni una acción del usuario, es este comportamiento nuevo.
- Sugerencia de UX: si detectas `plan === "free"` y hay perfiles con `is_active === false` que antes eran de un plan pagado, mostrar algo como *"Tu pase venció — reactiva un perfil comprando uno nuevo"* en vez de tratarlo como una pausa manual cualquiera.
- El usuario puede reactivar sus perfiles manualmente vía `PATCH /searches/{id}` (`{"is_active": true}`) **sin necesidad de comprar un pase de nuevo** si simplemente quiere reactivar — pero ojo: si su plan sigue siendo `"free"`, los límites de free (1 perfil, 0 títulos extra, 1 región) se le aplican en cualquier edición nueva que haga, no los límites del plan pagado que tenía antes.
- No cambia ningún endpoint ni forma de respuesta — es un efecto secundario automático del lado del servidor. No requiere ningún cambio de código en frontend, solo tenerlo en cuenta para la UX.

---

## 2. El score deja de mostrarse en puntos — ahora es "% de afinidad"

### El problema que resuelve

El score interno de matching (CV vs. descripción del puesto) siempre vivió en una escala de puntos que en la práctica va de ~10 a ~46 (nunca llega a 100 aunque la fórmula lo permitiría en teoría) — mostrarlo tal cual se veía como "15 pts" o "20 pts", números que no comunican bien qué tan bueno es un match.

### La solución

Se agregó una transformación matemática (sigmoide) que convierte el score interno a un porcentaje de afinidad más intuitivo, calibrado así:

| Score interno (sin cambios) | % de afinidad mostrado |
|---|---|
| 10 (sensibilidad "amplia") | ~27% |
| 15 (sensibilidad "balanceada", mediana histórica) | ~50% |
| 20 (sensibilidad "estricta") | ~73% |
| 31.65 (top 1% histórico) | ~96% |
| Cualquier score muy alto o extremo | **tope duro en 99% — nunca se muestra 100%**, por diseño |

**El score interno (`score` / `match_score`) no cambió — sigue siendo el mismo número de siempre**, usado igual para todos los umbrales y filtros del backend. Lo único nuevo es que ahora también viene un campo adicional ya calculado con el porcentaje.

### Campos nuevos en las respuestas de API

| Endpoint / schema | Campo nuevo | Ejemplo |
|---|---|---|
| `GET /jobs/` (`JobWithScore`) | `score_percentage` | `77` (entero, sin el símbolo `%`) |
| `GET /jobs/alerts` (`JobAlertResponse`) | `match_score_percentage` | `73` |

Ambos son campos **calculados automáticamente** junto al `score`/`match_score` de siempre — no hace falta pedir nada especial, ya vienen en la respuesta normal.

```json
{
  "id": 42,
  "title": "Construction Estimator",
  "score": 21.1,
  "score_percentage": 77,
  ...
}
```

### Qué debe hacer el frontend

- **Mostrar `score_percentage` (o `match_score_percentage`), no `score`/`match_score`.** El campo viejo se mantiene por compatibilidad y para cualquier lógica interna, pero de cara al usuario siempre debe verse el porcentaje.
- Formato sugerido: `"{score_percentage}% de afinidad"` — es un entero, no hace falta redondear ni agregar decimales.
- **No hace falta implementar ninguna fórmula del lado del frontend** — el backend ya manda el número final calculado. No calcular el porcentaje a partir del `score` crudo por tu cuenta, porque la fórmula puede recalibrarse más adelante y el número dejaría de coincidir.
- Nunca vas a recibir `100` en estos campos — el tope está puesto a propósito en 99.

Esto también aplica a los mensajes de WhatsApp y a los emails (ya se actualizaron del lado del backend), así que la experiencia debería ser consistente entre canales: WhatsApp/email/API todos van a mostrar el mismo tipo de número ("X% de afinidad"), nunca "X pts".
