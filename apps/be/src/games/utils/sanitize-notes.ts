export function sanitizeNotes(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  const cleanChars: string[] = [];
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    // Allow tab (9), newline (10), carriage return (13), and printable characters (>= 32 and != 127)
    if (
      code === 9 ||
      code === 10 ||
      code === 13 ||
      (code >= 32 && code !== 127)
    ) {
      cleanChars.push(input[i]);
    }
  }

  let sanitized = cleanChars
    .join('')
    // Remove HTML tags
    .replace(/<[^>]*>?/gm, '')
    // Remove dangerous protocol prefixes
    .replace(/(javascript|vbscript|data):/gi, '')
    .trim();

  if (sanitized.length > 500) {
    sanitized = sanitized.slice(0, 500);
  }

  return sanitized;
}
