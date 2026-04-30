import type { GameSession } from '../types/game';

export interface RealtimeAdapter {
  subscribeToGame(gameId: string, onChange: (session: GameSession | undefined) => void): () => void;
  broadcastGameChange(gameId: string): void;
}

export const localRealtimeAdapter: RealtimeAdapter = {
  subscribeToGame(_gameId, onChange) {
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
