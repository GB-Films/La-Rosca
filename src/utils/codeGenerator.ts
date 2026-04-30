const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const generateCode = (length = 6) =>
  Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');

export const createId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
