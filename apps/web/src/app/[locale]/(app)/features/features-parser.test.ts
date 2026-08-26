import { describe, it, expect } from 'vitest';
import { parseFeatures } from './features-parser';

describe('features-parser', () => {
  it('parses sections, categories, tables, and bullet items', () => {
    const sampleMarkdown = `
# Platform Features

---

## 1. Games (20+)

### Multiplayer Board Games

| Game | Players | Variants |
| --- | --- | --- |
| Chess | 2 | Chess960 |
| Checkers | 2 | Standard |

### Single-Player Puzzle Games

- Solitaire (Klondike)
- Minesweeper (Beginner/Intermediate)

---

## 8. Real-Time (WebSocket)

- Full-duplex Socket.IO communication
- AES-GCM encryption
`;

    const sections = parseFeatures(sampleMarkdown);

    expect(sections).toHaveLength(2);

    expect(sections[0].number).toBe(1);
    expect(sections[0].title).toBe('Games (20+)');
    expect(sections[0].category).toBe('games');
    expect(sections[0].icon).toBe('🎮');
    expect(sections[0].badge).toBe('20+ Games');
    expect(sections[0].subsections).toHaveLength(2);

    expect(sections[0].subsections[0].title).toBe('Multiplayer Board Games');
    expect(sections[0].subsections[0].items[0].isTable).toBe(true);
    expect(sections[0].subsections[0].items[0].tableHeaders).toEqual([
      'Game',
      'Players',
      'Variants',
    ]);
    expect(sections[0].subsections[0].items[0].tableRows).toHaveLength(2);

    expect(sections[0].subsections[1].title).toBe('Single-Player Puzzle Games');
    expect(sections[0].subsections[1].items).toHaveLength(2);
    expect(sections[0].subsections[1].items[0].text).toBe(
      'Solitaire (Klondike)',
    );

    expect(sections[1].number).toBe(8);
    expect(sections[1].title).toBe('Real-Time (WebSocket)');
    expect(sections[1].category).toBe('security');
    expect(sections[1].icon).toBe('🔌');
    expect(sections[1].badge).toBe('WebSocket AES-GCM');
    expect(sections[1].subsections[0].items).toHaveLength(2);
  });
});
