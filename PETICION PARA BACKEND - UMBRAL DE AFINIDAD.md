# Cambio: de "sensibilidad de alertas" a un umbral de afinidad en porcentaje

## Qué queremos hacer en la interfaz

Hoy el perfil de búsqueda tiene un control de tres opciones —amplia, balanceada, estricta— que
escribe en `alert_sensitivity`. Lo queremos reemplazar por un deslizador donde el usuario elige
directamente el **porcentaje mínimo de afinidad** que quiere recibir: 30, 40, 50, 60, 70 u 80, de
diez en diez.

El motivo es de coherencia, no de estética. Desde que ustedes agregaron `score_percentage` y
`match_score_percentage`, cada empleo que mostramos lleva un porcentaje de afinidad visible. Pedirle
al usuario que además elija entre "amplia" y "estricta" lo obliga a traducir mentalmente a otra unidad
algo que ya está expresado en la pantalla. Con el deslizador, el número que el usuario elige y el
número que ve en cada tarjeta son el mismo, y el control se vuelve verificable: si pide 60%, no
debería ver nada por debajo de 60%.

Eso último es justamente lo que depende de ustedes.

---

## 1. Campo nuevo en el perfil de búsqueda

Necesitamos un entero en puntos porcentuales. Proponemos `min_score_percentage`, para que case con
los nombres que ya devuelven (`score_percentage`, `match_score_percentage`), pero el nombre nos da
igual mientras sea consistente.

- Rango 30 a 80, múltiplos de 10.
- Aceptado en `POST /searches/` y en `PATCH /searches/{id}`.
- Devuelto en `GET /searches/` y `GET /searches/{id}`.

---

## 2. El filtro tiene que evaluarse sobre el porcentaje que se muestra

Este es el punto crítico. El umbral debe compararse contra el mismo número que ustedes ya calculan y
nos envían (`score_percentage` / `match_score_percentage`), no contra el score interno.

Si por rendimiento prefieren seguir filtrando sobre el score interno, está bien, pero entonces
necesitamos que **inviertan el sigmoide** y nos digan las equivalencias exactas de los seis escalones.
De lo contrario el control queda desmentido en pantalla: un usuario que pide 60% vería empleos de 45%
y el deslizador pasaría a ser decorativo.

Un argumento a favor de guardar el umbral en porcentaje y no en score interno: si algún día
recalibran el sigmoide, un umbral guardado como "60%" sigue significando lo mismo para el usuario,
mientras que uno guardado como score interno se desplazaría sin que nadie lo note.

---

## 3. Migración desde `alert_sensitivity`

Tomando la tabla de calibración de su propio documento (score 10 ≈ 27%, score 15 ≈ 50%, score 20 ≈ 73%),
el mapeo al escalón más cercano sería:

| `alert_sensitivity` actual | Score interno | % equivalente | `min_score_percentage` |
|---|---|---|---|
| `broad` (default de hoy) | 10 | ~27% | 30 |
| `balanced` | 15 | ~50% | 50 |
| `strict` | 20 | ~73% | 70 |

Dos consecuencias que asumimos a propósito, pero conviene que las confirmen:

- `broad` se vuelve levemente más estricto, porque 27% queda por debajo del piso de 30% del
  deslizador. Quien esté hoy en "amplia" dejaría de recibir un margen pequeño de empleos.
- `strict` se vuelve levemente más permisivo, de 73% a 70%.

Si prefieren que el piso del deslizador baje para preservar el comportamiento exacto de `broad`,
díganlo y movemos la escala.

---

## 4. ¿Conviven los dos campos o retiran el viejo?

Preferimos que `alert_sensitivity` se retire en la misma versión, para no quedarnos con dos fuentes de
verdad sobre lo mismo. Si necesitan una transición, necesitamos saber cuál manda si llegan los dos en
la misma petición.

---

## 5. Valor por defecto

¿Cuál para los perfiles nuevos? Sugerimos 30, que es el equivalente del `broad` que hoy es el default,
para no reducirle de golpe el volumen de alertas a quien se registre.

---

## 6. `POST /searches/{id}/analyze`

Ese endpoint recibe hoy `alert_sensitivity` en el cuerpo, y nosotros se lo mandamos desde la pantalla
de edición del perfil. Si el campo cambia, ese endpoint debería recibir el nuevo.

---

## 7. Ambigüedad en `min_score` de `GET /jobs/`

El parámetro `min_score` declara `minimum: 0, maximum: 100`, pero según su documentación el score
interno vive alrededor de 10 a 32, y 31.65 ya es el top 1% histórico. Entonces:

- ¿`min_score` compara contra `match_score` (el interno) o contra `match_score_percentage`?

Lo preguntamos porque si es el interno, el rango 0–100 es engañoso: alguien que mande `min_score=60`
creyendo que pide 60% de afinidad recibiría cero resultados. Y para el historial de empleos nos hace
falta poder filtrar en la misma unidad que el usuario eligió, así que necesitaríamos un parámetro
equivalente en porcentaje.

Hoy no le pasamos `min_score` desde ninguna pantalla, así que no hay nada roto todavía.

---

## 8. ¿A qué aplica el umbral?

¿Filtra solo las alertas que se envían por WhatsApp y email, o también lo que se guarda y lo que
devuelve el historial de empleos? Lo necesitamos para redactar el texto que acompaña al control, que
hoy dice "sensibilidad de alertas" y tendría que decir algo verificable.

---

## 9. Validación

- Si llega un valor fuera de 30–80, o que no sea múltiplo de 10, ¿responden 422 con un detalle legible?
- ¿Aceptan valores intermedios como 55, por si más adelante afinamos el paso del deslizador, o el
  backend también los rechaza? Nos sirve saber si el paso de 10 es una regla del backend o solo de la
  interfaz.

---

## 10. ¿Depende del plan?

Asumimos que no, que cualquier pase puede elegir cualquier umbral. Si piensan limitarlo por plan,
avísennos porque cambia el control y el texto.
