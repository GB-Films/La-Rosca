import { create } from 'zustand';
import type { CreateGameInput, GameSession, LetterStatus } from '../types/game';
import type { Question } from '../types/question';
import { createId } from '../utils/codeGenerator';
import { applyAnswerToSession, gameService, tickSessionInMemory } from '../services/gameService';

interface GameStore {
  session?: GameSession;
  clientId: string;
  currentRole?: 'host' | 'player';
  currentPlayerId?: string;
  error?: string;
  mutationVersion: number;
  pendingAction?: 'correct' | 'wrong' | 'pass' | 'pause' | 'resume' | 'switch' | 'undo' | 'manual' | 'reset' | 'lobby';
  acceptRemoteSession: (session?: GameSession) => void;
  loadSession: (gameId?: string) => Promise<void>;
  createGame: (input: CreateGameInput) => Promise<GameSession>;
  joinGame: (code: string, name: string) => Promise<GameSession>;
  addSimulatedPlayer: (name?: string) => Promise<void>;
  startGame: () => Promise<void>;
  pauseGame: () => Promise<void>;
  resumeGame: () => Promise<void>;
  finishGame: () => Promise<void>;
  deleteGame: () => Promise<void>;
  resetGame: () => Promise<void>;
  backToLobby: () => Promise<void>;
  switchTurn: () => Promise<void>;
  applyAnswer: (action: 'correct' | 'wrong' | 'pass') => Promise<void>;
  undoLastAction: () => Promise<void>;
  setLetterStatus: (playerId: string, letter: string, status: LetterStatus) => Promise<void>;
  updateQuestions: (questions: Question[]) => Promise<void>;
  tick: (persist?: boolean, elapsedSeconds?: number) => Promise<void>;
  setError: (message?: string) => void;
}

const getClientId = () => {
  const existing = localStorage.getItem('el-rosco:clientId');
  if (existing) return existing;
  const next = createId('client');
  localStorage.setItem('el-rosco:clientId', next);
  return next;
};

const rememberSession = (role: 'host' | 'player', gameId: string, playerId?: string) => {
  sessionStorage.setItem('el-rosco:role', role);
  sessionStorage.setItem('el-rosco:gameId', gameId);
  if (playerId) sessionStorage.setItem('el-rosco:playerId', playerId);
  localStorage.setItem('el-rosco:lastRole', role);
  localStorage.setItem('el-rosco:lastGameId', gameId);
};

const shouldAcceptSession = (current: GameSession | undefined, incoming: GameSession | undefined) => {
  if (!incoming) return true;
  if (!current || current.game.id !== incoming.game.id) return true;

  const currentActions = current.actionLog.length;
  const incomingActions = incoming.actionLog.length;
  if (incomingActions < currentActions) return false;

  const currentRevision = current.revision ?? 0;
  const incomingRevision = incoming.revision ?? 0;
  if (incomingActions === currentActions && incomingRevision < currentRevision) return false;

  if (incomingActions === currentActions) {
    const currentLastAction = current.actionLog.at(-1)?.id;
    const incomingLastAction = incoming.actionLog.at(-1)?.id;
    if (currentLastAction && incomingLastAction && currentLastAction !== incomingLastAction) return false;
    const sameRevision = incomingRevision === currentRevision;
    const localTimerAdvancedTurn =
      current.game.status === 'playing' &&
      incoming.game.status === 'playing' &&
      (current.game.activePlayerId !== incoming.game.activePlayerId ||
        current.game.activeLetter !== incoming.game.activeLetter);
    if (sameRevision && localTimerAdvancedTurn) return false;
  }

  return true;
};

const isSameRunningTurn = (first: GameSession, second: GameSession) =>
  first.game.status === 'playing' &&
  second.game.status === 'playing' &&
  first.game.activePlayerId === second.game.activePlayerId &&
  first.game.activeLetter === second.game.activeLetter &&
  first.actionLog.at(-1)?.id === second.actionLog.at(-1)?.id;

const mergeLocalTimer = (saved: GameSession, live: GameSession | undefined) => {
  if (!live || saved.game.id !== live.game.id) return saved;
  if (!isSameRunningTurn(saved, live) || !saved.game.activePlayerId) return saved;

  const activePlayerId = saved.game.activePlayerId;
  const livePlayer = live.players.find((player) => player.id === activePlayerId);
  const savedPlayer = saved.players.find((player) => player.id === activePlayerId);
  if (!livePlayer || !savedPlayer || livePlayer.remainingSeconds >= savedPlayer.remainingSeconds) return saved;

  const merged = structuredClone(saved) as GameSession;
  merged.players = merged.players.map((player) =>
    player.id === activePlayerId ? { ...player, remainingSeconds: livePlayer.remainingSeconds } : player,
  );
  return merged;
};

export const useGameStore = create<GameStore>((set, get) => {
  let timerSyncTask: Promise<void> | undefined;
  let queuedTimerGameId: string | undefined;

  const queueTimerSync = (gameId: string) => {
    queuedTimerGameId = gameId;
    if (timerSyncTask) return;

    timerSyncTask = (async () => {
      while (queuedTimerGameId) {
        const queuedGameId = queuedTimerGameId;
        queuedTimerGameId = undefined;
        const current = get().session;
        if (
          !current ||
          current.game.id !== queuedGameId ||
          (current.game.status !== 'playing' && current.game.status !== 'finished') ||
          get().pendingAction
        ) {
          continue;
        }

        const snapshot = structuredClone(current) as GameSession;
        try {
          const saved = await gameService.saveTimedSession(snapshot);
          set((state) => {
            const live = state.session;
            if (!live || live.game.id !== saved.game.id || !isSameRunningTurn(saved, live)) return state;
            return {
              session: {
                ...live,
                revision: Math.max(live.revision ?? 0, saved.revision ?? 0),
                updatedAt: saved.updatedAt,
              },
              error: undefined,
            };
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'No se pudo sincronizar el cronometro.' });
        }
      }
    })().finally(() => {
      timerSyncTask = undefined;
    });
  };

  const waitForTimerSync = async () => {
    if (timerSyncTask) await timerSyncTask;
  };

  const runSyncedMutation = async (
    action: NonNullable<GameStore['pendingAction']>,
    operation: () => Promise<GameSession>,
  ) => {
    if (get().pendingAction) return;
    set((state) => ({ mutationVersion: state.mutationVersion + 1, pendingAction: action }));
    try {
      await waitForTimerSync();
      const session = await operation();
      set((state) => ({
        mutationVersion: state.mutationVersion + 1,
        pendingAction: undefined,
        session,
        error: undefined,
      }));
    } catch (error) {
      set((state) => ({
        mutationVersion: state.mutationVersion + 1,
        pendingAction: undefined,
        error: error instanceof Error ? error.message : 'No se pudo actualizar la partida.',
      }));
    }
  };

  return {
  clientId: getClientId(),
  mutationVersion: 0,

  async loadSession(gameId) {
    const version = get().mutationVersion;
    const id = gameId ?? sessionStorage.getItem('el-rosco:gameId') ?? localStorage.getItem('el-rosco:lastGameId');
    const session = id ? await gameService.getGame(id) : undefined;
    if (version !== get().mutationVersion || get().pendingAction) return;
    if (!shouldAcceptSession(get().session, session)) return;
    set({
      session: session ? mergeLocalTimer(session, get().session) : undefined,
      currentRole: (sessionStorage.getItem('el-rosco:role') as 'host' | 'player' | null) ?? undefined,
      currentPlayerId: sessionStorage.getItem('el-rosco:playerId') ?? undefined,
    });
  },

  async createGame(input) {
    const session = await gameService.createGame(input, get().clientId);
    rememberSession('host', session.game.id);
    set({ session, currentRole: 'host', currentPlayerId: undefined, error: undefined });
    return session;
  },

  async joinGame(code, name) {
    const session = await gameService.joinGame(code, name, get().clientId);
    const player = session.players[session.players.length - 1];
    rememberSession('player', session.game.id, player.id);
    set({ session, currentRole: 'player', currentPlayerId: player.id, error: undefined });
    return session;
  },

  async addSimulatedPlayer(name) {
    const id = get().session?.game.id;
    if (!id) return;
    set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    set({ session: await gameService.addSimulatedPlayer(id, name), error: undefined });
    set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
  },

  async startGame() {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.startGame(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
  },

  async pauseGame() {
    const id = get().session?.game.id;
    if (id) await runSyncedMutation('pause', () => gameService.pauseGame(id, get().session));
  },

  async resumeGame() {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.resumeGame(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
  },

  async finishGame() {
    const id = get().session?.game.id;
    if (id) await runSyncedMutation('manual', () => gameService.finishGame(id));
  },

  async deleteGame() {
    const id = get().session?.game.id;
    if (!id) return;
    await gameService.deleteGame(id);
    sessionStorage.removeItem('el-rosco:gameId');
    sessionStorage.removeItem('el-rosco:role');
    sessionStorage.removeItem('el-rosco:playerId');
    localStorage.removeItem('el-rosco:lastGameId');
    set({ session: undefined, currentRole: undefined, currentPlayerId: undefined, error: undefined });
  },

  async resetGame() {
    const id = get().session?.game.id;
    if (id) await runSyncedMutation('reset', () => gameService.resetGame(id));
  },

  async backToLobby() {
    const id = get().session?.game.id;
    if (id) await runSyncedMutation('lobby', () => gameService.backToLobby(id));
  },

  async switchTurn() {
    const id = get().session?.game.id;
    if (id) await runSyncedMutation('switch', () => gameService.switchTurn(id, get().session));
  },

  async applyAnswer(action) {
    const id = get().session?.game.id;
    if (id) {
      const previous = get().session;
      if (!previous || get().pendingAction) return;
      const optimistic = structuredClone(previous) as GameSession;
      try {
        applyAnswerToSession(optimistic, id, action);
        set((state) => ({
          mutationVersion: state.mutationVersion + 1,
          pendingAction: action,
          session: optimistic,
          error: undefined,
        }));
        await waitForTimerSync();
        const saved = await gameService.saveAnsweredSession(optimistic);
        const merged = mergeLocalTimer(saved, get().session);
        const synchronized =
          merged === saved ? saved : await gameService.saveAnsweredSession(merged).catch(() => merged);
        set((state) => ({
          mutationVersion: state.mutationVersion + 1,
          pendingAction: undefined,
          session: shouldAcceptSession(optimistic, synchronized) ? synchronized : optimistic,
          error: undefined,
        }));
      } catch (error) {
        set((state) => ({
          mutationVersion: state.mutationVersion + 1,
          pendingAction: undefined,
          session: previous,
          error: error instanceof Error ? error.message : 'No se pudo aplicar la respuesta.',
        }));
      }
    }
  },

  acceptRemoteSession(session) {
    if (get().pendingAction) return;
    if (!shouldAcceptSession(get().session, session)) return;
    set({ session: session ? mergeLocalTimer(session, get().session) : undefined });
  },

  async undoLastAction() {
    const id = get().session?.game.id;
    if (id) await runSyncedMutation('undo', () => gameService.undoLastAction(id, get().session));
  },

  async setLetterStatus(playerId, letter, status) {
    const id = get().session?.game.id;
    if (id) {
      await runSyncedMutation('manual', () =>
        gameService.setLetterStatus(id, playerId, letter, status, get().session),
      );
    }
  },

  async updateQuestions(questions) {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.updateQuestions(id, questions), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
  },

  async tick(persist = true, elapsedSeconds = 1) {
    const id = get().session?.game.id;
    if (!id) return;
    set((state) => {
      if (!state.session || state.session.game.status !== 'playing') return state;
      const session = structuredClone(state.session) as GameSession;
      tickSessionInMemory(session, elapsedSeconds);
      return { session };
    });
    if (persist && !get().pendingAction) queueTimerSync(id);
  },

  setError(message) {
    set({ error: message });
  },
  };
});
