import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuickPresets } from './QuickPresets';
import { HouseRules } from './HouseRules';
import { RoomDetails } from './RoomDetails';
import { ThemePicker } from './ThemePicker';
import { initialForm } from './data/createFlow';
import { VISIBLE_GAMES, themesFor } from './data/themes';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
}));

vi.mock('next/dynamic', () => ({
  default: () => () => null,
}));

describe('QuickPresets', () => {
  it('marks the active preset and reports clicks', () => {
    const onChange = vi.fn();
    render(<QuickPresets value="friends" onChange={onChange} />);
    expect(screen.getByTestId('preset-friends')).toHaveAttribute(
      'aria-checked',
      'true',
    );
    fireEvent.click(screen.getByTestId('preset-ranked'));
    expect(onChange).toHaveBeenCalledWith('ranked');
    expect(screen.queryByTestId('preset-custom-note')).toBeNull();
  });
  it('explains when the setup was customised', () => {
    render(<QuickPresets value="custom" onChange={() => {}} />);
    expect(screen.getByTestId('preset-custom-note')).toBeInTheDocument();
  });
});

describe('HouseRules', () => {
  it('shows an empty state for games without supported rules', () => {
    render(
      <HouseRules
        gameId="chess_v1"
        value={initialForm('chess_v1', undefined, null).rules}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('house-rules-empty')).toBeInTheDocument();
    expect(screen.queryByTestId('house-rules')).toBeNull();
  });
  it('toggles a Critical rule', () => {
    const onChange = vi.fn();
    const rules = initialForm('critical_v1', undefined, null).rules;
    render(
      <HouseRules gameId="critical_v1" value={rules} onChange={onChange} />,
    );
    fireEvent.click(screen.getByTestId('rule-toggle-combos'));
    expect(onChange).toHaveBeenCalledWith({ ...rules, combos: true });
    expect(screen.queryByTestId('rule-toggle-teams')).toBeNull();
  });
  it('shows coming soon instead of a switch when the catalog says so', () => {
    render(
      <HouseRules
        gameId="critical_v1"
        value={initialForm('critical_v1', undefined, null).rules}
        ruleComingSoon={new Map([['critical_v1::combos', true]])}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByTestId('rule-toggle-combos')).toBeNull();
  });
});

describe('RoomDetails', () => {
  const base = initialForm('critical_v1', undefined, null);
  it('shows the validation message and flags the input', () => {
    render(
      <RoomDetails
        gameId="critical_v1"
        form={{ ...base, roomName: '' }}
        nameError="required"
        onNameBlur={() => {}}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('room-name-error')).toHaveTextContent(
      'createRoom.details.errorRequired',
    );
    expect(screen.getByTestId('room-name-input')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });
  it('shows helper text and no error when valid', () => {
    render(
      <RoomDetails
        gameId="critical_v1"
        form={{ ...base, roomName: 'Hi' }}
        nameError={null}
        onNameBlur={() => {}}
        onChange={() => {}}
      />,
    );
    expect(screen.queryByTestId('room-name-error')).toBeNull();
    expect(screen.getByTestId('visibility-help')).toHaveTextContent(
      'createRoom.details.visibilityHelp.public',
    );
  });
  it('replaces the stepper with a note for fixed-size games', () => {
    render(
      <RoomDetails
        gameId="chess_v1"
        form={{ ...initialForm('chess_v1', undefined, null), roomName: 'x' }}
        nameError={null}
        onNameBlur={() => {}}
        onChange={() => {}}
      />,
    );
    expect(screen.getByTestId('players-fixed')).toBeInTheDocument();
    expect(screen.queryByTestId('stepper-inc')).toBeNull();
  });
  it('reports edits with the preset reset to custom', () => {
    const onChange = vi.fn();
    render(
      <RoomDetails
        gameId="critical_v1"
        form={{ ...base, roomName: 'a' }}
        nameError={null}
        onNameBlur={() => {}}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByTestId('visibility-private'));
    expect(onChange).toHaveBeenCalledWith({
      visibility: 'private',
      preset: 'custom',
    });
  });
});

describe('ThemePicker', () => {
  it.each(VISIBLE_GAMES)(
    'renders one selectable card per theme for %s',
    (id) => {
      const themes = themesFor(id);
      const onChange = vi.fn();
      render(
        <ThemePicker
          gameId={id}
          value={themes[0].id}
          label="themes"
          onChange={onChange}
        />,
      );
      const group = screen.getByRole('radiogroup', { name: 'themes' });
      expect(group).toBeInTheDocument();
      expect(screen.getAllByRole('radio')).toHaveLength(themes.length);
      expect(screen.getByTestId(`theme-${themes[0].id}`)).toHaveAttribute(
        'aria-checked',
        'true',
      );
      if (themes.length > 1) {
        fireEvent.click(screen.getByTestId(`theme-${themes[1].id}`));
        expect(onChange).toHaveBeenCalledWith(themes[1].id);
      }
    },
  );
});
