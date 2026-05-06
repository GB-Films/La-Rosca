import { Check, RotateCcw, SkipForward, Square, TimerOff, TimerReset, X, Shuffle } from 'lucide-react';

interface HostControlsProps {
  paused: boolean;
  onCorrect: () => void;
  onWrong: () => void;
  onPass: () => void;
  onPause: () => void;
  onResume: () => void;
  onSwitch: () => void;
  onUndo: () => void;
  onFinish: () => void;
}

const buttonBase =
  'inline-flex min-h-10 items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-bold transition sm:min-h-12 sm:gap-2 sm:px-3 sm:py-3 sm:text-base';

export const HostControls = ({
  paused,
  onCorrect,
  onWrong,
  onPass,
  onPause,
  onResume,
  onSwitch,
  onUndo,
  onFinish,
}: HostControlsProps) => (
  <section className="rounded-lg border border-line bg-panel p-2.5 sm:p-4">
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
      <button type="button" className={`${buttonBase} bg-emerald-600 text-white`} onClick={onCorrect}>
        <Check className="h-4 w-4 sm:h-5 sm:w-5" /> Correcta
      </button>
      <button type="button" className={`${buttonBase} bg-red-500 text-red-950`} onClick={onWrong}>
        <X className="h-4 w-4 sm:h-5 sm:w-5" /> Incorrecta
      </button>
      <button type="button" className={`${buttonBase} bg-amber-400 text-amber-950`} onClick={onPass}>
        <SkipForward className="h-4 w-4 sm:h-5 sm:w-5" /> Pasa
      </button>
    </div>
    <div className="mt-2 grid grid-cols-2 gap-1.5 sm:mt-3 sm:gap-2 lg:grid-cols-5">
      {paused ? (
        <button type="button" className={`${buttonBase} bg-blue-500 text-blue-950`} onClick={onResume}>
          <TimerReset className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Reanudar
        </button>
      ) : (
        <button type="button" className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onPause}>
          <TimerOff className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Pausar
        </button>
      )}
      <button type="button" className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onSwitch}>
        <Shuffle className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Cambiar
      </button>
      <button type="button" className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onUndo}>
        <RotateCcw className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Deshacer
      </button>
      <button type="button" className={`${buttonBase} bg-slate-800 text-slate-100 lg:col-span-2`} onClick={onFinish}>
        <Square className="h-4 w-4 sm:h-[18px] sm:w-[18px]" /> Terminar
      </button>
    </div>
  </section>
);
