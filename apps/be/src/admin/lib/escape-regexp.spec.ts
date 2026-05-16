import { escapeRegExp } from './escape-regexp';

describe('escapeRegExp', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegExp('.')).toBe('\\.');
    expect(escapeRegExp('*')).toBe('\\*');
    expect(escapeRegExp('+')).toBe('\\+');
    expect(escapeRegExp('?')).toBe('\\?');
    expect(escapeRegExp('^')).toBe('\\^');
    expect(escapeRegExp('$')).toBe('\\$');
    expect(escapeRegExp('{}')).toBe('\\{\\}');
    expect(escapeRegExp('()')).toBe('\\(\\)');
    expect(escapeRegExp('|')).toBe('\\|');
    expect(escapeRegExp('[]')).toBe('\\[\\]');
    expect(escapeRegExp('\\')).toBe('\\\\');
  });

  it('leaves alphanumerics and spaces untouched', () => {
    expect(escapeRegExp('hello world 123')).toBe('hello world 123');
  });

  it('handles empty string', () => {
    expect(escapeRegExp('')).toBe('');
  });

  it('escapes mixed input correctly', () => {
    expect(escapeRegExp('user.name+tag@example.com')).toBe(
      'user\\.name\\+tag@example\\.com',
    );
  });

  it('output is safe to use in a new RegExp', () => {
    const value = '*+?(';
    expect(() => new RegExp(escapeRegExp(value))).not.toThrow();
    expect(new RegExp(escapeRegExp(value)).test(value)).toBe(true);
  });
});
