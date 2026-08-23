import type { VisionMode } from '@/shared/lib/colorblind';

/** English fallbacks for the vision-mode selector; i18n overrides come from
 * `messages/settings-vision.ts` via SettingsContent. */
export const VISION_MODE_FALLBACKS: Record<
  VisionMode,
  { label: string; description: string }
> = {
  none: {
    label: 'Default',
    description: 'Original theme colors.',
  },
  deuteranopia: {
    label: 'Deuteranopia',
    description: 'Rebalances red-green hues for red-green color blindness.',
  },
  protanopia: {
    label: 'Protanopia',
    description: 'Recolors boards for reduced red sensitivity.',
  },
  tritanopia: {
    label: 'Tritanopia',
    description: 'Separates blue-yellow hues for rare color blindness.',
  },
  highContrast: {
    label: 'High Contrast',
    description: 'Stronger outlines on game board cells.',
  },
};

export const VISION_OPTION_CODES = Object.keys(
  VISION_MODE_FALLBACKS,
) as VisionMode[];
