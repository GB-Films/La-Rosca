export type QuestionMode = 'startsWith' | 'contains';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  theme: string;
  letter: string;
  playerSlot?: number;
  mode: QuestionMode;
  prompt: string;
  answer: string;
  acceptedAnswers?: string[];
  difficulty: Difficulty;
  explanation?: string;
}

export interface QuestionValidationWarning {
  questionId: string;
  letter: string;
  message: string;
}
