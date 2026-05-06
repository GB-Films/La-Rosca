import type { LetterState, Player } from '../types/game';
import { Timer } from './Timer';

interface ScoreBoardProps {
  player: Player;
  letters: LetterState[];
  active?: boolean;
  compact?: boolean;
}

export const ScoreBoard = ({ player, letters, active, compact }: ScoreBoardProps) => {
  const pending = letters.filter((letter) => letter.status === 'pending' || letter.status === 'passed').length;
  return (
    <div
      className={`rounded-lg border ${compact ? 'p-2' : 'p-2.5 sm:p-4'} ${
        active ? 'border-blue-400 bg-blue-500/10' : 'border-line bg-white/[0.04]'
      }`}
    >
      <div className={compact ? 'flex items-center justify-between gap-2' : 'grid items-center gap-2 sm:grid-cols-[minmax(8rem,1fr)_auto_minmax(16rem,1.3fr)]'}>
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Jugador {player.slot}</p>
          <h3 className={`${compact ? 'text-sm' : 'text-base sm:text-xl'} font-bold leading-tight`}>{player.name}</h3>
        </div>
        {!compact && <Timer seconds={player.remainingSeconds} active={active} />}
        {!compact && (
          <div className="grid grid-cols-3 gap-1.5 text-center sm:gap-2">
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
        )}
      </div>
      {compact ? (
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className="font-black text-emerald-300">{player.score} pts</span>
          <span className="font-bold text-slate-300">{pending} pend.</span>
          <span className={player.connected ? 'text-emerald-300' : 'text-red-300'}>
            {player.connected ? 'online' : 'offline'}
          </span>
        </div>
      ) : null}
    </div>
  );
};
