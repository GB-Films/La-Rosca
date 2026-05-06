import { RefreshCw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { navigate } from '../app/router';
import { QuestionEditor } from '../components/QuestionEditor';
import { ThemeSelector } from '../components/ThemeSelector';
import { questionService } from '../services/questionService';
import { useGameStore } from '../store/gameStore';
import type { Question } from '../types/question';
import { validateQuestions } from '../utils/questionValidation';

export const CreateGamePage = () => {
  const createGame = useGameStore((state) => state.createGame);
  const [title, setTitle] = useState('Partida de La Rosca');
  const [theme, setTheme] = useState('cultura-general-argentina');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [includeÑ, setIncludeÑ] = useState(false);
  const [questionMode, setQuestionMode] = useState<'pack' | 'manual'>('pack');
  const [showQuestionToPlayers, setShowQuestionToPlayers] = useState(true);
  const [questions, setQuestions] = useState<Question[]>(() =>
    questionService.createBlankEditablePack('personalizada', false),
  );
  const [packQuestions, setPackQuestions] = useState<Question[]>(() =>
    questionService.createGamePack('cultura-general-argentina', false, 'preview'),
  );
  const [presetName, setPresetName] = useState('Mi categoria');
  const [customPresets, setCustomPresets] = useState(() => questionService.getCustomPresets());
  const [presetMessage, setPresetMessage] = useState('');
  const warnings = useMemo(() => validateQuestions(questions), [questions]);
  const packWarnings = useMemo(() => validateQuestions(packQuestions), [packQuestions]);

  const randomizePack = () => {
    setPackQuestions(questionService.createGamePack(theme, includeÑ, `preview-${Date.now()}`));
  };

  useEffect(() => {
    if (questionMode === 'pack') randomizePack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, includeÑ, questionMode]);

  const changeQuestionMode = (mode: typeof questionMode) => {
    setQuestionMode(mode);
    if (mode === 'manual') {
      setTheme('personalizada');
      setQuestions(questionService.createBlankEditablePack('personalizada', includeÑ));
    }
  };

  const savePreset = () => {
    const next = questionService.saveCustomPreset(presetName, questions);
    setCustomPresets(next);
    setPresetMessage('Preset guardado en este navegador.');
    window.setTimeout(() => setPresetMessage(''), 3000);
  };

  const loadPreset = (presetId: string) => {
    const preset = customPresets.find((item) => item.id === presetId);
    if (!preset) return;
    setQuestions(preset.questions);
    setPresetName(preset.name);
  };

  const create = async () => {
    const selectedQuestions =
      questionMode === 'manual'
        ? questions
        : packQuestions.map((question) => ({ ...question, id: `game-${question.id}` }));
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
    <div className="grid gap-3 sm:gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-lg border border-line bg-panel p-3 sm:p-5">
        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Crear partida</p>
        <h2 className="text-2xl font-black leading-tight sm:text-3xl">Configuracion</h2>
        <div className="mt-4 grid gap-3 sm:mt-5 sm:gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-200">Nombre de la partida</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-md border border-line bg-ink px-3 py-2.5 sm:py-3"
            />
          </label>
          <ThemeSelector value={theme} onChange={setTheme} />
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-200">Duracion por jugador (segundos)</span>
            <input
              type="number"
              min={30}
              max={900}
              value={timerSeconds}
              onChange={(event) => setTimerSeconds(Number(event.target.value))}
              className="rounded-md border border-line bg-ink px-3 py-2.5 sm:py-3"
            />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink p-2.5 sm:p-3">
            <span>Incluir Ñ</span>
            <input type="checkbox" checked={includeÑ} onChange={(event) => setIncludeÑ(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-md border border-line bg-ink p-2.5 sm:p-3">
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
              onChange={(event) => changeQuestionMode(event.target.value as typeof questionMode)}
              className="rounded-md border border-line bg-ink px-3 py-2.5 sm:py-3"
            >
              <option value="pack">Usar pack existente</option>
              <option value="manual">Personalizado editable</option>
            </select>
          </label>
          {questionMode === 'manual' && warnings.length > 0 && (
            <p className="rounded-md border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-100">
              Hay {warnings.length} warning(s) en el banco editable. El host tambien los vera luego.
            </p>
          )}
          <button
            type="button"
            className="rounded-md bg-amber-400 px-5 py-3 text-base font-black text-amber-950 sm:py-4 sm:text-lg"
            onClick={create}
          >
          Crear partida
          </button>
        </div>
      </section>
      {questionMode === 'pack' ? (
        <section className="rounded-lg border border-line bg-panel p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Pack existente</p>
              <h2 className="text-xl font-black leading-tight sm:text-2xl">Preguntas seleccionadas</h2>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Seleccion aleatoria para 2 jugadores. Toca randomizar para elegir otra combinacion.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-md bg-amber-400 px-3 py-2 text-sm font-bold text-amber-950 sm:px-4 sm:py-3"
              onClick={randomizePack}
            >
              <RefreshCw size={16} /> Randomizar
            </button>
          </div>
          {packWarnings.length > 0 && (
            <p className="mt-3 rounded-md border border-amber-300/40 bg-amber-400/10 p-3 text-sm text-amber-100">
              Hay {packWarnings.length} warning(s) en esta seleccion.
            </p>
          )}
          <div className="mt-3 max-h-[34rem] overflow-auto pr-1 scrollbar-thin">
            <div className="grid gap-2">
              {packQuestions.map((question) => (
                <article key={question.id} className="rounded-md border border-line bg-black/10 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-black text-blue-200">
                      J{question.playerSlot} - {question.letter}
                    </p>
                    <p className="text-xs text-slate-400">{question.mode === 'contains' ? 'Contiene' : 'Empieza'}</p>
                  </div>
                  <p className="mt-1 text-sm leading-snug text-slate-100">{question.prompt}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-200">{question.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <div className="grid gap-3">
          <section className="rounded-lg border border-line bg-panel p-3 sm:p-4">
            <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 sm:text-xs">Preset personalizado</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                className="rounded-md border border-line bg-ink px-3 py-2 text-sm sm:text-base"
                placeholder="Nombre del preset"
              />
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-amber-400 px-3 py-2 text-sm font-bold text-amber-950"
                onClick={savePreset}
              >
                <Save size={16} /> Guardar preset
              </button>
            </div>
            {customPresets.length > 0 && (
              <select
                className="mt-2 w-full rounded-md border border-line bg-ink px-3 py-2 text-sm"
                defaultValue=""
                onChange={(event) => loadPreset(event.target.value)}
              >
                <option value="" disabled>
                  Cargar preset guardado
                </option>
                {customPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            )}
            {presetMessage && <p className="mt-2 text-sm font-bold text-blue-200">{presetMessage}</p>}
          </section>
          <QuestionEditor questions={questions} theme="personalizada" includeÑ={includeÑ} onChange={setQuestions} />
        </div>
      )}
    </div>
  );
};
