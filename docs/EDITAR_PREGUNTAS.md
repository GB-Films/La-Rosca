# Como editar preguntas comodamente

El archivo mas comodo para revisar pistas es:

`docs/preguntas-editables.tsv`

Si Excel lo tiene abierto y Codex no puede reemplazarlo, Codex puede generar una version nueva como:

`docs/preguntas-editables-nuevo.tsv`

Es un archivo de texto con columnas separadas por tabulaciones. Tambien se puede abrir en Excel, Google Sheets o cualquier editor de texto.

## Columnas

- `categoria`: categoria principal. Debe ser `Preguntas de cultura general`.
- `subcategoria`: grupo interno, por ejemplo `Cultura general argentina`, `Cine Argentino`, `Futbol Argentino` o `Musica Nacional`.
- `letter`: letra del rosco.
- `mode`: `startsWith` o `contains`.
- `answer`: respuesta correcta.
- `difficulty`: por ahora debe quedar en `normal`.
- `description`: pista sin el prefijo "Con A:".
- `acceptedAnswers`: respuestas alternativas separadas por coma.

## Como corregir

Edita principalmente las columnas:

- `answer`
- `description`
- `acceptedAnswers`

No cambies `categoria`, `subcategoria`, `letter`, `mode` ni `difficulty` salvo que quieras mover una pregunta de categoria, letra, tipo o dificultad.

## Criterio de calidad para pistas

Evitar pistas demasiado genericas como:

`Actriz y conductora argentina.`

Preferir pistas con un dato distintivo:

`Figura del teatro de revistas, vedette, actriz y conductora argentina conocida como La One.`

## Como lo pasamos a la app

Cuando termines de editar `docs/preguntas-editables.tsv`, avisale a Codex. Codex puede leer ese archivo, convertir los cambios a los archivos fuente de la app y despues hacer build, commit y push.
