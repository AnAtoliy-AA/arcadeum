export type ApiErrorInfo = {
  messageKey: string | null;
  message: string;
};

export function parseApiError(rawText: string): ApiErrorInfo {
  try {
    const parsed = JSON.parse(rawText);

    if (typeof parsed === 'object' && parsed !== null) {
      const messageKey =
        typeof parsed.messageKey === 'string' ? parsed.messageKey : null;

      const message =
        typeof parsed.message === 'string'
          ? parsed.message
          : rawText || 'An unexpected error occurred';

      return { messageKey, message };
    }
  } catch {
    // Not JSON, treat as plain text
  }

  return {
    messageKey: null,
    message: rawText || 'An unexpected error occurred',
  };
}

const ERROR_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'Username already taken': 'usernameTaken',
  'Email already registered': 'emailTaken',
  'Invalid credentials': 'invalidCredentials',
};

export function getTranslationKeyForError(message: string): string | null {
  return ERROR_MESSAGE_TRANSLATIONS[message] ?? null;
}
