import { sampleQuestions } from './sampleQuestions';
import type { Question } from '../types/question';

const EXPANDED_THEMES = new Set(['cine-argentino', 'futbol-argentino', 'historia-argentina', 'musica-nacional']);

const clueFromPrompt = (prompt: string) => {
  const separator = prompt.indexOf(':');
  return separator >= 0 ? prompt.slice(separator + 1).trim() : prompt.trim();
};

const leadFor = (question: Question) =>
  question.mode === 'contains' ? `Contiene ${question.letter}` : `Con ${question.letter}`;

const categoryLabel: Record<string, string> = {
  'cine-argentino': 'cine argentino',
  'futbol-argentino': 'futbol argentino',
  'historia-argentina': 'historia argentina',
  'musica-nacional': 'musica nacional',
};

const promptVariants = (question: Question) => {
  const lead = leadFor(question);
  const clue = clueFromPrompt(question.prompt);
  const category = categoryLabel[question.theme] ?? 'cultura general';
  return [
    question.prompt,
    `${lead}: En ${category}, identifica la respuesta asociada a esta pista: ${clue}`,
    `${lead}: Pista ampliada de ${category}: ${clue}`,
    `${lead}: Referencia clave dentro de ${category}: ${clue}`,
    `${lead}: Para responder, pensa en este dato de ${category}: ${clue}`,
    `${lead}: Dato distintivo de ${category}: ${clue}`,
    `${lead}: Nombre, titulo o concepto buscado en ${category}: ${clue}`,
    `${lead}: Pista de contexto argentino: ${clue}`,
    `${lead}: Esta pregunta apunta a un dato reconocido de ${category}: ${clue}`,
    `${lead}: Ultima pista de la serie: ${clue}`,
  ];
};

export const expandedCategoryLibraries: Question[] = sampleQuestions
  .filter((question) => EXPANDED_THEMES.has(question.theme))
  .flatMap((question) =>
    promptVariants(question).map((prompt, index) => ({
      ...question,
      id: `${question.theme}-library-${question.playerSlot ?? 'g'}-${question.letter.toLowerCase()}-${question.id}-${index + 1}`,
      prompt,
      difficulty: 'medium',
    })),
  );
