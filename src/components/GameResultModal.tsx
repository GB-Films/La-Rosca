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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-lg border border-line bg-panel p-6 shadow-2xl">
        <p className="text-sm uppercase tracking-wide text-slate-400">Resultado final</p>
        <h2 className="mt-2 text-3xl font-black">{winner ? `Gana ${winner.name}` : 'Empate'}</h2>
        <div className="mt-5 grid gap-2">
          {sorted.map((player) => (
            <div key={player.id} className="flex items-center justify-between rounded-md bg-white/5 p-3">
              <span>{player.name}</span>
              <strong className="text-emerald-300">{player.score}</strong>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <button type="button" className="rounded-md bg-blue-500 px-4 py-3 font-bold text-blue-950" onClick={onReset}>
            Resetear
          </button>
          <button type="button" className="rounded-md bg-slate-700 px-4 py-3 font-bold" onClick={onLobby}>
            Volver al lobby
          </button>
        </div>
      </div>
    </div>
  );
};
