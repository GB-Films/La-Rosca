import type { LetterState, Player } from '../types/game';
import { Timer } from './Timer';

interface ScoreBoardProps {
  player: Player;
  letters: LetterState[];
  active?: boolean;
}

export const ScoreBoard = ({ player, letters, active }: ScoreBoardProps) => {
  const pending = letters.filter((letter) => letter.status === 'pending' || letter.status === 'passed').length;
  return (
    <div
      className={`rounded-lg border p-4 ${
        active ? 'border-blue-400 bg-blue-500/10' : 'border-line bg-white/[0.04]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Jugador {player.slot}</p>
          <h3 className="text-xl font-bold">{player.name}</h3>
        </div>
        <Timer seconds={player.remainingSeconds} active={active} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-black/15 p-2">
          <p className="text-xs text-slate-400">Puntos</p>
          <p className="text-2xl font-black text-emerald-300">{player.score}</p>
        </div>
        <div className="rounded-md bg-black/15 p-2">
          <p className="text-xs text-slate-400">Pendientes</p>
          <p className="text-2xl font-black">{pending}</p>
        </div>
        <div className="rounded-md bg-black/15 p-2">
          <p className="text-xs text-slate-400">Conexion</p>
          <p className={`text-sm font-bold ${player.connected ? 'text-emerald-300' : 'text-red-300'}`}>
            {player.connected ? 'online' : 'offline'}
          </p>
        </div>
      </div>
    </div>
  );
};
