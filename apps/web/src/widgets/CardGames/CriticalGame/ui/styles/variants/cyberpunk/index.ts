import { VariantStyleConfig } from '../types';
import { baseVariantStyles } from '../base';
import { tableInfoStyles } from './tableInfo';
import { cardsStyles } from './cards';

export const cyberpunkVariantStyles: Partial<VariantStyleConfig> = {
  tableInfo: tableInfoStyles,
  cards: cardsStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(121, 40, 202, 0.24) 0%, rgba(10, 5, 30, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    sceneBackgroundImage: '/images/variants/cyberpunk_bg.webp',
    gridLineColorA: 'rgba(255, 0, 128, 0.28)',
    gridLineColorB: 'rgba(0, 223, 216, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(255, 0, 128, 0.9) 25%, rgba(121, 40, 202, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(255, 0, 128, 0.32)',
    particleColors: [
      'rgba(255, 0, 128, 0.85)',
      'rgba(121, 40, 202, 0.75)',
      'rgba(0, 223, 216, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(255, 0, 128, 1), rgba(121, 40, 202, 1))',
    turnBannerDotColor: 'rgba(255, 0, 128, 1)',
  },
};
