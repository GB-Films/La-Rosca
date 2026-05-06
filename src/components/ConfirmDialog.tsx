interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  tone?: 'warning' | 'danger';
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel,
  tone = 'warning',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  if (!open) return null;

  const confirmClass =
    tone === 'danger' ? 'bg-red-500 text-red-950 hover:bg-red-400' : 'bg-amber-400 text-amber-950 hover:bg-amber-300';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <section className="w-full max-w-md rounded-xl border border-line bg-panel p-5 shadow-2xl">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-blue-200">Confirmar accion</p>
        <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">{description}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" className="rounded-md bg-slate-700 px-4 py-3 text-sm font-bold text-white" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className={`rounded-md px-4 py-3 text-sm font-black ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
};
