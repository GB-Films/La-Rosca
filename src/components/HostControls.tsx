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
  'inline-flex min-h-12 items-center justify-center gap-1 rounded-md px-2 py-3 text-sm font-bold transition sm:gap-2 sm:px-3 sm:text-base';

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
  <section className="rounded-lg border border-line bg-panel p-4">
    <div className="grid grid-cols-3 gap-2">
      <button type="button" className={`${buttonBase} bg-emerald-500 text-emerald-950`} onClick={onCorrect}>
        <Check size={20} /> Correcta
      </button>
      <button type="button" className={`${buttonBase} bg-red-500 text-red-950`} onClick={onWrong}>
        <X size={20} /> Incorrecta
      </button>
      <button type="button" className={`${buttonBase} bg-amber-400 text-amber-950`} onClick={onPass}>
        <SkipForward size={20} /> Pasa
      </button>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-5">
      {paused ? (
        <button type="button" className={`${buttonBase} bg-blue-500 text-blue-950`} onClick={onResume}>
          <TimerReset size={18} /> Reanudar
        </button>
      ) : (
        <button type="button" className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onPause}>
          <TimerOff size={18} /> Pausar
        </button>
      )}
      <button type="button" className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onSwitch}>
        <Shuffle size={18} /> Cambiar turno
      </button>
      <button type="button" className={`${buttonBase} bg-slate-700 text-slate-100`} onClick={onUndo}>
        <RotateCcw size={18} /> Deshacer
      </button>
      <button type="button" className={`${buttonBase} bg-slate-800 text-slate-100 lg:col-span-2`} onClick={onFinish}>
        <Square size={18} /> Terminar partida
      </button>
    </div>
  </section>
);
