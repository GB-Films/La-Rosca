import { sampleQuestions } from './sampleQuestions';
import type { Question } from '../types/question';

const EXPANDED_THEMES = new Set(['cine-argentino', 'historia-argentina', 'musica-nacional']);

const clueFromPrompt = (prompt: string) => {
  const separator = prompt.indexOf(':');
  return separator >= 0 ? prompt.slice(separator + 1).trim() : prompt.trim();
};

const leadFor = (question: Question) =>
  question.mode === 'contains' ? `Contiene ${question.letter}` : `Con ${question.letter}`;

const promptVariants = (question: Question) => {
  const lead = leadFor(question);
  const clue = clueFromPrompt(question.prompt);
  return [
    question.prompt,
    `${lead}: ${clue}`,
    `${lead}: En este pack, identifica la respuesta. ${clue}`,
    `${lead}: Pista de la categoria. ${clue}`,
    `${lead}: Referencia argentina. ${clue}`,
    `${lead}: Para responder, pensa en este dato. ${clue}`,
    `${lead}: Dato clave. ${clue}`,
    `${lead}: Pregunta de dificultad media. ${clue}`,
    `${lead}: Nombre o concepto buscado. ${clue}`,
    `${lead}: Pista final. ${clue}`,
  ];
};

export const expandedCategoryLibraries: Question[] = sampleQuestions
  .filter((question) => EXPANDED_THEMES.has(question.theme))
  .flatMap((question) =>
    promptVariants(question).map((prompt, index) => ({
      ...question,
      id: `${question.theme}-library-${question.playerSlot ?? 'g'}-${question.letter.toLowerCase()}-${question.id}-${index + 1}`,
      prompt,
      difficulty: index < 3 ? question.difficulty : 'medium',
    })),
  );
