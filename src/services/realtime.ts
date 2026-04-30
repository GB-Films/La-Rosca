import type { GameSession } from '../types/game';
import { isSupabaseConfigured, supabase } from './supabaseClient';
import { sessionRepository } from './sessionRepository';

export interface RealtimeAdapter {
  subscribeToGame(gameId: string, onChange: (session: GameSession | undefined) => void): () => void;
  broadcastGameChange(gameId: string): void;
}

export const localRealtimeAdapter: RealtimeAdapter = {
  subscribeToGame(_gameId, onChange) {
    const client = supabase;
    if (isSupabaseConfigured && client) {
      const channel = client
        .channel(`game-session:${_gameId}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'game_sessions', filter: `id=eq.${_gameId}` },
          async () => {
            onChange(await sessionRepository.get(_gameId));
          },
        )
        .subscribe();

      return () => {
        void client.removeChannel(channel);
      };
    }

    const handler = () => onChange(undefined);
    window.addEventListener('storage', handler);
    window.addEventListener('el-rosco:games-changed', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('el-rosco:games-changed', handler);
    };
  },
  broadcastGameChange() {
    window.dispatchEvent(new CustomEvent('el-rosco:games-changed'));
  },
};

// Supabase can replace the adapter above with channels/table subscriptions.
export const createSupabaseRealtimeAdapter = (): RealtimeAdapter => localRealtimeAdapter;
