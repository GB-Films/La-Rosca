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
      className={`rounded-lg border p-2.5 sm:p-4 ${
        active ? 'border-blue-400 bg-blue-500/10' : 'border-line bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Jugador {player.slot}</p>
          <h3 className="text-base font-bold leading-tight sm:text-xl">{player.name}</h3>
        </div>
        <Timer seconds={player.remainingSeconds} active={active} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center sm:mt-4 sm:gap-2">
        <div className="rounded-md bg-black/15 p-1.5 sm:p-2">
          <p className="text-[0.65rem] text-slate-400 sm:text-xs">
            <span className="sm:hidden">Pts</span>
            <span className="hidden sm:inline">Puntos</span>
          </p>
          <p className="text-xl font-black text-emerald-300 sm:text-2xl">{player.score}</p>
        </div>
        <div className="rounded-md bg-black/15 p-1.5 sm:p-2">
          <p className="text-[0.65rem] text-slate-400 sm:text-xs">
            <span className="sm:hidden">Pend</span>
            <span className="hidden sm:inline">Pendientes</span>
          </p>
          <p className="text-xl font-black sm:text-2xl">{pending}</p>
        </div>
        <div className="rounded-md bg-black/15 p-1.5 sm:p-2">
          <p className="text-[0.65rem] text-slate-400 sm:text-xs">Conex</p>
          <p className={`text-xs font-bold sm:text-sm ${player.connected ? 'text-emerald-300' : 'text-red-300'}`}>
            {player.connected ? 'online' : 'offline'}
          </p>
        </div>
      </div>
    </div>
  );
};
