import { useMemo, useState } from 'react';
import { navigate } from '../app/router';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { GameResultModal } from '../components/GameResultModal';
import { HostControls } from '../components/HostControls';
import { QuestionCard } from '../components/QuestionCard';
import { Rosco } from '../components/Rosco';
import { ScoreBoard } from '../components/ScoreBoard';
import { useGameStore } from '../store/gameStore';
import { formatSeconds } from '../utils/timer';

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
  const resetGame = useGameStore((state) => state.resetGame);
  const backToLobby = useGameStore((state) => state.backToLobby);
  const setLetterStatus = useGameStore((state) => state.setLetterStatus);
  const pendingAction = useGameStore((state) => state.pendingAction);
  const [confirmAction, setConfirmAction] = useState<'lobby' | 'reset' | undefined>();

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
  const players = [...session.players].sort((a, b) => a.slot - b.slot);
  const focusPlayer = activePlayer ?? players[0];
  const focusLetters = focusPlayer ? session.letters.filter((letter) => letter.playerId === focusPlayer.id) : [];
  const sidePlayers = players.filter((player) => player.id !== focusPlayer?.id);

  const lobby = async () => {
    await backToLobby();
    navigate(`/lobby/${session.game.id}`);
  };

  const resetAndRestart = async () => {
    await resetGame();
  };

  const confirm = async () => {
    const action = confirmAction;
    setConfirmAction(undefined);
    if (action === 'lobby') await lobby();
    if (action === 'reset') await resetAndRestart();
  };

  return (
    <div className="host-page grid gap-3 sm:gap-6">
      <section className="rounded-lg border border-line bg-panel p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Panel del host</p>
            <h2 className="text-xl font-black leading-tight sm:text-3xl">{session.game.title}</h2>
          </div>
          <div className="host-turn-badge rounded-md border border-blue-400 bg-blue-500/10 px-2 py-1 text-xs text-blue-100 sm:px-4 sm:py-2 sm:text-base">
            Turno: <strong>{activePlayer?.name ?? '-'}</strong>
          </div>
        </div>
      </section>

      <div className="host-game-grid grid gap-3 sm:gap-4 xl:grid-cols-[minmax(32rem,1fr)_minmax(19rem,24rem)_minmax(12rem,15rem)] xl:items-start">
        {focusPlayer && (
          <section className="host-rosco-panel order-2 rounded-lg border border-blue-400 bg-panel p-2 sm:p-4 xl:order-1">
            <ScoreBoard player={focusPlayer} letters={focusLetters} active />
            <Rosco
              letters={focusLetters}
              activeLetter={session.game.activeLetter}
              size="large"
              centerContent={
                <div className="grid place-items-center text-center">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-blue-200">Letra</p>
                  <p className="text-6xl font-black leading-none text-white sm:text-8xl">
                    {session.game.activeLetter ?? '-'}
                  </p>
                  <p className="mt-1 rounded-md border border-blue-400 bg-blue-500/15 px-3 py-1 text-lg font-black text-blue-100 sm:text-2xl">
                    {formatSeconds(focusPlayer.remainingSeconds)}
                  </p>
                </div>
              }
              onLetterStatusChange={(letter, status) => setLetterStatus(focusPlayer.id, letter, status)}
            />
          </section>
        )}

        <div className="host-control-stack sticky top-1 z-30 order-1 grid content-start gap-2 rounded-lg border border-line bg-ink/95 p-2 shadow-2xl sm:gap-3 xl:order-2 xl:top-4 xl:p-0">
          <QuestionCard question={activeQuestion} showAnswer letter={session.game.activeLetter} />
          <HostControls
            paused={session.game.status === 'paused'}
            busy={Boolean(pendingAction)}
            pendingAction={pendingAction}
            onCorrect={() => applyAnswer('correct')}
            onWrong={() => applyAnswer('wrong')}
            onPass={() => applyAnswer('pass')}
            onPause={pauseGame}
            onResume={resumeGame}
            onSwitch={switchTurn}
            onUndo={undoLastAction}
          />
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
            <button
              type="button"
              className="rounded-md bg-slate-700 px-2 py-2 text-xs font-bold sm:px-3 sm:py-3 sm:text-sm"
              onClick={() => setConfirmAction('lobby')}
            >
              Volver al lobby
            </button>
            <button
              type="button"
              className="rounded-md bg-slate-700 px-2 py-2 text-xs font-bold sm:px-3 sm:py-3 sm:text-sm"
              onClick={() => setConfirmAction('reset')}
            >
              Resetear partida
            </button>
          </div>
        </div>

        <section className="host-waiting-panel order-3 rounded-lg border border-amber-300/45 bg-amber-500/15 p-2 sm:p-3">
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-amber-100 sm:text-xs">En espera</p>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 xl:grid xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto xl:pb-0">
            {sidePlayers.map((player) => {
              const letters = session.letters.filter((letter) => letter.playerId === player.id);
              const pending = letters.filter((letter) => letter.status === 'pending' || letter.status === 'passed').length;
              return (
                <article key={player.id} className="min-w-[11rem] rounded-lg border border-amber-300/35 bg-amber-950/25 p-2">
                  <p className="text-[0.62rem] uppercase tracking-wide text-amber-100/80">Jugador {player.slot}</p>
                  <h3 className="truncate text-sm font-black text-white">{player.name}</h3>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                    <span className="rounded bg-black/15 px-2 py-1 font-bold text-emerald-200">{player.score} pts</span>
                    <span className="rounded bg-black/15 px-2 py-1 font-bold text-amber-100">{pending} pend.</span>
                    <span className="rounded bg-black/15 px-2 py-1 font-bold text-blue-100">
                      {formatSeconds(player.remainingSeconds)}
                    </span>
                    <span className={`rounded bg-black/15 px-2 py-1 font-bold ${player.connected ? 'text-emerald-200' : 'text-red-200'}`}>
                      {player.connected ? 'online' : 'offline'}
                    </span>
                  </div>
                </article>
              );
            })}
            {sidePlayers.length === 0 && (
              <p className="rounded-md border border-line bg-black/10 p-3 text-sm text-slate-300">
                Cuando entren mas jugadores van a aparecer aca.
              </p>
            )}
          </div>
        </section>
      </div>

      <GameResultModal
        players={session.players}
        open={session.game.status === 'finished'}
        onReset={resetAndRestart}
        onLobby={lobby}
      />
      <ConfirmDialog
        open={confirmAction === 'lobby'}
        title="Volver al lobby?"
        description="Se reinician puntos, letras y tiempos, y el host vuelve a la sala de espera con los mismos jugadores."
        confirmLabel="Volver"
        onCancel={() => setConfirmAction(undefined)}
        onConfirm={confirm}
      />
      <ConfirmDialog
        open={confirmAction === 'reset'}
        title="Resetear partida?"
        description="Se reinician puntos, letras y tiempos a sus valores iniciales, y la partida arranca de nuevo desde el primer jugador."
        confirmLabel="Resetear"
        tone="danger"
        onCancel={() => setConfirmAction(undefined)}
        onConfirm={confirm}
      />
    </div>
  );
};
