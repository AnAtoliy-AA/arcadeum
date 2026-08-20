import { describe, it, expect } from 'vitest';
import { SHARED_THEMES, getThemeById } from '../shared-themes';

describe('shared-themes', () => {
  it('contains exactly 12 visual themes plus random', () => {
    const ids = SHARED_THEMES.map((t) => t.id);
    expect(ids).toContain('cyberpunk');
    expect(ids).toContain('underwater');
    expect(ids).toContain('crime');
    expect(ids).toContain('horror');
    expect(ids).toContain('adventure');
    expect(ids).toContain('high-altitude-hike');
    expect(ids).toContain('galaxy');
    expect(ids).toContain('fantasy');
    expect(ids).toContain('western');
    expect(ids).toContain('egypt');
    expect(ids).toContain('steampunk');
    expect(ids).toContain('zen');
    expect(ids).toContain('random');
  });

  it('all 12 themes have defined bgImages, team palettes, and 10-player palettes', () => {
    for (const theme of SHARED_THEMES) {
      if (theme.id === 'random') continue;
      expect(theme.bgImage).toBeTruthy();
      expect(theme.colors.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.colors.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.colors.background).toBeTruthy();
      expect(theme.colors.surface).toBeTruthy();
      expect(theme.colors.text).toBeTruthy();
      expect(theme.colors.textSecondary).toBeTruthy();
      expect(theme.colors.glow).toBeTruthy();
      expect(theme.colors.border).toBeTruthy();
      expect(theme.colors.muted).toBeTruthy();
      expect(theme.colors.highlight).toBeTruthy();
      expect(theme.colors.teamPalette.length).toBeGreaterThanOrEqual(6);
      expect(theme.colors.playerPalette).toHaveLength(10);
    }
  });

  it('getThemeById retrieves the theme', () => {
    expect(getThemeById('cyberpunk')?.id).toBe('cyberpunk');
    expect(getThemeById('zen')?.id).toBe('zen');
    expect(getThemeById('random')?.id).toBe('random');
  });
});
