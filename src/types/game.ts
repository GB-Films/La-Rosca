import type { Question } from './question';

export type GameStatus = 'lobby' | 'playing' | 'paused' | 'finished';
export type PlayerSlot = 1 | 2;
export type LetterStatus = 'pending' | 'correct' | 'wrong' | 'passed';
export type GameAction = 'correct' | 'wrong' | 'pass' | 'undo' | 'manual_edit';
export type Role = 'host' | 'player';

export interface Game {
  id: string;
  code: string;
  title: string;
  theme: string;
  status: GameStatus;
  hostId: string;
  activePlayerId?: string;
  activeLetter?: string;
  timerSeconds: number;
  includeÑ: boolean;
  showQuestionToPlayers: boolean;
  createdAt: string;
}

export interface Player {
  id: string;
  gameId: string;
  name: string;
  role: 'player';
  slot: PlayerSlot;
  score: number;
  remainingSeconds: number;
  connected: boolean;
}

export interface LetterState {
  playerId: string;
  letter: string;
  status: LetterStatus;
  questionId: string;
}

export interface ActionLog {
  id: string;
  gameId: string;
  playerId: string;
  letter: string;
  action: GameAction;
  previousState: LetterState | null;
  nextState: LetterState | null;
  previousActivePlayerId?: string;
  previousActiveLetter?: string;
  previousScore?: number;
  nextActivePlayerId?: string;
  nextActiveLetter?: string;
  nextScore?: number;
  timestamp: string;
}

export interface GameSession {
  game: Game;
  players: Player[];
  letters: LetterState[];
  questions: Question[];
  actionLog: ActionLog[];
}

export interface CreateGameInput {
  title: string;
  theme: string;
  timerSeconds: number;
  includeÑ: boolean;
  questionMode: 'pack' | 'manual';
  questions: Question[];
  showQuestionToPlayers: boolean;
}
