import type { GameTheme } from './shared-themes';
import { PRIMARY_THEMES } from './themes-pack-primary';
import { SECONDARY_THEMES } from './themes-pack-secondary';

export const SHARED_THEMES: readonly GameTheme[] = [
  ...PRIMARY_THEMES,
  ...SECONDARY_THEMES,
];
