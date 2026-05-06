# Como editar preguntas comodamente

El archivo mas comodo para revisar pistas es:

`docs/preguntas-editables.tsv`

Es un archivo de texto con columnas separadas por tabulaciones. Tambien se puede abrir en Excel, Google Sheets o cualquier editor de texto.

## Columnas

- `source`: de donde sale la pregunta.
- `theme`: categoria.
- `playerSlot`: `1`, `2` o vacio si es una pregunta general.
- `letter`: letra del rosco.
- `mode`: `startsWith` o `contains`.
- `answer`: respuesta correcta.
- `clue`: pista sin el prefijo "Con A:".
- `acceptedAnswers`: respuestas alternativas separadas por coma.

## Como corregir

Edita principalmente las columnas:

- `answer`
- `clue`
- `acceptedAnswers`

No cambies `source`, `theme`, `playerSlot`, `letter` ni `mode` salvo que quieras mover una pregunta de categoria, jugador, letra o tipo.

## Criterio de calidad para pistas

Evitar pistas demasiado genericas como:

`Actriz y conductora argentina.`

Preferir pistas con un dato distintivo:

`Figura del teatro de revistas, vedette, actriz y conductora argentina conocida como La One.`

## Como lo pasamos a la app

Cuando termines de editar `docs/preguntas-editables.tsv`, avisale a Codex. Codex puede leer ese archivo, convertir los cambios a los archivos fuente de la app y despues hacer build, commit y push.
