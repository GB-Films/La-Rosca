# La Rosca - contexto para Codex

## Proyecto

- App web: **La Rosca**.
- Repo: `https://github.com/GB-Films/La-Rosca.git`.
- Deploy publico: `https://gb-films.github.io/La-Rosca/`.
- Stack: React, Vite, TypeScript, Tailwind, Zustand, Supabase.
- Workspace principal usado por Codex: `D:\OneDrive\Guido\00_Proyectos\02_Juegos\Pasapalabra`.

## Regla de trabajo

- Antes de tocar codigo, correr siempre:
  `git pull --ff-only origin main`
- Si se modifica codigo o documentacion del repo:
  - correr `npm.cmd run build` cuando aplique;
  - hacer commit;
  - hacer push a `main`.
- GitHub Pages deploya automaticamente despues del push.
- GitHub es la fuente de verdad entre computadoras y chats de Codex.

## Producto

- Juego para 1 host y entre 2 y 10 jugadores.
- El host crea partida, comparte link, controla respuestas y tiempos.
- Los jugadores entran desde su celular con el link/codigo y no ven respuestas correctas.
- Para jugar desde dispositivos distintos usando el link de GitHub Pages, Supabase debe estar configurado.
- Supabase ya fue configurado en GitHub Pages y la tabla `game_sessions` responde.

## Estetica actual

- Nombre visible: **La Rosca**.
- Paleta solicitada: azul oscuro dominante, texto blanco, celestes como acento y amarillo para acciones principales.
- Logo: solo rosca de pascua, sin sol ni otros iconos.

## Preguntas

- `src/data/sampleQuestions.ts` contiene packs base por categoria y jugador.
- `src/data/argentinaGeneralLibrary.ts` contiene 270 respuestas base de cultura general argentina y la app las puede asignar a hasta 10 jugadores sin repetir respuesta por letra.
- `src/data/categoryLibraries.ts` contiene 270 preguntas por subcategoria para cine argentino, futbol argentino y musica nacional.
- Para agregar, borrar o corregir preguntas fuente, editar principalmente:
  - `src/data/argentinaGeneralLibrary.ts` para cultura general argentina.
  - `src/data/sampleQuestions.ts` para cine, musica, historia, futbol y las semillas que usa `categoryLibraries.ts`.
- Para revision humana comoda en Excel, usar `docs/preguntas-editables.csv`; el usuario puede editar ese archivo y Codex luego pasa los cambios a los archivos fuente.
- `docs/preguntas-editables.tsv` queda como respaldo tecnico, pero el archivo recomendado para el usuario es el CSV separado por punto y coma.
- El TSV editable debe tener una categoria principal unica: `Preguntas de cultura general`, con subcategorias como `Cultura general argentina`, `Cine Argentino`, `Futbol Argentino` y `Musica Nacional`.
- La guia de edicion esta en `docs/EDITAR_PREGUNTAS.md`.
- No usar la frase "Respuesta de cultura general argentina" dentro de los prompts.
- Mantener preguntas distintas por jugador: dos jugadores no deben recibir la misma respuesta para la misma letra.
- Para las letras dificiles `Ñ`, `K`, `Q`, `W`, `X`, `Y`, `Z`, usar `contains`; en cultura general argentina las respuestas no deben empezar con esa letra, solo contenerla.
- Validar que `startsWith` empiece con la letra y `contains` contenga la letra.
- En crear partida, "Usar pack existente" muestra una seleccion aleatoria y un boton para randomizar otra seleccion.
- "Personalizado editable" permite editar, borrar, agregar y guardar presets en localStorage del navegador.

## Supabase

- Configuracion documentada en `SUPABASE.md`.
- SQL en `supabase/schema.sql`.
- GitHub Secrets necesarios:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Notas recientes

- En la vista del host durante la partida, el editor de preguntas queda oculto; el jugador activo se muestra grande y los demas jugadores quedan compactos en un rail lateral/en fila horizontal en mobile.
- Los warnings del editor de preguntas en crear partida solo deben mostrarse despues de apretar "Crear partida"; si siguen existiendo, bloquean la creacion.
- El centro del rosco activo muestra la letra actual grande y el tiempo restante. La seccion de jugadores en espera no muestra roscos, solo resumen compacto.
- El store usa `mutationVersion` para que polling/timer/realtime no pisen con estado viejo una accion del host recien tocada.
- En desktop, el scoreboard del jugador activo va en una sola fila: jugador, timer y metricas.
- El color de letras/respuestas correctas debe diferenciarse claramente del amarillo de "Pasa": usar verde esmeralda oscuro con texto blanco.
- Se agrego aviso para cuando GitHub Pages corre sin Supabase.
- El boton copiar link tiene fallback para navegadores moviles.
- Si una partida fue creada antes de Supabase, no aparece en otros celulares; hay que crear una partida nueva.
