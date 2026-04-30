import type { LetterStatus } from '../types/game';

interface LetterBubbleProps {
  letter: string;
  status: LetterStatus;
  active?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const statusClass: Record<LetterStatus, string> = {
  pending: 'border-slate-500 bg-slate-700 text-slate-100',
  correct: 'border-emerald-300 bg-emerald-500 text-emerald-950',
  wrong: 'border-red-300 bg-red-500 text-red-950',
  passed: 'border-amber-300 bg-amber-400 text-amber-950',
};

export const LetterBubble = ({ letter, status, active, compact, onClick }: LetterBubbleProps) => {
  const size = compact ? 'h-8 w-8 text-sm' : 'h-8 w-8 text-sm sm:h-11 sm:w-11 sm:text-base';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${size} rounded-full border-2 font-black shadow-sm transition hover:scale-105 ${
        statusClass[status]
      } ${active ? 'ring-4 ring-blue-300 ring-offset-2 ring-offset-ink' : ''}`}
      title={`${letter}: ${status}`}
    >
      {letter}
    </button>
  );
};
