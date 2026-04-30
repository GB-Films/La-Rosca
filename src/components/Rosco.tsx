import type { LetterState, LetterStatus } from '../types/game';
import { LetterBubble } from './LetterBubble';

interface RoscoProps {
  letters: LetterState[];
  activeLetter?: string;
  onLetterStatusChange?: (letter: string, status: LetterStatus) => void;
}

export const Rosco = ({ letters, activeLetter, onLetterStatusChange }: RoscoProps) => {
  const radius = 42;
  const menuStatuses: LetterStatus[] = ['pending', 'correct', 'wrong', 'passed'];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[25rem]">
      <div className="absolute inset-[19%] rounded-full border border-line bg-black/10 shadow-glow" />
      {letters.map((state, index) => {
        const angle = (index / letters.length) * Math.PI * 2 - Math.PI / 2;
        const left = 50 + radius * Math.cos(angle);
        const top = 50 + radius * Math.sin(angle);
        return (
          <div
            key={`${state.playerId}-${state.letter}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
          >
            {onLetterStatusChange ? (
              <div className="group relative">
                <LetterBubble letter={state.letter} status={state.status} active={activeLetter === state.letter} />
                <div className="invisible absolute left-1/2 top-11 z-20 grid -translate-x-1/2 grid-cols-2 gap-1 rounded-md border border-line bg-panel p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
                  {menuStatuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="rounded px-2 py-1 text-xs text-slate-100 hover:bg-white/10"
                      onClick={() => onLetterStatusChange(state.letter, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <LetterBubble letter={state.letter} status={state.status} active={activeLetter === state.letter} />
            )}
          </div>
        );
      })}
    </div>
  );
};
