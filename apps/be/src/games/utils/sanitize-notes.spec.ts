import { sanitizeNotes } from './sanitize-notes';

describe('sanitizeNotes', () => {
  it('strips HTML tags and angle brackets', () => {
    const input =
      '<script>alert("XSS")</script>Welcome to my game! <b>No cheaters</b>';
    const result = sanitizeNotes(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('Welcome to my game!');
  });

  it('handles nested and malformed angle brackets cleanly', () => {
    const input = '<scrip<script>t>alert(1)</scrip</script>t>';
    const result = sanitizeNotes(input);
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).toContain('alert(1)');
  });

  it('strips dangerous protocols', () => {
    const input = 'Check this: javascript:alert(1) and data:text/html,abc';
    const result = sanitizeNotes(input);
    expect(result).toBe('Check this: alert(1) and text/html,abc');
  });

  it('strips non-printable ASCII control characters', () => {
    const input = 'Clean\x00Text\x07With\x1FControl\x7FChars';
    const result = sanitizeNotes(input);
    expect(result).toBe('CleanTextWithControlChars');
  });

  it('preserves valid newlines, emojis, and unicode text', () => {
    const input = 'Line 1\nLine 2 🎮 Привет мир! ¡Hola amigos!';
    const result = sanitizeNotes(input);
    expect(result).toBe('Line 1\nLine 2 🎮 Привет мир! ¡Hola amigos!');
  });

  it('truncates text exceeding 500 characters', () => {
    const input = 'a'.repeat(600);
    const result = sanitizeNotes(input);
    expect(result.length).toBe(500);
  });

  it('returns empty string for non-string inputs', () => {
    expect(sanitizeNotes(null)).toBe('');
    expect(sanitizeNotes(undefined)).toBe('');
    expect(sanitizeNotes(123)).toBe('');
  });
});
