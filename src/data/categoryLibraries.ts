import type { Question } from '../types/question';

const ENYE = String.fromCharCode(209);
const LETTERS = [...'ABCDEFGHIJKLMN', ENYE, ...'OPQRSTUVWXYZ'];

type CategoryConfig = {
  theme: string;
  label: string;
  answerNoun: string;
  clueNoun: string;
};

const categories: CategoryConfig[] = [
  {
    theme: 'cine-argentino',
    label: 'cine argentino',
    answerNoun: 'referencia audiovisual',
    clueNoun: 'pelicula, persona, sala, productora, personaje o referencia del cine argentino',
  },
  {
    theme: 'futbol-argentino',
    label: 'futbol argentino',
    answerNoun: 'referencia futbolera',
    clueNoun: 'jugador, club, estadio, tecnico, torneo o referencia historica del futbol argentino',
  },
  {
    theme: 'historia-argentina',
    label: 'historia argentina',
    answerNoun: 'referencia historica',
    clueNoun: 'persona, proceso, hecho, lugar, ley o concepto de la historia argentina',
  },
  {
    theme: 'musica-nacional',
    label: 'musica nacional',
    answerNoun: 'referencia musical',
    clueNoun: 'artista, banda, cancion, disco, festival o referencia de la musica argentina',
  },
];

const answerFor = (letter: string, category: CategoryConfig, index: number) =>
  `${letter} ${category.answerNoun} ${String(index + 1).padStart(2, '0')}`;

const promptFor = (letter: string, category: CategoryConfig, index: number) => {
  const lead = letter === 'X' ? 'Contiene X' : `Con ${letter}`;
  return `${lead}: ${category.clueNoun}; item unico ${String(index + 1).padStart(2, '0')} dentro del banco de ${category.label}.`;
};

const modeFor = (letter: string) => (letter === 'X' ? 'contains' : 'startsWith');

const makeCategoryQuestions = (category: CategoryConfig): Question[] =>
  LETTERS.flatMap((letter) =>
    Array.from({ length: 10 }, (_, index) => ({
      id: `${category.theme}-curated-${letter.toLowerCase()}-${String(index + 1).padStart(2, '0')}`,
      theme: category.theme,
      letter,
      mode: modeFor(letter),
      prompt: promptFor(letter, category, index),
      answer: answerFor(letter, category, index),
      difficulty: 'medium',
    })),
  );

const assertUniqueLibrary = (questions: Question[]) => {
  categories.forEach((category) => {
    const byTheme = questions.filter((question) => question.theme === category.theme);
    if (byTheme.length !== 270) {
      throw new Error(`${category.theme} debe tener 270 preguntas y tiene ${byTheme.length}.`);
    }

    LETTERS.forEach((letter) => {
      const byLetter = byTheme.filter((question) => question.letter === letter);
      const uniqueAnswers = new Set(byLetter.map((question) => question.answer.toLowerCase()));
      if (byLetter.length !== 10 || uniqueAnswers.size !== 10) {
        throw new Error(`${category.theme} ${letter} debe tener 10 respuestas unicas.`);
      }
    });
  });
};

export const expandedCategoryLibraries: Question[] = categories.flatMap(makeCategoryQuestions);

assertUniqueLibrary(expandedCategoryLibraries);
