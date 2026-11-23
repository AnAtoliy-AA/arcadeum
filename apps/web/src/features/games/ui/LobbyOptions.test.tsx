import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LobbyOptionSection,
  LobbyChipGroup,
  LobbyToggle,
} from './LobbyOptions';

describe('LobbyOptionSection', () => {
  it('renders title, children and optional hint', () => {
    render(
      <LobbyOptionSection title="Speed" hint="Pick one">
        <span>child</span>
      </LobbyOptionSection>,
    );
    expect(screen.getByText('Speed')).toBeTruthy();
    expect(screen.getByText('child')).toBeTruthy();
    expect(screen.getByText('Pick one')).toBeTruthy();
  });

  it('omits the hint when not provided', () => {
    render(
      <LobbyOptionSection title="Speed">
        <span>child</span>
      </LobbyOptionSection>,
    );
    expect(screen.queryByText('Pick one')).toBeNull();
  });
});

describe('LobbyChipGroup', () => {
  const options = [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta', emoji: '🔥' },
    { id: 'c', label: 'Gamma', comingSoon: true },
  ];

  it('marks the active chip and calls onChange for another one', () => {
    const onChange = vi.fn();
    render(<LobbyChipGroup options={options} value="a" onChange={onChange} />);
    expect(screen.getByTestId('chip-a').getAttribute('data-active')).toBe('on');
    expect(screen.getByTestId('chip-b').getAttribute('data-active')).toBeNull();
    fireEvent.click(screen.getByTestId('chip-b'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('disables coming-soon chips', () => {
    const onChange = vi.fn();
    render(<LobbyChipGroup options={options} value="a" onChange={onChange} />);
    const chip = screen.getByTestId('chip-c') as HTMLButtonElement;
    expect(chip.disabled).toBe(true);
    fireEvent.click(chip);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('disables all chips when disabled and honors testIdPrefix', () => {
    render(
      <LobbyChipGroup
        options={options}
        value="a"
        onChange={vi.fn()}
        disabled
        testIdPrefix="speed"
      />,
    );
    expect((screen.getByTestId('speed-b') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });
});

describe('LobbyToggle', () => {
  it('is labelled by its text and reports changes', () => {
    const onCheckedChange = vi.fn();
    render(
      <LobbyToggle
        label="Fast room"
        checked={false}
        onCheckedChange={onCheckedChange}
        hint="Shorter turns"
      />,
    );
    const box = screen.getByLabelText('Fast room') as HTMLInputElement;
    expect(box.checked).toBe(false);
    fireEvent.click(box);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Shorter turns')).toBeTruthy();
  });

  it('does not fire when disabled', () => {
    const onCheckedChange = vi.fn();
    render(
      <LobbyToggle
        label="Fast room"
        checked
        disabled
        onCheckedChange={onCheckedChange}
      />,
    );
    const box = screen.getByLabelText('Fast room') as HTMLInputElement;
    expect(box.disabled).toBe(true);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
