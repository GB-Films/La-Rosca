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

  return (
    <div className="mx-auto grid max-w-3xl gap-4 sm:gap-5">
      <section
        className={`rounded-lg border p-4 sm:p-5 ${
          isTurn ? 'border-blue-400 bg-blue-500/10' : 'border-line bg-panel'
        }`}
      >
        <p className="text-xs uppercase tracking-wide text-slate-400">Vista del jugador</p>
        <h2 className="text-2xl font-black sm:text-3xl">{player.name}</h2>
        <p className={`mt-2 text-lg font-bold ${isTurn ? 'text-blue-200' : 'text-slate-300'}`}>
          {isTurn ? 'Es tu turno' : session.game.status === 'finished' ? 'Partida terminada' : 'Esperando turno'}
        </p>
      </section>
      <ScoreBoard player={player} letters={letters} active={isTurn} />
      <section className="rounded-lg border border-line bg-panel p-3 sm:p-4">
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
