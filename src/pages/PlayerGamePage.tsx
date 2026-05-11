import { useMemo } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import { Rosco } from '../components/Rosco';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGameStore } from '../store/gameStore';

interface PlayerGamePageProps {
  gameId: string;
  playerId: string;
}

export const PlayerGamePage = ({ gameId, playerId }: PlayerGamePageProps) => {
  const session = useGameStore((state) => state.session);

  const activeQuestion = useMemo(() => {
    if (!session?.game.showQuestionToPlayers || session.game.activePlayerId !== playerId || !session.game.activeLetter) {
      return undefined;
    }
    const state = session.letters.find(
      (letter) => letter.playerId === playerId && letter.letter === session.game.activeLetter,
    );
    return session.questions.find((question) => question.id === state?.questionId);
  }, [playerId, session]);

  if (!session || session.game.id !== gameId) {
    return <p className="rounded-lg border border-line bg-panel p-5">No encontramos esta partida.</p>;
  }

  const player = session.players.find((item) => item.id === playerId);
  if (!player) return <p className="rounded-lg border border-line bg-panel p-5">No encontramos tu jugador.</p>;

  const letters = session.letters.filter((letter) => letter.playerId === player.id);
  const isTurn = session.game.activePlayerId === player.id && session.game.status === 'playing';
  const finalRanking = [...session.players].sort((a, b) => b.score - a.score || a.slot - b.slot);
  const playerPosition = finalRanking.findIndex((item) => item.id === player.id) + 1;
  const topScore = finalRanking[0]?.score ?? 0;

  if (session.game.status === 'finished') {
    return (
      <div className="mx-auto grid max-w-3xl gap-3 sm:gap-5">
        <section className="player-final-card rounded-2xl border border-blue-300/45 p-4 shadow-2xl sm:p-6">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.24em] text-blue-200 sm:text-xs">
            Resultado final
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-100">Tu posicion</p>
              <h2 className="mt-1 text-5xl font-black leading-none text-white sm:text-7xl">
                #{playerPosition}
              </h2>
              <p className="mt-2 text-2xl font-black text-white">{player.name}</p>
            </div>
            <div className="rounded-2xl border border-emerald-200/45 bg-emerald-500/15 p-4 sm:min-w-36 sm:text-right">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-emerald-100">Puntaje</p>
              <strong className="block text-5xl font-black leading-none text-emerald-100">{player.score}</strong>
            </div>
          </div>
          {player.score < topScore && (
            <p className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm font-bold text-slate-200">
              Quedaste a {topScore - player.score} punto{topScore - player.score === 1 ? '' : 's'} del primer puesto.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-panel p-3 sm:p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-slate-400">Tabla completa</p>
              <h3 className="text-xl font-black text-white">Puntajes finales</h3>
            </div>
            <span className="rounded-full border border-blue-300/35 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-100">
              {session.players.length} jugadores
            </span>
          </div>
          <div className="mt-3 grid gap-2">
            {finalRanking.map((item, index) => (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                  item.id === player.id ? 'border-amber-200/55 bg-amber-400/15' : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-white/10 text-sm font-black text-blue-100">
                    {index + 1}
                  </span>
                  <span className="truncate font-black text-white">{item.name}</span>
                </div>
                <strong className="rounded-lg bg-emerald-400/15 px-3 py-1 text-lg font-black text-emerald-100">
                  {item.score}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-2.5 sm:gap-5">
      <section
        className={`rounded-lg border p-3 sm:p-5 ${
          isTurn ? 'border-blue-400 bg-blue-500/10' : 'border-line bg-panel'
        }`}
      >
        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Vista del jugador</p>
        <h2 className="text-xl font-black leading-tight sm:text-3xl">{player.name}</h2>
        <p className={`mt-1 text-sm font-bold sm:text-lg ${isTurn ? 'text-blue-200' : 'text-slate-300'}`}>
          {isTurn ? 'Es tu turno' : 'Esperando turno'}
        </p>
      </section>
      <ScoreBoard player={player} letters={letters} active={isTurn} />
      <section className="rounded-lg border border-line bg-panel p-2 sm:p-4">
        <Rosco letters={letters} activeLetter={isTurn ? session.game.activeLetter : undefined} />
      </section>
      <QuestionCard
        question={activeQuestion}
        showAnswer={false}
        letter={isTurn ? session.game.activeLetter : undefined}
      />
    </div>
  );
};
