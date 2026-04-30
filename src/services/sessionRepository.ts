import type { GameSession } from '../types/game';
import { isSupabaseConfigured, supabase } from './supabaseClient';

const STORAGE_KEY = 'el-rosco:games';
const API_URL = '/api/games';

type GameSessionRow = {
  id: string;
  code: string;
  payload: GameSession;
};

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
      const { error } = await supabase.from('game_sessions').upsert({
        id: session.game.id,
        code: session.game.code,
        payload: session,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      window.dispatchEvent(new CustomEvent('el-rosco:games-changed'));
      return session;
    }

    const games = readLocal();
    const index = games.findIndex((game) => game.game.id === session.game.id);
    if (index >= 0) {
      games[index] = session;
    } else {
      games.push(session);
    }
    writeLocal(games);
    return session;
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
