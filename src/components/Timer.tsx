import { Clock } from 'lucide-react';
import { formatSeconds } from '../utils/timer';

interface TimerProps {
  seconds: number;
  active?: boolean;
}

export const Timer = ({ seconds, active }: TimerProps) => (
  <div
    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-base font-bold sm:gap-2 sm:px-3 sm:py-2 sm:text-lg ${
      active ? 'border-blue-400 bg-blue-500/15 text-blue-100' : 'border-line bg-white/5 text-slate-200'
    }`}
  >
    <Clock className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
    <span>{formatSeconds(seconds)}</span>
  </div>
);
