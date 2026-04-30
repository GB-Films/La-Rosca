import { sampleQuestions } from '../data/sampleQuestions';
import type { Question } from '../types/question';
import { createId } from '../utils/codeGenerator';

export const questionService = {
  getPack(theme: string) {
    return sampleQuestions.filter((question) => question.theme === theme);
  },

  createEmpty(theme: string, letter = 'A', playerSlot?: 1 | 2): Question {
    return {
      id: createId('question'),
      theme,
      letter,
      playerSlot,
      mode: 'startsWith',
      prompt: `Con ${letter}: `,
      answer: '',
      acceptedAnswers: [],
      difficulty: 'easy',
    };
  },

  parseJson(text: string): Question[] {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) throw new Error('El JSON debe ser un array de preguntas.');
    return parsed as Question[];
  },

  toJson(questions: Question[]) {
    return JSON.stringify(questions, null, 2);
  },

  splitForPlayers(questions: Question[]) {
    const expanded: Question[] = [];
    questions.forEach((question) => {
      if (question.playerSlot) {
        expanded.push(question);
        return;
      }
      expanded.push(
        { ...question, id: `${question.id}-j1`, playerSlot: 1 },
        { ...question, id: `${question.id}-j2`, playerSlot: 2 },
      );
    });
    return expanded;
  },

  createEditablePack(questions: Question[], prefix = 'custom') {
    return this.splitForPlayers(questions).map((question) => ({
      ...question,
      id: `${prefix}-${question.id}`,
    }));
  },
};
