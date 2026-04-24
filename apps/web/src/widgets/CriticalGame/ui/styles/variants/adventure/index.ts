import { VariantStyleConfig } from '../types';
import { baseVariantStyles } from '../base';
import { layoutStyles } from './layout';
import { tableStyles } from './table';
import { headerStyles } from './header';
import { playersStyles } from './players';
import { tableInfoStyles } from './tableInfo';
import { chatStyles } from './chat';
import { cardsStyles } from './cards';

export const adventureFullVariantStyles: VariantStyleConfig = {
  layout: layoutStyles,
  table: tableStyles,
  header: headerStyles,
  players: playersStyles,
  tableInfo: tableInfoStyles,
  chat: chatStyles,
  cards: cardsStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(79, 86, 107, 0.32) 0%, rgba(10, 10, 15, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(79, 86, 107, 0.35)',
    gridLineColorB: 'rgba(255, 77, 77, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(79, 86, 107, 0.9) 25%, rgba(255, 77, 77, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(255, 77, 77, 0.28)',
    particleColors: [
      'rgba(255, 77, 77, 0.85)',
      'rgba(79, 86, 107, 0.75)',
      'rgba(156, 163, 175, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(79, 86, 107, 1), rgba(255, 77, 77, 1))',
    turnBannerDotColor: 'rgba(255, 77, 77, 1)',
  },
};
