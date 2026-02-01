import type { Palette } from '@/hooks/useThemedStyles';

export const getLayoutStyles = (palette: Palette) => ({
  container: {
    flex: 1,
    backgroundColor: palette.background,
    position: 'relative',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: palette.background,
    position: 'relative',
  },
  content: {
    padding: 24,
    gap: 20,
    paddingBottom: 48,
  },
  refreshTint: {
    color: palette.tint,
  },
});
