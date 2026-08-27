export function sanitizeNotes(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  const cleanChars: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    if (
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 32 && code !== 127)
    ) {
      cleanChars.push(input[i]);
    }
  }

  let sanitized = cleanChars.join('').replace(/[<>]/g, '');

  let previous: string;
  do {
    previous = sanitized;
    sanitized = sanitized.replace(/(javascript|vbscript|data):/gi, '');
  } while (sanitized !== previous);

  sanitized = sanitized.trim();

  if (sanitized.length > 500) {
    sanitized = sanitized.slice(0, 500);
  }

  return sanitized;
}
