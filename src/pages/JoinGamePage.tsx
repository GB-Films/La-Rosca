import { useState } from 'react';
import { navigate } from '../app/router';
import { useGameStore } from '../store/gameStore';

interface JoinGamePageProps {
  initialCode?: string;
}

export const JoinGamePage = ({ initialCode }: JoinGamePageProps) => {
  const joinGame = useGameStore((state) => state.joinGame);
  const [code, setCode] = useState(initialCode ?? '');
  const [name, setName] = useState(localStorage.getItem('el-rosco:lastPlayerName') ?? '');
  const [error, setError] = useState('');

  const join = async () => {
    try {
      const session = await joinGame(code.trim(), name.trim());
      const player = session.players[session.players.length - 1];
      navigate(`/player/${session.game.id}/${player.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo entrar a la partida.');
    }
  };

  return (
    <section className="mx-auto max-w-xl rounded-lg border border-line bg-panel p-3 sm:p-5">
      <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Unirse como jugador</p>
      <h2 className="text-2xl font-black leading-tight sm:text-3xl">Entrar a una partida</h2>
      <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-200">Codigo de partida</span>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            className="rounded-md border border-line bg-ink px-3 py-2.5 uppercase sm:py-3"
            placeholder="ABC123"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-200">Nombre del jugador</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-md border border-line bg-ink px-3 py-2.5 sm:py-3"
            placeholder="Tu nombre"
          />
        </label>
        {error && <p className="rounded-md border border-red-300/40 bg-red-500/10 p-3 text-red-100">{error}</p>}
        <button type="button" className="rounded-md bg-amber-400 px-5 py-3 font-black text-amber-950 sm:py-4" onClick={join}>
          Entrar
        </button>
      </div>
    </section>
  );
};
