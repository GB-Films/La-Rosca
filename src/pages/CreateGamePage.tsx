import { useMemo, useState } from 'react';
import { navigate } from '../app/router';
import { QuestionEditor } from '../components/QuestionEditor';
import { ThemeSelector } from '../components/ThemeSelector';
import { sampleQuestions } from '../data/sampleQuestions';
import { questionService } from '../services/questionService';
import { useGameStore } from '../store/gameStore';
import type { Question } from '../types/question';
import { validateQuestions } from '../utils/questionValidation';

export const CreateGamePage = () => {
  const createGame = useGameStore((state) => state.createGame);
  const [title, setTitle] = useState('Partida de La Rosca');
  const [theme, setTheme] = useState('cultura-general-argentina');
  const [timerSeconds, setTimerSeconds] = useState(150);
  const [includeÑ, setIncludeÑ] = useState(false);
  const [questionMode, setQuestionMode] = useState<'pack' | 'manual' | 'example'>('pack');
  const [showQuestionToPlayers, setShowQuestionToPlayers] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(() => questionService.createEditablePack(sampleQuestions));
  const warnings = useMemo(() => validateQuestions(questions), [questions]);

  const create = async () => {
    const selectedQuestions =
      questionMode === 'manual'
        ? questions
        : questionService.createEditablePack(
            questionMode === 'pack' ? questionService.getPack(theme) : sampleQuestions,
            'game',
          );
    const session = await createGame({
      title,
      theme,
      timerSeconds,
      includeÑ,
      questionMode,
      questions: selectedQuestions,
      showQuestionToPlayers,
    });
    navigate(`/lobby/${session.game.id}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-line bg-panel p-5">
        <p className="text-xs uppercase tracking-wide text-slate-400">Crear partida</p>
        <h2 className="text-3xl font-black">Configuracion</h2>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-200">Nombre de la partida</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-md border border-line bg-ink px-3 py-3"
            />
          </label>
          <ThemeSelector value={theme} onChange={setTheme} />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-200">Duracion por jugador</span>
            <input
              type="number"
              min={30}
              max={900}
              value={timerSeconds}
              onChange={(event) => setTimerSeconds(Number(event.target.value))}
              className="rounded-md border border-line bg-ink px-3 py-3"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink p-3">
            <span>Incluir Ñ</span>
            <input type="checkbox" checked={includeÑ} onChange={(event) => setIncludeÑ(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink p-3">
            <span>Mostrar pregunta a jugadores</span>
            <input
              type="checkbox"
              checked={showQuestionToPlayers}
              onChange={(event) => setShowQuestionToPlayers(event.target.checked)}
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-200">Modo de preguntas</span>
            <select
              value={questionMode}
              onChange={(event) => setQuestionMode(event.target.value as typeof questionMode)}
              className="rounded-md border border-line bg-ink px-3 py-3"
            >
              <option value="pack">Usar pack existente</option>
              <option value="manual">Usar pack personalizado editable</option>
              <option value="example">Generar pack de ejemplo local</option>
            </select>
          </label>
          {warnings.length > 0 && (
            <p className="rounded-md border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-100">
              Hay {warnings.length} warning(s) en el banco editable. El host tambien los vera luego.
            </p>
          )}
          <button
            type="button"
            className="rounded-md bg-amber-400 px-5 py-4 text-lg font-black text-amber-950"
            onClick={create}
          >
            Crear partida
          </button>
        </div>
      </section>
      <QuestionEditor questions={questions} theme={theme} includeÑ={includeÑ} onChange={setQuestions} />
    </div>
  );
};
