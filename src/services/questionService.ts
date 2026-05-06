import { argentinaGeneralLibrary } from '../data/argentinaGeneralLibrary';
import { expandedCategoryLibraries } from '../data/categoryLibraries';
import { getLetters, sampleQuestions } from '../data/sampleQuestions';
import type { Question } from '../types/question';
import { createId } from '../utils/codeGenerator';

const ARGENTINA_GENERAL_THEME = 'cultura-general-argentina';
const CUSTOM_PRESETS_KEY = 'la-rosca:custom-question-presets';
const EXPANDED_THEMES = new Set(['cine-argentino', 'historia-argentina', 'musica-nacional']);

const pickRandom = <T>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export type CustomQuestionPreset = {
  id: string;
  name: string;
  questions: Question[];
  createdAt: string;
};

const readCustomPresets = (): CustomQuestionPreset[] => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_PRESETS_KEY) ?? '[]') as CustomQuestionPreset[];
  } catch {
    return [];
  }
};

export const questionService = {
  getPack(theme: string) {
    if (theme === ARGENTINA_GENERAL_THEME) return argentinaGeneralLibrary;
    if (EXPANDED_THEMES.has(theme)) return expandedCategoryLibraries.filter((question) => question.theme === theme);
    return sampleQuestions.filter((question) => question.theme === theme);
  },

  createGamePack(theme: string, includeÑ: boolean, prefix = 'game') {
    const pack = this.getPack(theme);
    const selected: Question[] = [];

    getLetters(includeÑ).forEach((letter) => {
      const usedAnswers = new Set<string>();

      ([1, 2] as const).forEach((playerSlot) => {
        const candidates = pack.filter(
          (question) => question.letter === letter && (!question.playerSlot || question.playerSlot === playerSlot),
        );
        const freshCandidates = candidates.filter((question) => !usedAnswers.has(question.answer.toLowerCase()));
        const picked = pickRandom(freshCandidates.length > 0 ? freshCandidates : candidates);

        if (!picked) return;
        usedAnswers.add(picked.answer.toLowerCase());
        selected.push({
          ...picked,
          id: `${prefix}-${picked.id}-j${playerSlot}`,
          playerSlot,
          theme,
          difficulty: 'medium',
        });
      });
    });

    return selected;
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

  createBlankEditablePack(theme: string, includeÑ: boolean) {
    return getLetters(includeÑ).flatMap((letter) => [
      this.createEmpty(theme, letter, 1),
      this.createEmpty(theme, letter, 2),
    ]);
  },

  getCustomPresets() {
    return readCustomPresets();
  },

  saveCustomPreset(name: string, questions: Question[]) {
    const preset: CustomQuestionPreset = {
      id: createId('preset'),
      name: name.trim() || `Preset ${new Date().toLocaleDateString('es-AR')}`,
      questions,
      createdAt: new Date().toISOString(),
    };
    const presets = [preset, ...readCustomPresets()].slice(0, 20);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
    return presets;
  },
};
