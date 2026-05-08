import { render as rtlRender, screen } from '@testing-library/react';
import { TamaguiProvider } from 'tamagui';
import config from '../../tamagui.config';
import { StatTile } from './StatTile';
import { describe, it, expect } from 'vitest';

const render = (ui: React.ReactElement) =>
  rtlRender(
    <TamaguiProvider config={config} defaultTheme="dark">
      {ui}
    </TamaguiProvider>,
  );

describe('StatTile', () => {
  it('renders the value and label', () => {
    render(<StatTile value="2,840" label="Tickets resolved this month" />);
    expect(screen.getByText('2,840')).toBeInTheDocument();
    expect(
      screen.getByText('Tickets resolved this month'),
    ).toBeInTheDocument();
  });

  it('omits the sparkline accent when sparkline is false', () => {
    const { container } = render(
      <StatTile value="98%" label="SLA hit rate" sparkline={false} />,
    );
    expect(container.querySelectorAll('span[aria-hidden="true"]').length).toBe(
      0,
    );
  });
});
