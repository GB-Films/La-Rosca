import { build } from 'esbuild';

const entry = `
  import { applyAnswerToSession, tickSessionInMemory } from './src/services/gameService.ts';

  const players = [
    { id: 'p1', gameId: 'game', name: 'Uno', role: 'player', slot: 1, score: 0, remainingSeconds: 10, connected: true },
    { id: 'p2', gameId: 'game', name: 'Dos', role: 'player', slot: 2, score: 0, remainingSeconds: 10, connected: true },
  ];
  const letters = [
    { playerId: 'p1', letter: 'A', status: 'passed', questionId: 'p1-a' },
    { playerId: 'p1', letter: 'B', status: 'passed', questionId: 'p1-b' },
    { playerId: 'p2', letter: 'C', status: 'passed', questionId: 'p2-c' },
    { playerId: 'p2', letter: 'D', status: 'passed', questionId: 'p2-d' },
  ];
  const action = (id, playerId, letter) => ({
    id,
    gameId: 'game',
    playerId,
    letter,
    action: 'pass',
    previousState: null,
    nextState: null,
    timestamp: new Date().toISOString(),
  });
  const session = {
    game: {
      id: 'game',
      code: 'TEST01',
      title: 'Prueba',
      theme: 'test',
      status: 'playing',
      hostId: 'host',
      activePlayerId: 'p1',
      activeLetter: 'B',
      timerSeconds: 10,
      maxPlayers: 2,
      includeÑ: false,
      showQuestionToPlayers: false,
      createdAt: new Date().toISOString(),
    },
    players,
    letters,
    questions: [],
    actionLog: [action('a1', 'p1', 'A'), action('a2', 'p2', 'C')],
  };

  applyAnswerToSession(session, 'game', 'pass');
  if (session.game.activePlayerId !== 'p2' || session.game.activeLetter !== 'D') {
    throw new Error('El jugador 2 no avanzo a su siguiente letra pasada.');
  }

  applyAnswerToSession(session, 'game', 'pass');
  if (session.game.activePlayerId !== 'p1' || session.game.activeLetter !== 'A') {
    throw new Error('El jugador 1 no continuo la rotacion de letras pasadas.');
  }

  tickSessionInMemory(session, 3);
  if (session.players[0].remainingSeconds !== 7) {
    throw new Error('El cronometro no desconto todo el tiempo transcurrido durante la segunda vuelta.');
  }

  session.players[0].remainingSeconds = 1;
  session.players[1].remainingSeconds = 5;
  tickSessionInMemory(session, 3);
  if (
    session.players[0].remainingSeconds !== 0 ||
    session.players[1].remainingSeconds !== 3 ||
    session.game.activePlayerId !== 'p2'
  ) {
    throw new Error('El cronometro no transfirio correctamente el tiempo transcurrido al siguiente jugador.');
  }
`;

const result = await build({
  absWorkingDir: process.cwd(),
  bundle: true,
  define: {
    'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined',
    'import.meta.env.VITE_SUPABASE_URL': 'undefined',
  },
  format: 'esm',
  platform: 'node',
  stdin: {
    contents: entry,
    loader: 'ts',
    resolveDir: process.cwd(),
  },
  write: false,
});

const bundled = result.outputFiles[0].text;
await import(`data:text/javascript;base64,${Buffer.from(bundled).toString('base64')}`);
console.log('Game flow verification passed.');
