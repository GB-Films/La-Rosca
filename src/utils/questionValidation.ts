import type { Question, QuestionValidationWarning } from '../types/question';

export const normalizeForLetterCheck = (value: string) =>
  value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();

export const validateQuestion = (question: Question): QuestionValidationWarning | null => {
  const letter = normalizeForLetterCheck(question.letter);
  const answer = normalizeForLetterCheck(question.answer);

  if (!question.prompt.trim() || !question.answer.trim()) {
    return {
      questionId: question.id,
      letter: question.letter,
      message: 'La pregunta y la respuesta no pueden estar vacias.',
    };
  }

  if (question.mode === 'startsWith' && !answer.startsWith(letter)) {
    return {
      questionId: question.id,
      letter: question.letter,
      message: `La respuesta "${question.answer}" debe empezar con ${question.letter}.`,
    };
  }

  if (question.mode === 'contains' && !answer.includes(letter)) {
    return {
      questionId: question.id,
      letter: question.letter,
      message: `La respuesta "${question.answer}" debe contener ${question.letter}.`,
    };
  }

  return null;
};

export const validateQuestions = (questions: Question[]) =>
  questions.map(validateQuestion).filter((warning): warning is QuestionValidationWarning => Boolean(warning));
