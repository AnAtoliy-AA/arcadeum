import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SeaBattleWeaponsBar } from './SeaBattleWeaponsBar';

describe('SeaBattleWeaponsBar', () => {
  it('renders sonar and radar buttons and triggers selection callbacks', () => {
    const onSelectSonar = vi.fn();
    const onSelectRadar = vi.fn();
    const onToggleRadarAxis = vi.fn();
    const onCancel = vi.fn();

    render(
      <SeaBattleWeaponsBar
        hasSonar={true}
        hasRadar={true}
        sonarUsed={false}
        radarUsed={false}
        isSonarDisabled={false}
        isRadarDisabled={false}
        weaponMode={null}
        onSelectSonar={onSelectSonar}
        onSelectRadar={onSelectRadar}
        onToggleRadarAxis={onToggleRadarAxis}
        onCancel={onCancel}
      />,
    );

    const sonarBtn = screen.getByRole('button', { name: /Sonar/i });
    const radarBtn = screen.getByRole('button', { name: /Radar/i });

    fireEvent.click(sonarBtn);
    expect(onSelectSonar).toHaveBeenCalledTimes(1);

    fireEvent.click(radarBtn);
    expect(onSelectRadar).toHaveBeenCalledTimes(1);
  });

  it('renders cancel button and hint when weaponMode is active', () => {
    const onCancel = vi.fn();

    render(
      <SeaBattleWeaponsBar
        hasSonar={true}
        hasRadar={false}
        sonarUsed={false}
        radarUsed={false}
        isSonarDisabled={false}
        isRadarDisabled={false}
        weaponMode={{
          weapon: 'ability',
          abilityId: 'scout',
          targetPlayerId: 'p2',
        }}
        onSelectSonar={vi.fn()}
        onSelectRadar={vi.fn()}
        onToggleRadarAxis={vi.fn()}
        onCancel={onCancel}
      />,
    );

    expect(screen.getByText(/Tap a cell to scout 3×3 area/i)).toBeDefined();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
