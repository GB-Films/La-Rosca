import { create } from 'zustand';
import type { CreateGameInput, GameSession, LetterStatus } from '../types/game';
import type { Question } from '../types/question';
import { createId } from '../utils/codeGenerator';
import { gameService } from '../services/gameService';

interface GameStore {
  session?: GameSession;
  clientId: string;
  currentRole?: 'host' | 'player';
  currentPlayerId?: string;
  error?: string;
  loadSession: (gameId?: string) => void;
  createGame: (input: CreateGameInput) => GameSession;
  joinGame: (code: string, name: string) => GameSession;
  addSimulatedPlayer: (name?: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  finishGame: () => void;
  deleteGame: () => void;
  resetGame: () => void;
  backToLobby: () => void;
  switchTurn: () => void;
  applyAnswer: (action: 'correct' | 'wrong' | 'pass') => void;
  undoLastAction: () => void;
  setLetterStatus: (playerId: string, letter: string, status: LetterStatus) => void;
  updateQuestions: (questions: Question[]) => void;
  tick: () => void;
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

export const useGameStore = create<GameStore>((set, get) => ({
  clientId: getClientId(),

  loadSession(gameId) {
    const id = gameId ?? sessionStorage.getItem('el-rosco:gameId') ?? localStorage.getItem('el-rosco:lastGameId');
    const session = id ? gameService.getGame(id) : undefined;
    set({
      session,
      currentRole: (sessionStorage.getItem('el-rosco:role') as 'host' | 'player' | null) ?? undefined,
      currentPlayerId: sessionStorage.getItem('el-rosco:playerId') ?? undefined,
    });
  },

  createGame(input) {
    const session = gameService.createGame(input, get().clientId);
    rememberSession('host', session.game.id);
    set({ session, currentRole: 'host', currentPlayerId: undefined, error: undefined });
    return session;
  },

  joinGame(code, name) {
    const session = gameService.joinGame(code, name, get().clientId);
    const player = session.players[session.players.length - 1];
    rememberSession('player', session.game.id, player.id);
    set({ session, currentRole: 'player', currentPlayerId: player.id, error: undefined });
    return session;
  },

  addSimulatedPlayer(name) {
    const id = get().session?.game.id;
    if (!id) return;
    set({ session: gameService.addSimulatedPlayer(id, name), error: undefined });
  },

  startGame() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.startGame(id), error: undefined });
  },

  pauseGame() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.pauseGame(id), error: undefined });
  },

  resumeGame() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.resumeGame(id), error: undefined });
  },

  finishGame() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.finishGame(id), error: undefined });
  },

  deleteGame() {
    const id = get().session?.game.id;
    if (!id) return;
    gameService.deleteGame(id);
    sessionStorage.removeItem('el-rosco:gameId');
    sessionStorage.removeItem('el-rosco:role');
    sessionStorage.removeItem('el-rosco:playerId');
    localStorage.removeItem('el-rosco:lastGameId');
    set({ session: undefined, currentRole: undefined, currentPlayerId: undefined, error: undefined });
  },

  resetGame() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.resetGame(id), error: undefined });
  },

  backToLobby() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.backToLobby(id), error: undefined });
  },

  switchTurn() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.switchTurn(id), error: undefined });
  },

  applyAnswer(action) {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.applyAnswer(id, action), error: undefined });
  },

  undoLastAction() {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.undoLastAction(id), error: undefined });
  },

  setLetterStatus(playerId, letter, status) {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.setLetterStatus(id, playerId, letter, status), error: undefined });
  },

  updateQuestions(questions) {
    const id = get().session?.game.id;
    if (id) set({ session: gameService.updateQuestions(id, questions), error: undefined });
  },

  tick() {
    const id = get().session?.game.id;
    if (!id) return;
    const session = gameService.tick(id);
    if (session) set({ session });
  },

  setError(message) {
    set({ error: message });
  },
}));
