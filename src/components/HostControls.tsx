import { Check, RotateCcw, SkipForward, TimerOff, TimerReset, X, Shuffle } from 'lucide-react';

interface HostControlsProps {
  paused: boolean;
  busy?: boolean;
  pendingAction?: string;
  onCorrect: () => void;
  onWrong: () => void;
  onPass: () => void;
  onPause: () => void;
  onResume: () => void;
  onSwitch: () => void;
  onUndo: () => void;
}

const buttonBase =
  'inline-flex min-h-10 min-w-0 touch-manipulation items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-bold leading-tight transition active:scale-[0.98] sm:min-h-11 sm:gap-1.5 sm:px-2.5 sm:py-2.5 sm:text-sm';

export const HostControls = ({
  paused,
  busy,
  pendingAction,
  onCorrect,
  onWrong,
  onPass,
  onPause,
  onResume,
  onSwitch,
  onUndo,
}: HostControlsProps) => (
  <section className="rounded-lg border border-line bg-panel p-2.5 sm:p-4">
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2">
      <button type="button" disabled={busy} className={`${buttonBase} host-answer-button bg-emerald-600 text-white`} onClick={onCorrect}>
        <Check className="h-5 w-5 sm:h-5 sm:w-5" /> {pendingAction === 'correct' ? 'Aplicando' : 'Correcta'}
      </button>
      <button type="button" disabled={busy} className={`${buttonBase} host-answer-button bg-red-500 text-red-950`} onClick={onWrong}>
        <X className="h-5 w-5 sm:h-5 sm:w-5" /> {pendingAction === 'wrong' ? 'Aplicando' : 'Incorrecta'}
      </button>
      <button type="button" disabled={busy} className={`${buttonBase} host-answer-button col-span-2 bg-amber-400 text-amber-950 sm:col-span-1`} onClick={onPass}>
        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="sm:hidden">{pendingAction === 'pass' ? 'Aplicando' : 'Pasa'}</span>
        <span className="hidden sm:inline">{pendingAction === 'pass' ? 'Aplicando' : 'Pasapalabra'}</span>
      </button>
    </div>
    <div className="mt-2 grid grid-cols-3 gap-1.5 sm:mt-3 sm:gap-2">
      {paused ? (
        <button type="button" disabled={busy} className={`${buttonBase} bg-blue-500 text-blue-950`} onClick={onResume}>
          <TimerReset className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Reanudar
        </button>
      ) : (
        <button type="button" disabled={busy} className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onPause}>
          <TimerOff className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Pausar
        </button>
      )}
      <button type="button" disabled={busy} className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onSwitch}>
        <Shuffle className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Cambiar
      </button>
      <button type="button" disabled={busy} className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onUndo}>
        <RotateCcw className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Deshacer
      </button>
    </div>
  </section>
);
