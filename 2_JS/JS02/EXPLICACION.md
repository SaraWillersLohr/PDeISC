# Explicación del Trabajo Práctico — JS02

Documento para estudiar, repasar y defender el oral. Lo escribí en **primera persona** después de implementar cada parte.

**Puertos:** Proyecto 1 → `3026` · Proyecto 2 → `3027` · Proyecto 3 → `3028`

---

# Punto 1 — Página dinámica y 3 formas de leer el formulario

**Carpeta:** `01_invitados`  
**URL:** http://localhost:3026

## Qué pedía la consigna

- Una página que **no se recargue** al cargar un usuario nuevo.
- Demostrar las **3 formas de lectura** de formularios en JavaScript.

## Cómo lo resolví

Armé un registro VIP de invitados. Cuando confirmo el formulario:

1. Cancelo el comportamiento por defecto con `e.preventDefault()` en el `submit`.
2. Leo los campos con **tres métodos distintos** (no mezclo todo en uno solo a propósito).
3. Armo un objeto `nuevoInvitado` y lo guardo en un array en memoria.
4. Llamo a `dibujarInvitados()` para pintar las cards sin refrescar.

## Las 3 formas de lectura (con código real)

| Método           | Campo(s)                                | Por qué lo usé acá                                                                        |
| ---------------- | --------------------------------------- | ----------------------------------------------------------------------------------------- |
| `getElementById` | `nombre`                                | Es directo cuando el input tiene `id`. Lo uso para mostrar el método más clásico del DOM. |
| `querySelector`  | `apellido`                              | Busco por selector CSS `[name="apellido"]`. Sirve cuando no quiero depender solo del id.  |
| `FormData`       | edad, email, tipo entrada, acompañantes | Leo varios campos de una con `new FormData(form)` y `datos.get("campo")`.                 |

El archivo `modules/formReaders.js` concentra esa lógica. En `modules/formReaders.js` → `renderizarLecturaMetodos()` creo cards en el panel **“Lectura en vivo”** para que se vea qué método leyó qué dato.

## DOM y render dinámico

En `modules/render.js`:

- Hago `contenedor.innerHTML = ""` **antes** de volver a dibujar (si no, se duplican nodos).
- Por cada invitado creo un `div` (columna Bootstrap), dentro un `article` con `innerHTML` para el contenido estático de la card.
- El botón borrar lo enlazo con `addEventListener("click", ...)` después de insertarlo en el DOM.

No recargo la página: solo modifico el árbol del documento.

## Eventos que uso

| Evento   | Elemento                | Función                                   |
| -------- | ----------------------- | ----------------------------------------- |
| `input`  | formulario              | Validar en tiempo real mientras escribo   |
| `change` | checkbox términos       | Habilitar o no el botón enviar            |
| `submit` | formulario              | Leer con los 3 métodos y agregar invitado |
| `click`  | botón borrar (dinámico) | `splice` en el array y re-render          |

Usé `addEventListener` porque puedo registrar varios handlers y no piso atributos HTML viejos tipo `onsubmit=""`.

## Validaciones (Punto 1)

En `modules/validations.js`:

- **Nombre/apellido:** sin números, con vocales, lista negra (`asdf`, `qwerty`, etc.), detección de repeticiones.
- **Edad:** entero entre 18 y 99.
- **Email:** patrón real con `@` y dominio con punto.
- **Acompañantes:** entre 0 y 5.

El botón submit arranca `disabled` y solo se activa si todo es válido + términos.

## Consola visual, tema y toasts

- **Consola:** `EventConsole` escribe líneas con hora en `sessionStorage` y hace autoscroll.
- **Dark mode:** `data-theme` en `<html>` + `localStorage`.
- **Toasts:** mensajes de éxito/error sin `alert()`.

## Responsive (Punto 1)

- Grid `layout-main`: formulario + panel lateral en desktop; una columna en mobile (`max-width: 991px`).
- `overflow-x: hidden` en `body`, `min-width: 0` en columnas.
- Títulos con `clamp()` para que no exploten en pantallas chicas.

---

# Punto 2 — Invitados, arrays y métodos de almacenaje

**Carpeta:** `02_mascotas` (el nombre de carpeta quedó del proyecto anterior, pero el contenido es **invitados + arrays**)  
**URL:** http://localhost:3027

## Qué pedía la consigna

- Formulario con **mínimo 8 campos**, mostrar datos **dinámicamente**.
- Guardar en un **array** usando **distintos métodos** de almacenaje.
- Consola que muestre **cómo** se guardó según el método elegido.

## Cómo lo resolví

Formulario de evento con 9 campos: nombre, apellido, email, teléfono, edad, mesa, menú, tipo entrada, acompañantes y notas.

Antes de enviar, el usuario elige en un `<select>`:

- `push()` — agrega al final
- `unshift()` — agrega al inicio
- spread `[...lista, dato]` — copia nueva
- `concat()` — unión al final sin mutar el original de la misma forma que push en la práctica

La lógica está en `modules/arrayStorage.js`. Cada método devuelve `{ lista, detalle }` y eso lo muestro en:

1. **Visor JSON** (`#arrayViewer`) — el array completo en pantalla.
2. **Consola visual** — texto tipo “Array actualizado con push()”.
3. **Cards** — todos los campos del invitado.

## Por qué cada método

- **push:** el más habitual, O(1) al final.
- **unshift:** lo usé para demostrar inserción al inicio (útil si quiero ver el último cargado primero en un listado ordenado así).
- **spread:** muestro que puedo crear un array nuevo inmutable-style con `[...lista, dato]`.
- **concat:** alternativa declarativa para unir sin usar push explícito.

Al borrar uso `splice(indice, 1)` y actualizo el visor — eso también lo registro en consola.

## DOM dinámico

Igual que en el P1: `preventDefault`, array en memoria, render de cards con `createElement` + `appendChild`. La diferencia es que acá el **estado del array** es protagonista y lo ves en JSON.

## Eventos

- `input` → validación por campo con un mapa `mapaValidadores`.
- `change` en método de array → log en consola.
- `submit` → aplicar estrategia elegida y re-renderizar array + cards.

## Validaciones (Punto 2)

Módulo propio `validations.js`: nombres, email, teléfono genérico (10–12 dígitos), edad 16–100, mesa 1–80, notas sin spam.

## Responsive (Punto 2)

- `layout-main--p2` con sidebar para consola + visor array.
- `.array-pre` con scroll interno y `max-height` para que el JSON no rompa mobile.
- Cards `col-12 col-lg-6`.

---

# Punto 3 — Personas en localStorage (validaciones por país)

**Carpeta:** `03_pasajeros`  
**URL:** http://localhost:3028

## Qué pedía la consigna

- Almacén de personas con formulario completo.
- **localStorage** persistente.
- Validación JS de **todos** los campos.
- Mensajes de guardado correcto/incorrecto.
- Listado dinámico de nombres completos.

## Cómo lo resolví (y qué mejoré fuerte)

Este punto lo traté como un formulario **real**: reglas distintas según país, prefijo telefónico automático y edad calculada con `Date` sin tolerancia floja.

### Nacionalidades permitidas

Solo 5 en un `<select>` obligatorio:

- Argentina, Chile, Uruguay, Brasil, Paraguay

La configuración vive en `modules/paisConfig.js`. Si no hay país elegido, documento y teléfono no se pueden validar bien — por eso el mensaje pide elegir nacionalidad primero.

### Documento según país

| País      | Regla                       |
| --------- | --------------------------- |
| Argentina | 7 u 8 dígitos, solo números |
| Chile     | 7 u 8 dígitos               |
| Uruguay   | 7 u 8 dígitos               |
| Brasil    | **11** dígitos (CPF)        |
| Paraguay  | 6 a 8 dígitos               |

En `validarDocumento()`:

- Rechazo letras y símbolos con `/[^0-9]/`.
- Comparo longitud con `min` y `max` del país.
- Mensaje dinámico del país, ej: _“El DNI argentino debe tener 7 u 8 números”_.

En el input uso `soloNumeros()` al escribir para que no entren `dw33333` ni letras.

### Teléfono y prefijo automático

Cuando cambia `#nacionalidad`, `aplicarReglasPais()` en `modules/uiPais.js`:

- Setea el prefijo: +54, +56, +598, +55, +595.
- Ajusta `maxLength` del input teléfono.
- Muestra hint y contador `3 / 10 dígitos`.

Longitudes por país:

| País      | Dígitos (sin prefijo) |
| --------- | --------------------- |
| Argentina | 10                    |
| Chile     | 9                     |
| Uruguay   | 8 o 9                 |
| Brasil    | 10 u 11               |
| Paraguay  | 9                     |

Guardo en localStorage como: `+54 1122334455` (prefijo + número).

### Edad y fecha — cálculo REAL

En `calcularEdadDesdeFecha()`:

- Parseo la fecha como año/mes/día locales (evito desfases raros de UTC).
- Resto años y ajusto si todavía no cumplió años este año.

En `validarEdadYFecha()` comparo **exacto**:

```text
edadReal !== numEdad  →  "La edad no coincide con la fecha de nacimiento"
```

Ejemplo: nació 11/11/2000 y pone 33 si hoy le corresponde 25 → **error**.

### Mail

Valido:

- sin espacios
- `@` en el medio
- parte local mínima
- dominio con punto y TLD de al menos 2 letras
- rechazo cosas como `gmail.com`, `aa@`, `algo@gmail.`

### Nombres y apellidos

Lista negra ampliada (`ajajaj`, `lalala`, etc.), vocales obligatorias, sin números, sin repeticiones absurdas.

### Feedback visual

`modules/feedback.js` agrega ícono **✓** / **✕** en cada `.field-wrap`, bordes verde/rojo Bootstrap-style (`is-valid` / `is-invalid`), mensajes debajo del campo. Sin `alert()`.

### localStorage

```js
localStorage.setItem("peopleList", JSON.stringify(listaPersonas));
```

Al cargar:

```js
listaPersonas = JSON.parse(localStorage.getItem("peopleList")) || [];
```

**Importante:** siempre `JSON.parse` porque localStorage guarda strings. Si guardás mal, al recargar rompe todo.

Al iniciar llamo `dibujarListaPersonas()` para que el listado aparezca solo con abrir la página.

### Guardado correcto / incorrecto

- Banner `#saveStatus` (verde/rojo).
- Toast flotante.
- Log en consola visual.

### Listado de nombres

`#namesList` se regenera en cada render con `<li>` por persona. Las cards muestran el detalle completo.

## Eventos clave (Punto 3)

| Evento                | Uso                                 |
| --------------------- | ----------------------------------- |
| `change` nacionalidad | Prefijo + hints + revalidar doc/tel |
| `input` documento/tel | Solo números + validar por país     |
| `input` edad/fecha    | Recalcular coherencia               |
| `submit`              | Guardar o mostrar error global      |

## Responsive (Punto 3)

- `.phone-row` en grid: prefijo + número; en mobile se apilan.
- `.field-wrap` con `min-width: 0` para que Bootstrap no desborde.
- Formulario y sidebar en una columna bajo 991px.

## Dark mode y consola

Igual arquitectura que P1/P2: tema en `localStorage`, consola en `sessionStorage` (son cosas distintas: tema persiste forever de sesión en sesión del browser para la consola de debug visual).

---

# Errores comunes y cómo los evité

| Error                                  | Qué pasa                                     | Qué hice                        |
| -------------------------------------- | -------------------------------------------- | ------------------------------- |
| Olvidar `preventDefault`               | La página recarga y perdés el array / estado | Siempre al inicio del `submit`  |
| No vaciar contenedor antes de render   | Cards duplicadas                             | `innerHTML = ""` antes del loop |
| Guardar objeto directo en localStorage | Se guarda `"[object Object]"`                | Siempre `JSON.stringify`        |
| Leer localStorage sin parse            | Error o datos raros                          | `JSON.parse(...) \|\| []`       |
| Validar DNI genérico para todos        | Brasil necesita 11, Paraguay 6–8             | `paisConfig.js` por país        |
| Tolerar edad ±1 año                    | Pasan datos incoherentes                     | Comparación exacta con `Date`   |
| Usar `alert()`                         | UX mala y el profe lo marca                  | Toasts + banner + consola       |
| `required` en HTML                     | Doble validación confusa                     | `novalidate` + solo JS          |
| Inputs sin `maxLength` en teléfono     | Números enormes                              | `maxLength` dinámico por país   |

---

# Conclusión final

Con este TP entendí mucho mejor el ciclo **evento → validar → actualizar datos → renderizar DOM**.

- **Lo más útil:** ver en el Punto 2 cómo cambia el array según `push` o `unshift` _y_ verlo en pantalla, no solo en la consola del navegador.
- **Lo más difícil:** el Punto 3, sobre todo sincronizar nacionalidad → documento → teléfono → prefijo sin que quede una validación genérica falsa.
- **DOM:** perdoné de pensar en “páginas” y pasé a pensar en **nodos** que creo, borro y vuelvo a crear.
- **localStorage:** aprendí que es persistencia simple del lado cliente, ideal para prototipos, no para datos sensibles sin backend.
- **Validaciones:** me quedó claro que conviene centralizar reglas por país en un objeto config en vez de llenar el `main.js` de `if`.

Si tengo que defenderlo oralmente, arranco mostrando el Punto 1 (sin recarga + 3 lecturas en vivo), después el Punto 2 (elijo `unshift` y muestra el JSON cambiando) y cierro con el Punto 3 cargando una persona argentina con DNI de 8 dígitos y teléfono de 10 — y recargando la página para demostrar que sigue guardado.

---

## Mapa rápido de archivos

| Proyecto | Entrada HTML                    | Lógica principal  | Extra importante                             |
| -------- | ------------------------------- | ----------------- | -------------------------------------------- |
| 1        | `01_invitados/pages/index.html` | `scripts/main.js` | `modules/formReaders.js`                     |
| 2        | `02_mascotas/pages/index.html`  | `scripts/main.js` | `modules/arrayStorage.js`                    |
| 3        | `03_pasajeros/pages/index.html` | `scripts/main.js` | `modules/paisConfig.js`, `modules/uiPais.js` |

**Documentación por carpeta:** cada proyecto tiene su `README.md` con instrucciones de ejecución. Este archivo es la explicación académica completa.
