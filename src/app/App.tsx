import { useEffect, useState } from 'react';
import { CreateGamePage } from '../pages/CreateGamePage';
import { HomePage } from '../pages/HomePage';
import { HostGamePage } from '../pages/HostGamePage';
import { JoinGamePage } from '../pages/JoinGamePage';
import { LobbyPage } from '../pages/LobbyPage';
import { PlayerGamePage } from '../pages/PlayerGamePage';
import { BrandLogo } from '../components/BrandLogo';
import { localRealtimeAdapter } from '../services/realtime';
import { useGameStore } from '../store/gameStore';
import { navigate, parseRoute, type Route } from './router';

export const App = () => {
  const [route, setRoute] = useState<Route>(() => parseRoute());
  const loadSession = useGameStore((state) => state.loadSession);
  const tick = useGameStore((state) => state.tick);
  const session = useGameStore((state) => state.session);
  const pendingAction = useGameStore((state) => state.pendingAction);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    const gameId = 'gameId' in route ? route.gameId : undefined;
    void loadSession(gameId);
  }, [loadSession, route]);

  useEffect(() => {
    const refresh = () => {
      const gameId = 'gameId' in route ? route.gameId : undefined;
      void loadSession(gameId);
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('el-rosco:games-changed', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('el-rosco:games-changed', refresh);
    };
  }, [loadSession, route]);

  useEffect(() => {
    if (!('gameId' in route)) return undefined;
    const id = window.setInterval(() => void loadSession(route.gameId), 1200);
    return () => window.clearInterval(id);
  }, [loadSession, route]);

  useEffect(() => {
    if (!('gameId' in route)) return undefined;
    return localRealtimeAdapter.subscribeToGame(route.gameId, (updatedSession) => {
      if (updatedSession) {
        if (!useGameStore.getState().pendingAction) useGameStore.setState({ session: updatedSession });
      } else {
        void loadSession(route.gameId);
      }
    });
  }, [loadSession, route]);

  useEffect(() => {
    if (session?.game.status !== 'playing' || route.name !== 'host' || pendingAction) return undefined;
    const id = window.setInterval(() => void tick(), 1000);
    return () => window.clearInterval(id);
  }, [pendingAction, route.name, session?.game.status, tick]);

  let page = <HomePage />;
  if (route.name === 'create') page = <CreateGamePage />;
  if (route.name === 'join') page = <JoinGamePage initialCode={route.code} />;
  if (route.name === 'lobby') page = <LobbyPage gameId={route.gameId} />;
  if (route.name === 'host') page = <HostGamePage gameId={route.gameId} />;
  if (route.name === 'player') page = <PlayerGamePage gameId={route.gameId} playerId={route.playerId} />;

  return (
    <div className="min-h-screen">
      <header className="app-header border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-4 sm:py-3">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-left sm:gap-3">
            <BrandLogo size="sm" />
            <span>
              <p className="stamp-label text-[0.65rem] uppercase tracking-[0.18em] sm:text-xs sm:tracking-[0.2em]">
                Juego local
              </p>
              <h1 className="brand-title text-xl font-black sm:text-2xl">La Rosca</h1>
            </span>
          </button>
          <span className="route-badge rounded-md px-2 py-1 text-[0.7rem] sm:px-3 sm:text-xs">Host</span>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-2 py-2 sm:px-4 sm:py-6">{page}</main>
    </div>
  );
};
