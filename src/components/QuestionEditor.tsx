import { Download, Plus, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { getLetters } from '../data/sampleQuestions';
import { questionService } from '../services/questionService';
import type { Question } from '../types/question';
import { validateQuestions } from '../utils/questionValidation';

interface QuestionEditorProps {
  questions: Question[];
  theme: string;
  includeÑ: boolean;
  onChange: (questions: Question[]) => void;
}

export const QuestionEditor = ({ questions, theme, includeÑ, onChange }: QuestionEditorProps) => {
  const [filterTheme, setFilterTheme] = useState(theme);
  const [filterLetter, setFilterLetter] = useState('all');
  const [filterPlayer, setFilterPlayer] = useState('all');
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState('');

  const warnings = useMemo(() => validateQuestions(questions), [questions]);
  const playerSlots = useMemo(
    () => Array.from(new Set([1, 2, ...questions.map((question) => question.playerSlot).filter(Boolean) as number[]])).sort((a, b) => a - b),
    [questions],
  );
  const visibleQuestions = questions.filter(
    (question) =>
      (filterTheme === 'all' || question.theme === filterTheme) &&
      (filterLetter === 'all' || question.letter === filterLetter) &&
      (filterPlayer === 'all' ||
        (filterPlayer === 'general' && !question.playerSlot) ||
        question.playerSlot === Number(filterPlayer)),
  );

  const updateQuestion = (id: string, patch: Partial<Question>) => {
    onChange(questions.map((question) => (question.id === id ? { ...question, ...patch } : question)));
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter((question) => question.id !== id));
  };

  const addQuestion = () => {
    onChange([...questions, questionService.createEmpty(theme, getLetters(includeÑ)[0], 1)]);
  };

  const importJson = () => {
    try {
      const imported = questionService.parseJson(jsonText);
      onChange(imported);
      setMessage(`Importadas ${imported.length} preguntas.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo importar el JSON.');
    }
  };

  const exportJson = () => {
    setJsonText(questionService.toJson(questions));
    setMessage('JSON exportado en el editor.');
  };

  return (
    <section className="rounded-lg border border-line bg-panel p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
        <div>
          <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Editor de preguntas</p>
          <h2 className="text-xl font-black leading-tight sm:text-2xl">Pack personalizado</h2>
          <p className="mt-1 text-xs text-slate-300 sm:text-sm">
            Edita una copia para esta partida. El pack argentino default queda intacto.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-3 py-2 text-sm font-bold text-amber-950 sm:px-4 sm:py-3 sm:text-base"
          onClick={addQuestion}
        >
          <Plus size={18} /> Nueva pregunta
        </button>
      </div>

      {warnings.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-300/40 bg-amber-400/10 p-2.5 text-sm text-amber-100 sm:mt-4 sm:p-3">
          <strong>{warnings.length} warning(s) de validacion</strong>
          <ul className="mt-2 grid gap-1">
            {warnings.slice(0, 6).map((warning) => (
              <li key={warning.questionId}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3 md:grid-cols-3">
        <label className="grid gap-2">
          <span className="text-xs text-slate-300 sm:text-sm">Filtrar por tematica</span>
          <select
            value={filterTheme}
            onChange={(event) => setFilterTheme(event.target.value)}
            className="rounded-md border border-line bg-ink px-3 py-2 text-sm sm:text-base"
          >
            <option value="all">Todas</option>
            {[...new Set(questions.map((question) => question.theme))].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs text-slate-300 sm:text-sm">Filtrar por letra</span>
          <select
            value={filterLetter}
            onChange={(event) => setFilterLetter(event.target.value)}
            className="rounded-md border border-line bg-ink px-3 py-2 text-sm sm:text-base"
          >
            <option value="all">Todas</option>
            {getLetters(includeÑ).map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs text-slate-300 sm:text-sm">Filtrar por jugador</span>
          <select
            value={filterPlayer}
            onChange={(event) => setFilterPlayer(event.target.value)}
            className="rounded-md border border-line bg-ink px-3 py-2 text-sm sm:text-base"
          >
            <option value="all">Todas</option>
            {playerSlots.map((slot) => (
              <option key={slot} value={slot}>
                Jugador {slot}
              </option>
            ))}
            <option value="general">Generales</option>
          </select>
        </label>
      </div>

      <div className="mt-3 max-h-[26rem] overflow-auto pr-1 scrollbar-thin sm:mt-4 sm:max-h-[30rem]">
        <div className="grid gap-2 sm:gap-3">
          {visibleQuestions.map((question) => (
            <article key={question.id} className="rounded-md border border-line bg-black/10 p-2 sm:p-3">
              <p className="mb-2 text-[0.65rem] font-bold uppercase tracking-wide text-amber-200 sm:text-xs">
                {question.playerSlot ? `Pregunta Jugador ${question.playerSlot}` : 'Pregunta general'}
              </p>
              <div className="grid gap-2 sm:grid-cols-[6rem_5rem_8rem_1fr_auto]">
                <select
                  value={question.playerSlot ?? 'general'}
                  onChange={(event) =>
                    updateQuestion(question.id, {
                      playerSlot: event.target.value === 'general' ? undefined : Number(event.target.value),
                    })
                  }
                  className="rounded-md border border-line bg-ink px-2 py-2 text-sm sm:text-base"
                >
                  {playerSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      J{slot}
                    </option>
                  ))}
                  <option value="general">General</option>
                </select>
                <select
                  value={question.letter}
                  onChange={(event) => updateQuestion(question.id, { letter: event.target.value })}
                  className="rounded-md border border-line bg-ink px-2 py-2 text-sm sm:text-base"
                >
                  {getLetters(includeÑ).map((letter) => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </select>
                <select
                  value={question.mode}
                  onChange={(event) => updateQuestion(question.id, { mode: event.target.value as Question['mode'] })}
                  className="rounded-md border border-line bg-ink px-2 py-2 text-sm sm:text-base"
                >
                  <option value="startsWith">Empieza</option>
                  <option value="contains">Contiene</option>
                </select>
                <input
                  value={question.answer}
                  onChange={(event) => updateQuestion(question.id, { answer: event.target.value })}
                  className="rounded-md border border-line bg-ink px-3 py-2 text-sm sm:text-base"
                  placeholder="Respuesta"
                />
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-red-500/90 px-3 py-2 text-red-950"
                  onClick={() => removeQuestion(question.id)}
                  title="Borrar pregunta"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <textarea
                value={question.prompt}
                onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })}
                className="mt-2 min-h-16 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm sm:min-h-20 sm:text-base"
                placeholder="Pregunta"
              />
              <input
                value={question.acceptedAnswers?.join(', ') ?? ''}
                onChange={(event) =>
                  updateQuestion(question.id, {
                    acceptedAnswers: event.target.value
                      .split(',')
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
                className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm sm:text-base"
                placeholder="Respuestas aceptadas separadas por coma"
              />
            </article>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:mt-4 sm:gap-3">
        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          className="min-h-28 rounded-md border border-line bg-ink px-3 py-2 font-mono text-sm sm:min-h-36"
          placeholder="Importar/exportar JSON de preguntas"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-bold sm:px-4 sm:py-3 sm:text-base"
            onClick={importJson}
          >
            <Upload size={18} /> Importar JSON
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-slate-700 px-3 py-2 text-sm font-bold sm:px-4 sm:py-3 sm:text-base"
            onClick={exportJson}
          >
            <Download size={18} /> Exportar JSON
          </button>
          {message && <p className="self-center text-sm text-slate-300">{message}</p>}
        </div>
      </div>
    </section>
  );
};
