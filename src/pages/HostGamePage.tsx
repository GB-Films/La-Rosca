import { useMemo } from 'react';
import { navigate } from '../app/router';
import { GameResultModal } from '../components/GameResultModal';
import { HostControls } from '../components/HostControls';
import { QuestionCard } from '../components/QuestionCard';
import { QuestionEditor } from '../components/QuestionEditor';
import { Rosco } from '../components/Rosco';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGameStore } from '../store/gameStore';
import type { Question } from '../types/question';

interface HostGamePageProps {
  gameId: string;
}

export const HostGamePage = ({ gameId }: HostGamePageProps) => {
  const session = useGameStore((state) => state.session);
  const applyAnswer = useGameStore((state) => state.applyAnswer);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const switchTurn = useGameStore((state) => state.switchTurn);
  const undoLastAction = useGameStore((state) => state.undoLastAction);
  const finishGame = useGameStore((state) => state.finishGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const backToLobby = useGameStore((state) => state.backToLobby);
  const setLetterStatus = useGameStore((state) => state.setLetterStatus);
  const updateQuestions = useGameStore((state) => state.updateQuestions);

  const activeQuestion = useMemo(() => {
    if (!session?.game.activePlayerId || !session.game.activeLetter) return undefined;
    const state = session.letters.find(
      (letter) => letter.playerId === session.game.activePlayerId && letter.letter === session.game.activeLetter,
    );
    return session.questions.find((question) => question.id === state?.questionId);
  }, [session]);

  if (!session || session.game.id !== gameId) {
    return <p className="rounded-lg border border-line bg-panel p-5">No encontramos esta partida.</p>;
  }

  const activePlayer = session.players.find((player) => player.id === session.game.activePlayerId);
  const playerOne = session.players.find((player) => player.slot === 1);
  const playerTwo = session.players.find((player) => player.slot === 2);

  const finish = () => {
    if (window.confirm('Terminar la partida ahora?')) finishGame();
  };

  const lobby = () => {
    void backToLobby();
    navigate(`/lobby/${session.game.id}`);
  };

  return (
    <div className="grid gap-3 sm:gap-6">
      <section className="rounded-lg border border-line bg-panel p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Panel del host</p>
            <h2 className="text-xl font-black leading-tight sm:text-3xl">{session.game.title}</h2>
          </div>
          <div className="rounded-md border border-blue-400 bg-blue-500/10 px-2 py-1 text-xs text-blue-100 sm:px-4 sm:py-2 sm:text-base">
            Turno: <strong>{activePlayer?.name ?? '-'}</strong>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)_minmax(0,1fr)] xl:items-start">
        {playerOne && (
          <section className="rounded-lg border border-line bg-panel p-2 sm:p-4">
            <ScoreBoard
              player={playerOne}
              letters={session.letters.filter((letter) => letter.playerId === playerOne.id)}
              active={playerOne.id === session.game.activePlayerId}
            />
            <Rosco
              letters={session.letters.filter((letter) => letter.playerId === playerOne.id)}
              activeLetter={playerOne.id === session.game.activePlayerId ? session.game.activeLetter : undefined}
              onLetterStatusChange={(letter, status) => setLetterStatus(playerOne.id, letter, status)}
            />
          </section>
        )}

        <div className="sticky top-1 z-30 order-first grid content-start gap-2 rounded-lg border border-line bg-ink/95 p-2 shadow-2xl sm:gap-3 xl:order-none xl:top-4 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none">
          <QuestionCard question={activeQuestion} showAnswer letter={session.game.activeLetter} />
          <HostControls
            paused={session.game.status === 'paused'}
            onCorrect={() => applyAnswer('correct')}
            onWrong={() => applyAnswer('wrong')}
            onPass={() => applyAnswer('pass')}
            onPause={pauseGame}
            onResume={resumeGame}
            onSwitch={switchTurn}
            onUndo={undoLastAction}
            onFinish={finish}
          />
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button type="button" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-bold sm:px-4 sm:py-3 sm:text-base" onClick={lobby}>
              Volver al lobby
            </button>
            <button type="button" className="rounded-md bg-slate-700 px-3 py-2 text-sm font-bold sm:px-4 sm:py-3 sm:text-base" onClick={resetGame}>
              Resetear partida
            </button>
          </div>
        </div>

        {playerTwo && (
          <section className="rounded-lg border border-line bg-panel p-2 sm:p-4">
            <ScoreBoard
              player={playerTwo}
              letters={session.letters.filter((letter) => letter.playerId === playerTwo.id)}
              active={playerTwo.id === session.game.activePlayerId}
            />
            <Rosco
              letters={session.letters.filter((letter) => letter.playerId === playerTwo.id)}
              activeLetter={playerTwo.id === session.game.activePlayerId ? session.game.activeLetter : undefined}
              onLetterStatusChange={(letter, status) => setLetterStatus(playerTwo.id, letter, status)}
            />
          </section>
        )}
      </div>

      <QuestionEditor
        questions={session.questions as Question[]}
        theme={session.game.theme}
        includeÑ={session.game.includeÑ}
        onChange={updateQuestions}
      />

      <GameResultModal
        players={session.players}
        open={session.game.status === 'finished'}
        onReset={resetGame}
        onLobby={lobby}
      />
    </div>
  );
};
