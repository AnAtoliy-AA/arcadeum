import { countUrls, escapeDiscordMarkdown, stripNewlines } from './sanitize';

describe('stripNewlines', () => {
  it('replaces CR/LF runs with a single space', () => {
    expect(stripNewlines('hello\nworld')).toBe('hello world');
    expect(stripNewlines('a\r\nb\nc')).toBe('a b c');
  });

  it('trims surrounding whitespace', () => {
    expect(stripNewlines('  spaced  ')).toBe('spaced');
  });

  it('defeats header-injection attempts', () => {
    // Classic header-injection payload tries to slip Bcc: via newline.
    const payload = 'Mallory\nBcc: victim@example.com';
    expect(stripNewlines(payload)).not.toContain('\n');
  });
});

describe('escapeDiscordMarkdown', () => {
  it('escapes link syntax and emphasis chars', () => {
    expect(escapeDiscordMarkdown('[click](https://evil.com)')).toBe(
      '\\[click\\]\\(https://evil.com\\)',
    );
    expect(escapeDiscordMarkdown('*bold* _italic_ ~strike~')).toBe(
      '\\*bold\\* \\_italic\\_ \\~strike\\~',
    );
  });

  it('escapes backticks so user content cannot break out of code blocks', () => {
    expect(escapeDiscordMarkdown('end```start')).toBe('end\\`\\`\\`start');
  });
});

describe('countUrls', () => {
  it('counts http and https URLs', () => {
    expect(
      countUrls('see https://a.com and http://b.org and https://c.io'),
    ).toBe(3);
  });

  it('returns 0 for plain text', () => {
    expect(countUrls('I have a question, no links.')).toBe(0);
  });

  it('does not count bare domains (only http/https)', () => {
    expect(countUrls('check arcadeum.games for details')).toBe(0);
  });
});
