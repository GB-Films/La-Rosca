import { getLetters } from '../data/sampleQuestions';
import type {
  ActionLog,
  CreateGameInput,
  GameSession,
  LetterState,
  LetterStatus,
  Player,
  PlayerSlot,
} from '../types/game';
import type { Question } from '../types/question';
import { generateCode, createId } from '../utils/codeGenerator';
import { sessionRepository } from './sessionRepository';
import { isHostedWithoutSupabase } from './supabaseClient';

const availableSlot = (players: Player[]): PlayerSlot | null => {
  if (!players.some((player) => player.slot === 1)) return 1;
  if (!players.some((player) => player.slot === 2)) return 2;
  return null;
};

const getQuestionForLetter = (questions: Question[], theme: string, letter: string, playerSlot: PlayerSlot) =>
  questions.find(
    (question) => question.theme === theme && question.letter === letter && question.playerSlot === playerSlot,
  ) ??
  questions.find((question) => question.theme === theme && question.letter === letter && !question.playerSlot) ??
  questions.find((question) => question.letter === letter);

const createLetterStates = (player: Player, session: GameSession): LetterState[] =>
  getLetters(session.game.includeÑ).map((letter) => ({
    playerId: player.id,
    letter,
    status: 'pending',
    questionId:
      getQuestionForLetter(session.questions, session.game.theme, letter, player.slot)?.id ??
      createId(`missing-${letter.toLowerCase()}`),
  }));

const getNextLetter = (session: GameSession, playerId: string, fromLetter?: string) => {
  const playerLetters = session.letters.filter((letter) => letter.playerId === playerId);
  const playable = playerLetters.filter((letter) => letter.status === 'pending');
  const fallbackPassed = playerLetters.filter((letter) => letter.status === 'passed');
  const pool = playable.length > 0 ? playable : fallbackPassed;
  if (pool.length === 0) return undefined;
  if (!fromLetter) return pool[0].letter;

  const allLetters = getLetters(session.game.includeÑ);
  const start = allLetters.indexOf(fromLetter);
  const ordered = [...allLetters.slice(start + 1), ...allLetters.slice(0, start + 1)];
  return ordered.find((letter) => pool.some((state) => state.letter === letter));
};

const getNextPlayablePlayer = (session: GameSession, currentPlayerId?: string) => {
  const players = [...session.players].sort((a, b) => a.slot - b.slot);
  const currentIndex = Math.max(0, players.findIndex((player) => player.id === currentPlayerId));
  const ordered = [...players.slice(currentIndex + 1), ...players.slice(0, currentIndex + 1)];
  return ordered.find((player) => player.remainingSeconds > 0 && getNextLetter(session, player.id));
};

const isPlayerDone = (session: GameSession, playerId: string) =>
  !session.letters.some(
    (letter) => letter.playerId === playerId && (letter.status === 'pending' || letter.status === 'passed'),
  );

const shouldFinish = (session: GameSession) =>
  session.players.length === 2 &&
  session.players.every((player) => player.remainingSeconds <= 0 || isPlayerDone(session, player.id));

const assignNextTurn = (
  session: GameSession,
  preferredPlayerId?: string,
  fromLetter?: string,
  preferSamePlayer = true,
) => {
  const preferred = preferredPlayerId
    ? session.players.find((player) => player.id === preferredPlayerId && player.remainingSeconds > 0)
    : undefined;
  const preferredLetter = preferSamePlayer && preferred ? getNextLetter(session, preferred.id, fromLetter) : undefined;

  const nextPlayer = preferredLetter ? preferred : getNextPlayablePlayer(session, preferredPlayerId);
  const nextLetter = nextPlayer
    ? getNextLetter(session, nextPlayer.id, nextPlayer.id === preferredPlayerId ? fromLetter : undefined)
    : undefined;

  session.game.activePlayerId = nextPlayer?.id;
  session.game.activeLetter = nextLetter;
  if (shouldFinish(session) || !nextPlayer || !nextLetter) {
    session.game.status = 'finished';
  }
};

export const gameService = {
  listGames: () => sessionRepository.list(),

  getGame(id: string) {
    return sessionRepository.get(id);
  },

  getGameByCode(code: string) {
    return sessionRepository.getByCode(code);
  },

  async createGame(input: CreateGameInput, hostId: string) {
    const existingCodes = new Set((await sessionRepository.list()).map((session) => session.game.code));
    let code = generateCode();
    while (existingCodes.has(code)) code = generateCode();

    const session: GameSession = {
      game: {
        id: createId('game'),
        code,
        title: input.title.trim() || 'La Rosca',
        theme: input.theme,
        status: 'lobby',
        hostId,
        timerSeconds: input.timerSeconds,
        includeÑ: input.includeÑ,
        showQuestionToPlayers: input.showQuestionToPlayers,
        createdAt: new Date().toISOString(),
      },
      players: [],
      letters: [],
      questions: input.questions,
      actionLog: [],
    };

    return sessionRepository.save(session);
  },

  async joinGame(code: string, name: string, clientId: string) {
    const session = await this.getGameByCode(code);
    if (!session) {
      if (isHostedWithoutSupabase) {
        throw new Error(
          'Este link publico todavia no tiene Supabase configurado, entonces las partidas no se comparten entre celulares. Configura Supabase o usa el link local de la misma red WiFi.',
        );
      }
      throw new Error('No encontramos una partida con ese codigo.');
    }
    if (session.players.length >= 2) throw new Error('La partida ya tiene 2 jugadores.');

    const browserJoinKey = `el-rosco:joined:${session.game.id}`;
    const existingPlayerId = localStorage.getItem(browserJoinKey);
    if (existingPlayerId && session.players.some((player) => player.id === existingPlayerId)) {
      throw new Error('Este navegador ya esta unido a esta partida como jugador.');
    }

    const slot = availableSlot(session.players);
    if (!slot) throw new Error('La partida ya tiene 2 jugadores.');

    const player: Player = {
      id: createId(`player-${slot}-${clientId.slice(0, 4)}`),
      gameId: session.game.id,
      name: name.trim() || `Jugador ${slot}`,
      role: 'player',
      slot,
      score: 0,
      remainingSeconds: session.game.timerSeconds,
      connected: true,
    };
    session.players.push(player);
    session.letters.push(...createLetterStates(player, session));
    localStorage.setItem(browserJoinKey, player.id);
    localStorage.setItem('el-rosco:lastPlayerName', player.name);
    return sessionRepository.save(session);
  },

  async addSimulatedPlayer(gameId: string, name?: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    if (session.players.length >= 2) throw new Error('La partida ya tiene 2 jugadores.');
    const slot = availableSlot(session.players);
    if (!slot) throw new Error('La partida ya tiene 2 jugadores.');

    const player: Player = {
      id: createId(`sim-${slot}`),
      gameId,
      name: name || `Jugador ${slot}`,
      role: 'player',
      slot,
      score: 0,
      remainingSeconds: session.game.timerSeconds,
      connected: true,
    };
    session.players.push(player);
    session.letters.push(...createLetterStates(player, session));
    return sessionRepository.save(session);
  },

  async startGame(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    if (session.players.length < 2) throw new Error('Necesitas 2 jugadores para iniciar.');
    session.game.status = 'playing';
    const firstPlayer = [...session.players].sort((a, b) => a.slot - b.slot)[0];
    assignNextTurn(session, firstPlayer.id);
    return sessionRepository.save(session);
  },

  async pauseGame(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    if (session.game.status === 'playing') session.game.status = 'paused';
    return sessionRepository.save(session);
  },

  async resumeGame(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    if (session.game.status === 'paused') session.game.status = 'playing';
    return sessionRepository.save(session);
  },

  async backToLobby(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    session.game.status = 'lobby';
    return sessionRepository.save(session);
  },

  async finishGame(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    session.game.status = 'finished';
    return sessionRepository.save(session);
  },

  deleteGame(gameId: string) {
    return sessionRepository.delete(gameId);
  },

  async resetGame(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    session.game.status = 'lobby';
    session.game.activePlayerId = undefined;
    session.game.activeLetter = undefined;
    session.players = session.players.map((player) => ({
      ...player,
      score: 0,
      remainingSeconds: session.game.timerSeconds,
    }));
    session.letters = session.players.flatMap((player) => createLetterStates(player, session));
    session.actionLog = [];
    return sessionRepository.save(session);
  },

  async switchTurn(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    assignNextTurn(session, session.game.activePlayerId, session.game.activeLetter, false);
    return sessionRepository.save(session);
  },

  async applyAnswer(gameId: string, action: 'correct' | 'wrong' | 'pass') {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    const playerId = session.game.activePlayerId;
    const letter = session.game.activeLetter;
    if (!playerId || !letter) throw new Error('No hay turno activo.');

    const player = session.players.find((item) => item.id === playerId);
    const letterState = session.letters.find((item) => item.playerId === playerId && item.letter === letter);
    if (!player || !letterState) throw new Error('No se encontro la letra activa.');

    const previousState = { ...letterState };
    const previousScore = player.score;
    const previousActivePlayerId = session.game.activePlayerId;
    const previousActiveLetter = session.game.activeLetter;

    if (action === 'correct') {
      letterState.status = 'correct';
      player.score += 1;
      assignNextTurn(session, player.id, letter);
    } else {
      letterState.status = action === 'wrong' ? 'wrong' : 'passed';
      assignNextTurn(session, player.id, letter, false);
    }

    const log: ActionLog = {
      id: createId('action'),
      gameId,
      playerId,
      letter,
      action,
      previousState,
      nextState: { ...letterState },
      previousActivePlayerId,
      previousActiveLetter,
      previousScore,
      nextActivePlayerId: session.game.activePlayerId,
      nextActiveLetter: session.game.activeLetter,
      nextScore: player.score,
      timestamp: new Date().toISOString(),
    };
    session.actionLog.push(log);
    return sessionRepository.save(session);
  },

  async undoLastAction(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    const last = [...session.actionLog].reverse().find((log) => log.action !== 'undo');
    if (!last || !last.previousState) throw new Error('No hay acciones para deshacer.');

    const state = session.letters.find(
      (letter) => letter.playerId === last.playerId && letter.letter === last.letter,
    );
    const player = session.players.find((item) => item.id === last.playerId);
    if (!state || !player) throw new Error('No se pudo deshacer la accion.');

    const nextState = { ...state };
    Object.assign(state, last.previousState);
    if (typeof last.previousScore === 'number') player.score = last.previousScore;
    session.game.activePlayerId = last.previousActivePlayerId;
    session.game.activeLetter = last.previousActiveLetter;
    if (session.game.status === 'finished') session.game.status = 'playing';

    session.actionLog.push({
      id: createId('undo'),
      gameId,
      playerId: last.playerId,
      letter: last.letter,
      action: 'undo',
      previousState: nextState,
      nextState: { ...state },
      timestamp: new Date().toISOString(),
    });
    return sessionRepository.save(session);
  },

  async setLetterStatus(gameId: string, playerId: string, letter: string, status: LetterStatus) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    const state = session.letters.find((item) => item.playerId === playerId && item.letter === letter);
    const player = session.players.find((item) => item.id === playerId);
    if (!state || !player) throw new Error('No se encontro la letra.');

    const previousState = { ...state };
    const wasCorrect = state.status === 'correct';
    const isCorrect = status === 'correct';
    state.status = status;
    if (wasCorrect && !isCorrect) player.score = Math.max(0, player.score - 1);
    if (!wasCorrect && isCorrect) player.score += 1;

    session.actionLog.push({
      id: createId('manual'),
      gameId,
      playerId,
      letter,
      action: 'manual_edit',
      previousState,
      nextState: { ...state },
      timestamp: new Date().toISOString(),
    });
    return sessionRepository.save(session);
  },

  async updateQuestions(gameId: string, questions: Question[]) {
    const session = await this.getGame(gameId);
    if (!session) throw new Error('No encontramos la partida.');
    session.questions = questions;
    return sessionRepository.save(session);
  },

  async tick(gameId: string) {
    const session = await this.getGame(gameId);
    if (!session || session.game.status !== 'playing' || !session.game.activePlayerId) return session;
    const player = session.players.find((item) => item.id === session.game.activePlayerId);
    if (!player) return session;
    player.remainingSeconds = Math.max(0, player.remainingSeconds - 1);
    if (player.remainingSeconds <= 0) {
      assignNextTurn(session, player.id, session.game.activeLetter);
    }
    return sessionRepository.save(session);
  },
};
