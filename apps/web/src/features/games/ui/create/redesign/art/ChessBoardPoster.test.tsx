import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ChessBoardPoster } from './ChessBoardPoster';

describe('ChessBoardPoster', () => {
  it('renders different square colors for distinct themes', () => {
    const { container: cyberpunkContainer } = render(
      <ChessBoardPoster
        theme={{
          id: 'cyberpunk',
          name: 'Cyberpunk',
          desc: 'desc',
          color: '#FF0080',
        }}
      />,
    );

    const { container: fantasyContainer } = render(
      <ChessBoardPoster
        theme={{
          id: 'fantasy',
          name: 'Fantasy',
          desc: 'desc',
          color: '#065f46',
        }}
      />,
    );

    const cyberpunkRects = cyberpunkContainer.querySelectorAll('rect');
    const fantasyRects = fantasyContainer.querySelectorAll('rect');

    expect(cyberpunkRects.length).toBeGreaterThan(0);
    expect(fantasyRects.length).toBeGreaterThan(0);

    const cyberpunkFills = Array.from(cyberpunkRects).map((r) =>
      r.getAttribute('fill'),
    );
    const fantasyFills = Array.from(fantasyRects).map((r) =>
      r.getAttribute('fill'),
    );

    expect(cyberpunkFills).not.toEqual(fantasyFills);
  });

  it('renders chess960 theme with specific colors', () => {
    const { container } = render(
      <ChessBoardPoster
        theme={{
          id: 'chess960',
          name: 'Chess960',
          desc: 'desc',
          color: '#5b7fa5',
        }}
      />,
    );

    const rects = container.querySelectorAll('rect');
    const fills = Array.from(rects).map((r) => r.getAttribute('fill'));
    expect(fills).toContain('#5b7fa5');
    expect(fills).toContain('#c8d6e5');
  });
});
