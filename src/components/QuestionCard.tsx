import type { Question } from '../types/question';

interface QuestionCardProps {
  question?: Question;
  showAnswer?: boolean;
  letter?: string;
}

export const QuestionCard = ({ question, showAnswer, letter }: QuestionCardProps) => (
  <section className="rounded-lg border border-line bg-panel p-3 sm:p-5">
    <p className="text-xs uppercase tracking-wide text-slate-400">Letra actual</p>
    <h2 className="text-2xl font-black text-blue-200 sm:text-3xl">{letter ?? '-'}</h2>
    <div className="mt-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Pregunta</p>
      <p className="mt-1 text-base leading-relaxed text-slate-100 sm:text-lg">
        {question?.prompt ?? 'Sin pregunta asignada.'}
      </p>
    </div>
    {showAnswer && (
      <div className="mt-4 rounded-md border border-emerald-400/30 bg-emerald-500/10 p-3">
        <p className="text-xs uppercase tracking-wide text-emerald-200">Respuesta correcta</p>
        <p className="text-lg font-bold text-emerald-100 sm:text-xl">{question?.answer ?? '-'}</p>
      </div>
    )}
  </section>
);
