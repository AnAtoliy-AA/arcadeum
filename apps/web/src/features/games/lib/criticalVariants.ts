// Backward-compat re-export. The canonical theme registry now lives in
// './shared-themes' so every game can share the same visual themes.
import { SHARED_THEMES } from './shared-themes';

export const CARD_VARIANTS: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  bgImage?: string;
  disabled?: boolean;
}[] = SHARED_THEMES.map((t) => ({
  id: t.id,
  name: t.nameKey,
  description: t.descriptionKey,
  emoji: t.emoji,
  gradient: t.gradient,
  bgImage: t.bgImage,
}));
