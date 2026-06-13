import { createGameThemeContext } from '@/features/games/lib/createGameThemeContext';
import { getTheme, type SeaBattleTheme } from './theme';

export const { Provider: SeaBattleThemeProvider, useTheme: useSeaBattleTheme } =
  createGameThemeContext<SeaBattleTheme>(getTheme, 'classic');
