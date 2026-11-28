import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  LobbyChoice,
  LobbyHostOnlyNote,
  LobbyOptionGroup,
  LobbySubAdvanced,
  LobbySwitchRow,
} from './LobbyOptionKit';

const items = [
  { id: 'a', label: 'Alpha', description: 'First option' },
  { id: 'b', label: 'Beta', description: 'Second option' },
  { id: 'c', label: 'Gamma', disabled: true, badge: 'Soon' },
];

describe('LobbyChoice', () => {
  it('marks the selected item and shows its description', () => {
    render(
      <LobbyChoice
        aria-label="Pick"
        items={items}
        value="b"
        onChange={vi.fn()}
        testIdPrefix="pick"
      />,
    );
    expect(screen.getByRole('radiogroup', { name: 'Pick' })).toBeDefined();
    expect(screen.getByTestId('pick-b').getAttribute('aria-checked')).toBe(
      'true',
    );
    expect(screen.getByTestId('pick-a').getAttribute('data-active')).toBeNull();
    expect(screen.getByText('Second option')).toBeDefined();
  });

  it('calls onChange for enabled items', () => {
    const onChange = vi.fn();
    render(
      <LobbyChoice
        aria-label="Pick"
        items={items}
        value="a"
        onChange={onChange}
        testIdPrefix="pick"
      />,
    );
    fireEvent.click(screen.getByTestId('pick-b'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('disables every item when disabled and for per-item disabled', () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <LobbyChoice
        aria-label="Pick"
        items={items}
        value="a"
        onChange={onChange}
        testIdPrefix="pick"
      />,
    );
    expect((screen.getByTestId('pick-c') as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect(screen.getByText('Soon')).toBeDefined();
    rerender(
      <LobbyChoice
        aria-label="Pick"
        items={items}
        value="a"
        onChange={onChange}
        testIdPrefix="pick"
        disabled
      />,
    );
    fireEvent.click(screen.getByTestId('pick-b'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('LobbySwitchRow', () => {
  it('toggles and exposes switch semantics', () => {
    const onChange = vi.fn();
    render(
      <LobbySwitchRow
        label="Nil"
        hint="Bid zero"
        checked={false}
        onCheckedChange={onChange}
        testId="nil"
      />,
    );
    const sw = screen.getByRole('switch', { name: 'Nil' });
    expect(sw.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(screen.getByTestId('nil'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(screen.getByText('Bid zero')).toBeDefined();
  });

  it('does not toggle when disabled', () => {
    const onChange = vi.fn();
    render(
      <LobbySwitchRow
        label="Nil"
        checked
        disabled
        onCheckedChange={onChange}
        testId="nil"
      />,
    );
    fireEvent.click(screen.getByTestId('nil'));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('LobbyOptionGroup / SubAdvanced / HostOnlyNote', () => {
  it('renders title, hint and children', () => {
    render(
      <LobbyOptionGroup title="Board size" hint="Bigger is slower">
        <span>child</span>
      </LobbyOptionGroup>,
    );
    expect(screen.getByText('Board size')).toBeDefined();
    expect(screen.getByText('Bigger is slower')).toBeDefined();
    expect(screen.getByText('child')).toBeDefined();
  });

  it('renders a collapsed disclosure', () => {
    render(
      <LobbySubAdvanced title="More" testId="more">
        <span>inner</span>
      </LobbySubAdvanced>,
    );
    const details = screen.getByTestId('more') as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(screen.getByText('More')).toBeDefined();
  });

  it('shows the host-only note only when requested', () => {
    const { rerender } = render(<LobbyHostOnlyNote show={false} />);
    expect(screen.queryByTestId('lobby-host-only-note')).toBeNull();
    rerender(<LobbyHostOnlyNote />);
    expect(screen.getByTestId('lobby-host-only-note')).toBeDefined();
  });
});
