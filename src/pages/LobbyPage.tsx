import { Copy, Play, Trash2, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { navigate } from '../app/router';
import { findThemeName } from '../data/themes';
import { isHostedWithoutSupabase } from '../services/supabaseClient';
import { useGameStore } from '../store/gameStore';

interface LobbyPageProps {
  gameId: string;
}

export const LobbyPage = ({ gameId }: LobbyPageProps) => {
  const [copyMessage, setCopyMessage] = useState('');
  const session = useGameStore((state) => state.session);
  const startGame = useGameStore((state) => state.startGame);
  const addSimulatedPlayer = useGameStore((state) => state.addSimulatedPlayer);
  const deleteGame = useGameStore((state) => state.deleteGame);

  if (!session || session.game.id !== gameId) {
    return <p className="rounded-lg border border-line bg-panel p-5">No encontramos esta partida.</p>;
  }

  const joinLink = `${window.location.origin}${window.location.pathname}#/join/${session.game.code}`;
  const maxPlayers = session.game.maxPlayers ?? 2;
  const canStart = session.players.length >= 2;

  const start = async () => {
    await startGame();
    navigate(`/host/${session.game.id}`);
  };

  const closeGame = async () => {
    if (!window.confirm('Cerrar esta partida? Se va a borrar del modo local.')) return;
    await deleteGame();
    navigate('/');
  };

  const copyJoinLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(joinLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = joinLink;
        textarea.setAttribute('readonly', 'true');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (!copied) throw new Error('copy command failed');
      }
      setCopyMessage('Link copiado');
    } catch {
      setCopyMessage('No se pudo copiar automatico. Mantené apretado el link y copialo manualmente.');
    }
    window.setTimeout(() => setCopyMessage(''), 3500);
  };

  return (
    <div className="grid gap-3 sm:gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-line bg-panel p-3 sm:p-5">
        <div className="mb-3 flex flex-wrap gap-2 sm:mb-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white"
            onClick={closeGame}
          >
            <Trash2 size={16} /> Cerrar partida
          </button>
        </div>
        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Lobby del host</p>
        <h2 className="text-2xl font-black leading-tight sm:text-3xl">{session.game.title}</h2>
        <p className="mt-1 text-sm text-slate-300 sm:mt-2 sm:text-base">{findThemeName(session.game.theme)}</p>
        <div className="mt-3 rounded-xl border border-blue-300/40 bg-white p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
          <p className="text-xs text-blue-100 sm:text-sm">Codigo de partida</p>
          <p className="mt-1 text-4xl font-black tracking-widest text-blue-200 sm:text-5xl">{session.game.code}</p>
        </div>
        <div className="mt-3 grid gap-2 sm:mt-4">
          <p className="text-sm font-bold text-slate-300">Link para compartir con jugadores</p>
          {isHostedWithoutSupabase && (
            <p className="rounded-lg border border-amber-300/40 bg-amber-400/10 p-2.5 text-sm font-semibold text-amber-100 sm:p-3">
              Este link de GitHub necesita Supabase para que otros celulares vean la partida. Ahora esta funcionando
              solo en este navegador.
            </p>
          )}
          <input
            readOnly
            value={joinLink}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm sm:py-3"
            aria-label="Link para jugadores"
          />
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-bold sm:py-3 sm:text-base"
            onClick={copyJoinLink}
          >
            <Copy size={18} /> Copiar link para jugadores
          </button>
          {copyMessage && <p className="text-sm font-bold text-blue-300">{copyMessage}</p>}
        </div>
        <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-lg bg-slate-700 px-4 py-2.5 text-sm font-bold sm:py-3 sm:text-base"
            onClick={() => addSimulatedPlayer()}
            disabled={session.players.length >= maxPlayers}
          >
            Simular jugador
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-black text-amber-950 sm:py-3 sm:text-base"
            onClick={start}
            disabled={!canStart}
          >
            <Play size={18} /> Iniciar partida
          </button>
        </div>
      </section>
      <section className="rounded-lg border border-line bg-panel p-3 sm:p-5">
        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Conexion de jugadores</p>
        <h3 className="text-xl font-black sm:text-2xl">
          {session.players.length < 2 ? 'Esperando al menos 2 jugadores' : `${session.players.length}/${maxPlayers} jugadores`}
        </h3>
        <div className="mt-3 grid gap-2 sm:mt-5 sm:gap-3">
          {Array.from({ length: maxPlayers }, (_, index) => index + 1).map((slot) => {
            const player = session.players.find((item) => item.slot === slot);
            return (
              <div key={slot} className="flex items-center justify-between rounded-xl border border-line bg-white p-3 sm:rounded-2xl sm:p-4">
                <div>
                  <p className="text-xs text-slate-400 sm:text-sm">Jugador {slot}</p>
                  <p className="text-lg font-bold sm:text-xl">{player?.name ?? 'Pendiente'}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold sm:text-sm ${
                    player ? 'bg-emerald-500 text-emerald-950' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {player ? 'Conectado' : 'Esperando'}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
