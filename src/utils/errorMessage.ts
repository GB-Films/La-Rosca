type ErrorLike = {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
};

export const getErrorMessage = (error: unknown, fallback = 'Ocurrio un error.') => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const item = error as ErrorLike;
    const parts = [item.message, item.details, item.hint, item.code]
      .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
      .map((part) => part.trim());
    if (parts.length > 0) return parts.join(' ');
  }
  return fallback;
};
