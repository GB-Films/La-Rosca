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
  correct: 'border-emerald-200 bg-emerald-600 text-white shadow-[0_0_18px_rgba(16,185,129,0.58)]',
  wrong: 'border-red-300 bg-red-500 text-red-950',
  passed: 'border-amber-300 bg-amber-400 text-amber-950',
};

export const LetterBubble = ({ letter, status, active, compact, onClick }: LetterBubbleProps) => {
  const size = compact ? 'h-7 w-7 text-xs' : 'h-7 w-7 text-xs sm:h-10 sm:w-10 sm:text-base';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${size} font-letter rounded-full border-2 font-black shadow-sm transition hover:scale-105 ${
        statusClass[status]
      } ${active ? 'ring-4 ring-blue-300 ring-offset-2 ring-offset-ink' : ''}`}
      title={`${letter}: ${status}`}
    >
      {letter}
    </button>
  );
};
