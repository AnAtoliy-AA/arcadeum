import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HouseRulesSection } from './HouseRulesSection';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('HouseRulesSection', () => {
  const baseRoom = {
    id: 'room-1',
    gameType: 'tic-tac-toe',
    gameOptions: {
      idleTimerAutoplay: false,
      allowSpectators: true,
      firstPlayer: 'host',
    },
  };

  it('renders correctly and toggles random first player checkbox', () => {
    const onSetOption = vi.fn();
    render(
      <HouseRulesSection
        room={baseRoom}
        ruleComingSoon={new Map()}
        onSetOption={onSetOption}
      />,
    );

    const checkbox = screen.getByTestId(
      'random-first-player-checkbox',
    ) as HTMLInputElement;
    const select = screen.getByTestId(
      'first-player-select',
    ) as HTMLSelectElement;

    expect(checkbox.checked).toBe(false);
    expect(select.value).toBe('host');

    fireEvent.click(checkbox);
    expect(onSetOption).toHaveBeenCalledWith({ firstPlayer: 'random' });
  });

  it('renders checked when room has firstPlayer set to random', () => {
    const onSetOption = vi.fn();
    render(
      <HouseRulesSection
        room={{
          ...baseRoom,
          gameOptions: {
            ...baseRoom.gameOptions,
            firstPlayer: 'random',
          },
        }}
        ruleComingSoon={new Map()}
        onSetOption={onSetOption}
      />,
    );

    const checkbox = screen.getByTestId(
      'random-first-player-checkbox',
    ) as HTMLInputElement;
    const select = screen.getByTestId(
      'first-player-select',
    ) as HTMLSelectElement;

    expect(checkbox.checked).toBe(true);
    expect(select.value).toBe('random');

    fireEvent.change(select, { target: { value: 'host' } });
    expect(onSetOption).toHaveBeenCalledWith({ firstPlayer: 'host' });
  });
});
