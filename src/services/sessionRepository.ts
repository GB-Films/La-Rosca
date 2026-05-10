import type { GameSession } from '../types/game';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const STORAGE_KEY = 'el-rosco:games';
const API_URL = '/api/games';

type GameSessionRow = {
  id: string;
  code: string;
  payload: GameSession;
};

const getRevision = (session?: GameSession) => session?.revision ?? 0;
const getActionCount = (session?: GameSession) => session?.actionLog.length ?? 0;

const isStaleSave = (current: GameSession | undefined, incoming: GameSession) => {
  if (!current) return false;
  const isRoundReset =
    incoming.actionLog.length === 0 &&
    (incoming.game.status === 'lobby' || incoming.game.status === 'playing') &&
    current.game.status === 'finished';
  if (isRoundReset) return false;

  const currentActions = getActionCount(current);
  const incomingActions = getActionCount(incoming);
  if (incomingActions < currentActions) return true;
  if (incomingActions === currentActions && getRevision(incoming) < getRevision(current)) return true;
  return false;
};

const withNextRevision = (session: GameSession, current?: GameSession): GameSession => ({
  ...session,
  revision: Math.max(getRevision(current), getRevision(session)) + 1,
  updatedAt: new Date().toISOString(),
});

const requestSharedGames = (method: 'GET' | 'PUT', body?: string) => {
  if (typeof XMLHttpRequest === 'undefined') return undefined;
  try {
    const request = new XMLHttpRequest();
    request.open(method, API_URL, false);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(body);
    if (request.status >= 200 && request.status < 300) return request.responseText;
  } catch {
    return undefined;
  }
  return undefined;
};

const readLocal = (): GameSession[] => {
  try {
    const shared = requestSharedGames('GET');
    if (shared) {
      localStorage.setItem(STORAGE_KEY, shared);
      return JSON.parse(shared) as GameSession[];
    }
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as GameSession[];
  } catch {
    return [];
  }
};

const writeLocal = (games: GameSession[]) => {
  const serialized = JSON.stringify(games);
  localStorage.setItem(STORAGE_KEY, serialized);
  requestSharedGames('PUT', serialized);
  window.dispatchEvent(new CustomEvent('el-rosco:games-changed'));
};

export const sessionRepository = {
  isRemoteEnabled: isSupabaseConfigured,

  async list() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('payload')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const sessions = (data ?? []).map((row) => (row as Pick<GameSessionRow, 'payload'>).payload);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      return sessions;
    }
    return readLocal();
  },

  async get(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('game_sessions').select('payload').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data as Pick<GameSessionRow, 'payload'> | null)?.payload;
    }
    return readLocal().find((session) => session.game.id === id);
  },

  async getByCode(code: string) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('payload')
        .eq('code', code.toUpperCase())
        .maybeSingle();
      if (error) throw error;
      return (data as Pick<GameSessionRow, 'payload'> | null)?.payload;
    }
    return readLocal().find((session) => session.game.code.toUpperCase() === code.toUpperCase());
  },

  async save(session: GameSession) {
    if (isSupabaseConfigured && supabase) {
      const { data: existing, error: existingError } = await supabase
        .from('game_sessions')
        .select('payload')
        .eq('id', session.game.id)
        .maybeSingle();
      if (existingError) throw existingError;
      const current = (existing as Pick<GameSessionRow, 'payload'> | null)?.payload;
      if (isStaleSave(current, session)) return current ?? session;
      const nextSession = withNextRevision(session, current);
      const { error } = await supabase.from('game_sessions').upsert({
        id: nextSession.game.id,
        code: nextSession.game.code,
        payload: nextSession,
        updated_at: nextSession.updatedAt,
      });
      if (error) throw error;
      window.dispatchEvent(new CustomEvent('el-rosco:games-changed'));
      return nextSession;
    }

    const games = readLocal();
    const index = games.findIndex((game) => game.game.id === session.game.id);
    const current = index >= 0 ? games[index] : undefined;
    if (isStaleSave(current, session)) return current ?? session;
    const nextSession = withNextRevision(session, current);
    if (index >= 0) {
      games[index] = nextSession;
    } else {
      games.push(nextSession);
    }
    writeLocal(games);
    return nextSession;
  },

  async delete(id: string) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('game_sessions').delete().eq('id', id);
      if (error) throw error;
      window.dispatchEvent(new CustomEvent('el-rosco:games-changed'));
      return;
    }

    writeLocal(readLocal().filter((session) => session.game.id !== id));
  },
};
