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

- Juego para 1 host y 2 jugadores.
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
- `src/data/argentinaGeneralLibrary.ts` genera 540 preguntas de cultura general argentina.
- No usar la frase "Respuesta de cultura general argentina" dentro de los prompts.
- Mantener preguntas distintas por jugador cuando corresponda.
- Validar que `startsWith` empiece con la letra y `contains` contenga la letra.

## Supabase

- Configuracion documentada en `SUPABASE.md`.
- SQL en `supabase/schema.sql`.
- GitHub Secrets necesarios:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

## Notas recientes

- Se agrego aviso para cuando GitHub Pages corre sin Supabase.
- El boton copiar link tiene fallback para navegadores moviles.
- Si una partida fue creada antes de Supabase, no aparece en otros celulares; hay que crear una partida nueva.
