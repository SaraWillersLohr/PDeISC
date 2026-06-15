# Proyecto 15 — El Mensaje Secreto

Ejercicio **extra** de la colección `14_proyectos_node`. Decodifica un mensaje donde los fragmentos entre paréntesis están escritos al revés.

## Problema

Dado un texto con bloques codificados entre `(` y `)`, hay que:

1. Detectar cada bloque.
2. Extraer su contenido (sin paréntesis).
3. Invertir los caracteres del contenido.
4. Reemplazar el bloque completo por el texto legible.

### Ejemplo

**Entrada:**

```
Hoy (.sh 22 sal a) (ed asac ne sominuer son) Marcelo.
```

**Salida:**

```
Hoy a las 22 hs. nos reunimos en casa de Marcelo.
```

Los paréntesis desaparecen del resultado final.

## Estrategia

El algoritmo se divide en pasos fáciles de explicar en un oral:

1. **Recorrido del string** — recorro el mensaje carácter a carácter buscando `(`.
2. **Detección de bloques** — cuando encuentro `(`, leo hasta `)` y guardo el bloque en un array.
3. **Inversión** — para cada contenido uso `split("")` → `reverse()` → `join("")`.
4. **Reconstrucción** — armo un array `partes` con `push()`: texto plano + bloque invertido + texto plano…
5. **Resultado** — uno las partes con `join("")`.

No se usa una única regex compleja: la lógica es explícita y didáctica.

## Métodos utilizados

| Recurso | Uso en este ejercicio |
|---------|------------------------|
| `Array` | Lista de bloques detectados y partes del mensaje final |
| `String` | Mensaje de entrada y contenido de cada bloque |
| `split("")` | Convierte el contenido en array de caracteres |
| `reverse()` | Invierte el orden de los caracteres |
| `join("")` | Vuelve a unir los caracteres en un string |
| `push()` | Agrega fragmentos al array `partes` |
| `forEach()` | Recorre bloques para armar el resultado |
| `slice()` | Extrae tramos del mensaje original |

## Ejemplos

| Bloque original | Contenido | Invertido |
|-----------------|-----------|-----------|
| `(.sh 22 sal a)` | `.sh 22 sal a` | `a las 22 hs.` |
| `(ed asac ne sominuer son)` | `ed asac ne sominuer son` | `nos reunimos en casa de` |

## Complejidad

Sea **n** la longitud del mensaje y **b** la cantidad de bloques:

| Paso | Complejidad | Notas |
|------|-------------|-------|
| Detectar bloques | O(n) | Un solo recorrido del string |
| Invertir cada bloque | O(n) en total | Cada carácter se procesa una vez |
| Armar resultado | O(n) | `slice` + `join` sobre el texto |
| **Total** | **O(n)** | Lineal respecto al tamaño del mensaje |

Espacio auxiliar: O(n) para almacenar bloques y partes intermedias.

## Estructura

```
15_secreto/
├── pages/index.html
├── scripts/script.js
├── styles/style.css
├── server.js
├── package.json
└── README.md
```

## Cómo correr

```bash
cd 15_secreto
npm install
node server.js
```

Abrí `http://localhost:3026`

También podés usar **Live Server** abriendo la carpeta `14_proyectos_node` como workspace y luego `15_secreto/pages/index.html`.

## Interfaz

- Descripción del problema
- Área de texto con mensaje precargado
- Botón **Decodificar**
- Flujo visual: Mensaje original → Bloques detectados → Transformación → Resultado final
- Detalle por bloque: original, contenido e invertido
- Consola visual de eventos (compartida con `_shared/`)
- Modo claro / oscuro
- Botón volver arriba

## Tecnologías

- HTML5, CSS3, JavaScript ES modules
- Bootstrap 5, Font Awesome, Animate.css
- Node + Express (servidor estático)
- Módulos compartidos en `../_shared/`
