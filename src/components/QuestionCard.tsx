import type { Question } from '../types/question';

interface QuestionCardProps {
  question?: Question;
  showAnswer?: boolean;
  letter?: string;
}

export const QuestionCard = ({ question, showAnswer, letter }: QuestionCardProps) => (
  <section className="rounded-lg border border-line bg-panel p-2.5 sm:p-5">
    <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Letra actual</p>
    <h2 className="text-xl font-black leading-none text-blue-200 sm:text-3xl">{letter ?? '-'}</h2>
    <div className="mt-2 sm:mt-4">
      <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Pregunta</p>
      <p className="mt-1 text-sm leading-snug text-slate-100 sm:text-lg sm:leading-relaxed">
        {question?.prompt ?? 'Sin pregunta asignada.'}
      </p>
    </div>
    {showAnswer && (
      <div className="mt-2 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-2 sm:mt-4 sm:p-3">
        <p className="text-[0.65rem] uppercase tracking-wide text-emerald-200 sm:text-xs">Respuesta correcta</p>
        <p className="text-base font-bold text-emerald-100 sm:text-xl">{question?.answer ?? '-'}</p>
      </div>
    )}
  </section>
);
