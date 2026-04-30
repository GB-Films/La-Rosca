export type Route =
  | { name: 'home' }
  | { name: 'create' }
  | { name: 'join'; code?: string }
  | { name: 'lobby'; gameId: string }
  | { name: 'host'; gameId: string }
  | { name: 'player'; gameId: string; playerId: string };

export const navigate = (path: string) => {
  window.location.hash = path;
};

export const parseRoute = (): Route => {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [name, first, second] = hash.split('/');
  if (name === 'create') return { name: 'create' };
  if (name === 'join') return { name: 'join', code: first };
  if (name === 'lobby' && first) return { name: 'lobby', gameId: first };
  if (name === 'host' && first) return { name: 'host', gameId: first };
  if (name === 'player' && first && second) return { name: 'player', gameId: first, playerId: second };
  return { name: 'home' };
};
