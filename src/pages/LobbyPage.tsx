import { Copy, Play, Trash2, ArrowLeft } from 'lucide-react';
import { navigate } from '../app/router';
import { findThemeName } from '../data/themes';
import { useGameStore } from '../store/gameStore';

interface LobbyPageProps {
  gameId: string;
}

export const LobbyPage = ({ gameId }: LobbyPageProps) => {
  const session = useGameStore((state) => state.session);
  const startGame = useGameStore((state) => state.startGame);
  const addSimulatedPlayer = useGameStore((state) => state.addSimulatedPlayer);
  const deleteGame = useGameStore((state) => state.deleteGame);

  if (!session || session.game.id !== gameId) {
    return <p className="rounded-lg border border-line bg-panel p-5">No encontramos esta partida.</p>;
  }

  const joinLink = `${window.location.origin}${window.location.pathname}#/join/${session.game.code}`;
  const canStart = session.players.length === 2;

  const start = async () => {
    await startGame();
    navigate(`/host/${session.game.id}`);
  };

  const closeGame = async () => {
    if (!window.confirm('Cerrar esta partida? Se va a borrar del modo local.')) return;
    await deleteGame();
    navigate('/');
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg border border-line bg-panel p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-bold"
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Volver
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-2 text-sm font-bold text-white"
            onClick={closeGame}
          >
            <Trash2 size={16} /> Cerrar partida
          </button>
        </div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Lobby del host</p>
        <h2 className="text-3xl font-black">{session.game.title}</h2>
        <p className="mt-2 text-slate-300">{findThemeName(session.game.theme)}</p>
        <div className="mt-5 rounded-lg border border-blue-300/40 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-100">Codigo de partida</p>
          <p className="mt-1 text-5xl font-black tracking-widest text-blue-200">{session.game.code}</p>
        </div>
        <div className="mt-4 grid gap-2">
          <p className="text-sm font-bold text-slate-300">Link para compartir con jugadores</p>
          <p className="break-all rounded-md bg-black/15 p-3 text-sm text-slate-300">{joinLink}</p>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-700 px-4 py-3 font-bold"
            onClick={() => navigator.clipboard?.writeText(joinLink)}
          >
            <Copy size={18} /> Copiar link para jugadores
          </button>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            className="rounded-md bg-slate-700 px-4 py-3 font-bold"
            onClick={() => addSimulatedPlayer('Jugador 1')}
            disabled={session.players.length >= 2}
          >
            Simular jugador
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-3 font-black text-amber-950"
            onClick={start}
            disabled={!canStart}
          >
            <Play size={18} /> Iniciar partida
          </button>
        </div>
      </section>
      <section className="rounded-lg border border-line bg-panel p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Conexion de jugadores</p>
        <h3 className="text-2xl font-black">Esperando 2 jugadores</h3>
        <div className="mt-5 grid gap-3">
          {[1, 2].map((slot) => {
            const player = session.players.find((item) => item.slot === slot);
            return (
              <div key={slot} className="flex items-center justify-between rounded-md border border-line bg-black/10 p-4">
                <div>
                  <p className="text-sm text-slate-400">Jugador {slot}</p>
                  <p className="text-xl font-bold">{player?.name ?? 'Pendiente'}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
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
