import { vi } from 'vitest';

/** Shared vi.mock factories for landing component tests. */
export const translationMock = () => ({
  useTranslation: () => ({
    t: (key: string) => key.replace('games.landing.', ''),
  }),
});

export const quickplayButtonMock = () => ({
  QuickplayButton: (props: {
    label: string;
    mode: string;
    difficulty?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      data-testid={`quickplay-${props.mode}-button`}
      data-difficulty={props.difficulty}
      disabled={props.disabled}
    >
      {props.label}
    </button>
  ),
});

export const gamesApiMock = () => ({
  gamesApi: {
    getCatalog: vi.fn().mockResolvedValue({ games: [] }),
  },
});
