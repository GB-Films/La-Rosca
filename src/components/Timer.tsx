import { Clock } from 'lucide-react';
import { formatSeconds } from '../utils/timer';

interface TimerProps {
  seconds: number;
  active?: boolean;
}

export const Timer = ({ seconds, active }: TimerProps) => (
  <div
    className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-lg font-bold ${
      active ? 'border-blue-400 bg-blue-500/15 text-blue-100' : 'border-line bg-white/5 text-slate-200'
    }`}
  >
    <Clock size={18} />
    <span>{formatSeconds(seconds)}</span>
  </div>
);
