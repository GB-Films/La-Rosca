import { create } from 'zustand';
import type { CreateGameInput, GameSession, LetterStatus } from '../types/game';
import type { Question } from '../types/question';
import { createId } from '../utils/codeGenerator';
import { applyAnswerToSession, gameService } from '../services/gameService';

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
  tick: () => Promise<void>;
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

  if (incomingActions === currentActions) {
    const currentLastAction = current.actionLog.at(-1)?.id;
    const incomingLastAction = incoming.actionLog.at(-1)?.id;
    if (currentLastAction && incomingLastAction && currentLastAction !== incomingLastAction) return false;
  }

  return true;
};

export const useGameStore = create<GameStore>((set, get) => ({
  clientId: getClientId(),
  mutationVersion: 0,

  async loadSession(gameId) {
    const version = get().mutationVersion;
    const id = gameId ?? sessionStorage.getItem('el-rosco:gameId') ?? localStorage.getItem('el-rosco:lastGameId');
    const session = id ? await gameService.getGame(id) : undefined;
    if (version !== get().mutationVersion || get().pendingAction) return;
    if (!shouldAcceptSession(get().session, session)) return;
    set({
      session,
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
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.pauseGame(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
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
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.finishGame(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
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
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.resetGame(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
  },

  async backToLobby() {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.backToLobby(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
  },

  async switchTurn() {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.switchTurn(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
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
        const saved = await gameService.applyAnswer(id, action);
        set((state) => ({
          mutationVersion: state.mutationVersion + 1,
          pendingAction: undefined,
          session: saved,
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
    set({ session });
  },

  async undoLastAction() {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.undoLastAction(id), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
    }
  },

  async setLetterStatus(playerId, letter, status) {
    const id = get().session?.game.id;
    if (id) {
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
      set({ session: await gameService.setLetterStatus(id, playerId, letter, status), error: undefined });
      set((state) => ({ mutationVersion: state.mutationVersion + 1 }));
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

  async tick() {
    const id = get().session?.game.id;
    if (!id) return;
    const version = get().mutationVersion;
    const session = await gameService.tick(id);
    if (version !== get().mutationVersion || get().pendingAction) return;
    if (session) set({ session });
  },

  setError(message) {
    set({ error: message });
  },
}));
