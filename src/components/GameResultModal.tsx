import type { Player } from '../types/game';

interface GameResultModalProps {
  players: Player[];
  open: boolean;
  onReset: () => void;
  onLobby: () => void;
}

export const GameResultModal = ({ players, open, onReset, onLobby }: GameResultModalProps) => {
  if (!open) return null;
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0]?.score === sorted[1]?.score ? undefined : sorted[0];
  const runnerUp = sorted.filter((player) => player.id !== winner?.id);
  const topScore = sorted[0]?.score ?? 0;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-4">
      <section className="result-modal relative w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-300/45 p-4 shadow-2xl sm:p-6">
        <div className="relative z-10">
          <p className="result-kicker text-[0.68rem] font-black uppercase tracking-[0.24em] text-blue-200 sm:text-xs">
            Resultado final
          </p>

          {winner ? (
            <div className="winner-card mt-3 rounded-2xl border border-amber-200/45 p-4 sm:mt-3 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100/90">Ganador</p>
                  <h2 className="winner-name mt-0.5 text-4xl font-black leading-none text-white sm:text-6xl">
                    {winner.name}
                  </h2>
                </div>
                <div className="winner-score rounded-xl border border-emerald-200/45 px-4 py-3 text-left sm:text-right">
                  <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-100">Puntaje</p>
                  <strong className="block text-5xl font-black leading-none text-emerald-100 sm:text-6xl">
                    {winner.score}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="winner-card mt-3 rounded-2xl border border-amber-200/45 p-4 sm:mt-4 sm:p-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100/90">Partida empatada</p>
              <h2 className="winner-name mt-1 text-4xl font-black leading-none text-white sm:text-6xl">Empate</h2>
              <p className="mt-2 text-lg font-black text-emerald-100">{topScore} puntos</p>
            </div>
          )}

          <div className="mt-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-400">Tabla final</p>
                <h3 className="text-xl font-black text-white">Puntajes de jugadores</h3>
              </div>
              <span className="rounded-full border border-blue-300/35 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-100">
                {players.length} jugadores
              </span>
            </div>

            <div className="result-ranking mt-3 grid gap-2">
              {(winner ? runnerUp : sorted).map((player, index) => (
                <div key={player.id} className="result-row flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2.5">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white/10 text-sm font-black text-blue-100">
                      {winner ? index + 2 : index + 1}
                    </span>
                    <span className="truncate font-black text-white">{player.name}</span>
                  </div>
                  <strong className="rounded-lg bg-emerald-400/15 px-3 py-1 text-lg font-black text-emerald-100">
                    {player.score}
                  </strong>
                </div>
              ))}
              {winner && runnerUp.length === 0 && (
                <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">
                  No hay mas jugadores en la tabla.
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" className="rounded-xl bg-blue-500 px-4 py-3 text-sm font-black text-white" onClick={onReset}>
              Jugar de nuevo
            </button>
            <button type="button" className="rounded-xl bg-slate-700 px-4 py-3 text-sm font-black text-white" onClick={onLobby}>
              Volver al lobby
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
